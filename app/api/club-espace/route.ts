import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

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

  // ── Mon bilan : ce que le club m'a rapporte ─────────────
  if (action === 'bilan') {
    const depuis = membre.date_adhesion || '2000-01-01';

    const { data: mesDeals } = await sb.from('club_deals')
      .select('*')
      .or(`membre_prestataire.eq.${membre.id},membre_client.eq.${membre.id},membre_apporteur.eq.${membre.id}`)
      .eq('statut', 'valide');

    const deals = mesDeals || [];
    const gagne = deals.filter((d: any) => d.membre_prestataire === membre.id)
      .reduce((a: number, d: any) => a + Number(d.montant_net || 0), 0);
    const apporte = deals.filter((d: any) => d.membre_apporteur === membre.id)
      .reduce((a: number, d: any) => a + Number(d.commission_apporteur_montant || 0), 0);
    const ca_apporte_aux_autres = deals.filter((d: any) => d.membre_apporteur === membre.id)
      .reduce((a: number, d: any) => a + Number(d.montant || 0), 0);
    const depense = deals.filter((d: any) => d.membre_client === membre.id)
      .reduce((a: number, d: any) => a + Number(d.montant || 0), 0);

    const { data: convs } = await sb.from('club_conversations')
      .select('id').or(`membre_a.eq.${membre.id},membre_b.eq.${membre.id}`);

    const { data: mesDemandes } = await sb.from('club_demandes')
      .select('id').eq('membre_id', membre.id);

    const cout = Number(membre.montant_cotisation || 2000);
    const retour = gagne + apporte;

    return NextResponse.json({
      success: true,
      depuis,
      fin_adhesion: membre.date_fin_adhesion,
      deals_conclus: deals.filter((d: any) => d.membre_prestataire === membre.id).length,
      deals_apportes: deals.filter((d: any) => d.membre_apporteur === membre.id).length,
      ca_gagne: gagne,
      commissions_percues: apporte,
      ca_apporte_aux_autres,
      montant_depense: depense,
      mises_en_relation: (convs || []).length,
      demandes_publiees: (mesDemandes || []).length,
      cout_adhesion: cout,
      retour_total: retour,
      rapport: cout > 0 ? Math.round((retour / cout) * 10) / 10 : 0,
      score_reputation: membre.score_reputation || 0,
    });
  }

  // ── Classement des donneurs d'affaires ──────────────────
  if (action === 'classement') {
    const { data: deals } = await sb.from('club_deals')
      .select('membre_apporteur,montant,commission_apporteur_montant')
      .eq('statut', 'valide').not('membre_apporteur', 'is', null);

    const parMembre: Record<string, { ca: number; nb: number; gain: number }> = {};
    for (const d of deals || []) {
      const id = d.membre_apporteur;
      if (!parMembre[id]) parMembre[id] = { ca: 0, nb: 0, gain: 0 };
      parMembre[id].ca += Number(d.montant || 0);
      parMembre[id].gain += Number(d.commission_apporteur_montant || 0);
      parMembre[id].nb += 1;
    }

    const { data: tous } = await sb.from('club_membres')
      .select('id,nom,metier,ville,pays,score_reputation').eq('statut', 'actif');

    const classement = Object.entries(parMembre)
      .map(([id, v]) => {
        const m = (tous || []).find((x: any) => x.id === id);
        return { id, nom: m?.nom || 'Membre', metier: m?.metier || '', ville: m?.ville || '', ...v };
      })
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 20);

    return NextResponse.json({ success: true, classement, moi: membre.id });
  }

  // ── Places libres par metier et par zone ────────────────
  if (action === 'places') {
    const { data: occupes } = await sb.from('club_membres')
      .select('metier,zone,ville,pays,nom').eq('statut', 'actif');

    const parZone: Record<string, any[]> = {};
    for (const m of occupes || []) {
      const z = m.zone || m.ville || m.pays || 'Non precisee';
      if (!parZone[z]) parZone[z] = [];
      parZone[z].push({ metier: m.metier, nom: m.nom });
    }

    return NextResponse.json({
      success: true,
      zones: Object.entries(parZone).map(([zone, metiers]) => ({ zone, metiers })),
      ma_zone: membre.zone || membre.ville || membre.pays,
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

  // ── Expansion internationale : Lea compose une equipe ───
  if (action === 'plan_expansion') {
    const pays = body.pays || membre.expansion_pays;
    const objectif = body.objectif || membre.expansion_type || 'les_deux';
    if (!pays) {
      return NextResponse.json({ error: 'Indiquez le pays vise dans votre profil' }, { status: 400 });
    }

    // Les membres presents sur place
    const { data: locaux } = await sb.from('club_membres')
      .select('id,nom,metier,secteur,ville,pays,propose,recherche,score_reputation,nb_deals')
      .eq('statut', 'actif').ilike('pays', `%${pays}%`);

    if (!locaux || locaux.length === 0) {
      return NextResponse.json({
        success: true,
        pays,
        aucun_membre: true,
        message: `Aucun membre du club n'est encore etabli en ${pays}. Vous serez prevenu des qu'un membre s'y installe.`,
        membres: [],
      });
    }

    const liste = locaux.map((m: any, i: number) =>
      `${i + 1}. ${m.nom} — ${m.metier}${m.secteur ? ' (' + m.secteur + ')' : ''}, ${m.ville || m.pays}. Propose : ${m.propose || 'non precise'}. Reputation ${m.score_reputation || 0}, ${m.nb_deals || 0} deals.`
    ).join('\n');

    const but = objectif === 'vendre'
      ? "vendre a distance dans ce pays sans s'y implanter (il cherche des clients, des distributeurs ou des apporteurs d'affaires)"
      : objectif === 'implanter'
      ? "s'implanter dans ce pays (il aura besoin d'accompagnement local : comptable, juridique, partenaires, connaissance du marche)"
      : "vendre dans ce pays et envisager de s'y implanter ensuite";

    const prompt = `Tu conseilles un membre d'un club d'affaires prive qui veut se developper en ${pays}.

SON PROFIL
Metier : ${membre.metier || 'non precise'}
Secteur : ${membre.secteur || 'non precise'}
Base a : ${membre.ville || ''} ${membre.pays || ''}
Ce qu'il propose : ${membre.propose || 'non precise'}
Son objectif : ${but}

LES MEMBRES DU CLUB PRESENTS EN ${pays.toUpperCase()}
${liste}

Reponds UNIQUEMENT en JSON, sans texte avant ni apres, sans balises markdown :
{
  "synthese": "2 phrases sur ce qui l'attend dans ce pays pour son metier",
  "equipe": [
    { "nom": "nom exact du membre de la liste", "role": "ce qu'il peut lui apporter concretement", "ordre": 1, "pourquoi": "une phrase" }
  ],
  "premiere_etape": "l'action concrete a faire en premier",
  "points_vigilance": ["2 a 3 points d'attention propres a ce pays et ce metier"]
}

Classe l'equipe dans l'ordre ou il devrait les contacter. N'invente aucun nom : utilise uniquement ceux de la liste. Si un membre n'apporte rien d'utile, ne le cite pas.`;

    try {
      const reponse = await askClaude(prompt);
      const propre = reponse.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const plan = JSON.parse(propre);
      return NextResponse.json({ success: true, pays, objectif, plan, membres: locaux });
    } catch (e: any) {
      return NextResponse.json({ error: "Lea n'a pas pu etablir le plan", detail: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
