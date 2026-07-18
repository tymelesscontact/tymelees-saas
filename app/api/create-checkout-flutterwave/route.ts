import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = body.plan || 'starter';
    const email = body.email || '';
    const societe = body.societe || '';
    const nom = body.nom || societe || 'Client Xyra';
    const tel = body.tel || '';
    const currency = body.currency || 'XOF';

    const PLANS: Record<string, { name: string; amountEur: number }> = {
      starter: { name: 'Xyra Starter', amountEur: 59 },
      business: { name: 'Xyra Business Pro', amountEur: 129 },
      enterprise: { name: 'Xyra Enterprise', amountEur: 249 },
    };
    const planData = PLANS[plan] || PLANS.starter;
    const tauxXOF = 655.96;
    const amount = currency === 'XOF' ? Math.round(planData.amountEur * tauxXOF) : planData.amountEur;
    const txRef = `xyra-${plan}-${Date.now()}`;

    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency,
        redirect_url: `https://xyraio.fr/mon-espace?payment=success&plan=${plan}&ref=${txRef}`,
        customer: {
          email: email || undefined,
          name: nom,
          phonenumber: tel || undefined,
        },
        customizations: {
          title: `Xyra — ${planData.name}`,
          description: `Abonnement mensuel Xyra — ${societe}`,
        },
        meta: { societe, plan },
      }),
    });

    const data = await res.json();

    if (data.status !== 'success') {
      return NextResponse.json({ error: data.message || 'Erreur Flutterwave' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.link, tx_ref: txRef });
  } catch (error: any) {
    console.error('Flutterwave error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
