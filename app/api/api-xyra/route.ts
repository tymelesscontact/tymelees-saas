import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function genKey(type: string): string {
  const prefix = type === 'test' ? 'ty_test_' : 'ty_live_';
  return prefix + crypto.randomBytes(24).toString('hex');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'all';

  if (action === 'all') {
    const tenantId = await getTenantIdFromRequest(req);
    const companyId = searchParams.get('company_id');
    function scoped(q: any) {
      if (tenantId) q = q.eq('tenant_id', tenantId);
      if (companyId) q = q.eq('company_id', companyId);
      return q;
    }
    const [keysRes, webhooksRes, logsRes] = await Promise.all([
      scoped(sb.from('api_keys').select('*').eq('statut', 'active').order('created_at', { ascending: false })),
      scoped(sb.from('api_webhooks').select('*').order('created_at', { ascending: false })),
      scoped(sb.from('api_logs').select('*').order('created_at', { ascending: false }).limit(50)),
    ]);
    const keys = keysRes.data || [];
    const logs = logsRes.data || [];
    const totalAppels = keys.reduce((a, k) => a + (k.appels_total || 0), 0);
    const tauxSucces = logs.length > 0 ? Math.round(logs.filter(l => l.statut_code < 400).length / logs.length * 100) : 100;
    const latenceMoy = logs.length > 0 ? Math.round(logs.reduce((a, l) => a + (l.duree_ms || 0), 0) / logs.length) : 0;
    return NextResponse.json({ keys, webhooks: webhooksRes.data || [], logs, totalAppels, tauxSucces, latenceMoy });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (action === 'create_key') {
    const { nom, type, permissions } = body;
    const key_value = genKey(type || 'live');
    const { data, error } = await sb.from('api_keys').insert({
      nom, key_value, type: type || 'live',
      permissions: permissions || ['read'],
      limite_mois: 10000,
      tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, key: data, key_value });
  }

  if (action === 'revoquer_key') {
    await sb.from('api_keys').update({ statut: 'révoquée' }).eq('id', body.id);
    return NextResponse.json({ success: true });
  }

  if (action === 'create_webhook') {
    const { nom, url, evenements } = body;
    const secret = 'whsec_' + crypto.randomBytes(16).toString('hex');
    const { data, error } = await sb.from('api_webhooks').insert({
      nom, url, evenements: evenements || ['paiement.recu'],
      secret, statut: 'actif',
      tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, webhook: data });
  }

  if (action === 'toggle_webhook') {
    const { id, statut_actuel } = body;
    const nouveau = statut_actuel === 'actif' ? 'inactif' : 'actif';
    await sb.from('api_webhooks').update({ statut: nouveau }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'tester_webhook') {
    const { url, secret } = body;
    try {
      const payload = { event: 'test.webhook', data: { message: 'Test webhook Xyra', timestamp: new Date().toISOString() } };
      const sig = crypto.createHmac('sha256', secret || 'test').update(JSON.stringify(payload)).digest('hex');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Xyra-Signature': sig },
        body: JSON.stringify(payload),
      });
      return NextResponse.json({ success: res.ok, status: res.status });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message });
    }
  }

  if (action === 'expliquer_erreur') {
    const { code, endpoint, message } = body;
    try {
      const explication = await askClaude(`Tu es expert API. Explique cette erreur en langage simple (2-3 phrases, français, pour un non-développeur) : Code ${code} sur ${endpoint} — "${message}". Donne aussi 1 solution concrète.`);
      return NextResponse.json({ success: true, explication });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'log_appel') {
    const { api_key_id, methode, endpoint, statut_code, duree_ms, ip } = body;
    await sb.from('api_logs').insert({ api_key_id, methode, endpoint, statut_code, duree_ms, ip });
    if (api_key_id) {
      const { data: key } = await sb.from('api_keys').select('appels_total,appels_mois').eq('id', api_key_id).single();
      if (key) await sb.from('api_keys').update({ appels_total: (key.appels_total || 0) + 1, appels_mois: (key.appels_mois || 0) + 1, derniere_utilisation: new Date().toISOString() }).eq('id', api_key_id);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}