import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { alerterEntreprise } from '../../lib/rappels';
import { fuseauDuTenant, heureLocale, jourLocal } from '../../lib/fuseauHoraire';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Champs modifiables d'une fiche bien (jamais tenant_id, qr_token, id)
const CHAMPS_BIEN = [
  'client_id', 'client_nom', 'nom', 'type_bien', 'adresse', 'etage_porte', 'code_acces',
  'code_boite_cles', 'emplacement_boite_cles', 'wifi', 'consignes', 'infos',
];

function nettoyer(body: any) {
  const champs: Record<string, any> = {};
  for (const c of CHAMPS_BIEN) {
    if (body[c] === undefined) continue;
    const v = typeof body[c] === 'string' ? body[c].trim().slice(0, 4000) : body[c];
    champs[c] = v === '' ? null : v;
  }
  return champs;
}

// Liste des biens de l'entreprise (RH / proprietaire) — avec les codes, pour la gestion
export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, 'planning');
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) {
    // Un salarie voit la liste (nom, adresse) pour ses missions, jamais les codes
    const { data } = await sb.from('biens').select('id,nom,adresse,client_nom').eq('tenant_id', tenantId).eq('actif', true).order('nom');
    return NextResponse.json({ biens: data || [] });
  }
  const { data, error } = await sb.from('biens').select('*').eq('tenant_id', tenantId).eq('actif', true).order('nom');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ biens: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ── SCAN DU QR CODE COLLE DANS LE BIEN ──────────────────────────────
  // 1er scan du jour = arrivee, 2e = depart, sur la mission du jour dans ce bien.
  // Les codes d'acces ne sont donnes qu'a un salarie qui a une mission ici aujourd'hui (ou au RH).
  if (action === 'scan') {
    const token = String(body.token || '').trim();
    if (!/^[a-f0-9]{16,64}$/i.test(token)) return NextResponse.json({ error: 'QR code invalide' }, { status: 400 });
    const { data: bien } = await sb.from('biens').select('*').eq('qr_token', token).eq('actif', true).maybeSingle();
    if (!bien) return NextResponse.json({ error: 'QR code inconnu ou désactivé' }, { status: 404 });

    const tokenMoi = req.cookies.get('sb-access-token')?.value;
    const { data: authMoi } = tokenMoi ? await sb.auth.getUser(tokenMoi) : { data: null as any };
    if (!authMoi?.user) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
    const { data: moi } = await sb.from('equipe').select('id,nom,prenom').eq('user_id', authMoi.user.id).eq('tenant_id', bien.tenant_id).maybeSingle();
    const estRH = await estAutoriseGererEquipe(req, bien.tenant_id);
    if (!moi && !estRH) return NextResponse.json({ error: 'Ce bien ne fait pas partie de votre entreprise' }, { status: 403 });

    const fuseau = await fuseauDuTenant(bien.tenant_id);
    const maintenant = new Date();
    const aujourdhui = jourLocal(maintenant, fuseau);
    const heure = heureLocale(maintenant, fuseau);
    const nomAgent = moi ? `${moi.prenom || ''} ${moi.nom || ''}`.trim() : 'Responsable';

    // Mission du jour dans ce bien, confiee a ce salarie
    let mission: any = null;
    if (moi) {
      const { data: missionsJour } = await sb.from('missions')
        .select('id,statut,service,heure,client_nom,heure_arrivee_reelle,missions_collaborateurs(collaborateur_id)')
        .eq('tenant_id', bien.tenant_id).eq('bien_id', bien.id).eq('date_mission', aujourdhui).neq('statut', 'annule')
        .order('heure');
      const miennes = (missionsJour || []).filter((m: any) => (m.missions_collaborateurs || []).some((c: any) => c.collaborateur_id === moi.id));
      // La premiere non terminee, sinon la derniere
      mission = miennes.find((m: any) => m.statut !== 'termine') || miennes[miennes.length - 1] || null;
    }

    const infosBien = {
      nom: bien.nom, client_nom: bien.client_nom, type_bien: bien.type_bien, adresse: bien.adresse,
      etage_porte: bien.etage_porte, code_acces: bien.code_acces, code_boite_cles: bien.code_boite_cles,
      emplacement_boite_cles: bien.emplacement_boite_cles, wifi: bien.wifi, consignes: bien.consignes, infos: bien.infos,
    };

    if (!mission) {
      if (estRH) return NextResponse.json({ success: true, action: 'consultation', agent: nomAgent, date: aujourdhui, heure, bien: infosBien, mission: null });
      try { await alerterEntreprise(bien.tenant_id, 'Scan sans mission prévue', `${nomAgent} a scanné le QR code du bien « ${bien.nom} » le ${aujourdhui} à ${heure}, sans mission prévue pour lui ici aujourd'hui. Les codes d'accès ne lui ont pas été affichés.`); } catch (e: any) { console.error('Alerte scan:', e.message); }
      return NextResponse.json({ error: "Aucune mission prévue pour vous aujourd'hui dans ce bien. Votre responsable est prévenu." }, { status: 403 });
    }

    // Pointage via la meme logique que les boutons de l'espace salarie (heure reelle, presence, fin de mission)
    let actionPointage: 'arrivee' | 'depart' | 'deja_termine' | 'deja_arrive' = 'arrivee';
    if (mission.statut === 'termine') actionPointage = 'deja_termine';
    else if (mission.statut === 'en_cours') {
      // Page rechargee ou double scan juste apres l'arrivee : on ne pointe pas le depart par erreur
      const enMinutes = (t: string) => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + (m || 0); };
      const depuisArrivee = mission.heure_arrivee_reelle ? enMinutes(heure) - enMinutes(mission.heure_arrivee_reelle) : 999;
      actionPointage = depuisArrivee >= 0 && depuisArrivee < 5 ? 'deja_arrive' : 'depart';
    }
    if (actionPointage === 'arrivee' || actionPointage === 'depart') {
      const r = await fetch(new URL('/api/planning-missions', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
        body: JSON.stringify({ action: 'modifier_statut', id: mission.id, statut: actionPointage === 'arrivee' ? 'en_cours' : 'termine' }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        return NextResponse.json({ error: d.error || 'Pointage impossible' }, { status: r.status });
      }
      const libelle = actionPointage === 'arrivee' ? 'est arrivé(e)' : 'a terminé et quitté';
      let detailDuree = '';
      if (actionPointage === 'depart' && mission.heure_arrivee_reelle) {
        const enMin = (t: string) => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + (m || 0); };
        let d = enMin(heure) - enMin(mission.heure_arrivee_reelle);
        if (d < 0) d += 24 * 60;
        detailDuree = ` Durée de la mission : ${d >= 60 ? Math.floor(d / 60) + ' h ' + String(d % 60).padStart(2, '0') : d + ' min'} (arrivée ${String(mission.heure_arrivee_reelle).slice(0, 5)}).`;
      }
      try { await alerterEntreprise(bien.tenant_id, actionPointage === 'arrivee' ? 'Agent arrivé' : 'Mission terminée', `${nomAgent} ${libelle} le bien « ${bien.nom} »${bien.adresse ? ' (' + bien.adresse + ')' : ''} le ${aujourdhui} à ${heure} — pointé par QR code.${detailDuree}`); } catch (e: any) { console.error('Alerte scan:', e.message); }
    }

    // Fin de mission : heure d'arrivee + duree passee sur place (relues en base)
    let heureArrivee: string | null = mission.heure_arrivee_reelle ? String(mission.heure_arrivee_reelle).slice(0, 5) : (actionPointage === 'arrivee' ? heure : null);
    let heureFin: string | null = null;
    if (actionPointage === 'depart' || actionPointage === 'deja_termine') {
      const { data: m2 } = await sb.from('missions').select('heure_arrivee_reelle,heure_fin_reelle').eq('id', mission.id).maybeSingle();
      heureArrivee = m2?.heure_arrivee_reelle ? String(m2.heure_arrivee_reelle).slice(0, 5) : heureArrivee;
      heureFin = m2?.heure_fin_reelle ? String(m2.heure_fin_reelle).slice(0, 5) : heure;
    }
    let dureeMinutes: number | null = null;
    if (heureArrivee && heureFin) {
      const enMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
      dureeMinutes = enMin(heureFin) - enMin(heureArrivee);
      if (dureeMinutes < 0) dureeMinutes += 24 * 60; // mission passee minuit
    }

    return NextResponse.json({
      success: true, action: actionPointage, agent: nomAgent, date: aujourdhui, heure,
      heure_arrivee: heureArrivee, heure_fin: heureFin, duree_minutes: dureeMinutes,
      bien: infosBien, mission: { service: mission.service, heure: mission.heure },
    });
  }

  // ── GESTION DES BIENS (RH / proprietaire) ───────────────────────────
  const acces = await verifierAccesModule(req, 'planning');
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });

  if (action === 'creer') {
    const champs = nettoyer(body);
    if (!champs.nom) return NextResponse.json({ error: 'Nom du bien requis' }, { status: 400 });
    const { data, error } = await sb.from('biens').insert({ ...champs, tenant_id: tenantId }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, bien: data });
  }

  if (action === 'modifier') {
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const champs = nettoyer(body);
    if ('nom' in champs && !champs.nom) return NextResponse.json({ error: 'Nom du bien requis' }, { status: 400 });
    const { data, error } = await sb.from('biens').update(champs).eq('id', body.id).eq('tenant_id', tenantId).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Bien introuvable' }, { status: 404 });
    return NextResponse.json({ success: true, bien: data });
  }

  // Desactivation (le bien et son historique restent en base ; l'ancien QR code ne marche plus)
  if (action === 'desactiver') {
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { error } = await sb.from('biens').update({ actif: false }).eq('id', body.id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Nouveau QR code (si l'ancien a ete perdu ou photographie) : l'ancien cesse de fonctionner
  if (action === 'nouveau_qr') {
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const nouveau = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32);
    const { data, error } = await sb.from('biens').update({ qr_token: nouveau }).eq('id', body.id).eq('tenant_id', tenantId).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, bien: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
