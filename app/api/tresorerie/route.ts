import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

async function askClaude(prompt: string, maxTokens = 400) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function sendWhatsApp(to: string, message: string) {
  const safe = message.replace(/[^\x00-\xFF]/g, '');
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: safe } }),
  });
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entiteId = searchParams.get('entite_id');
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q) {
    if (tenantId) q = q.eq('tenant_id', tenantId);
    if (companyId) q = q.eq('company_id', companyId);
    return q;
  }
  const [walletRes, facturesRes, chargesRes, paramRes, stockRes, equipeRes, clientsRes, missionsRes] = await Promise.all([
    scoped(sb.from('wallet_transactions').select('*')),
    scoped(sb.from('factures').select('*')),
    scoped(sb.from('charges').select('*')),
    scoped(sb.from('tresorerie_parametres').select('*')).limit(1).maybeSingle(),
    scoped(sb.from('stock').select('qte,prixU,prix_unitaire')),
    scoped(sb.from('equipe').select('salaire,nom')),
    scoped(sb.from('clients').select('id,nom')),
    scoped(sb.from('factures').select('client_nom,montant_ttc,statut,date_emission,date_echeance')),
  ]);

  const wallet = walletRes.data || [];
  const factures = facturesRes.data || [];
  const charges = chargesRes.data || [];
  const param = paramRes.data || { seuil_alerte_bas: 5000, seuil_alerte_critique: 2000, seuil_sortie_importante: 3000, placement_seuil: 20000 };
  const stock = stockRes.data || [];
  const equipe = equipeRes.data || [];
  const facturesList = missionsRes.data || [];

  // ── SOLDE ACTUEL ─────────────────────────────────────────
  const entreesConfirmees = wallet.filter((t: any) => t.type === 'entree' && t.statut === 'confirmé').reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
  const sortiesVirees = wallet.filter((t: any) => t.type !== 'entree' && t.statut === 'viré').reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
  const facturesPayees = factures.filter((f: any) => f.statut === 'payée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
  const soldeActuel = entreesConfirmees + facturesPayees - sortiesVirees;

  // ── HISTORIQUE 8 SEMAINES ─────────────────────────────────
  const now = new Date();
  const evenements: any[] = [];
  wallet.forEach((t: any) => {
    if (t.type === 'entree' && t.statut === 'confirmé') evenements.push({ date: t.created_at, montant: Number(t.montant || 0), sens: 'entree', categorie: t.libelle?.toLowerCase().includes('airbnb') ? 'Airbnb' : t.libelle?.toLowerCase().includes('jet') || t.libelle?.toLowerCase().includes('yacht') ? 'Jet/Yacht' : t.libelle?.toLowerCase().includes('rapatri') ? 'Rapatriement' : t.type === 'commission' ? 'Partenaires' : 'Autres' });
    if (t.type !== 'entree' && t.statut === 'viré') evenements.push({ date: t.created_at, montant: Number(t.montant || 0), sens: 'sortie', categorie: t.type === 'commission' ? 'Commissions' : t.type === 'fournisseur' ? 'Fournisseurs' : 'Autres' });
  });
  factures.forEach((f: any) => { if (f.statut === 'payée') evenements.push({ date: f.date_emission || f.created_at, montant: Number(f.montant_ttc || 0), sens: 'entree', categorie: 'Facturation' }); });
  evenements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const semaines: any[] = [];
  for (let i = 7; i >= 0; i--) {
    const debut = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const fin = new Date(debut.getTime() + 7 * 24 * 60 * 60 * 1000);
    const evts = evenements.filter(e => { const d = new Date(e.date); return d >= debut && d < fin; });
    const entrees = evts.filter(e => e.sens === 'entree').reduce((a, e) => a + e.montant, 0);
    const sorties = evts.filter(e => e.sens === 'sortie').reduce((a, e) => a + e.montant, 0);
    semaines.push({ debut: debut.toISOString().slice(0, 10), entrees, sorties, net: entrees - sorties, pred: false });
  }
  let runningSolde = soldeActuel;
  for (let i = semaines.length - 1; i >= 0; i--) { semaines[i].sol = runningSolde; runningSolde -= semaines[i].net; }

  // ── TENDANCE & SAISONNALITÉ ───────────────────────────────
  const dernieres4 = semaines.slice(-4);
  const moyEntrees = dernieres4.reduce((a, s) => a + s.entrees, 0) / Math.max(1, dernieres4.length);
  const moySorties = dernieres4.reduce((a, s) => a + s.sorties, 0) / Math.max(1, dernieres4.length);
  const chargesMensuelles = charges.reduce((a: number, c: any) => a + Number(c.montant || 0), 0);
  const chargesHebdo = chargesMensuelles / 4.33;

  // Détection saisonnalité simple (mois actuel vs même mois année précédente)
  const moisActuel = now.getMonth();
  const moisEteAirbnb = [5, 6, 7]; // juin, juillet, août
  const moisHiverRapatriement = [10, 11, 0]; // nov, déc, jan
  const facteurSaisonnier = moisEteAirbnb.includes(moisActuel) ? 1.15 : moisHiverRapatriement.includes(moisActuel) ? 1.1 : 1.0;

  // ── 3 SCÉNARIOS DE PRÉVISION ─────────────────────────────
  const genererPrevisions = (facteurEntrees: number, facteurSorties: number) => {
    const prevs: any[] = [];
    let solde = soldeActuel;
    for (let i = 1; i <= 13; i++) {
      const debut = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const entrees = Math.round(moyEntrees * facteurEntrees * facteurSaisonnier);
      const sorties = Math.round(Math.max(moySorties * facteurSorties, chargesHebdo));
      solde += entrees - sorties;
      prevs.push({ debut, entrees, sorties, net: entrees - sorties, sol: Math.round(solde), pred: true });
    }
    return prevs;
  };
  const prevRealiste = genererPrevisions(1.0, 1.0);
  const prevOptimiste = genererPrevisions(1.2, 0.9);
  const prevPessimiste = genererPrevisions(0.8, 1.1);

  // ── SCORE DE SANTÉ 0-100 ──────────────────────────────────
  let scoreBase = 50;
  const couvertureEnSemaines = moySorties > 0 ? Math.floor(soldeActuel / moySorties) : 12;
  if (couvertureEnSemaines >= 8) scoreBase += 20; else if (couvertureEnSemaines >= 4) scoreBase += 10; else if (couvertureEnSemaines < 2) scoreBase -= 15;
  const tendanceNet = dernieres4.reduce((a, s) => a + s.net, 0);
  if (tendanceNet > 0) scoreBase += 15; else if (tendanceNet < -2000) scoreBase -= 10;
  const commissionsDues = wallet.filter((t: any) => t.type === 'commission' && t.statut === 'à_virer').reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
  if (commissionsDues > soldeActuel * 0.3) scoreBase -= 10;
  if (soldeActuel < param.seuil_alerte_critique) scoreBase -= 20;
  const scoreFinancier = Math.max(0, Math.min(100, scoreBase));

  // ── POINT MORT HEBDOMADAIRE ───────────────────────────────
  const pointMort = Math.max(0, Math.round(chargesHebdo + (soldeActuel < param.seuil_alerte_bas ? param.seuil_alerte_bas - soldeActuel : 0)));

  // ── BFR ──────────────────────────────────────────────────
  const facturesPayeesListe = facturesList.filter((f: any) => f.statut === 'payée' && f.date_emission && f.date_echeance);
  const delaiClientMoyen = facturesPayeesListe.length > 0
    ? Math.round(facturesPayeesListe.reduce((a: number, f: any) => {
        const emission = new Date(f.date_emission);
        const echeance = new Date(f.date_echeance);
        return a + (echeance.getTime() - emission.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / facturesPayeesListe.length)
    : 30;
  const stockImmobilise = stock.reduce((a: number, s: any) => a + Number(s.qte || 0) * Number(s.prixU || s.prix_unitaire || 0), 0);
  const bfr = Math.round((delaiClientMoyen / 30) * moyEntrees - (21 / 30) * moySorties + stockImmobilise);

  // ── CASHFLOW PAR COLLABORATEUR ────────────────────────────
  const cashflowEquipe = equipe.map((e: any) => {
    const salaire = Number(e.salaire || 0);
    const coutMensuel = Math.round(salaire * 1.43);
    return { nom: e.nom, salaire, coutMensuel, coutHebdo: Math.round(coutMensuel / 4.33) };
  });
  const coutEquipeTotal = cashflowEquipe.reduce((a: number, e: any) => a + e.coutMensuel, 0);

  // ── DÉCOMPOSITION PAR SOURCE ──────────────────────────────
  const sources: Record<string, number> = {};
  evenements.filter(e => e.sens === 'entree').forEach(e => {
    sources[e.categorie] = (sources[e.categorie] || 0) + e.montant;
  });

  // ── SCORING PRÉDICTIF CLIENTS ─────────────────────────────
  const clientsEnRetard = facturesList.filter((f: any) => {
    if (f.statut === 'payée' || !f.date_echeance) return false;
    const echeance = new Date(f.date_echeance);
    return echeance < now;
  }).map((f: any) => ({ client: f.client_nom, montant: Number(f.montant_ttc || 0), retardJours: Math.floor((now.getTime() - new Date(f.date_echeance).getTime()) / (1000 * 60 * 60 * 24)) }));

  // ── PLACEMENT EXCÉDENTS ───────────────────────────────────
  const seuilPlacement = Number(param.placement_seuil || 20000);
  const excedent = Math.max(0, soldeActuel - seuilPlacement);
  const suggestionsPlacement = excedent > 0 ? [
    { nom: 'Livret A', taux: '3%', rendementAnnuel: Math.round(excedent * 0.03), risque: 'Nul', liquidite: 'Immédiate' },
    { nom: 'Fonds monétaire', taux: '3.5%', rendementAnnuel: Math.round(excedent * 0.035), risque: 'Très faible', liquidite: '24-48h' },
    { nom: 'Compte à terme 3 mois', taux: '4%', rendementAnnuel: Math.round(excedent * 0.04), risque: 'Faible', liquidite: '3 mois' },
  ] : [];

  return NextResponse.json({
    soldeActuel,
    semaines,
    prevRealiste,
    prevOptimiste,
    prevPessimiste,
    scoreFinancier,
    pointMort,
    bfr,
    couvertureEnSemaines,
    cashflowEquipe,
    coutEquipeTotal,
    sources,
    commissionsDues,
    facturesEnAttente: factures.filter((f: any) => f.statut !== 'payée' && f.statut !== 'annulée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0),
    chargesMensuelles,
    clientsEnRetard,
    suggestionsPlacement,
    excedent,
    seuilPlacement,
    parametres: param,
    soldeJ90: prevRealiste[prevRealiste.length - 1]?.sol ?? soldeActuel,
    soldeJ90Optimiste: prevOptimiste[prevOptimiste.length - 1]?.sol ?? soldeActuel,
    soldeJ90Pessimiste: prevPessimiste[prevPessimiste.length - 1]?.sol ?? soldeActuel,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // ── ANALYSE IA COMPLÈTE ──────────────────────────────────
  if (action === 'analyse_ia') {
    const { soldeActuel, soldeJ90, soldeJ90Optimiste, soldeJ90Pessimiste, commissionsDues, facturesEnAttente, chargesMensuelles, scoreFinancier, pointMort, bfr, clientsEnRetard, semaines } = body;
    try {
      const prompt = `Tu es analyste financier expert pour une PME de services premium (Airbnb, jet privé, yacht, rapatriement). Données réelles :

Solde actuel : ${soldeActuel}€
Score de santé financière : ${scoreFinancier}/100
Solde J+90 scénario réaliste : ${soldeJ90}€
Solde J+90 scénario optimiste : ${soldeJ90Optimiste}€
Solde J+90 scénario pessimiste : ${soldeJ90Pessimiste}€
Point mort hebdomadaire : ${pointMort}€ à encaisser cette semaine minimum
BFR : ${bfr}€ bloqués dans le cycle d'exploitation
Commissions partenaires dues : ${commissionsDues}€
Factures clients en attente : ${facturesEnAttente}€
Charges mensuelles fixes : ${chargesMensuelles}€
Clients en retard de paiement : ${(clientsEnRetard || []).length}

Donne une analyse en 4-5 phrases max, en français, avec :
1. Le point le plus urgent à traiter
2. Le risque principal sur 90 jours
3. Une recommandation concrète et chiffrée
Sois direct et précis.`;

      const analyse = await askClaude(prompt, 400);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── ALERTES INTELLIGENTES ─────────────────────────────────
  if (action === 'alerte_intelligente') {
    const { soldeActuel, prevRealiste, param, commissionsDues, clientsEnRetard } = body;
    try {
      const semainesEnDanger = (prevRealiste || []).filter((p: any) => p.sol < (param?.seuil_alerte_bas || 5000));
      if (semainesEnDanger.length === 0) return NextResponse.json({ success: true, alerte: null });

      const prompt = `Génère une alerte trésorerie intelligente et contextuelle (2-3 phrases max, français) :
Solde actuel : ${soldeActuel}€
Première semaine critique : ${semainesEnDanger[0]?.debut} (solde prévu : ${semainesEnDanger[0]?.sol}€)
Commissions dues : ${commissionsDues}€
Clients en retard : ${(clientsEnRetard || []).map((c: any) => c.client + ' (' + c.montant + '€)').join(', ')}

Explique POURQUOI le solde va baisser et donne 2 actions concrètes pour l'éviter. Sois précis et chiffré.`;

      const alerte = await askClaude(prompt, 250);
      return NextResponse.json({ success: true, alerte });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── RAPPORT HEBDOMADAIRE WHATSAPP ─────────────────────────
  if (action === 'rapport_hebdo') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { soldeActuel, scoreFinancier, pointMort, clientsEnRetard, commissionsDues } = body;
    try {
      const prompt = `Génère un rapport trésorerie hebdomadaire WhatsApp (5-6 lignes max, français, emojis autorisés) :
Solde : ${soldeActuel}€ | Score santé : ${scoreFinancier}/100 | Point mort semaine : ${pointMort}€
Commissions dues : ${commissionsDues}€ | Clients en retard : ${(clientsEnRetard || []).length}
Inclus : 1 chiffre clé, 1 risque, 1 priorité cette semaine. Commence par "Bonjour Curtiss"`;

      const message = await askClaude(prompt, 300);
      await sendWhatsApp(ownerTel, message);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── ALERTE CRITIQUE WHATSAPP ──────────────────────────────
  if (action === 'alerte_critique_whatsapp') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { soldeActuel, seuil } = body;
    try {
      await sendWhatsApp(ownerTel, `Xyra ALERTE TRESORERIE - Solde actuel : ${soldeActuel}€ est passe sous le seuil critique de ${seuil}€. Action requise immediatement.`);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── SCORING PRÉDICTIF CLIENTS ─────────────────────────────
  if (action === 'scoring_clients') {
    const { facturesList } = body;
    if (!facturesList?.length) return NextResponse.json({ success: true, predictions: [] });
    try {
      const prompt = `Analyse ces factures et prédit lesquelles risquent d'être payées en retard ce mois (réponds en JSON uniquement) :
${JSON.stringify(facturesList.slice(0, 10))}
Format : [{"client": "nom", "risque": "élevé|moyen|faible", "raison": "courte explication"}]`;

      const res = await askClaude(prompt, 400);
      const clean = res.replace(/```json|```/g, '').trim();
      const predictions = JSON.parse(clean);
      return NextResponse.json({ success: true, predictions });
    } catch (e: any) {
      return NextResponse.json({ success: true, predictions: [] });
    }
  }

  // ── SAUVEGARDER PARAMÈTRES ────────────────────────────────
  if (action === 'set_parametres') {
    const { seuil_alerte_bas, seuil_alerte_critique, seuil_sortie_importante, placement_seuil } = body;
    const { data: existing } = await sb.from('tresorerie_parametres').select('id').limit(1).single();
    if (existing) {
      await sb.from('tresorerie_parametres').update({ seuil_alerte_bas, seuil_alerte_critique, seuil_sortie_importante, placement_seuil, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await sb.from('tresorerie_parametres').insert({ seuil_alerte_bas, seuil_alerte_critique, seuil_sortie_importante, placement_seuil });
    }
    return NextResponse.json({ success: true });
  }

  // ── AJOUTER LIGNE MANUELLE ────────────────────────────────
  if (action === 'ajouter_ligne_manuelle') {
    const { libelle, montant, semaine, sens } = body;
    const { error } = await sb.from('tresorerie_lignes_manuelles').insert({ libelle, montant: Number(montant), semaine, sens, created_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}