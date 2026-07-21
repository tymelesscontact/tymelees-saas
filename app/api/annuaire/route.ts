import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'contacts';
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'contacts') {
    let q = sb.from('reseau_contacts').select('*').order('nom');
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contacts: data || [] });
  }
  if (action === 'deals') {
    let q = sb.from('reseau_deals').select('*, reseau_contacts(nom,secteur)').order('created_at', { ascending: false });
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deals: data || [] });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'creer_contact') {
    const { nom, type, secteur, pays, ville, continent, tel, email, bio } = body;
    if (!nom) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('reseau_contacts').insert({
      nom, type, secteur, pays, ville, continent, tel, email, bio, tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, contact: data });
  }
  if (action === 'supprimer_contact') {
    const { id } = body;
    const { error } = await sb.from('reseau_contacts').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'demander_mise_en_relation') {
    const { reseau_contact_id, club_membre_id, club_membre_nom, notes } = body;
    const { data, error } = await sb.from('reseau_deals').insert({
      reseau_contact_id, club_membre_id, initiateur: club_membre_nom, notes,
      statut: 'demande_mise_en_relation', tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deal: data });
  }
  if (action === 'valider_mise_en_relation') {
    const { id } = body;
    const { error } = await sb.from('reseau_deals').update({ statut: 'valide' }).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'definir_montant') {
    const { id, valeur, commission_pct } = body;
    const pct = commission_pct || 3;
    const commission_montant = Math.round(Number(valeur) * pct / 100 * 100) / 100;
    const { error } = await sb.from('reseau_deals').update({
      valeur, commission_pct: pct, commission_montant, statut: 'conclu',
    }).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, commission_montant });
  }
  if (action === 'marquer_commission_payee') {
    const { id } = body;
    const { error } = await sb.from('reseau_deals').update({ commission_statut: 'payee' }).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
