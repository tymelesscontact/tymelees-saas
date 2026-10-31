import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { getAnthropicKey } from '../../lib/anthropicKey';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { echapHtml } from '../../lib/walletValidation';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ leads: [] });
  let query = sb.from('crm_leads').select('*').eq('tenant_id', tenantId).order('updated_at', { ascending: false });
  if (companyId && UUID_RE.test(companyId)) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const cleAnthropic = await getAnthropicKey(tenantId);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, contact, email, tel, metier, ca_potentiel, source, notes } = body;
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('crm_leads').insert({
      nom, contact, email, tel, metier, ca_potentiel: Number(ca_potentiel) || 0, source, notes,
      etape: 'Nouveau', score: 50, tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, lead: data });
  }

  if (action === 'modifier') {
    const { id } = body;
    // Liste blanche : jamais tenant_id ni autre colonne technique depuis le navigateur.
    const CHAMPS_LEAD = ['nom', 'contact', 'email', 'tel', 'metier', 'ca_potentiel', 'source', 'notes', 'etape', 'score'];
    const fields: Record<string, unknown> = {};
    for (const champ of CHAMPS_LEAD) if (body[champ] !== undefined) fields[champ] = body[champ];
    const { error } = await sb.from('crm_leads').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('crm_leads').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_whatsapp') {
    const { id, message } = body;
    // Destinataire relu dans la fiche du lead : Xyra ne relaie pas vers un numero quelconque.
    const { data: leadWa } = id ? await sb.from('crm_leads').select('tel').eq('id', id).eq('tenant_id', tenantId).maybeSingle() : { data: null };
    if (!leadWa) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    const tel = leadWa.tel;
    if (!tel || !message) return NextResponse.json({ error: 'Téléphone et message requis' }, { status: 400 });
    try {
      const envoi = await envoyerWhatsApp(tel, message, tenantId);
      if (!envoi?.ok) return NextResponse.json({ error: "WhatsApp n'est pas connecté pour le moment — utilisez l'envoi par email" }, { status: 503 });
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi WhatsApp' }, { status: 500 });
    }
    if (id) await sb.from('crm_leads').update({ updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_email') {
    const { id, subject, message } = body;
    const { data: leadMail } = id ? await sb.from('crm_leads').select('email').eq('id', id).eq('tenant_id', tenantId).maybeSingle() : { data: null };
    if (!leadMail) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    const email = leadMail.email;
    if (!email || !message) return NextResponse.json({ error: 'Email et message requis' }, { status: 400 });
    try {
      await sendEmail(email, subject || 'Message de Xyra', `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${echapHtml(String(message))}</div>`);
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }
    if (id) await sb.from('crm_leads').update({ updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenantId);
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
          'x-api-key': cleAnthropic,
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