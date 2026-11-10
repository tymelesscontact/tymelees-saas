import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { envoyerRappelMission, envoyerPartout, alerterEntreprise } from '../../lib/rappels';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { fuseauDuTenant, heureLocale } from '../../lib/fuseauHoraire';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Coordonnees d'une adresse francaise (Base Adresse Nationale, gratuite, sans cle). null si introuvable.
async function geocoderAdresse(adresse: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`, { signal: ctrl.signal });
    clearTimeout(minuteur);
    const d = await r.json();
    const f = d?.features?.[0];
    if (!f || (f.properties?.score ?? 0) < 0.4) return null;
    return { lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] };
  } catch { return null; }
}

// Distance en metres entre deux points GPS
function distanceMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// Au-dela de cette distance de l'adresse de la mission, le pointage est signale au patron
const RAYON_POINTAGE_METRES = 300;

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, "planning");
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collaborateurId = searchParams.get('collaborateur_id');
  const dateDebut = searchParams.get('date_debut');
  const dateFin = searchParams.get('date_fin');

  // equipe(nom, prenom) : uniquement le nom d'affichage du collaborateur (jamais le salaire), pour le tableau de bord.
  let q = sb.from('missions').select('*, missions_collaborateurs(collaborateur_id, role, statut_presence, equipe(nom, prenom))')
    .eq('tenant_id', tenantId).order('date_mission');
  if (dateDebut) q = q.gte('date_mission', dateDebut);
  if (dateFin) q = q.lte('date_mission', dateFin);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let missions = data || [];
  if (collaborateurId) {
    missions = missions.filter((m: any) =>
      (m.missions_collaborateurs || []).some((c: any) => c.collaborateur_id === collaborateurId)
    );
  }

  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const acces = await verifierAccesModule(req, "planning");
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const {
      type_mission_id, client_id, client_nom, client_email, client_tel,
      date_mission, heure_debut, heure_fin, adresse, notes,
      collaborateur_ids, acompte_montant, recurrence_frequence, company_id, cree_par,
    } = body;

    if (!date_mission || !heure_debut) {
      return NextResponse.json({ error: 'Date et heure necessaires' }, { status: 400 });
    }
    if (!collaborateur_ids || !Array.isArray(collaborateur_ids) || collaborateur_ids.length === 0) {
      return NextResponse.json({ error: 'Au moins un collaborateur necessaire' }, { status: 400 });
    }

    // Verifie que tous les collaborateurs appartiennent bien au tenant
    const { data: valides } = await sb.from('equipe').select('id')
      .in('id', collaborateur_ids).eq('tenant_id', tenantId);
    if (!valides || valides.length !== collaborateur_ids.length) {
      return NextResponse.json({ error: 'Un collaborateur est invalide' }, { status: 403 });
    }

    let serviceNom = notes ? notes.slice(0, 60) : 'Mission';
    if (type_mission_id) {
      const { data: typePresta } = await sb.from('types_rdv').select('nom').eq('id', type_mission_id).maybeSingle();
      if (typePresta?.nom) serviceNom = typePresta.nom;
    }

    const { data: mission, error } = await sb.from('missions').insert({
      tenant_id: tenantId, company_id: company_id || null,
      type_mission_id: type_mission_id || null,
      service: serviceNom,
      client_id: client_id || null, client_nom: client_nom || null,
      client_email: client_email || null, client_tel: client_tel || null,
      date_mission, heure: heure_debut,
      adresse: adresse || null, notes: notes || null,
      acompte_montant: acompte_montant || null,
      recurrence_frequence: recurrence_frequence || null,
      cree_par: cree_par || 'equipe',
      statut: 'propose',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const liaisons = collaborateur_ids.map((id: string) => ({ mission_id: mission.id, collaborateur_id: id }));
    await sb.from('missions_collaborateurs').insert(liaisons);

    return NextResponse.json({ success: true, mission });
  }

  if (action === 'modifier_statut') {
    const { id, statut, lat, lng } = body;
    const valides = ['propose', 'confirme', 'en_route', 'en_cours', 'termine', 'annule', 'reporte'];
    if (!valides.includes(statut)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    const champsMaj: any = { statut };
    if (statut === 'confirme') champsMaj.prise_connaissance_le = new Date().toISOString();

    // Statut avant modification : la chaine de fin de mission ne doit partir qu'une fois
    const { data: avant } = await sb.from('missions').select('statut,adresse,client_nom,heure,heure_arrivee_reelle,collaborateur_id,employe_id,missions_collaborateurs(collaborateur_id)').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!avant) return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    const dejaTerminee = avant?.statut === 'termine';

    // Un salarie ne change que le statut des missions qui lui sont confiees (le RH : toutes)
    const estRH = await estAutoriseGererEquipe(req, tenantId);
    let moiCollab: any = null;
    {
      const tokenMoi = req.cookies.get('sb-access-token')?.value;
      const { data: authMoi } = tokenMoi ? await sb.auth.getUser(tokenMoi) : { data: null as any };
      if (authMoi?.user) {
        const { data: m } = await sb.from('equipe').select('id,nom,prenom').eq('user_id', authMoi.user.id).eq('tenant_id', tenantId).maybeSingle();
        moiCollab = m;
      }
    }
    const monId = moiCollab?.id;
    const assigne = !!monId && (avant.collaborateur_id === monId || avant.employe_id === monId || (avant.missions_collaborateurs || []).some((c: any) => c.collaborateur_id === monId));
    if (!estRH && !assigne) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

    // Pointage reel : heure d'arrivee (premiere arrivee) et heure de fin, dans le fuseau de l'entreprise
    const heureMaintenant = heureLocale(new Date(), await fuseauDuTenant(tenantId));
    if (statut === 'en_cours' && !avant.heure_arrivee_reelle) champsMaj.heure_arrivee_reelle = heureMaintenant;
    if (statut === 'termine') champsMaj.heure_fin_reelle = heureMaintenant;

    // Controle de lieu : position du telephone comparee a l'adresse de la mission
    let distanceM: number | null = null;
    if (assigne && (statut === 'en_cours' || statut === 'termine') && typeof lat === 'number' && typeof lng === 'number' && avant.adresse) {
      const cible = await geocoderAdresse(avant.adresse);
      if (cible) distanceM = distanceMetres({ lat, lng }, cible);
    }
    if (distanceM !== null && distanceM > RAYON_POINTAGE_METRES) {
      const qui = `${moiCollab?.prenom || ''} ${moiCollab?.nom || ''}`.trim() || 'Un collaborateur';
      const dist = distanceM >= 1000 ? `${(distanceM / 1000).toFixed(1).replace('.', ',')} km` : `${distanceM} m`;
      try { await alerterEntreprise(tenantId, 'Pointage hors du lieu de mission', `${qui} a pointé ${statut === 'en_cours' ? "son arrivée" : 'la fin'} de la mission chez ${avant.client_nom || 'le client'} à ${dist} de l'adresse prévue (${avant.adresse}), à ${heureMaintenant}.`); } catch (e: any) { console.error('Alerte pointage:', e.message); }
    }
    if (assigne && (statut === 'en_cours' || statut === 'termine')) {
      await sb.from('missions_collaborateurs').update({ statut_presence: statut === 'en_cours' ? 'arrive' : 'termine' }).eq('mission_id', id).eq('collaborateur_id', monId);
    }

    const { error } = await sb.from('missions')
      .update(champsMaj).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Chaine automatique quand une mission se termine : demande d'avis + facture si devis lie
    if (statut === 'termine' && !dejaTerminee) {
      try {
        const { data: mission } = await sb.from('missions').select('*').eq('id', id).maybeSingle();
        if (mission?.client_tel || mission?.client_email) {
          const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr';
          await fetch(`${site}/api/scoring`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
            body: JSON.stringify({
              action: 'demander_avis_whatsapp',
              client_tel: mission.client_tel, client_email: mission.client_email, client_nom: mission.client_nom, service: mission.service,
            }),
          });
        }
        if (mission?.devis_id) {
          const { data: devis } = await sb.from('devis').select('*').eq('id', mission.devis_id).maybeSingle();
          if (devis) {
            const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr';
            await fetch(`${site}/api/factures`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
              body: JSON.stringify({
                action: 'creer',
                client_nom: mission.client_nom, client_email: mission.client_email, client_tel: mission.client_tel,
                description: mission.service || 'Prestation', montant_ht: devis.montant,
                devis_id: mission.devis_id, mission_id: mission.id,
              }),
            });
          }
        }
      } catch (e: any) {
        console.error('Chaine post-mission:', e.message);
      }
    }

    return NextResponse.json({ success: true, heure: heureMaintenant, distance_m: distanceM, rayon_m: RAYON_POINTAGE_METRES });
  }

  // Rappel de mission — WhatsApp d'abord, email si echec, SMS en dernier recours
  if (action === 'envoyer_rappel') {
    const { id, cible } = body;
    const resultat = await envoyerRappelMission(id, tenantId, cible || 'tous');
    return NextResponse.json(resultat);
  }

  // Suggere les meilleurs collaborateurs pour une mission, sans jamais assigner a la place de Bene
  // Inscrire un client en liste d'attente pour un creneau complet
  if (action === 'rejoindre_liste_attente') {
    const { client_nom, client_email, client_tel, type_mission_id, date_souhaitee } = body;
    if (!client_nom || !date_souhaitee) return NextResponse.json({ error: 'Nom et date necessaires' }, { status: 400 });
    const { data, error } = await sb.from('liste_attente_planning').insert({
      tenant_id: tenantId, client_nom, client_email: client_email || null,
      client_tel: client_tel || null, type_mission_id: type_mission_id || null,
      date_souhaitee, notifie: false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, inscription: data });
  }

  if (action === 'suggerer_collaborateurs') {
    const { date_mission, heure_debut, zone, competence, exclure_id } = body;
    if (!date_mission || !heure_debut) return NextResponse.json({ error: 'Date et heure necessaires' }, { status: 400 });

    // Absents ce jour-la (absence validee ou en attente qui couvre la date) : jamais proposes
    const { data: absentsJour } = await sb.from('absences')
      .select('employe_id').eq('tenant_id', tenantId).in('statut', ['validee', 'en_attente'])
      .lte('debut', date_mission).gte('fin', date_mission);
    const absents = new Set((absentsJour || []).map((a: any) => a.employe_id));
    if (exclure_id) absents.add(exclure_id);

    const { data: tousCollabs } = await sb.from('equipe')
      .select('id,nom,prenom,zones_intervention,competences,statut')
      .eq('tenant_id', tenantId).eq('statut', 'actif');

    const { data: missionsJour } = await sb.from('missions')
      .select('id,heure,missions_collaborateurs(collaborateur_id)')
      .eq('tenant_id', tenantId).eq('date_mission', date_mission).neq('statut', 'annule');

    const chargeParCollab: Record<string, number> = {};
    const dejaAssigneCreneauProche: Record<string, boolean> = {};
    for (const m of (missionsJour || [])) {
      for (const c of (m.missions_collaborateurs || [])) {
        const id = c.collaborateur_id;
        chargeParCollab[id] = (chargeParCollab[id] || 0) + 1;
        // meme heure a une heure pres = conflit
        if (m.heure && Math.abs(parseInt(m.heure) - parseInt(heure_debut)) < 1) {
          dejaAssigneCreneauProche[id] = true;
        }
      }
    }

    const suggestions = (tousCollabs || [])
      .filter((c: any) => !dejaAssigneCreneauProche[c.id] && !absents.has(c.id))
      .map((c: any) => {
        let score = 100;
        score -= (chargeParCollab[c.id] || 0) * 15;
        if (zone && c.zones_intervention?.length && !c.zones_intervention.includes(zone)) score -= 40;
        if (competence && c.competences?.length && !c.competences.includes(competence)) score -= 30;
        return {
          id: c.id, nom: `${c.prenom || ''} ${c.nom}`.trim(), score: Math.max(0, score),
          missions_ce_jour: chargeParCollab[c.id] || 0,
          zone_compatible: !zone || !c.zones_intervention?.length || c.zones_intervention.includes(zone),
          competence_compatible: !competence || !c.competences?.length || c.competences.includes(competence),
        };
      })
      .sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({ success: true, suggestions });
  }

  // Remplacement en un clic : la mission passe de l'absent au remplacant choisi,
  // le remplacant est prevenu (WhatsApp, sinon email, sinon SMS), et le client si demande.
  if (action === 'remplacer') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { mission_id, ancien_id, nouveau_id, prevenir_client } = body;
    if (!mission_id || !ancien_id || !nouveau_id || ancien_id === nouveau_id) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const { data: mission } = await sb.from('missions').select('*').eq('id', mission_id).eq('tenant_id', tenantId).maybeSingle();
    if (!mission) return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    if (['annule', 'termine'].includes(mission.statut)) return NextResponse.json({ error: 'Mission terminée ou annulée' }, { status: 409 });
    const { data: remplacant } = await sb.from('equipe').select('id,nom,prenom,tel,email,statut').eq('id', nouveau_id).eq('tenant_id', tenantId).maybeSingle();
    if (!remplacant) return NextResponse.json({ error: 'Remplaçant introuvable' }, { status: 404 });

    // Affectation : on remplace la ligne de l'absent (ou on ajoute le remplacant s'il n'y en avait pas)
    const { data: lignes } = await sb.from('missions_collaborateurs').update({ collaborateur_id: nouveau_id, statut_presence: 'prevu' })
      .eq('mission_id', mission_id).eq('collaborateur_id', ancien_id).select('id');
    if (!lignes || lignes.length === 0) {
      const { data: dejaLa } = await sb.from('missions_collaborateurs').select('id').eq('mission_id', mission_id).eq('collaborateur_id', nouveau_id).maybeSingle();
      if (!dejaLa) await sb.from('missions_collaborateurs').insert({ mission_id, collaborateur_id: nouveau_id });
    }
    const nomRemplacant = `${remplacant.prenom || ''} ${remplacant.nom || ''}`.trim();
    if (mission.collaborateur_id === ancien_id || mission.employe_id === ancien_id) {
      await sb.from('missions').update({ collaborateur_id: nouveau_id, collaborateur_nom: nomRemplacant, ...(mission.employe_id === ancien_id ? { employe_id: nouveau_id } : {}) })
        .eq('id', mission_id).eq('tenant_id', tenantId);
    }

    const quand = `${mission.date_mission ? new Date(mission.date_mission + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}${mission.heure ? ' à ' + String(mission.heure).slice(0, 5) : ''}`;
    const texteRemplacant = `Bonjour ${remplacant.prenom || ''}, une mission vous est confiée en remplacement : ${mission.service || 'intervention'} chez ${mission.client_nom || 'un client'}, ${quand}${mission.adresse ? ', ' + mission.adresse : ''}. Merci de confirmer dans votre espace Xyra.`;
    let canalRemplacant: string | null = null;
    try { canalRemplacant = await envoyerPartout(remplacant.tel || null, remplacant.email || null, texteRemplacant, tenantId, { sujet: 'Mission en remplacement' }); } catch (e: any) { console.error('Remplacement (salarie):', e.message); }

    let canalClient: string | null = null;
    if (prevenir_client && (mission.client_tel || mission.client_email)) {
      const texteClient = `Bonjour ${mission.client_nom || ''}, pour votre rendez-vous du ${quand}, votre intervenant sera ${remplacant.prenom || nomRemplacant}. Le rendez-vous est maintenu.`;
      try { canalClient = await envoyerPartout(mission.client_tel || null, mission.client_email || null, texteClient, tenantId, { sujet: 'Votre rendez-vous est maintenu' }); } catch (e: any) { console.error('Remplacement (client):', e.message); }
    }
    return NextResponse.json({ success: true, remplacant: nomRemplacant, canal_remplacant: canalRemplacant, canal_client: canalClient });
  }

  if (action === 'presence_collaborateur') {
    const { mission_id, collaborateur_id, statut_presence } = body;
    const valides = ['prevu', 'arrive', 'termine', 'absent'];
    if (!valides.includes(statut_presence)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    const { data: missionDuTenant } = await sb.from('missions').select('id').eq('id', mission_id).eq('tenant_id', tenantId).maybeSingle();
    if (!missionDuTenant) return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    const { error } = await sb.from('missions_collaborateurs')
      .update({ statut_presence }).eq('mission_id', mission_id).eq('collaborateur_id', collaborateur_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
