import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = getAdminClient();

async function askClaude(prompt: string, maxTokens = 300) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function collecterSignaux(tenantId: string) {
  const dans3j = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const dans7j = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const maintenant = new Date().toISOString();
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const finMoisDernier = debutMois;
  const debutMoisDernier = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();

  const [
    { data: devisExpirent },
    { data: facturesRetard },
    { data: stockArticles },
    { data: signalements },
    { data: contratsEnAttente },
    { data: evenementsAVenir },
    { data: facturesPayees },
    { data: charges },
    { data: leads },
  ] = await Promise.all([
    sb.from('devis').select('id,client_nom,montant,expire_le').eq('tenant_id', tenantId).eq('statut', 'envoyé').not('expire_le', 'is', null).lte('expire_le', dans3j).gte('expire_le', maintenant),
    sb.from('factures').select('id,client_nom,montant_ttc').eq('tenant_id', tenantId).eq('statut', 'en_retard'),
    sb.from('stock').select('id,art,quantite,seuil_min,min').eq('tenant_id', tenantId),
    sb.from('signalements_mission').select('id,type,gravite,contenu').eq('tenant_id', tenantId).neq('statut', 'resolu'),
    sb.from('contrats').select('id,titre,nom_membre,lien_expire_le').eq('tenant_id', tenantId).eq('statut', 'envoye').gt('lien_expire_le', maintenant),
    sb.from('evenements').select('id,titre,date_evenement').eq('tenant_id', tenantId).gte('date_evenement', maintenant).lte('date_evenement', dans7j),
    sb.from('factures').select('montant_ttc,date_emission,created_at').eq('tenant_id', tenantId).eq('statut', 'payée'),
    sb.from('charges').select('montant,frequence').eq('tenant_id', tenantId),
    sb.from('crm_leads').select('id').eq('tenant_id', tenantId).eq('etape', 'Nouveau'),
  ]);

  const stockBas = (stockArticles || []).filter((a: any) => {
    const seuil = Number(a.seuil_min ?? a.min ?? 0);
    return seuil > 0 && Number(a.quantite || 0) < seuil;
  });

  let caMois = 0, caMoisDernier = 0;
  (facturesPayees || []).forEach((f: any) => {
    const d = new Date(f.date_emission || f.created_at);
    const m = Number(f.montant_ttc || 0);
    if (d.toISOString() >= debutMois) caMois += m;
    else if (d.toISOString() >= debutMoisDernier && d.toISOString() < finMoisDernier) caMoisDernier += m;
  });
  const chargesMensuelles = (charges || []).reduce((a: number, c: any) => {
    const m = Number(c.montant || 0);
    if (c.frequence === 'annuelle') return a + m / 12;
    if (c.frequence === 'ponctuelle') return a;
    return a + m;
  }, 0);
  const marge = caMois > 0 ? Math.round(((caMois - chargesMensuelles) / caMois) * 100) : 0;

  return {
    devisExpirent: devisExpirent || [], facturesRetard: facturesRetard || [], stockBas,
    signalements: signalements || [], contratsEnAttente: contratsEnAttente || [], evenementsAVenir: evenementsAVenir || [],
    caMois, caMoisDernier, marge, leads: (leads || []).length,
  };
}

