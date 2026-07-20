import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RATES: Record<string, number> = {
  EUR: 1, XOF: 655.957, MAD: 10.8, AED: 3.97, USD: 1.08, GBP: 0.86,
};

function conv(amount: number, from: string, to: string) {
  return Math.round(amount / (RATES[from] || 1) * (RATES[to] || 1));
}

function getSourceFromLibelle(libelle: string) {
  const l = (libelle || '').toLowerCase();
  if (l.includes('airbnb') || l.includes('location')) return 'Airbnb';
  if (l.includes('jet') || l.includes('aviation')) return 'Jet privé';
  if (l.includes('yacht') || l.includes('yachting')) return 'Yacht';
  if (l.includes('rapatri')) return 'Rapatriement';
  if (l.includes('commission') || l.includes('partenaire')) return 'Partenaires';
  if (l.includes('saas') || l.includes('abonnement')) return 'SaaS';
  if (l.includes('nettoyage') || l.includes('menage') || l.includes('ménage')) return 'Nettoyage';
  return 'Autres';
}

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const devise = searchParams.get('devise') || 'EUR';
  const periode = searchParams.get('periode') || 'mois';
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q) {
    if (tenantId) q = q.eq('tenant_id', tenantId);
    if (companyId) q = q.eq('company_id', companyId);
    return q;
  }

  const [facturesRes, walletRes, chargesRes, equipeRes] = await Promise.all([
    scoped(sb.from('factures').select('*')),
    scoped(sb.from('wallet_transactions').select('*')),
    scoped(sb.from('charges').select('*')),
    scoped(sb.from('equipe').select('nom,salaire')),
  ]);

  const factures = facturesRes.data || [];
  const wallet = walletRes.data || [];
  const charges = chargesRes.data || [];
  const equipe = equipeRes.data || [];

  const now = new Date();
  const debutMoisActuel = new Date(now.getFullYear(), now.getMonth(), 1);
  const debutMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0);
  const debutNMoins1 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const finNMoins1 = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);

  // Toutes les entrées réelles
  const entrees = [
    ...factures.filter((f: any) => f.statut === 'payée').map((f: any) => ({
      date: new Date(f.date_emission || f.created_at),
      montant: Number(f.montant_ttc || 0),
      client: f.client_nom || 'Inconnu',
      source: getSourceFromLibelle(f.objet || f.description || ''),
      devise: 'EUR',
    })),
    ...wallet.filter((t: any) => t.type === 'entree' && t.statut === 'confirmé').map((t: any) => ({
      date: new Date(t.created_at),
      montant: Number(t.montant || 0),
      client: t.client_nom || t.libelle || 'Inconnu',
      source: getSourceFromLibelle(t.libelle || ''),
      devise: 'EUR',
    })),
  ];

  // CA par période (12 derniers mois)
  const caParMois: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    caParMois[key] = 0;
  }
  entrees.forEach(e => {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
    if (caParMois[key] !== undefined) caParMois[key] += conv(e.montant, e.devise, devise);
  });

  // CA mois actuel vs précédent vs N-1
  const caMoisActuel = entrees.filter(e => e.date >= debutMoisActuel).reduce((a, e) => a + conv(e.montant, e.devise, devise), 0);
  const caMoisPrecedent = entrees.filter(e => e.date >= debutMoisPrecedent && e.date <= finMoisPrecedent).reduce((a, e) => a + conv(e.montant, e.devise, devise), 0);
  const caNMoins1 = entrees.filter(e => e.date >= debutNMoins1 && e.date <= finNMoins1).reduce((a, e) => a + conv(e.montant, e.devise, devise), 0);
  const evolutionMois = caMoisPrecedent > 0 ? Math.round(((caMoisActuel - caMoisPrecedent) / caMoisPrecedent) * 100) : 0;
  const evolutionNMoins1 = caNMoins1 > 0 ? Math.round(((caMoisActuel - caNMoins1) / caNMoins1) * 100) : 0;

  // CA par source
  const caParSource: Record<string, number> = {};
  entrees.forEach(e => {
    caParSource[e.source] = (caParSource[e.source] || 0) + conv(e.montant, e.devise, devise);
  });

  // CA par client + alerte dépendance
  const caParClient: Record<string, number> = {};
  entrees.forEach(e => {
    if (e.client && e.client !== 'Inconnu') {
      caParClient[e.client] = (caParClient[e.client] || 0) + conv(e.montant, e.devise, devise);
    }
  });
  const caTotal = entrees.reduce((a, e) => a + conv(e.montant, e.devise, devise), 0);
  const topClients = Object.entries(caParClient)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nom, ca]) => ({ nom, ca, pct: caTotal > 0 ? Math.round(ca / caTotal * 100) : 0 }));
  const alerteDependance = topClients.filter(c => c.pct >= 30);

  // Charges totales
  const chargesTotales = charges.reduce((a: number, c: any) => a + Number(c.montant || 0), 0);
  const coutEquipe = equipe.reduce((a: number, e: any) => a + Number(e.salaire || 0) * 1.43, 0);
  const margeNette = caTotal - chargesTotales - coutEquipe;
  const tauxMarge = caTotal > 0 ? Math.round(margeNette / caTotal * 100) : 0;

  // Prévision CA 90j (3 scénarios depuis tendance 3 derniers mois)
  const derniers3Mois = Object.values(caParMois).slice(-3);
  const moyCA = derniers3Mois.reduce((a, v) => a + v, 0) / Math.max(1, derniers3Mois.length);
  const prevision = {
    realiste: Math.round(moyCA * 3),
    optimiste: Math.round(moyCA * 3 * 1.2),
    pessimiste: Math.round(moyCA * 3 * 0.8),
  };

  return NextResponse.json({
    caTotal, caMoisActuel, caMoisPrecedent, caNMoins1,
    evolutionMois, evolutionNMoins1,
    caParMois, caParSource,
    topClients, alerteDependance,
    chargesTotales, coutEquipe, margeNette, tauxMarge,
    prevision, devise,
    nbTransactions: entrees.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'analyse_ia') {
    const { caTotal, caMoisActuel, evolutionMois, evolutionNMoins1, topClients, alerteDependance, tauxMarge, caParSource } = body;
    try {
      const sourcesPrincipales = Object.entries(caParSource || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([s, v]) => `${s}: ${v}€`).join(', ');
      const prompt = `Tu es analyste financier expert pour une PME de services premium (Airbnb, jet privé, yacht, rapatriement, nettoyage). Données réelles :

CA total : ${caTotal}€
CA mois actuel : ${caMoisActuel}€
Évolution vs mois précédent : ${evolutionMois}%
Évolution vs même mois N-1 : ${evolutionNMoins1}%
Taux de marge nette : ${tauxMarge}%
Sources principales : ${sourcesPrincipales}
Top client 1 : ${topClients?.[0]?.nom} (${topClients?.[0]?.pct}% du CA)
${alerteDependance?.length > 0 ? `⚠️ Alerte dépendance : ${alerteDependance.map((c: any) => c.nom).join(', ')} représentent plus de 30% du CA` : 'Pas de dépendance client excessive'}

Donne une analyse en 4-5 phrases max, en français, avec :
1. Le point fort du mois
2. Le risque principal identifié
3. Une recommandation concrète et chiffrée pour le mois prochain
Sois direct et précis.`;

      const analyse = await askClaude(prompt);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'rapport_mensuel_whatsapp') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { caTotal, caMoisActuel, evolutionMois, tauxMarge, topClients, prevision } = body;
    try {
      const prompt = `Génère un rapport CA mensuel WhatsApp (5-6 lignes max, français, emojis) :
CA total : ${caTotal}€ | CA ce mois : ${caMoisActuel}€ | Évolution : ${evolutionMois}%
Marge nette : ${tauxMarge}% | Top client : ${topClients?.[0]?.nom} (${topClients?.[0]?.pct}%)
Prévision 90j réaliste : ${prevision?.realiste}€
Commence par "Rapport CA Xyra —" et inclus 1 point fort et 1 priorité ce mois.`;
      const message = await askClaude(prompt);
      await sendWhatsApp(ownerTel, message);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}