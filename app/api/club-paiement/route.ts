import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const DROIT_ENTREE = 50000;   // 500 EUR en centimes
const COTISATION   = 200000;  // 2000 EUR en centimes

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Paiement de l'adhesion au Club.
 * PAIEMENT UNIQUE, jamais d'abonnement : le renouvellement est manuel.
 * Premiere annee  : droit d'entree 500 EUR + cotisation 2000 EUR
 * Renouvellement  : cotisation 2000 EUR seule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { membre_id } = body;
    if (!membre_id) {
      return NextResponse.json({ error: 'membre_id requis' }, { status: 400 });
    }

    const sb = sbAdmin();
    const { data: membre } = await sb.from('club_membres').select('*').eq('id', membre_id).single();
    if (!membre) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    // Le droit d'entree n'est du que si l'adhesion n'a jamais ete continue
    const premiereFois = !membre.droit_entree_paye;

    const lignes: any[] = [{
      price_data: {
        currency: 'eur',
        product_data: { name: "Xyra Club - cotisation annuelle" },
        unit_amount: COTISATION,
      },
      quantity: 1,
    }];
    if (premiereFois) {
      lignes.unshift({
        price_data: {
          currency: 'eur',
          product_data: { name: "Xyra Club - droit d'entree" },
          unit_amount: DROIT_ENTREE,
        },
        quantity: 1,
      });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: membre.email || undefined,
      line_items: lignes,
      metadata: {
        type: 'club_adhesion',
        membre_id: String(membre_id),
        droit_entree: premiereFois ? 'oui' : 'non',
      },
      success_url: 'https://xyraio.fr/club/bienvenue?session={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://xyraio.fr/club/rejoindre',
    });

    await sb.from('club_membres')
      .update({ reference_paiement: session.id })
      .eq('id', membre_id);

    return NextResponse.json({
      success: true,
      url: session.url,
      montant: (premiereFois ? DROIT_ENTREE + COTISATION : COTISATION) / 100,
      premiere_adhesion: premiereFois,
    });
  } catch (e: any) {
    console.error('Club paiement:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
