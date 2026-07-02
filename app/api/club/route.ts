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
    const { nom, email, metier, message, coopte_par } = body;
    const { error } = await sb.from('club_candidatures').insert({ nom, email, metier, message, coopte_par });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_candidature') {
    const { candidature_id, nom, email, metier, pays, bio, plan } = body;
    await sb.from('club_candidatures').update({ statut: 'accepté' }).eq('id', candidature_id);
    await sb.from('club_membres').insert({ nom, email, metier, pays, bio, plan: plan || 'starter', statut: 'actif' });
    return NextResponse.json({ success: true });
  }

  if (action === 'rejeter_candidature') {
    await sb.from('club_candidatures').update({ statut: 'refusé' }).eq('id', body.candidature_id);
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