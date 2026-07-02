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
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 350, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: message.replace(/[^\x00-\xFF]/g, '') } }),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const eventId = searchParams.get('event_id');

  if (action === 'list') {
    const { data } = await sb.from('evenements').select('*').order('date_debut', { ascending: true });
    return NextResponse.json({ evenements: data || [] });
  }

  if (action === 'inscrits' && eventId) {
    const { data } = await sb.from('evenements_inscrits').select('*').eq('evenement_id', eventId);
    return NextResponse.json({ inscrits: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'create') {
    const { titre, description, date_debut, date_fin, lieu, type, prix, max_inscrits, club_only } = body;
    const { data, error } = await sb.from('evenements').insert({
      titre, description, date_debut, date_fin, lieu,
      type: type || 'présentiel', prix: Number(prix || 0),
      max_inscrits: Number(max_inscrits || 50), inscrits: 0,
      statut: 'ouvert', club_only: club_only || false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, evenement: data });
  }

  if (action === 'inscrire') {
    const { evenement_id, nom, email, tel } = body;
    const { data: evt } = await sb.from('evenements').select('titre,inscrits,max_inscrits,date_debut,lieu').eq('id', evenement_id).single();
    if (!evt) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    if (evt.inscrits >= evt.max_inscrits) return NextResponse.json({ error: 'Événement complet' }, { status: 400 });
    await sb.from('evenements_inscrits').insert({ evenement_id, nom, email, tel, statut: 'confirmé' });
    await sb.from('evenements').update({ inscrits: evt.inscrits + 1, statut: evt.inscrits + 1 >= evt.max_inscrits ? 'complet' : 'ouvert' }).eq('id', evenement_id);
    if (tel && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      await sendWhatsApp(tel, `Xyra Events : Inscription confirmee pour ${evt.titre} le ${new Date(evt.date_debut).toLocaleDateString('fr')} a ${evt.lieu}. A bientot !`);
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'inviter_reseau') {
    const { evenement_id, titre, date_debut, lieu } = body;
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    await sendWhatsApp(ownerTel, `Xyra Events : Invitation reseau envoyee pour ${titre} le ${new Date(date_debut).toLocaleDateString('fr')} a ${lieu}. Vos contacts recevront l'invitation.`);
    return NextResponse.json({ success: true });
  }

  if (action === 'rappels') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { data: evts } = await sb.from('evenements').select('*').eq('statut', 'ouvert');
    const now = new Date();
    let rappelsEnvoyes = 0;
    for (const evt of (evts || [])) {
      const dateEvt = new Date(evt.date_debut);
      const jours = Math.ceil((dateEvt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (jours === 7 || jours === 1) {
        await sendWhatsApp(ownerTel, `Xyra Events rappel J-${jours} : ${evt.titre} le ${dateEvt.toLocaleDateString('fr')}. ${evt.inscrits}/${evt.max_inscrits} inscrits.`);
        rappelsEnvoyes++;
      }
    }
    return NextResponse.json({ success: true, rappels: rappelsEnvoyes });
  }

  if (action === 'analyse_roi') {
    const { evenements } = body;
    try {
      const resume = (evenements || []).map((e: any) => `${e.titre}: ${e.inscrits}/${e.max_inscrits} inscrits, ${e.prix}€, ${e.type}`).join(' | ');
      const analyse = await askClaude(`Tu es expert en événementiel B2B. Analyse le ROI de ces événements et donne 3 recommandations concrètes (4 phrases max, français) : ${resume}`);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'checkin') {
    const { inscrit_id } = body;
    await sb.from('evenements_inscrits').update({ statut: 'présent', checked_in_at: new Date().toISOString() }).eq('id', inscrit_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}