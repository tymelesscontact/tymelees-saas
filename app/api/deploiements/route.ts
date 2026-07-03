import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: message.replace(/[^\x00-\xFF]/g, '') } }),
  });
}

const PLAN_PRICES: Record<string, number> = {
  starter: 59, business: 129, business_pro: 129, enterprise: 249,
  multi_societes: 499, multi_pro: 799, holding: 1200,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'dashboard';

  if (action === 'dashboard') {
    const { data: tenants } = await sb.from('tenants').select('*').order('created_at', { ascending: false });
    const t = tenants || [];
    const mrr = t.reduce((a, x: any) => a + Number(x.plan_price || 0), 0);
    const actifs = t.filter((x: any) => x.statut === 'actif').length;
    const essais = t.filter((x: any) => x.statut === 'essai').length;
    const churnes = t.filter((x: any) => x.statut === 'suspendu' || x.statut === 'annulé').length;
    const inactifs = t.filter((x: any) => {
      if (!x.last_login) return false;
      const days = (Date.now() - new Date(x.last_login).getTime()) / (1000 * 60 * 60 * 24);
      return days > 14;
    }).length;
    const commissions = mrr * 0.05;
    return NextResponse.json({ tenants: t, mrr, actifs, essais, churnes, inactifs, commissions, arr: mrr * 12 });
  }

  if (action === 'health_scores') {
    const { data: tenants } = await sb.from('tenants').select('id,societe,plan,statut,created_at,last_login,plan_price').order('created_at', { ascending: false });
    const scores = (tenants || []).map((t: any) => {
      let score = 50;
      if (t.plan === 'enterprise') score += 20;
      else if (t.plan === 'business_pro' || t.plan === 'business') score += 10;
      if (t.statut === 'actif') score += 15;
      if (t.last_login) {
        const days = (Date.now() - new Date(t.last_login).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 3) score += 15;
        else if (days < 7) score += 8;
        else if (days > 14) score -= 15;
        else if (days > 30) score -= 25;
      }
      return { ...t, health_score: Math.max(0, Math.min(100, score)) };
    });
    return NextResponse.json({ scores });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'scoring_churn') {
    const { tenants } = body;
    try {
      const aRisque = (tenants || []).filter((t: any) => t.statut === 'essai' || t.health_score < 40)
        .map((t: any) => `${t.societe} (${t.plan}, score:${t.health_score || '?'})`).join(', ');
      const prompt = `Tu es expert en rétention SaaS. Analyse ces clients à risque de churn et donne 3 actions prioritaires (3 phrases max, français) : ${aRisque || 'Aucun client à risque identifié'}. Sois précis et actionnable.`;
      const analyse = await askClaude(prompt);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'generer_upsell') {
    const { societe, plan, metier, taille } = body;
    try {
      const planSuperieur = plan === 'starter' ? 'Business Pro (129€)' : plan === 'business' || plan === 'business_pro' ? 'Enterprise (249€)' : 'Multi-Sociétés (499€)';
      const prompt = `Rédige un email d'upsell court et percutant (5-6 lignes, français, professionnel) pour ${societe} (${metier}, ${taille} employés) actuellement sur le plan ${plan}. Propose-leur le ${planSuperieur} en mettant en avant 2 bénéfices concrets pour leur secteur. Commence par "Bonjour,"`;
      const email = await askClaude(prompt);
      return NextResponse.json({ success: true, email });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'alerte_inactifs') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { inactifs } = body;
    if (!inactifs?.length) return NextResponse.json({ success: true, message: 'Aucun inactif' });
    const noms = inactifs.map((t: any) => t.societe).join(', ');
    await sendWhatsApp(ownerTel, `Xyra Alerte inactifs : ${inactifs.length} client(s) sans connexion depuis 14j : ${noms}. Contactez-les pour eviter le churn.`);
    return NextResponse.json({ success: true });
  }

  if (action === 'rapport_mensuel') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { mrr, actifs, essais, churnes, commissions } = body;
    try {
      const prompt = `Génère un rapport mensuel SaaS WhatsApp (5 lignes max, français, emojis) :
MRR : ${mrr}€ | Clients actifs : ${actifs} | En essai : ${essais} | Churns : ${churnes} | Commissions Xyra : ${commissions}€
Commence par "Rapport SaaS Xyra —" et donne 1 insight et 1 priorité.`;
      const message = await askClaude(prompt);
      await sendWhatsApp(ownerTel, message);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'provisioner_tenant') {
    const { societe, email, plan, pays, metier } = body;
    const prix = PLAN_PRICES[plan] || 59;
    const { data, error } = await sb.from('tenants').insert({
      societe, email, plan, pays, metier,
      plan_price: prix, statut: 'essai',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra Nouveau client : ${societe} (${metier}, ${pays}) - Plan ${plan} a ${prix}EUR/mois. Essai 14j demarre.`);
    }
    return NextResponse.json({ success: true, tenant: data });
  }

  if (action === 'demande_revendeur') {
    const { plan_revendeur, nom, email, societe, tel, message } = body;
    const ownerTel = process.env.OWNER_WHATSAPP;
    const ownerEmail = process.env.OWNER_EMAIL || 'xyra.solution@gmail.com';

    // WhatsApp
    if (ownerTel) {
      await sendWhatsApp(ownerTel, `Xyra NOUVELLE DEMANDE REVENDEUR : ${societe} (${nom}) - Plan ${plan_revendeur}. Email : ${email}. Tel : ${tel||'non renseigne'}. Message : "${(message||'').slice(0,100)}". Repondez rapidement !`);
    }

    // Email via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Xyra <noreply@xyraio.fr>',
          to: [ownerEmail],
          subject: `🚀 Nouvelle demande revendeur — ${plan_revendeur} — ${societe}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#C9A84C">🚀 Nouvelle demande revendeur Xyra</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#666;width:140px">Plan demandé</td><td style="padding:8px 0;font-weight:bold">${plan_revendeur}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Société</td><td style="padding:8px 0;font-weight:bold">${societe}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Contact</td><td style="padding:8px 0">${nom}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#666">Téléphone</td><td style="padding:8px 0">${tel || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Message</td><td style="padding:8px 0">${message || '—'}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px;color:#666;font-size:13px">
                Répondez rapidement — les demandes de revendeurs traitées sous 24h ont un taux de conversion de 3x supérieur.
              </div>
            </div>
          `
        })
      });
    } catch (e) { console.error('Resend error:', e); }

    // Sauvegarder la demande en base
    try { await sb.from('revendeur_demandes').insert({ plan_revendeur, nom, email, societe, tel, message, statut: 'nouveau' }); } catch(e) {}

    return NextResponse.json({ success: true });
  }

  if (action === 'commission_deal') {
    const { deal_id, valeur, societe } = body;
    const commission = Math.round(Number(valeur) * 0.05);
    await sb.from('wallet_transactions').insert({
      type: 'commission_platform', montant: commission, statut: 'confirmé',
      libelle: `Commission Xyra 5% — Deal ${societe}`, created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, commission });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}