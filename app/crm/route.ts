import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      text: { body: message },
    }),
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET() {
  const { data, error } = await sb.from('crm_leads').select('*').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, contact, email, tel, metier, ca_potentiel, source, notes } = body;
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('crm_leads').insert({
      nom, contact, email, tel, metier, ca_potentiel: Number(ca_potentiel) || 0, source, notes,
      etape: 'Nouveau', score: 50,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, lead: data });
  }

  if (action === 'modifier') {
    const { id, ...fields } = body;
    const { error } = await sb.from('crm_leads').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('crm_leads').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_whatsapp') {
    const { id, tel, message } = body;
    if (!tel || !message) return NextResponse.json({ error: 'Téléphone et message requis' }, { status: 400 });
    try {
      await sendWhatsApp(tel, message);
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi WhatsApp' }, { status: 500 });
    }
    if (id) await sb.from('crm_leads').update({ updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_email') {
    const { id, email, subject, message } = body;
    if (!email || !message) return NextResponse.json({ error: 'Email et message requis' }, { status: 400 });
    try {
      await sendEmail(email, subject || 'Message de Xyra', `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${message}</div>`);
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }
    if (id) await sb.from('crm_leads').update({ updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'generer_message_ia') {
    const { lead } = body;
    if (!lead) return NextResponse.json({ error: 'Données du lead manquantes' }, { status: 400 });
    try {
      const prompt = `Tu rédiges un message de relance commerciale court (WhatsApp ou email, 3-5 phrases) en français pour Xyra, à destination d'un prospect réel. Voici les données réelles du prospect :
Entreprise : ${lead.nom}
Contact : ${lead.contact || 'non renseigné'}
Secteur : ${lead.metier || 'non renseigné'}
Étape actuelle du pipeline : ${lead.etape}
CA potentiel estimé : ${lead.ca_potentiel || 0}€
Notes internes : ${lead.notes || 'aucune'}

Rédige un message de relance personnalisé et concret basé sur ces informations, adapté à l'étape actuelle. Pas de formule générique passe-partout. Réponds uniquement avec le texte du message, sans préambule.`;

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 350,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const claudeData = await claudeRes.json();
      const message = claudeData.content?.[0]?.text || '';
      if (!message) return NextResponse.json({ error: 'Génération vide' }, { status: 500 });
      return NextResponse.json({ success: true, message });
    } catch (e) {
      return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}