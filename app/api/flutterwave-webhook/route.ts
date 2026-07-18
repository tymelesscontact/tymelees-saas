import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (!secretHash || signature !== secretHash) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const payload = await req.json();

    if (payload.data?.status !== 'successful') {
      return NextResponse.json({ received: true });
    }

    const meta = payload.data.meta || {};
    const { societe, plan } = meta;
    const customer = payload.data.customer || {};
    const email = customer.email;

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await sb.from('tenants').update({
      statut: 'actif',
      flutterwave_tx_ref: payload.data.tx_ref,
    }).eq('email', email);

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const planPrix = plan === 'starter' ? '59€' : plan === 'business' ? '129€' : '249€';
    const planNom = plan === 'starter' ? 'Starter' : plan === 'business' ? 'Business Pro' : 'Enterprise';

    if (email) {
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
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
              <a href="https://xyraio.fr/mon-espace" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;border-radius:8px;">
                Accéder à mon dashboard →
              </a>
            </div>
            <p style="text-align:center;font-size:12px;color:#5A5A7A;">
              Support : <a href="https://wa.me/33765189527" style="color:#C9A84C;">WhatsApp Xyra</a>
            </p>
          </div>
        `
      });
    }

    await resend.emails.send({
      from: 'Xyra Alerts <notifications@xyraio.fr>',
      to: 'xyra.solution@gmail.com',
      subject: `💳 Paiement Flutterwave reçu — ${societe} — ${planPrix}/mois`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:28px;max-width:480px;margin:0 auto;">
          <h1 style="color:#C9A84C;font-family:Georgia,serif;">XYRA · PAIEMENT FLUTTERWAVE 💳</h1>
          <div style="background:#2EC9B011;border:1px solid #2EC9B033;padding:16px;border-radius:8px;margin:12px 0;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#2EC9B0;">${planPrix}/mois</div>
          </div>
          <div style="font-size:14px;line-height:2;">
            <div><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
            <div><span style="color:#5A5A7A;">Email :</span> ${email}</div>
            <div><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${planNom}</strong></div>
          </div>
        </div>
      `
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
