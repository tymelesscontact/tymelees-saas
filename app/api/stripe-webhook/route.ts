import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { email, societe, prenom, plan, planPrice, metier, pays } = session.metadata || {}

    // Notif owner
    await resend.emails.send({
      from: 'Xyra Alerts <onboarding@resend.dev>',
      to: 'xyra.contact@gmail.com',
      subject: `🎉 Nouveau client — ${societe} — ${planPrice}€/mois`,
      html: `
        <div style="font-family:sans-serif;background:#06060E;color:#EAE6DE;padding:32px;">
          <h1 style="color:#C9A84C;">XYRA · NOUVEAU CLIENT 🎉</h1>
          <p><strong>Société :</strong> ${societe}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Plan :</strong> ${plan} · ${planPrice}€/mois</p>
          <p><strong>Secteur :</strong> ${metier}</p>
          <p><strong>Pays :</strong> ${pays}</p>
        </div>
      `
    })
  }

  return NextResponse.json({ received: true })
}