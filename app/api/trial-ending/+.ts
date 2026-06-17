import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    // Récupérer tous les clients dont l'essai se termine dans 2 jours
    const in2days = new Date();
    in2days.setDate(in2days.getDate() + 2);
    const dateStr = in2days.toISOString().split('T')[0];

    const { data: tenants } = await sb
      .from('tenants')
      .select('*')
      .eq('statut', 'essai')
      .lte('trial_ends_at', `${dateStr}T23:59:59`);

    if (!tenants || tenants.length === 0) {
      return NextResponse.json({ message: 'Aucun essai expirant bientôt', count: 0 });
    }

    let sent = 0;
    for (const tenant of tenants) {
      const planNom = tenant.plan === 'starter' ? 'Starter' : tenant.plan === 'business' ? 'Business Pro' : 'Enterprise';
      const planPrix = tenant.plan === 'starter' ? '59€' : tenant.plan === 'business' ? '129€' : '249€';
      const stripeLink = `https://tymelees-saas-yzel.vercel.app/paiement?plan=${tenant.plan}&email=${tenant.email}&societe=${encodeURIComponent(tenant.societe)}`;
      const locale = tenant.pays?.includes('United') || tenant.pays?.includes('Canada') ? 'en' : 'fr';

      const subject = locale === 'en'
        ? `⏰ Your Xyra trial ends in 2 days`
        : `⏰ Votre essai Xyra se termine dans 2 jours`;

      const html = locale === 'en' ? `
        <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
          <h1 style="color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
          <div style="background:#FF525211;border:1px solid #FF525233;padding:20px;border-radius:10px;margin:20px 0;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">⏰</div>
            <h2 style="color:#FF5252;font-weight:300;">Your trial ends in 2 days</h2>
          </div>
          <p style="color:#A0A0C0;font-size:14px;line-height:1.8;">
            Hi <strong>${tenant.societe}</strong>,<br/><br/>
            Your 14-day free trial expires soon. Don't lose access to your data and features — activate your subscription now.
          </p>
          <div style="background:#121222;border:1px solid #C9A84C33;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#C9A84C;">${planPrix}/month</div>
            <div style="font-size:13px;color:#5A5A7A;">${planNom} plan — Cancel anytime</div>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${stripeLink}" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:16px 40px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;border-radius:8px;">
              Activate my subscription →
            </a>
          </div>
          <div style="background:#0C0C1A;border:1px solid #1E1E36;border-radius:8px;padding:14px;margin-bottom:16px;">
            <div style="font-size:12px;color:#C9A84C;font-weight:600;margin-bottom:8px;">✓ What you keep with your subscription</div>
            <div style="font-size:12px;color:#A0A0C0;line-height:1.8;">
              ✓ All your data (clients, quotes, invoices)<br/>
              ✓ Full access to all modules<br/>
              ✓ WhatsApp support included<br/>
              ✓ No commitment — cancel anytime
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#5A5A7A;">
            Questions? <a href="https://wa.me/33765189527" style="color:#C9A84C;">Contact us on WhatsApp</a>
          </p>
        </div>
      ` : `
        <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
          <h1 style="color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
          <div style="background:#FF525211;border:1px solid #FF525233;padding:20px;border-radius:10px;margin:20px 0;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">⏰</div>
            <h2 style="color:#FF5252;font-weight:300;">Votre essai se termine dans 2 jours</h2>
          </div>
          <p style="color:#A0A0C0;font-size:14px;line-height:1.8;">
            Bonjour <strong>${tenant.societe}</strong>,<br/><br/>
            Votre période d'essai gratuit de 14 jours expire bientôt. Ne perdez pas l'accès à vos données et fonctionnalités — activez votre abonnement maintenant.
          </p>
          <div style="background:#121222;border:1px solid #C9A84C33;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#C9A84C;">${planPrix}/mois</div>
            <div style="font-size:13px;color:#5A5A7A;">Plan ${planNom} — Sans engagement</div>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${stripeLink}" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:16px 40px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;border-radius:8px;">
              Activer mon abonnement →
            </a>
          </div>
          <div style="background:#0C0C1A;border:1px solid #1E1E36;border-radius:8px;padding:14px;margin-bottom:16px;">
            <div style="font-size:12px;color:#C9A84C;font-weight:600;margin-bottom:8px;">✓ Ce que vous conservez avec votre abonnement</div>
            <div style="font-size:12px;color:#A0A0C0;line-height:1.8;">
              ✓ Toutes vos données (clients, devis, factures)<br/>
              ✓ Accès complet à tous vos modules<br/>
              ✓ Support WhatsApp inclus<br/>
              ✓ Sans engagement — résiliation à tout moment
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#5A5A7A;">
            Des questions ? <a href="https://wa.me/33765189527" style="color:#C9A84C;">Contactez-nous sur WhatsApp</a>
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: tenant.email,
        subject,
        html,
      });

      sent++;
    }

    return NextResponse.json({ message: `${sent} email(s) envoyé(s)`, count: sent });
  } catch (error: any) {
    console.error('Trial ending email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}