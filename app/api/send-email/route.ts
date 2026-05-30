import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { type, email, societe, prenom, plan, planPrice, metier, pays } = await req.json();

    if (type === 'welcome') {
      // Email bienvenue au client
      await resend.emails.send({
        from: 'Xyra <onboarding@resend.dev>',
        to: email,
        subject: `🎉 Bienvenue sur Xyra, ${societe} !`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:0.15em;color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
            <div style="background:#0C0C1A;border:1px solid #1E1E36;padding:32px;margin:24px 0;">
              <h2 style="font-size:22px;font-weight:300;margin-bottom:16px;">Bienvenue ${prenom || societe} ! 🎉</h2>
              <p style="color:#A0A0C0;font-size:14px;line-height:1.7;margin-bottom:24px;">
                Votre compte Xyra est créé. Vous avez <strong style="color:#C9A84C;">14 jours gratuits</strong> pour découvrir toutes les fonctionnalités.
              </p>
              <div style="background:#121222;border:1px solid #C9A84C33;padding:16px;border-radius:6px;margin-bottom:24px;">
                <div style="font-size:12px;color:#5A5A7A;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em;">Votre compte</div>
                <div style="font-size:14px;margin-bottom:4px;"><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
                <div style="font-size:14px;margin-bottom:4px;"><span style="color:#5A5A7A;">Secteur :</span> ${metier}</div>
                <div style="font-size:14px;margin-bottom:4px;"><span style="color:#5A5A7A;">Pays :</span> ${pays}</div>
                <div style="font-size:14px;"><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${plan} · ${planPrice}€/mois</strong></div>
              </div>
              <div style="text-align:center;">
                <a href="https://tymelees-saas-yzel.vercel.app/login" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
                  Accéder à mon dashboard →
                </a>
              </div>
            </div>
            <p style="text-align:center;font-size:12px;color:#5A5A7A;">Besoin d'aide ? <a href="https://wa.me/33765189527" style="color:#C9A84C;">WhatsApp Support</a></p>
          </div>
        `
      });

      // Notification owner
      await resend.emails.send({
        from: 'Xyra Alerts <onboarding@resend.dev>',
        to: 'curtiss.tymeless@gmail.com',
        subject: `🎉 Nouveau client — ${societe} — ${planPrice}€/mois`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:32px;max-width:500px;margin:0 auto;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;">XYRA · NOUVEAU CLIENT 🎉</h1>
            <div style="background:#0C0C1A;border:1px solid #2EC9B033;padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
              <div style="font-size:32px;font-weight:700;color:#2EC9B0;">+${planPrice}€/mois</div>
            </div>
            <div style="font-size:14px;line-height:2;">
              <div><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
              <div><span style="color:#5A5A7A;">Email :</span> ${email}</div>
              <div><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${plan}</strong></div>
              <div><span style="color:#5A5A7A;">Secteur :</span> ${metier}</div>
              <div><span style="color:#5A5A7A;">Pays :</span> ${pays}</div>
            </div>
            <div style="text-align:center;margin-top:20px;">
              <a href="https://tymelees-saas-yzel.vercel.app/dashboard" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;font-weight:600;border-radius:4px;display:inline-block;">
                Voir dans le dashboard →
              </a>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}