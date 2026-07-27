import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, client_nom, client_email, client_tel, client_adresse, items } = body;
    if (!slug || !client_nom || !client_email || !items?.length) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    const { data: company } = await sb.from('companies').select('id,tenant_id,nom').eq('slug', slug).single();
    if (!company) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    const montant_total = items.reduce((a: number, it: any) => a + it.prix * it.quantite, 0);
    const reference = `CMD-${Date.now().toString(36).toUpperCase()}`;

    const { data: commande, error } = await sb.from('commandes').insert({
      tenant_id: company.tenant_id, company_id: company.id, reference,
      client_nom, client_email, client_tel, client_adresse, items, montant_total,
      statut: 'en_attente_paiement',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: client_email,
      metadata: { commande_id: commande.id, reference },
      line_items: items.map((it: any) => ({
        price_data: { currency: 'eur', product_data: { name: it.nom }, unit_amount: Math.round(it.prix * 100) },
        quantity: it.quantite,
      })),
      success_url: `https://xyraio.fr/boutique/${slug}?commande=success&ref=${reference}`,
      cancel_url: `https://xyraio.fr/boutique/${slug}?commande=annulee`,
    });

    await sb.from('commandes').update({ stripe_session_id: session.id }).eq('id', commande.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Commande error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
