import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cronOk = !!process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
  if (!cronOk) {
    return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr';
      const stripeLink = `${site}/paiement?plan=${encodeURIComponent(tenant.plan || '')}&email=${encodeURIComponent(tenant.email || '')}&societe=${encodeURIComponent(tenant.societe || '')}`;
      const locale = tenant.pays?.includes('United') || tenant.pays?.includes('Canada') ? 'en' : 'fr';

      const subject = locale === 'en'
        ? 'Your Xyra trial ends in 2 days'
        : 'Votre essai Xyra se termine dans 2 jours';

      const html = locale === 'en'
        ? `<div style="font-family:sans-serif;padding:24px;"><p>Hi ${String(tenant.societe || '')}, your trial expires soon.</p><p><a href="${stripeLink}">Activate subscription (${planPrix}/month — ${planNom})</a></p></div>`
        : `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${String(tenant.societe || '')}, votre essai expire bientôt.</p><p><a href="${stripeLink}">Activer l'abonnement (${planPrix}/mois — ${planNom})</a></p></div>`;

      if (!tenant.email) continue;
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: tenant.email,
        subject,
        html,
      });
      sent++;
    }

    return NextResponse.json({ message: `${sent} email(s) envoyé(s)`, count: sent });
  } catch (error: unknown) {
    console.error('Trial ending email error:', error);
    const message = error instanceof Error ? error.message : 'erreur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