function construireAlertes(s: Awaited<ReturnType<typeof collecterSignaux>>) {
  const alertes: { icone: string; texte: string; page: string }[] = [];
  if (s.facturesRetard.length > 0) alertes.push({ icone: '🔴', texte: `${s.facturesRetard.length} facture${s.facturesRetard.length > 1 ? 's' : ''} en retard de paiement`, page: 'compta' });
  if (s.devisExpirent.length > 0) alertes.push({ icone: '🟠', texte: `${s.devisExpirent.length} devis expire${s.devisExpirent.length > 1 ? 'nt' : ''} sous 3 jours`, page: 'devis' });
  if (s.signalements.length > 0) alertes.push({ icone: '🚨', texte: `${s.signalements.length} signalement${s.signalements.length > 1 ? 's' : ''} d'équipe non traité${s.signalements.length > 1 ? 's' : ''}`, page: 'planning' });
  if (s.stockBas.length > 0) alertes.push({ icone: '📦', texte: `${s.stockBas.length} article${s.stockBas.length > 1 ? 's' : ''} sous le seuil de stock`, page: 'stock' });
  if (s.contratsEnAttente.length > 0) alertes.push({ icone: '✦', texte: `${s.contratsEnAttente.length} contrat${s.contratsEnAttente.length > 1 ? 's' : ''} en attente de signature`, page: 'signatures' });
  if (s.leads > 0) alertes.push({ icone: '🔵', texte: `${s.leads} lead${s.leads > 1 ? 's' : ''} CRM à traiter`, page: 'crm' });
  if (s.evenementsAVenir.length > 0) alertes.push({ icone: '📅', texte: `${s.evenementsAVenir.length} événement${s.evenementsAVenir.length > 1 ? 's' : ''} sous 7 jours`, page: 'evenements' });
  return alertes;
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ texte: null, alertes: [] });
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const { data } = await sb.from('brief_quotidien').select('texte,alertes,created_at').eq('tenant_id', tenantId).eq('date', aujourdhui).maybeSingle();
  return NextResponse.json({ texte: data?.texte || null, alertes: data?.alertes || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  if (body.action !== 'generer') return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  try {
    const signaux = await collecterSignaux(tenantId);
    const alertes = construireAlertes(signaux);

    const faits = [
      `CA ce mois : ${Math.round(signaux.caMois)}€ (mois dernier : ${Math.round(signaux.caMoisDernier)}€)`,
      `Marge estimée : ${signaux.marge}%`,
      `Leads CRM nouveaux : ${signaux.leads}`,
      signaux.facturesRetard.length > 0 ? `${signaux.facturesRetard.length} facture(s) en retard, total ${Math.round(signaux.facturesRetard.reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0))}€` : null,
      signaux.devisExpirent.length > 0 ? `${signaux.devisExpirent.length} devis expire(nt) sous 3 jours, total ${Math.round(signaux.devisExpirent.reduce((a: number, d: any) => a + Number(d.montant || 0), 0))}€` : null,
      signaux.stockBas.length > 0 ? `${signaux.stockBas.length} article(s) sous le seuil de stock : ${signaux.stockBas.slice(0, 3).map((a: any) => a.art).join(', ')}` : null,
      signaux.signalements.length > 0 ? `${signaux.signalements.length} signalement(s) d'équipe non traité(s)` : null,
      signaux.contratsEnAttente.length > 0 ? `${signaux.contratsEnAttente.length} contrat(s) en attente de signature` : null,
      signaux.evenementsAVenir.length > 0 ? `${signaux.evenementsAVenir.length} événement(s) sous 7 jours` : null,
    ].filter(Boolean).join('\n- ');

    const prompt = `Tu es l'assistant business d'un patron d'entreprise de services premium. Voici sa vraie situation ce matin :
- ${faits}

Rédige un brief matinal (3-4 phrases max, français, direct et actionnable). Commence par le sujet le plus urgent/important parmi ces faits (pas forcément le CA). Si rien n'est urgent, dis simplement que tout est sous contrôle et donne un point positif réel parmi les chiffres. N'invente aucun chiffre en dehors de ceux donnés ci-dessus.`;

    const texte = await askClaude(prompt);

    const aujourdhui = new Date().toISOString().slice(0, 10);
    const { error } = await sb.from('brief_quotidien').upsert(
      { tenant_id: tenantId, date: aujourdhui, texte: texte || 'Analyse indisponible pour le moment.', alertes },
      { onConflict: 'tenant_id,date' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ texte, alertes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur génération brief' }, { status: 500 });
  }
}
