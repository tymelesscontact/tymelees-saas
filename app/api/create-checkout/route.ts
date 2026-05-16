import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { amount, plan, societe, email, metier, pays, taille } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "sepa_debit"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Tymeless OS — Plan ${plan}`,
              description: `${metier} · ${pays} · ${taille}`,
            },
            unit_amount: amount * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { societe, plan, metier, pays, taille },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/client?plan=${plan.toLowerCase().replace(/ /g,"_")}&societe=${encodeURIComponent(societe)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/inscription?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}