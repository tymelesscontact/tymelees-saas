import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Devise selon le pays : XOF pour l'UEMOA, XAF pour la CEMAC
const DEVISE_PAYS: Record<string, string> = {
  'senegal': 'XOF', 'cote-divoire': 'XOF', 'benin': 'XOF', 'burkina-faso': 'XOF',
  'mali': 'XOF', 'niger': 'XOF', 'togo': 'XOF', 'guinee-bissau': 'XOF',
  'cameroun': 'XAF', 'gabon': 'XAF', 'congo': 'XAF', 'tchad': 'XAF',
  'centrafrique': 'XAF', 'guinee-equatoriale': 'XAF',
  'france': 'EUR', 'belgique': 'EUR',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, client_nom, client_email, client_tel, client_adresse, items, mode_paiement, devise } = body;
    if (!slug || !client_nom || !client_email || !items?.length) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const { data: company } = await sb.from('companies')
      .select('id,tenant_id,nom,pays').eq('slug', slug).single();
    if (!company) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    // ── Verification en base : ni le prix ni la disponibilite ne
    //    peuvent venir du navigateur.
    const idsProduits = items.map((it: any) => it.produit_id).filter(Boolean);
    if (idsProduits.length !== items.length) {
      return NextResponse.json({ error: 'Articles invalides' }, { status: 400 });
    }

    const { data: produits } = await sb.from('produits_catalogue')
      .select('id,nom,prix_vente,quantite_stock,article_stock_id,suivi_stock,vente_active,actif')
      .in('id', idsProduits).eq('company_id', company.id);

    const itemsVerifies: any[] = [];
    for (const it of items) {
      const p = (produits || []).find((x: any) => x.id === it.produit_id);
      if (!p) return NextResponse.json({ error: `Produit indisponible` }, { status: 400 });
      if (!p.actif || !p.vente_active) {
        return NextResponse.json({ error: `${p.nom} n'est plus en vente` }, { status: 400 });
      }

      const qte = Math.max(1, Math.floor(Number(it.quantite) || 0));

      // Disponibilite selon le mode de suivi
      if (p.suivi_stock === 'stock' && p.article_stock_id) {
        const { data: art } = await sb.from('stock')
          .select('qte,quantite,art').eq('id', p.article_stock_id).maybeSingle();
        const dispo = Number(art?.qte ?? art?.quantite ?? 0);
        if (dispo < qte) {
          return NextResponse.json({
            error: `${p.nom} : ${dispo} disponible${dispo > 1 ? 's' : ''} seulement`,
          }, { status: 400 });
        }
      } else if (p.suivi_stock !== 'aucun') {
        const dispo = Number(p.quantite_stock || 0);
        if (dispo < qte) {
          return NextResponse.json({
            error: `${p.nom} : ${dispo} disponible${dispo > 1 ? 's' : ''} seulement`,
          }, { status: 400 });
        }
      }

      itemsVerifies.push({
        produit_id: p.id,
        nom: p.nom,
        prix: Number(p.prix_vente),   // le prix vient de la base, jamais du client
        quantite: qte,
        article_stock_id: p.article_stock_id || null,
        suivi_stock: p.suivi_stock || 'catalogue',
      });
    }

    const montant_total = itemsVerifies.reduce((a, it) => a + it.prix * it.quantite, 0);
    const reference = `CMD-${Date.now().toString(36).toUpperCase()}`;

    const { data: commande, error } = await sb.from('commandes').insert({
      tenant_id: company.tenant_id, company_id: company.id, reference,
      client_nom, client_email, client_tel, client_adresse,
      items: itemsVerifies, montant_total,
      statut: 'en_attente_paiement',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const paysSlug = String(company.pays || '').toLowerCase().replace(/[^a-z]/g, '-');
    const deviseFinale = devise || DEVISE_PAYS[paysSlug] || 'EUR';

    if (mode_paiement === 'flutterwave') {
      const lien = await payerFlutterwave(commande, itemsVerifies, slug, deviseFinale, sb);
      return NextResponse.json({ url: lien });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as any });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: client_email,
      metadata: { type: 'commande_payment', commande_id: commande.id, reference },
      line_items: itemsVerifies.map((it) => ({
        price_data: {
          currency: (deviseFinale === 'EUR' ? 'eur' : deviseFinale.toLowerCase()),
          product_data: { name: it.nom },
          unit_amount: Math.round(it.prix * 100),
        },
        quantity: it.quantite,
      })),
      success_url: `https://xyraio.fr/boutique/${slug}?commande=success&ref=${reference}`,
      cancel_url: `https://xyraio.fr/boutique/${slug}?commande=annulee`,
    });

    await sb.from('commandes').update({ stripe_session_id: session.id, mode_paiement: 'stripe' }).eq('id', commande.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Commande error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function payerFlutterwave(commande: any, items: any[], slug: string, devise: string, sb: any) {
  const currency = devise || 'XOF';
  const TAUX: Record<string, number> = { XOF: 655.96, XAF: 655.96 };
  const taux = TAUX[currency] || 1;
  const amount = taux !== 1 ? Math.round(commande.montant_total * taux) : commande.montant_total;

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: commande.reference,
      amount,
      currency,
      redirect_url: `https://xyraio.fr/boutique/${slug}?commande=success&ref=${commande.reference}`,
      customer: { email: commande.client_email, name: commande.client_nom, phonenumber: commande.client_tel || undefined },
      customizations: { title: `Commande — ${commande.reference}`, description: `Commande boutique — ${items.map((i: any) => i.nom).join(', ')}` },
      meta: { commande_id: commande.id, reference: commande.reference, type: 'commande_payment' },
    }),
  });
  const data = await res.json();
  if (data.status !== 'success') throw new Error(data.message || 'Erreur Flutterwave');
  await sb.from('commandes').update({ flutterwave_ref: commande.reference, mode_paiement: 'flutterwave' }).eq('id', commande.id);
  return data.data.link;
}
