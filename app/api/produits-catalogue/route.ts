import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'liste';
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q: any) {
    if (tenantId) q = q.eq('tenant_id', tenantId);
    if (companyId && UUID_RE.test(companyId)) q = q.eq('company_id', companyId);
    return q;
  }
  if (action === 'liste') {
    const { data } = await scoped(sb.from('produits_catalogue').select('*').order('nom'));
    return NextResponse.json({ produits: data || [] });
  }
  if (action === 'lookup_barcode') {
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'code requis' }, { status: 400 });
    try {
      const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
      const data = await res.json();
      const item = data.items?.[0];
      if (!item) return NextResponse.json({ found: false });
      return NextResponse.json({ found: true, nom: item.title, marque: item.brand, categorie: item.category, photo_url: item.images?.[0] || '' });
    } catch (e) {
      return NextResponse.json({ found: false });
    }
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
