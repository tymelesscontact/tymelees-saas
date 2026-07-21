import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  let query = sb.from('fournisseurs').select('*').order('nom');
  if (tenantId) query = query.eq('tenant_id', tenantId);
  if (companyId) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fournisseurs: data || [] });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'creer') {
    const { nom, categorie, contact, iban, delai_livraison, company_id } = body;
    if (!nom) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('fournisseurs').insert({
      nom, categorie, contact, iban, delai_livraison,
      tenant_id: tenantId,
      company_id: company_id || null,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, fournisseur: data });
  }
  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('fournisseurs').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'commander') {
    const { fournisseur_id, nom, montant, iban, company_id } = body;
    if (!montant) return NextResponse.json({ success: false, error: 'Montant requis' }, { status: 400 });
    const { data, error } = await sb.from('wallet_transactions').insert({
      type: 'sortie',
      libelle: `Commande — ${nom}`,
      montant: Number(montant),
      devise: 'EUR',
      methode: 'Virement SEPA',
      statut: 'à_virer',
      ref: `CMD-${Date.now()}`,
      destinataire_nom: nom,
      destinataire_iban: iban || null,
      tenant_id: tenantId,
      company_id: company_id || null,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, transaction: data });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
