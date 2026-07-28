import { NextRequest, NextResponse } from 'next/server';
import { normaliserPlan } from '../../lib/plans';

export const dynamic = 'force-dynamic';

const PLANS: Record<string, { name: string; amount: number; interval: 'month' | 'year' }> = {
  starter:            { name: 'Xyra Starter',            amount: 5900,   interval: 'month' },
  business:           { name: 'Xyra Business Pro',       amount: 12900,  interval: 'month' },
  enterprise:         { name: 'Xyra Enterprise',         amount: 24900,  interval: 'month' },
  multi_societes:     { name: 'Xyra Multi-Societes',     amount: 49900,  interval: 'month' },
  multi_societes_pro: { name: 'Xyra Multi-Societes Pro', amount: 79900,  interval: 'month' },
  multi_pro:          { name: 'Xyra Multi-Societes Pro', amount: 79900,  interval: 'month' },
  holding:            { name: 'Xyra Holding',            amount: 120000, interval: 'month' },
  club_affaires:      { name: "Xyra Club d'affaires",    amount: 200000, interval: 'year'  },
};

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    const body = await req.json();
    const planRecu = body.plan || 'starter';
    const planKey = normaliserPlan(planRecu);
    const email = body.email || '';
    const societe = body.societe || '';

    const planData = PLANS[planKey];
    if (!planData) {
      console.error('Plan refuse:', planRecu, '->', planKey);
      return NextResponse.json(
        { error: `Le plan "${planRecu}" n'est pas disponible en paiement direct. Contactez Xyra.` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email || undefined,
      metadata: { societe, plan: planKey },
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: planData.name,
            description: `Abonnement Xyra — ${societe}`
          },
          unit_amount: planData.amount,
          recurring: { interval: planData.interval },
        },
        quantity: 1,
      }],
      success_url: `https://xyraio.fr/mon-espace?payment=success&plan=${planKey}`,
      cancel_url: `https://xyraio.fr/mon-espace?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
