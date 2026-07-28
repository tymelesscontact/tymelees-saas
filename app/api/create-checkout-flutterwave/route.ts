import { NextRequest, NextResponse } from 'next/server';
import { normaliserPlan } from '../../lib/plans';

export const dynamic = 'force-dynamic';

const PLANS: Record<string, { name: string; amountEur: number; periode: 'mois' | 'an' }> = {
  starter:            { name: 'Xyra Starter',            amountEur: 59,   periode: 'mois' },
  business:           { name: 'Xyra Business Pro',       amountEur: 129,  periode: 'mois' },
  enterprise:         { name: 'Xyra Enterprise',         amountEur: 249,  periode: 'mois' },
  multi_societes:     { name: 'Xyra Multi-Societes',     amountEur: 499,  periode: 'mois' },
  multi_societes_pro: { name: 'Xyra Multi-Societes Pro', amountEur: 799,  periode: 'mois' },
  multi_pro:          { name: 'Xyra Multi-Societes Pro', amountEur: 799,  periode: 'mois' },
  holding:            { name: 'Xyra Holding',            amountEur: 1200, periode: 'mois' },
  club_affaires:      { name: "Xyra Club d'affaires",    amountEur: 2000, periode: 'an'   },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planRecu = body.plan || 'starter';
    const planKey = normaliserPlan(planRecu);
    const email = body.email || '';
    const societe = body.societe || '';
    const nom = body.nom || societe || 'Client Xyra';
    const tel = body.tel || '';
    const currency = body.currency || 'XOF';

    const planData = PLANS[planKey];
    if (!planData) {
      console.error('Plan refuse (Flutterwave):', planRecu, '->', planKey);
      return NextResponse.json(
        { error: `Le plan "${planRecu}" n'est pas disponible en paiement direct. Contactez Xyra.` },
        { status: 400 }
      );
    }

    const tauxXOF = 655.96;
    const amount = currency === 'XOF'
      ? Math.round(planData.amountEur * tauxXOF)
      : planData.amountEur;
    const txRef = `xyra-${planKey}-${Date.now()}`;

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
        redirect_url: `https://xyraio.fr/mon-espace?payment=success&plan=${planKey}&ref=${txRef}`,
        customer: {
          email: email || undefined,
          name: nom,
          phonenumber: tel || undefined,
        },
        customizations: {
          title: `Xyra — ${planData.name}`,
          description: `Abonnement Xyra (${planData.periode}) — ${societe}`,
        },
        meta: { societe, plan: planKey, type: 'abonnement', periode: planData.periode },
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
