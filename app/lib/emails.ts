import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── EMAIL BIENVENUE CLIENT ────────────────────────────────────
export const sendWelcomeEmail = async ({
  email, societe, prenom, plan, planPrice, metier, pays
}: {
  email: string;
  societe: string;
  prenom?: string;
  plan: string;
  planPrice: number;
  metier: string;
  pays: string;
}) => {
  await resend.emails.send({
    from: 'Xyra <onboarding@resend.dev>',
    to: email,
    subject: `🎉 Bienvenue sur Xyra, ${societe} !`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:28px;font-weight:300;letter-spacing:0.15em;color:#C9A84C;font-family:Georgia,serif;">XYRA</h1>
          <p style="font-size:12px;color:#5A5A7A;letter-spacing:0.1em;">LE SYSTÈME DE GESTION POUR TOUTE ENTREPRISE</p>
        </div>

        <div style="background:#0C0C1A;border:1px solid #1E1E36;padding:32px;margin-bottom:24px;">
          <h2 style="font-size:22px;font-weight:300;margin-bottom:8px;">Bienvenue ${prenom || societe} ! 🎉</h2>
          <p style="color:#A0A0C0;font-size:14px;line-height:1.7;margin-bottom:24px;">
            Votre compte Xyra est créé et prêt à l'emploi. Vous avez <strong style="color:#C9A84C;">14 jours gratuits</strong> pour découvrir toutes les fonctionnalités.
          </p>

          <div style="background:#121222;border:1px solid #C9A84C33;padding:20px;border-radius:8px;margin-bottom:24px;">
            <h3 style="font-size:12px;color:#5A5A7A;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Votre compte</h3>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#A0A0C0;font-size:13px;">Société</span>
              <span style="color:#EAE6DE;font-size:13px;font-weight:600;">${societe}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#A0A0C0;font-size:13px;">Secteur</span>
              <span style="color:#EAE6DE;font-size:13px;">${metier}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#A0A0C0;font-size:13px;">Pays</span>
              <span style="color:#EAE6DE;font-size:13px;">${pays}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#A0A0C0;font-size:13px;">Plan</span>
              <span style="color:#C9A84C;font-size:13px;font-weight:700;">${plan} · ${planPrice}€/mois</span>
            </div>
          </div>

          <h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">🚀 Pour démarrer en 5 minutes :</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${['Connectez-vous à votre dashboard', 'Ajoutez votre premier client', 'Créez votre premier devis', 'Configurez votre wallet', 'Invitez votre équipe'].map((step, i) => `
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#C9A84C22;border:1px solid #C9A84C;display:flex;align-items:center;justify-content:center;font-size:11px;color:#C9A84C;font-weight:700;flex-shrink:0;">${i+1}</div>
                <span style="font-size:13px;color:#A0A0C0;">${step}</span>
              </div>
            `).join('')}
          </div>

          <div style="text-align:center;margin-top:28px;">
            <a href="https://tymelees-saas-yzel.vercel.app/login" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
              Accéder à mon dashboard →
            </a>
          </div>
        </div>

        <div style="text-align:center;padding:20px;border-top:1px solid #1E1E36;">
          <p style="font-size:12px;color:#5A5A7A;margin-bottom:8px;">Besoin d'aide ? On répond en moins de 5 minutes</p>
          <a href="https://wa.me/33765189527" style="color:#C9A84C;font-size:13px;text-decoration:none;">💬 Contacter le support WhatsApp</a>
        </div>
        <p style="text-align:center;font-size:11px;color:#3A3A5A;margin-top:16px;">© 2026 Xyra · Tous droits réservés</p>
      </div>
    `
  });
};

// ─── NOTIFICATION OWNER (TOI) ──────────────────────────────────
export const sendOwnerNotification = async ({
  societe, email, plan, planPrice, metier, pays
}: {
  societe: string;
  email: string;
  plan: string;
  planPrice: number;
  metier: string;
  pays: string;
}) => {
  await resend.emails.send({
    from: 'Xyra Alerts <onboarding@resend.dev>',
    to: 'xyra.contact@gmail.com',
    subject: `🎉 Nouveau client Xyra — ${societe} — ${planPrice}€/mois`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:32px;max-width:500px;margin:0 auto;">
        <h1 style="font-size:20px;color:#C9A84C;font-family:Georgia,serif;margin-bottom:4px;">XYRA · NOUVEAU CLIENT</h1>
        <div style="background:#0C0C1A;border:1px solid #2EC9B033;padding:20px;border-radius:8px;margin:16px 0;">
          <div style="font-size:24px;font-weight:700;color:#2EC9B0;margin-bottom:4px;">+${planPrice}€/mois 🎉</div>
          <div style="font-size:12px;color:#5A5A7A;">Nouveau client inscrit</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${[['Société', societe], ['Email', email], ['Plan', plan], ['MRR', planPrice+'€/mois'], ['Secteur', metier], ['Pays', pays]].map(([l,v]) => `
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#5A5A7A;border-bottom:1px solid #1E1E36;">${l}</td>
              <td style="padding:8px 0;font-size:13px;color:#EAE6DE;font-weight:600;border-bottom:1px solid #1E1E36;text-align:right;">${v}</td>
            </tr>
          `).join('')}
        </table>
        <div style="text-align:center;margin-top:20px;">
          <a href="https://tymelees-saas-yzel.vercel.app/dashboard" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;font-weight:600;font-size:13px;display:inline-block;border-radius:4px;">
            Voir dans le dashboard →
          </a>
        </div>
      </div>
    `
  });
};

// ─── EMAIL J+12 — FIN D'ESSAI ──────────────────────────────────
export const sendTrialEndingEmail = async ({
  email, societe, plan, planPrice
}: {
  email: string;
  societe: string;
  plan: string;
  planPrice: number;
}) => {
  await resend.emails.send({
    from: 'Xyra <onboarding@resend.dev>',
    to: email,
    subject: `⏰ Votre essai Xyra se termine dans 2 jours`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
        <h1 style="font-size:24px;color:#C9A84C;font-family:Georgia,serif;">XYRA</h1>
        <h2 style="font-size:20px;font-weight:300;margin:16px 0 8px;">⏰ Votre essai se termine dans 2 jours</h2>
        <p style="color:#A0A0C0;font-size:14px;line-height:1.7;margin-bottom:24px;">
          Bonjour ${societe},<br/><br/>
          Votre période d'essai gratuit de 14 jours touche à sa fin. Pour continuer à profiter de toutes les fonctionnalités Xyra, activez votre abonnement maintenant.
        </p>
        <div style="background:#0C0C1A;border:1px solid #C9A84C33;padding:20px;border-radius:8px;margin-bottom:24px;text-align:center;">
          <div style="font-size:32px;font-weight:300;color:#C9A84C;">${planPrice}€<span style="font-size:14px;color:#5A5A7A;">/mois</span></div>
          <div style="font-size:13px;color:#A0A0C0;margin-top:4px;">Plan ${plan}</div>
        </div>
        <div style="text-align:center;">
          <a href="https://tymelees-saas-yzel.vercel.app/dashboard" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
            Activer mon abonnement →
          </a>
        </div>
        <p style="text-align:center;font-size:12px;color:#5A5A7A;margin-top:20px;">
          Des questions ? <a href="https://wa.me/33765189527" style="color:#C9A84C;">Contactez-nous sur WhatsApp</a>
        </p>
      </div>
    `
  });
};