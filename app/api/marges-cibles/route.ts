import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ marges: [] });
  const { data } = await sb.from('marges_cibles_categorie').select('*').eq('tenant_id', tenantId).order('categorie');
  return NextResponse.json({ marges: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
  const body = await req.json();
  const { action } = body;

  if (action === 'definir') {
    const { categorie, marge_cible_pct } = body;
    if (!categorie || marge_cible_pct === undefined) return NextResponse.json({ error: 'categorie et marge_cible_pct requis' }, { status: 400 });
    const { error } = await sb.from('marges_cibles_categorie').upsert({
      tenant_id: tenantId, categorie, marge_cible_pct: Number(marge_cible_pct),
    }, { onConflict: 'tenant_id,categorie' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
