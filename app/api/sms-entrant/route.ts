import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Reception de SMS entrant via la passerelle "SMS Gateway for Android"
// (serveur cloud public api.sms-gate.app). Quand un client repond par SMS
// a un message envoye depuis une conversation Xyra, la reponse doit
// reapparaitre dans le Chat du Dashboard.
//
// Securite : endpoint anonyme par nature. Deux garde-fous :
//  1. un jeton dans l'URL (?k=...) compare a SMS_GATE_URL_TOKEN ;
//  2. si SMS_GATE_WEBHOOK_SECRET est defini, verification de la signature
//     HMAC-SHA256 (en-tetes X-Signature = hex(hmac(corps + X-Timestamp)),
//     X-Timestamp) -- comme dans le repo d'exemple officiel.

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const chiffres = (n: string) => (n || '').replace(/\D/g, '');

// Deux numeros correspondent si leur suite de chiffres se termine pareil
// (gere 0659828671 vs +33659828671 vs 33659828671).
function memeNumero(a: string, b: string): boolean {
  const x = chiffres(a), y = chiffres(b);
  if (!x || !y) return false;
  const court = x.length < y.length ? x : y;
  const long = x.length < y.length ? y : x;
  return court.length >= 6 && long.endsWith(court);
}

function verifierSignature(corps: string, timestamp: string, signature: string, secret: string): boolean {
  const attendu = crypto.createHmac('sha256', secret).update(corps + timestamp).digest('hex');
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(attendu);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jetonAttendu = process.env.SMS_GATE_URL_TOKEN;
  if (!jetonAttendu || searchParams.get('k') !== jetonAttendu) {
    return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  }

  const corps = await req.text();

  const secret = process.env.SMS_GATE_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers.get('x-signature');
    const timestamp = req.headers.get('x-timestamp');
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'signature_absente' }, { status: 401 });
    }
    const ts = parseInt(timestamp, 10);
    if (!ts || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) {
      return NextResponse.json({ error: 'horodatage_invalide' }, { status: 401 });
    }
    if (!verifierSignature(corps, timestamp, signature, secret)) {
      return NextResponse.json({ error: 'signature_invalide' }, { status: 401 });
    }
  }

  let event: any;
  try { event = JSON.parse(corps); } catch { return NextResponse.json({ error: 'corps_invalide' }, { status: 400 }); }

  if (event?.event !== 'sms:received') {
    return NextResponse.json({ success: true, ignore: true });
  }

  const expediteur: string = event?.payload?.phoneNumber || '';
  const texte: string = (event?.payload?.message || '').trim();
  const tenantId = process.env.SMS_GATE_TENANT_ID;
  if (!expediteur || !texte || !tenantId) {
    console.error('sms-entrant: donnees incompletes', { expediteur: !!expediteur, texte: !!texte, tenantId: !!tenantId });
    return NextResponse.json({ success: true, ignore: true });
  }

  // On rapproche le numero de l'expediteur d'une conversation existante
  // du tenant proprietaire de la passerelle. Plusieurs candidates : la
  // plus recemment active.
  const { data: convs } = await sb.from('conversations')
    .select('id,tenant_id,contact_nom,contact_tel')
    .eq('tenant_id', tenantId)
    .not('contact_tel', 'is', null)
    .order('derniere_activite', { ascending: false });

  const conv = (convs || []).find((c: any) => memeNumero(c.contact_tel, expediteur));
  if (!conv) {
    console.error('sms-entrant: aucune conversation pour', chiffres(expediteur));
    return NextResponse.json({ success: true, ignore: true });
  }

  const { data: message, error } = await sb.from('chat_messages').insert({
    conversation_id: conv.id,
    auteur: conv.contact_nom || expediteur,
    contenu: texte,
    moi: false,
    type: 'texte',
    lu: false,
  }).select().single();
  if (error) {
    console.error('sms-entrant: insertion message', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conv.id);

  await sb.from('notifications').insert({
    type: 'info', icon: '💬', urgence: 'normale',
    titre: `Réponse SMS de ${conv.contact_nom || 'un contact'}`,
    message: texte.slice(0, 140),
    action_type: 'chat', action_id: conv.id, lu: false,
    tenant_id: conv.tenant_id || null,
  });

  return NextResponse.json({ success: true, message });
}

// GET (proprietaire uniquement) : enregistre le webhook sms:received aupres
// de la passerelle, pour ne pas avoir a taper une commande curl a la main.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (!token || !ownerEmail) return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  const { data } = await sb.auth.getUser(token);
  if (!data?.user?.email || data.user.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  }

  const user = process.env.SMS_GATE_USERNAME;
  const pass = process.env.SMS_GATE_PASSWORD;
  const jeton = process.env.SMS_GATE_URL_TOKEN;
  if (!user || !pass || !jeton) {
    return NextResponse.json({ error: 'Identifiants passerelle manquants (SMS_GATE_USERNAME / SMS_GATE_PASSWORD / SMS_GATE_URL_TOKEN)' }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`;
  const urlWebhook = `${base}/api/sms-entrant?k=${jeton}`;

  try {
    const auth = Buffer.from(`${user}:${pass}`).toString('base64');
    const res = await fetch('https://api.sms-gate.app/3rdparty/v1/webhooks', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlWebhook, event: 'sms:received' }),
    });
    const corps = await res.text();
    if (!res.ok) return NextResponse.json({ error: `Passerelle a repondu ${res.status}`, detail: corps }, { status: 502 });
    return NextResponse.json({ success: true, webhook: JSON.parse(corps) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
