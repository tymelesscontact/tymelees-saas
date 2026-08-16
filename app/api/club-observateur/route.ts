import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fenetre d'observation de 3 semaines offerte aux clients Xyra.
 * Il voit ce qui se passe dans le club, sans jamais pouvoir agir.
 */
export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const sb = sbAdmin();

  // Deja membre ? Alors pas d'observation, acces complet
  const token = req.cookies.get('sb-access-token')?.value;
  if (token) {
    const { data: auth } = await sb.auth.getUser(token);
    if (auth?.user) {
      const { data: membre } = await sb.from('club_membres')
        .select('id,statut').eq('user_id', auth.user.id).maybeSingle();
      if (membre && ['actif', 'fondateur'].includes(membre.statut)) {
        return NextResponse.json({ est_membre: true });
      }
    }
  }

  const { data: tenant } = await sb.from('tenants')
    .select('id,societe,email,metier,pays,user_id').eq('id', tenantId).maybeSingle();

  // Ouvrir la fenetre a la premiere visite
  let { data: obs } = await sb.from('club_observateurs')
    .select('*').eq('tenant_id', tenantId).maybeSingle();

  if (!obs) {
    const { data: cree } = await sb.from('club_observateurs').insert({
      tenant_id: tenantId,
      user_id: tenant?.user_id || null,
      email: tenant?.email || null,
      societe: tenant?.societe || null,
      metier: tenant?.metier || null,
      pays: tenant?.pays || null,
    }).select().single();
    obs = cree;
  }
  if (!obs) return NextResponse.json({ error: 'erreur' }, { status: 500 });

  const fin = new Date(obs.fin_observation);
  const jours = Math.ceil((fin.getTime() - Date.now()) / 86400000);
  const expiree = jours <= 0;

  // La place de son metier est-elle libre ?
  let place_libre = null;
  let occupee_par = null;
  if (obs.metier) {
    const zone = obs.ville || obs.pays;
    let q = sb.from('club_membres').select('nom,zone,ville')
      .ilike('metier', `%${obs.metier}%`).in('statut', ['actif', 'fondateur']);
    if (zone) q = q.or(`zone.ilike.%${zone}%,ville.ilike.%${zone}%`);
    const { data: pris } = await q.maybeSingle();
    place_libre = !pris;
    occupee_par = pris?.nom || null;
  }

  if (expiree) {
    // Ce qu'il a rate
    const { data: demandes } = await sb.from('club_demandes')
      .select('id').eq('statut', 'ouverte')
      .gte('created_at', obs.debut_observation)
      .ilike('metier_recherche', obs.metier ? `%${obs.metier}%` : '%');
    return NextResponse.json({
      expiree: true,
      jours_restants: 0,
      metier: obs.metier,
      place_libre,
      occupee_par,
      demandes_manquees: (demandes || []).length,
      a_candidate: obs.a_candidate,
    });
  }

  // Le mouvement du club, sans nommer personne
  const debutMois = new Date(); debutMois.setDate(1);
  const [membresRes, dealsRes, demandesRes, pubsRes, evtRes] = await Promise.all([
    sb.from('club_membres').select('id,nom,metier,secteur,ville,pays,propose,score_reputation,nb_deals')
      .in('statut', ['actif', 'fondateur']).order('score_reputation', { ascending: false }),
    sb.from('club_deals').select('montant,created_at').eq('statut', 'valide'),
    sb.from('club_demandes').select('*').eq('statut', 'ouverte').order('created_at', { ascending: false }).limit(20),
    sb.from('club_publications').select('id,titre,categorie,auteur_nom,created_at,contenu')
      .eq('masque', false).order('created_at', { ascending: false }).limit(10),
    sb.from('evenements').select('*').gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(6),
  ]);

  const deals = dealsRes.data || [];
  const dealsMois = deals.filter((d: any) => new Date(d.created_at) >= debutMois);

  return NextResponse.json({
    observation: true,
    jours_restants: jours,
    fin: obs.fin_observation,
    metier: obs.metier,
    place_libre,
    occupee_par,
    a_candidate: obs.a_candidate,
    evenements_restants: Math.max(0, 2 - (obs.evenements_utilises || 0)),
    // Les chiffres, pas le detail
    activite: {
      nb_membres: (membresRes.data || []).length,
      deals_ce_mois: dealsMois.length,
      volume_ce_mois: dealsMois.reduce((a: number, d: any) => a + Number(d.montant || 0), 0),
      volume_total: deals.reduce((a: number, d: any) => a + Number(d.montant || 0), 0),
    },
    membres: (membresRes.data || []).map((m: any) => ({
      nom: m.nom, metier: m.metier, secteur: m.secteur,
      ville: m.ville, pays: m.pays, propose: m.propose,
      score_reputation: m.score_reputation, nb_deals: m.nb_deals,
    })),
    demandes: demandesRes.data || [],
    publications: (pubsRes.data || []).map((p: any) => ({
      ...p, contenu: String(p.contenu || '').slice(0, 200),
    })),
    evenements: evtRes.data || [],
  });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const sb = sbAdmin();
  const body = await req.json();

  if (body.action === 'inscrire_evenement') {
    const { data: obs } = await sb.from('club_observateurs')
      .select('*').eq('tenant_id', tenantId).maybeSingle();
    if (!obs) return NextResponse.json({ error: 'Aucune observation en cours' }, { status: 404 });
    if ((obs.evenements_utilises || 0) >= 2) {
      return NextResponse.json({ error: 'Vous avez utilise vos deux invitations' }, { status: 400 });
    }
    await sb.from('club_observateurs')
      .update({ evenements_utilises: (obs.evenements_utilises || 0) + 1 })
      .eq('tenant_id', tenantId);
    return NextResponse.json({ success: true, restantes: 1 - (obs.evenements_utilises || 0) });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
