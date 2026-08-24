import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ charges: [] });
  let query = sb.from('charges').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (companyId && UUID_RE.test(companyId)) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charges: data });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'creer' || action === 'modifier') {
    const { id, categorie, libelle, montant, frequence } = body;
    if (action === 'modifier' && id) {
      const { error } = await sb.from('charges').update({ categorie, libelle, montant: Number(montant), frequence }).eq('id', id).eq('tenant_id', tenantId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    const { data, error } = await sb.from('charges').insert({ categorie, libelle, montant: Number(montant), frequence: frequence || 'mensuelle', tenant_id: tenantId }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, charge: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('charges').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}