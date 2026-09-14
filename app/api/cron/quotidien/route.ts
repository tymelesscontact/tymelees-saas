import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { envoyerPartout } from '../../../lib/rappels';
import { envoyerRappelMission } from '../../../lib/rappels';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Tache quotidienne, declenchee par Vercel Cron.
 * Proteg par CRON_SECRET pour qu'elle ne soit pas appelable
 * publiquement par n'importe qui connaissant l'adresse.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  }

  const resultats: any = { relances: null, rappels: null };

  // 1 - Les relances commerciales dues aujourd'hui
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr';
    const r = await fetch(`${site}/api/relance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ action: 'traiter_envois_dus' }),
    });
    resultats.relances = await r.json();
  } catch (e: any) {
    resultats.relances = { error: e.message };
  }

  // 2 - Les rappels de mission pour demain (24h avant)
  try {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const dateDemain = demain.toISOString().slice(0, 10);

    const { data: missions } = await sb.from('missions_planning')
      .select('id,tenant_id')
      .eq('date_mission', dateDemain)
      .eq('rappel_24h_envoye', false)
      .in('statut', ['propose', 'confirme']);

    let envoyes = 0;
    for (const m of (missions || [])) {
      try {
        await envoyerRappelMission(m.id, m.tenant_id, 'tous');
        envoyes++;
      } catch (e: any) { console.error('Rappel cron:', e.message); }
    }
    resultats.rappels = { missions_traitees: envoyes };
  } catch (e: any) {
    resultats.rappels = { error: e.message };
  }

  // 3 - Liste d'attente : notifier si une mission a ete annulee/liberee a une date attendue
  try {
    const { data: attentes } = await sb.from('liste_attente_planning')
      .select('*').eq('notifie', false);

    let notifiesAttente = 0;
    for (const a of (attentes || [])) {
      const { data: missionsCeJour } = await sb.from('missions')
        .select('id').eq('tenant_id', a.tenant_id).eq('date_mission', a.date_souhaitee)
        .neq('statut', 'annule');

      // Simplification : si moins de 5 missions ce jour-la, on considere qu'il y a de la place
      if ((missionsCeJour || []).length < 5) {
        await envoyerPartout(a.client_tel || null, a.client_email || null,
          `Bonne nouvelle : un creneau s'est libere le ${a.date_souhaitee}. Contactez-nous pour reserver !`,
          a.tenant_id);
        await sb.from('liste_attente_planning').update({ notifie: true }).eq('id', a.id);
        notifiesAttente++;
      }
    }
    resultats.listeAttente = { notifies: notifiesAttente };
  } catch (e: any) {
    resultats.listeAttente = { error: e.message };
  }

  // 4 - Essais expires jamais convertis : suppression pour liberer l'email, seconde chance possible
  try {
    const { data: essaisExpires } = await sb.from('tenants')
      .select('id').eq('statut', 'essai').lt('trial_ends_at', new Date().toISOString());

    let essaisSupprimes = 0;
    for (const t of (essaisExpires || [])) {
      const { count } = await sb.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id);
      if (!count || count === 0) {
        await sb.from('tenant_membres').delete().eq('tenant_id', t.id);
        await sb.from('tenants').delete().eq('id', t.id);
        essaisSupprimes++;
      }
    }
    resultats.essaisNettoyes = { supprimes: essaisSupprimes };
  } catch (e: any) {
    resultats.essaisNettoyes = { error: e.message };
  }

  // 5 - Abonnements Flutterwave (paiement unique, jamais reconduit automatiquement) :
  // rappel avant echeance, puis suspension si non renouvele a temps
  try {
    const maintenant = new Date();
    const dans3Jours = new Date(maintenant.getTime() + 3 * 86400000);

    const { data: aRappeler } = await sb.from('tenants')
      .select('id,societe,email,abonnement_expire_le')
      .eq('statut', 'actif')
      .not('flutterwave_tx_ref', 'is', null)
      .eq('rappel_expiration_envoye', false)
      .lt('abonnement_expire_le', dans3Jours.toISOString())
      .gt('abonnement_expire_le', maintenant.toISOString());

    let rappelsAbonnement = 0;
    for (const t of (aRappeler || [])) {
      const canal = await envoyerPartout(null, t.email,
        `Xyra : votre abonnement ${t.societe} arrive a echeance le ${new Date(t.abonnement_expire_le).toLocaleDateString('fr')}. Connectez-vous a votre espace pour renouveler et garder l'acces.`,
        t.id);
      if (canal) {
        await sb.from('tenants').update({ rappel_expiration_envoye: true }).eq('id', t.id);
        rappelsAbonnement++;
      }
    }

    const { data: aExpirer } = await sb.from('tenants')
      .select('id,societe,email')
      .eq('statut', 'actif')
      .not('flutterwave_tx_ref', 'is', null)
      .lt('abonnement_expire_le', maintenant.toISOString());

    let abonnementsSuspendus = 0;
    for (const t of (aExpirer || [])) {
      await sb.from('tenants').update({
        statut: 'suspendu',
        statut_avant_suspension: 'actif',
      }).eq('id', t.id);
      await envoyerPartout(null, t.email,
        `Xyra : votre abonnement ${t.societe} a expire et l'acces a ete suspendu. Connectez-vous pour renouveler et retrouver votre espace immediatement.`,
        t.id);
      abonnementsSuspendus++;
    }

    resultats.abonnementsFlutterwave = { rappels: rappelsAbonnement, suspendus: abonnementsSuspendus };
  } catch (e: any) {
    resultats.abonnementsFlutterwave = { error: e.message };
  }

  // 6 - Signaux de prospection : nouvelles entreprises creees recemment dans
  // le secteur/ville du tenant (API officielle recherche-entreprises.api.gouv.fr,
  // gratuite, sans cle). Plafonne a 5 signaux/tenant/jour pour eviter le bruit.
  try {
    const { data: tenantsActifs } = await sb.from('tenants')
      .select('id,secteur,code_postal')
      .eq('statut', 'actif')
      .not('secteur', 'is', null)
      .not('code_postal', 'is', null);

    const septJoursAvant = new Date(Date.now() - 7 * 86400000);
    let tenantsTraites = 0;
    let signauxCrees = 0;

    for (const t of (tenantsActifs || [])) {
      try {
        const url = new URL('https://recherche-entreprises.api.gouv.fr/search');
        url.searchParams.set('q', t.secteur);
        url.searchParams.set('code_postal', t.code_postal);
        url.searchParams.set('per_page', '25');
        url.searchParams.set('etat_administratif', 'A');

        const res = await fetch(url.toString());
        if (!res.ok) continue;
        const data = await res.json();

        const recentes = (data.results || []).filter((r: any) => {
          if (!r.date_creation) return false;
          return new Date(r.date_creation) >= septJoursAvant;
        }).slice(0, 5);

        for (const r of recentes) {
          const siret = r.siege?.siret || null;
          if (siret) {
            const { data: existant } = await sb.from('signaux_prospection')
              .select('id').eq('tenant_id', t.id).eq('siret', siret).maybeSingle();
            if (existant) continue;
          }
          const dirigeantBrut = (r.dirigeants || [])[0];
          const dirigeant = dirigeantBrut
            ? (dirigeantBrut.type_dirigeant === 'personne morale'
                ? dirigeantBrut.denomination
                : [dirigeantBrut.prenoms, dirigeantBrut.nom].filter(Boolean).join(' '))
            : null;

          await sb.from('signaux_prospection').insert({
            tenant_id: t.id,
            type: 'nouvelle_entreprise',
            nom_entreprise: r.nom_complet || r.nom_raison_sociale,
            siret,
            dirigeant,
            raison: `Entreprise creee le ${r.date_creation} dans le secteur "${t.secteur}" -- personne ne l'a encore contactee.`,
          });
          signauxCrees++;
        }
        tenantsTraites++;
      } catch (e: any) {
        console.error('Signal prospection tenant', t.id, e.message);
      }
    }
    resultats.signauxProspection = { tenants_traites: tenantsTraites, signaux_crees: signauxCrees };
  } catch (e: any) {
    resultats.signauxProspection = { error: e.message };
  }

  return NextResponse.json({ success: true, resultats, executee_le: new Date().toISOString() });
}
