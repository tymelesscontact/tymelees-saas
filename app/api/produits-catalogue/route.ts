import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, marque, code_barre, categorie, description, photo_url,
            prix_vente, cout_achat, quantite_stock, seuil_alerte,
            vente_active, article_stock_id, suivi_stock, company_id } = body;
    if (!nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

    const { data, error } = await sb.from('produits_catalogue').insert({
      nom: nom.trim(),
      marque: marque || null, code_barre: code_barre || null,
      categorie: categorie || null, description: description || null,
      photo_url: photo_url || null,
      prix_vente: Number(prix_vente || 0),
      cout_achat: Number(cout_achat || 0),
      quantite_stock: Number(quantite_stock || 0),
      seuil_alerte: Number(seuil_alerte || 0),
      actif: true,
      vente_active: !!vente_active,
      article_stock_id: article_stock_id || null,
      suivi_stock: article_stock_id ? 'stock' : (suivi_stock || 'catalogue'),
      tenant_id: tenantId,
      company_id: company_id && UUID_RE.test(company_id) ? company_id : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, produit: data });
  }

  if (action === 'modifier') {
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const champs: any = {};
    for (const c of ['nom','marque','code_barre','categorie','description','photo_url']) {
      if (body[c] !== undefined) champs[c] = body[c] || null;
    }
    for (const c of ['prix_vente','cout_achat','quantite_stock','seuil_alerte']) {
      if (body[c] !== undefined) champs[c] = Number(body[c] || 0);
    }
    if (body.vente_active !== undefined) champs.vente_active = !!body.vente_active;
    if (body.actif !== undefined) champs.actif = !!body.actif;
    if (body.article_stock_id !== undefined) {
      champs.article_stock_id = body.article_stock_id || null;
      champs.suivi_stock = body.article_stock_id ? 'stock' : (body.suivi_stock || 'catalogue');
    } else if (body.suivi_stock !== undefined) {
      champs.suivi_stock = body.suivi_stock;
    }

    const { error } = await sb.from('produits_catalogue')
      .update(champs).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { error } = await sb.from('produits_catalogue')
      .delete().eq('id', body.id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
