import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'catalogue';
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q: any) {
    if (tenantId) q = q.eq('tenant_id', tenantId);
    if (companyId) q = q.eq('company_id', companyId);
    return q;
  }
  if (action === 'catalogue') {
    const { data } = await scoped(sb.from('services_catalogue').select('*').order('categorie'));
    return NextResponse.json({ services: data || [] });
  }
  if (action === 'packages') {
    const { data } = await scoped(sb.from('services_packages').select('*'));
    return NextResponse.json({ packages: data || [] });
  }
  if (action === 'stats') {
    const { data: devisData } = await scoped(sb.from('devis').select('service_id,montant,statut').not('service_id', 'is', null));
    return NextResponse.json({ devis: devisData || [] });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'creer_service') {
    const { nom, categorie, description, photo_url, prix_standard, prix_vip, prix_enterprise, cout_reel, duree, membres_qualifies, company_id } = body;
    if (!nom) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('services_catalogue').insert({
      tenant_id: tenantId, company_id, nom, categorie, description, photo_url,
      prix_standard: prix_standard || 0, prix_vip: prix_vip || 0, prix_enterprise: prix_enterprise || 0,
      cout_reel: cout_reel || 0, duree, membres_qualifies: membres_qualifies || [],
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, service: data });
  }
  if (action === 'modifier_service') {
    const { id, ...champs } = body;
    delete champs.action;
    const { error } = await sb.from('services_catalogue').update(champs).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'supprimer_service') {
    const { id } = body;
    const { error } = await sb.from('services_catalogue').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'creer_package') {
    const { nom, description, service_ids, prix_package, company_id } = body;
    if (!nom) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('services_packages').insert({
      tenant_id: tenantId, company_id, nom, description, service_ids: service_ids || [], prix_package: prix_package || 0,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, package: data });
  }
  if (action === 'supprimer_package') {
    const { id } = body;
    const { error } = await sb.from('services_packages').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
