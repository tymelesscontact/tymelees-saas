import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // ── PAIEMENT WALLET (Encaisser) ──────────────────────────
      if (session.metadata?.type === 'wallet_payment') {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

        await sb.from('wallet_transactions')
          .update({ statut: 'confirmé' })
          .eq('id', session.metadata.transaction_id);

        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Xyra Alerts <onboarding@resend.dev>',
            to: 'xyra.solution@gmail.com',
            subject: `💰 Paiement Wallet reçu — ${(session.amount_total / 100).toFixed(2)}€`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>Paiement confirmé !</h2><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}€</strong></p></div>`,
          });
        } catch (e) { console.error('Email error:', e); }

        return NextResponse.json({ received: true });
      }

      // ── ABONNEMENT XYRA ───────────────────────────────────────
      const { email, societe, plan } = session.metadata || {};

      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
      await sb.from('tenants').update({
        statut: 'actif',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      }).eq('email', email);

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const planPrix = plan === 'starter' ? '59€' : plan === 'business' ? '129€' : '249€';
      const planNom = plan === 'starter' ? 'Starter' : plan === 'business' ? 'Business Pro' : 'Enterprise';

      await resend.emails.send({
        from: 'Xyra <onboarding@resend.dev>',
        to: email,
        subject: `✅ Paiement confirmé — Bienvenue sur Xyra ${planNom} !`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
            <div style="background:#0C0C1A;border:1px solid #2EC9B033;padding:28px;border-radius:12px;margin:20px 0;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h2 style="font-size:22px;font-weight:300;color:#2EC9B0;">Paiement confirmé !</h2>
              <p style="color:#A0A0C0;font-size:14px;">Votre abonnement <strong style="color:#C9A84C;">${planNom} — ${planPrix}/mois</strong> est actif.</p>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://xyraio.fr/dashboard" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;border-radius:8px;">
                Accéder à mon dashboard →
              </a>
            </div>
            <p style="text-align:center;font-size:12px;color:#5A5A7A;">
              Support : <a href="https://wa.me/33765189527" style="color:#C9A84C;">WhatsApp Xyra</a>
            </p>
          </div>
        `
      });

      await resend.emails.send({
        from: 'Xyra Alerts <onboarding@resend.dev>',
        to: 'xyra.solution@gmail.com',
        subject: `💳 Paiement reçu — ${societe} — ${planPrix}/mois`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:28px;max-width:480px;margin:0 auto;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;">XYRA · PAIEMENT REÇU 💳</h1>
            <div style="background:#2EC9B011;border:1px solid #2EC9B033;padding:16px;border-radius:8px;margin:12px 0;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#2EC9B0;">${planPrix}/mois</div>
            </div>
            <div style="font-size:14px;line-height:2;">
              <div><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
              <div><span style="color:#5A5A7A;">Email :</span> ${email}</div>
              <div><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${planNom}</strong></div>
            </div>
            <div style="text-align:center;margin-top:16px;">
              <a href="https://xyraio.fr/dashboard" style="background:#C9A84C;color:#000;padding:10px 20px;text-decoration:none;font-weight:700;border-radius:6px;display:inline-block;">
                Voir dans le dashboard →
              </a>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}