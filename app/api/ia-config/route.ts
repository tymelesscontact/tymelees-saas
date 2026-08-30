import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { chiffrer } from '../../lib/anthropicKey';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { data } = await sb.from('tenants').select('anthropic_api_key').eq('id', tenantId).maybeSingle();
  const active = !!data?.anthropic_api_key;
  return NextResponse.json({ active });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'sauvegarder') {
    const { cle } = body;
    if (!cle || typeof cle !== 'string' || !cle.startsWith('sk-ant-')) {
      return NextResponse.json({ success: false, error: 'Format de cle invalide -- doit commencer par sk-ant-' }, { status: 400 });
    }
    const chiffree = chiffrer(cle.trim());
    const { error } = await sb.from('tenants').update({ anthropic_api_key: chiffree }).eq('id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'retirer') {
    const { error } = await sb.from('tenants').update({ anthropic_api_key: null }).eq('id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
