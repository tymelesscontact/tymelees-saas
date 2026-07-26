import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 });

  const { data: company } = await sb.from('companies').select('id,nom,logo_url,couleur,slug').eq('slug', slug).single();
  if (!company) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

  const { data: produits } = await sb.from('produits_catalogue')
    .select('id,nom,marque,categorie,description,photo_url,prix_vente,quantite_stock')
    .eq('company_id', company.id)
    .eq('vente_active', true)
    .eq('actif', true)
    .order('categorie');

  return NextResponse.json({ company, produits: produits || [] });
}
