import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

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
            <p style="text-align:center;font-size:12px;color:#5A5A7A;letter-spacing:0.1em;margin-bottom:32px;">LE SYSTÈME DE GESTION POUR TOUTE ENTREPRISE</p>
            
            <div style="background:#0C0C1A;border:1px solid #1E1E36;padding:32px;margin:24px 0;">
              <h2 style="font-size:22px;font-weight:300;margin-bottom:16px;">Bienvenue ${prenom || societe} ! 🎉</h2>
              <p style="color:#A0A0C0;font-size:14px;line-height:1.7;margin-bottom:24px;">
                Votre compte Xyra est actif. Vous bénéficiez de <strong style="color:#C9A84C;">14 jours gratuits</strong> avec un accès complet à toutes les fonctionnalités.
              </p>

              <div style="background:#121222;border:1px solid #C9A84C33;padding:20px;border-radius:6px;margin-bottom:24px;">
                <div style="font-size:12px;color:#5A5A7A;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.1em;">Récapitulatif de votre compte</div>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;font-size:13px;color:#5A5A7A;border-bottom:1px solid #1E1E3633;">Société</td><td style="padding:6px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #1E1E3633;">${societe}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#5A5A7A;border-bottom:1px solid #1E1E3633;">Email de connexion</td><td style="padding:6px 0;font-size:13px;text-align:right;border-bottom:1px solid #1E1E3633;">${email}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#5A5A7A;border-bottom:1px solid #1E1E3633;">Secteur</td><td style="padding:6px 0;font-size:13px;text-align:right;border-bottom:1px solid #1E1E3633;">${metier}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#5A5A7A;border-bottom:1px solid #1E1E3633;">Pays</td><td style="padding:6px 0;font-size:13px;text-align:right;border-bottom:1px solid #1E1E3633;">${pays}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#5A5A7A;">Plan</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#C9A84C;text-align:right;">${plan} · ${planPrice}€/mois</td></tr>
                </table>
              </div>

              <div style="background:#C9A84C11;border:1px solid #C9A84C33;border-radius:6px;padding:16px;margin-bottom:24px;">
                <div style="font-size:12px;color:#C9A84C;font-weight:600;margin-bottom:8px;">🔑 Vos identifiants de connexion</div>
                <div style="font-size:13px;color:#A0A0C0;margin-bottom:4px;">Email : <strong style="color:#EAE6DE;">${email}</strong></div>
                <div style="font-size:13px;color:#A0A0C0;">Mot de passe : <strong style="color:#EAE6DE;">celui choisi à l'inscription</strong></div>
              </div>

              <div style="background:#2EC9B011;border:1px solid #2EC9B033;border-radius:6px;padding:14px;margin-bottom:24px;">
                <div style="font-size:12px;color:#2EC9B0;font-weight:600;margin-bottom:6px;">✅ Votre dashboard est prêt !</div>
                <div style="font-size:13px;color:#A0A0C0;">Vous êtes déjà connecté — retrouvez votre dashboard à tout moment sur <strong style="color:#EAE6DE;">tymelees-saas-yzel.vercel.app/dashboard</strong></div>
              </div>

              <div style="border-top:1px solid #1E1E36;padding-top:20px;">
                <div style="font-size:13px;font-weight:600;margin-bottom:12px;">🚀 Pour bien démarrer :</div>
                ${['Ajoutez votre premier client dans le CRM', 'Créez votre premier devis en 30 secondes', 'Configurez votre Wallet & Paiements', 'Invitez votre équipe dans RH & Équipe', 'Explorez la Prospection IA'].map((step, i) => `
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <span style="width:20px;height:20px;border-radius:50%;background:#C9A84C22;border:1px solid #C9A84C;display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:#C9A84C;font-weight:700;flex-shrink:0;">${i+1}</span>
                    <span style="font-size:13px;color:#A0A0C0;">${step}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="text-align:center;padding:16px;border-top:1px solid #1E1E36;">
              <p style="font-size:12px;color:#5A5A7A;margin-bottom:8px;">Une question ? On répond en moins de 5 minutes 👇</p>
              <a href="https://wa.me/33765189527" style="color:#C9A84C;font-size:13px;text-decoration:none;">💬 Support WhatsApp Xyra</a>
            </div>
            <p style="text-align:center;font-size:11px;color:#3A3A5A;margin-top:16px;">© 2026 Xyra · Tous droits réservés</p>
          </div>
        `
      });

      // Notification owner
      await resend.emails.send({
        from: 'Xyra Alerts <onboarding@resend.dev>',
        to: 'xyra.solution@gmail.com',
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