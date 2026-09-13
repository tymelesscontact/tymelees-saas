import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';

const sb = getAdminClient();

async function askClaude(prompt: string, maxTokens = 900) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function calculerFinancesReelles(tenantId: string) {
  const [facturesRes, chargesRes] = await Promise.all([
    sb.from('factures').select('montant_ttc, statut').eq('tenant_id', tenantId),
    sb.from('charges').select('montant, frequence').eq('tenant_id', tenantId),
  ]);
  const factures = facturesRes.data || [];
  const charges = chargesRes.data || [];

  const caTotal = factures
    .filter((f) => f.statut === 'payée')
    .reduce((a, f) => a + Number(f.montant_ttc || 0), 0);

  const chargesMensuelles = charges.reduce((a, c) => {
    const m = Number(c.montant || 0);
    if (c.frequence === 'annuelle') return a + m / 12;
    if (c.frequence === 'ponctuelle') return a;
    return a + m; // mensuelle par défaut
  }, 0);

  const chargesAnnuelles = chargesMensuelles * 12;
  const marge = caTotal > 0 ? Math.round(((caTotal - chargesAnnuelles) / caTotal) * 100) : 0;

  return { caTotal, chargesAnnuelles, chargesMensuelles: Math.round(chargesMensuelles), marge, nbFactures: factures.filter((f) => f.statut === 'payée').length };
}

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, 'investissement');
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ recommandations: [], portefeuille: { investiTotal: 0, roiMoyen: 0, nbActifs: 0 }, finances: null });

  const [{ data: recommandations, error }, finances] = await Promise.all([
    sb.from('investissement_recommandations').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    calculerFinancesReelles(tenantId),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const validees = (recommandations || []).filter((r) => r.statut === 'validee');
  const portefeuille = {
    investiTotal: validees.reduce((a, r) => a + Number(r.budget_estime || 0), 0),
    roiMoyen: validees.length > 0 ? Math.round(validees.reduce((a, r) => a + Number(r.roi_estime_pct || 0), 0) / validees.length) : 0,
    nbActifs: validees.length,
  };

  return NextResponse.json({ recommandations: recommandations || [], portefeuille, finances });
}

export async function POST(req: NextRequest) {
  const acces = await verifierAccesModule(req, 'investissement');
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'generer') {
    try {
      const finances = await calculerFinancesReelles(tenantId);
      const { data: tenant } = await sb.from('tenants').select('secteur').eq('id', tenantId).maybeSingle();
      const secteur = tenant?.secteur || 'services premium';

      const prompt = `Tu es un conseiller en investissement pour une entreprise de ${secteur}.
Voici sa situation financière réelle :
- Chiffre d'affaires (factures payées, cumul) : ${finances.caTotal} €
- Charges mensuelles récurrentes : ${finances.chargesMensuelles} €
- Marge estimée : ${finances.marge}%
- Nombre de factures payées : ${finances.nbFactures}

Propose 3 à 4 recommandations d'investissement réalistes et chiffrées, adaptées à cette situation précise (si le CA est faible ou nul, propose des investissements modestes et prudents ; si la marge est bonne, tu peux proposer plus ambitieux). Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, format exact :
[{"titre":"...","type_investissement":"...","description":"2-3 phrases expliquant pourquoi, en français","budget_estime":1234,"roi_estime_pct":150,"delai_estime":"3 mois","risque":"Faible|Moyen|Élevé","priorite":"haute|moyenne|basse"}]`;

      const reponse = await askClaude(prompt, 1200);
      let recos: any[];
      try {
        const jsonMatch = reponse.match(/\[[\s\S]*\]/);
        recos = JSON.parse(jsonMatch ? jsonMatch[0] : reponse);
      } catch {
        return NextResponse.json({ error: 'Réponse IA illisible, réessaie.' }, { status: 502 });
      }
      if (!Array.isArray(recos) || recos.length === 0) {
        return NextResponse.json({ error: 'Aucune recommandation générée, réessaie.' }, { status: 502 });
      }

      const lignes = recos.map((r) => ({
        tenant_id: tenantId,
        type_investissement: String(r.type_investissement || 'autre').slice(0, 100),
        titre: String(r.titre || 'Investissement').slice(0, 200),
        description: String(r.description || ''),
        budget_estime: Number(r.budget_estime) || 0,
        roi_estime_pct: Number(r.roi_estime_pct) || 0,
        gain_mensuel_estime: Math.round(((Number(r.budget_estime) || 0) * (Number(r.roi_estime_pct) || 0)) / 100 / 12),
        gain_annuel_estime: Math.round(((Number(r.budget_estime) || 0) * (Number(r.roi_estime_pct) || 0)) / 100),
        priorite: ['haute', 'moyenne', 'basse'].includes(r.priorite) ? r.priorite : 'moyenne',
        statut: 'proposee',
        notes: r.delai_estime ? `Délai estimé : ${r.delai_estime} · Risque : ${r.risque || 'non précisé'}` : null,
      }));

      const { data: inserted, error } = await sb.from('investissement_recommandations').insert(lignes).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, recommandations: inserted });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Erreur génération IA' }, { status: 500 });
    }
  }

  if (action === 'valider' || action === 'rejeter') {
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    const statut = action === 'valider' ? 'validee' : 'rejetee';
    const { error } = await sb.from('investissement_recommandations').update({ statut }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
