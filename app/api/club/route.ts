import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'membres';

  if (action === 'membres') {
    const [membresRes, tenantsRes] = await Promise.all([
      sb.from('club_membres').select('*').eq('statut', 'actif').order('score_reputation', { ascending: false }),
      sb.from('tenants').select('id,societe,email,metier,pays,plan,plan_price').limit(50),
    ]);
    return NextResponse.json({ membres: membresRes.data || [], tenants: tenantsRes.data || [] });
  }

  if (action === 'coinvestissements') {
    const { data } = await sb.from('club_coinvestissements').select('*').eq('statut', 'ouvert').order('created_at', { ascending: false });
    return NextResponse.json({ coinvestissements: data || [] });
  }

  if (action === 'contenu') {
    const { data } = await sb.from('club_contenu').select('*').order('created_at', { ascending: false }).limit(10);
    return NextResponse.json({ contenu: data || [] });
  }

  if (action === 'candidatures') {
    const { data } = await sb.from('club_candidatures').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ candidatures: data || [] });
  }

  if (action === 'speed_meetings') {
    const { data } = await sb.from('club_speed_meetings').select('*').order('date_heure', { ascending: true });
    return NextResponse.json({ meetings: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'candidature') {
    const { nom, email, metier, message, coopte_par, tel, societe, siren,
            pays, ville, zone, linkedin, site_web, recherche, propose } = body;
    if (!nom || !email || !metier) {
      return NextResponse.json({ error: 'Nom, email et metier sont necessaires' }, { status: 400 });
    }
    const { error } = await sb.from('club_candidatures').insert({
      nom, email, metier, message: message || null, coopte_par: coopte_par || null,
      tel: tel || null, societe: societe || null, siren: siren || null,
      pays: pays || null, ville: ville || null, zone: zone || ville || null,
      linkedin: linkedin || null, site_web: site_web || null,
      recherche: recherche || null, propose: propose || null,
      statut: 'en_attente',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_candidature') {
    const { candidature_id } = body;
    const { data: c } = await sb.from('club_candidatures').select('*').eq('id', candidature_id).single();
    if (!c) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });

    // La place est-elle deja prise pour ce metier dans cette zone ?
    const zone = c.zone || c.ville || c.pays;
    if (c.metier && zone) {
      const { data: occupe } = await sb.from('club_membres')
        .select('id,nom').eq('metier', c.metier).eq('zone', zone).eq('statut', 'actif').maybeSingle();
      if (occupe) {
        return NextResponse.json({
          error: `La place de ${c.metier} a ${zone} est deja occupee par ${occupe.nom}`,
        }, { status: 409 });
      }
    }

    await sb.from('club_candidatures')
      .update({ statut: 'accepté', decision_le: new Date().toISOString().slice(0, 10) })
      .eq('id', candidature_id);

    // Membre cree EN ATTENTE DE PAIEMENT, pas encore actif
    const { data: membre, error } = await sb.from('club_membres').insert({
      nom: c.nom, email: c.email, metier: c.metier, tel: c.tel,
      pays: c.pays, ville: c.ville, zone, linkedin: c.linkedin,
      recherche: c.recherche, propose: c.propose, bio: c.message,
      statut: 'attente_paiement',
      droit_entree_paye: false,
      montant_cotisation: 2000,
      score_reputation: 0, ca_genere: 0, nb_deals: 0,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, membre });
  }

  if (action === 'rejeter_candidature') {
    await sb.from('club_candidatures').update({
      statut: 'refusé',
      motif_refus: body.motif || null,
      decision_le: new Date().toISOString().slice(0, 10),
    }).eq('id', body.candidature_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'ia_match') {
    const { membres, profil } = body;
    try {
      const listeMembres = (membres || []).slice(0, 10).map((m: any) => `${m.nom} (${m.metier}, ${m.pays}, services: ${(m.services || []).join(', ')})`).join('\n');
      const prompt = `Tu es un expert en networking B2B. Identifie les 3 meilleures synergies pour ce profil :
Profil : ${profil?.metier || 'Entrepreneur'} - ${profil?.pays || 'France'}

Membres disponibles :
${listeMembres}

Pour chaque match, donne : membre, raison (1 phrase), CA potentiel estimé, score (sur 100).
Réponds en JSON : [{"membre":"nom","raison":"...","ca_estime":5000,"score":87}]`;

      const res = await askClaude(prompt);
      const clean = res.replace(/```json|```/g, '').trim();
      const matches = JSON.parse(clean);
      return NextResponse.json({ success: true, matches });
    } catch (e) {
      return NextResponse.json({ success: true, matches: [] });
    }
  }

  if (action === 'participer_coinvestissement') {
    const { coinvestissement_id, membre_id, montant } = body;
    const { error } = await sb.from('club_participations').insert({ coinvestissement_id, membre_id, montant: Number(montant) });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'creer_coinvestissement') {
    const { titre, description, porteur, montant_total, montant_min_ticket, secteur, rendement_estime, date_cloture } = body;
    const { error } = await sb.from('club_coinvestissements').insert({ titre, description, porteur, montant_total, montant_min_ticket, secteur, rendement_estime, date_cloture });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'planifier_meeting') {
    const { organisateur_id, participant_id, date_heure, duree_minutes, lien_visio } = body;
    const { error } = await sb.from('club_speed_meetings').insert({ organisateur_id, participant_id, date_heure, duree_minutes: duree_minutes || 20, lien_visio: lien_visio || 'https://meet.xyra.io/club' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'maj_score') {
    const { membre_id, delta } = body;
    const { data: m } = await sb.from('club_membres').select('score_reputation').eq('id', membre_id).single();
    if (m) {
      const nouveau = Math.max(0, Math.min(100, (m.score_reputation || 50) + Number(delta)));
      await sb.from('club_membres').update({ score_reputation: nouveau }).eq('id', membre_id);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}