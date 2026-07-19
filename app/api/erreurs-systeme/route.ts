import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('erreurs_systeme')
    .select('*')
    .eq('resolu', false)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ erreurs: data });
}

export async function POST(req: NextRequest) {
  const sb = getAdminClient();
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { route, message, tenant_email, gravite } = body;
    const { error } = await sb.from('erreurs_systeme').insert({
      route, message, tenant_email, gravite: gravite || 'erreur',
    });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'resoudre') {
    const { id } = body;
    const { error } = await sb.from('erreurs_systeme').update({ resolu: true }).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
