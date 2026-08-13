import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Retrouve le membre a partir du compte connecte, et verifie son adhesion.
async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return { membre: null, raison: 'non_connecte' };

  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return { membre: null, raison: 'session_invalide' };

  const { data: membre } = await sb.from('club_membres')
    .select('*').eq('user_id', auth.user.id).maybeSingle();
  if (!membre) return { membre: null, raison: 'pas_membre' };

  if (membre.statut !== 'actif') return { membre, raison: 'adhesion_inactive' };

  // Un mois de grace apres l'echeance : lecture seule
  if (membre.date_fin_adhesion) {
    const fin = new Date(membre.date_fin_adhesion);
    const grace = new Date(fin); grace.setMonth(grace.getMonth() + 1);
    const now = new Date();
    if (now > grace) return { membre, raison: 'adhesion_expiree' };
    if (now > fin) return { membre, raison: 'periode_grace' };
  }

  return { membre, raison: 'ok' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'accueil';
  const { membre, raison } = await membreConnecte(req);

  if (!membre) {
    return NextResponse.json({ error: raison }, { status: 401 });
  }
  if (raison === 'adhesion_inactive' || raison === 'adhesion_expiree') {
    return NextResponse.json({ error: raison, membre: { nom: membre.nom, statut: membre.statut } }, { status: 403 });
  }

  const sb = sbAdmin();
  const lectureSeule = raison === 'periode_grace';

  if (action === 'accueil') {
    const [annuaire, demandes, evenements] = await Promise.all([
      sb.from('club_membres')
        .select('id,nom,metier,secteur,ville,pays,bio,services,linkedin,score_reputation,nb_deals,recherche,propose,expansion_pays,tel,tel_visible,numero_adherent,date_adhesion')
        .eq('statut', 'actif').order('score_reputation', { ascending: false }),
      sb.from('club_demandes')
        .select('*').eq('statut', 'ouverte').order('created_at', { ascending: false }).limit(30),
      sb.from('evenements')
        .select('*').gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(10),
    ]);
    return NextResponse.json({
      moi: membre,
      lecture_seule: lectureSeule,
      membres: annuaire.data || [],
      demandes: demandes.data || [],
      evenements: evenements.data || [],
    });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { membre, raison } = await membreConnecte(req);
  if (!membre || raison !== 'ok') {
    return NextResponse.json({ error: raison || 'non_autorise' }, { status: 403 });
  }

  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  if (action === 'maj_profil') {
    const champs: any = {};
    for (const c of ['bio', 'recherche', 'propose', 'metier', 'secteur', 'ville', 'pays',
                     'tel', 'linkedin', 'instagram', 'expansion_pays', 'expansion_type',
                     'interets', 'references_pro']) {
      if (body[c] !== undefined) champs[c] = body[c];
    }
    if (body.tel_visible !== undefined) champs.tel_visible = !!body.tel_visible;
    if (Array.isArray(body.services)) champs.services = body.services;

    const { error } = await sb.from('club_membres').update(champs).eq('id', membre.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'publier_demande') {
    const { titre, description, metier_recherche, pays, ville, budget, urgence } = body;
    if (!titre) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    const { data, error } = await sb.from('club_demandes').insert({
      membre_id: membre.id, titre, description: description || null,
      metier_recherche: metier_recherche || null, pays: pays || null,
      ville: ville || null, budget: budget || null,
      urgence: urgence || 'normale', statut: 'ouverte',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, demande: data });
  }

  if (action === 'fermer_demande') {
    const { error } = await sb.from('club_demandes')
      .update({ statut: 'fermee' })
      .eq('id', body.demande_id).eq('membre_id', membre.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
