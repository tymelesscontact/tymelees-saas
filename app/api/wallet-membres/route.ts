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
  const action = searchParams.get('action') || 'membres';

  if (action === 'membres') {
    const { data: tenants } = await sb.from('tenants').select('*').order('created_at', { ascending: false });
    const membres = (tenants || []).map((t: any) => {
      const prix = PLAN_PRICES[t.plan] || 59;
      const trialEnd = t.trial_ends_at ? new Date(t.trial_ends_at) : null;
      const now = new Date();
      const joursRestants = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      return { ...t, prix_plan: prix, jours_restants: joursRestants, en_essai: t.statut === 'essai' };
    });
    const mrr = membres.filter((m: any) => m.statut === 'actif').reduce((a: number, m: any) => a + m.prix_plan, 0);
    const essais = membres.filter((m: any) => m.statut === 'essai').length;
    const expirant = membres.filter((m: any) => m.statut === 'essai' && m.jours_restants !== null && m.jours_restants <= 3 && m.jours_restants >= 0).length;
    const churnes = membres.filter((m: any) => m.statut === 'expiré' || m.statut === 'annulé').length;
    const total = membres.length;
    const tauxChurn = total > 0 ? Math.round((churnes / total) * 100) : 0;
    return NextResponse.json({ membres, mrr, essais, expirant, churnes, tauxChurn });
  }

  if (action === 'historique') {
    const { data } = await sb.from('inscriptions').select('*').order('created_at', { ascending: false }).limit(100);
    return NextResponse.json({ historique: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'upgrade') {
    const { tenant_id, nouveau_plan } = body;
    const prix = PLAN_PRICES[nouveau_plan] || 59;
    await sb.from('tenants').update({ plan: nouveau_plan, plan_price: prix, statut: 'actif' }).eq('id', tenant_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'downgrade') {
    const { tenant_id, nouveau_plan } = body;
    const prix = PLAN_PRICES[nouveau_plan] || 59;
    await sb.from('tenants').update({ plan: nouveau_plan, plan_price: prix }).eq('id', tenant_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'suspendre') {
    await sb.from('tenants').update({ statut: 'suspendu' }).eq('id', body.tenant_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'reactiver') {
    await sb.from('tenants').update({ statut: 'actif' }).eq('id', body.tenant_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'analyse_churn') {
    const { membres } = body;
    try {
      const enEssai = (membres || []).filter((m: any) => m.statut === 'essai').map((m: any) => `${m.societe} (${m.plan}, J-${m.jours_restants})`).join(', ');
      const prompt = `Tu es expert en rétention SaaS. Analyse ces membres en essai gratuit et prédit leur risque de churn (3-4 phrases, français, conseils concrets) :
Membres en essai expirant bientôt : ${enEssai || "Aucun"}
Donne 2 actions concrètes pour améliorer la conversion essai → payant.`;
      const analyse = await askClaude(prompt);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'rapport_mrr') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { mrr, membres_actifs, essais, expirant, taux_churn } = body;
    try {
      const prompt = `Génère un rapport MRR mensuel WhatsApp (5 lignes max, français, emojis) :
MRR : ${mrr}€ | Membres actifs : ${membres_actifs} | En essai : ${essais} | Expirant bientôt : ${expirant} | Taux churn : ${taux_churn}%
Commence par "Rapport Wallets Xyra —" et donne 1 insight et 1 priorité.`;
      const message = await askClaude(prompt);
      await sendWhatsApp(ownerTel, message);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'alertes_expiration') {
    const { membres } = body;
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const expirants = (membres || []).filter((m: any) => m.jours_restants !== null && m.jours_restants <= 3 && m.jours_restants >= 0);
    for (const m of expirants) {
      await sendWhatsApp(ownerTel, `Xyra Alerte : ${m.societe} (${m.plan}) - essai expire dans ${m.jours_restants}j. Contactez-les pour convertir.`);
    }
    return NextResponse.json({ success: true, alertes_envoyees: expirants.length });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}