import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

    const { plan, email, societe } = await req.json();

    const PLANS: Record<string, { name: string; amount: number }> = {
      starter:   { name: 'Xyra Starter',      amount: 5900  },
      business:  { name: 'Xyra Business Pro', amount: 12900 },
      enterprise:{ name: 'Xyra Enterprise',   amount: 24900 },
    };

    const planData = PLANS[plan];
    if (!planData) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      metadata: { societe, plan },
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: planData.name, description: `Abonnement mensuel Xyra — ${societe}` },
          unit_amount: planData.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `https://tymelees-saas-yzel.vercel.app/dashboard?payment=success&plan=${plan}`,
      cancel_url: `https://tymelees-saas-yzel.vercel.app/inscription?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}