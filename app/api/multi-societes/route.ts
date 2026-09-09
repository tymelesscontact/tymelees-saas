import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

// Service role : le tenant_id est verifie et impose dans chaque requete de
// ce fichier -- la cle anonyme ne marchait pas ici car ce client n'attache
// jamais le JWT de l'utilisateur (RLS le voyait comme anon, auth.uid()
// toujours nul), ce qui bloquait silencieusement l'acces meme aux donnees
// du bon tenant.
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RATES: Record<string, number> = {
  EUR: 1, XOF: 655.957, MAD: 10.8, AED: 3.97, USD: 1.08, GBP: 0.86,
};

function convert(amount: number, from: string, to: string) {
  const inEur = amount / (RATES[from] || 1);
  return Math.round(inEur * (RATES[to] || 1));
}

// Verifie qu'une societe appartient bien au tenant appelant, avant toute
// lecture/ecriture liee a elle -- sans ca, un tenant pouvait agir sur les
// societes de n'importe quel autre tenant (faille corrigee).
async function companyAppartientAuTenant(companyId: string, tenantId: string): Promise<boolean> {
  const { data } = await sb.from('companies').select('id').eq('id', companyId).eq('tenant_id', tenantId).maybeSingle();
  return !!data;
}

// GET — liste des sociétés + données consolidées
export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const companyId = searchParams.get('company_id');
  const deviseConsolidee = searchParams.get('devise') || 'EUR';

  if (action === 'list') {
    const { data: companies } = await sb.from('companies').select('*').eq('tenant_id', tenantId).order('created_at');
    return NextResponse.json({ companies: companies || [] });
  }

  if (action === 'consolidee') {
    const { data: companies } = await sb.from('companies').select('*').eq('tenant_id', tenantId);
    if (!companies?.length) return NextResponse.json({ consolidee: [] });

    const consolidee = await Promise.all(companies.map(async (c) => {
      const [walletRes, facturesRes, chargesRes] = await Promise.all([
        sb.from('wallet_transactions').select('montant,type,statut').eq('company_id', c.id).eq('tenant_id', tenantId),
        sb.from('factures').select('montant_ttc,statut').eq('company_id', c.id).eq('tenant_id', tenantId),
        sb.from('charges').select('montant').eq('company_id', c.id).eq('tenant_id', tenantId),
      ]);

      const entrees = (walletRes.data || []).filter((t: any) => t.type === 'entree' && t.statut === 'confirmé').reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
      const factures = (facturesRes.data || []).filter((f: any) => f.statut === 'payée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
      const charges = (chargesRes.data || []).reduce((a: number, ch: any) => a + Number(ch.montant || 0), 0);
      const ca = entrees + factures;
      const solde = ca - charges;

      return {
        ...c,
        ca: convert(ca, c.devise, deviseConsolidee),
        charges: convert(charges, c.devise, deviseConsolidee),
        solde: convert(solde, c.devise, deviseConsolidee),
        devise_consolidee: deviseConsolidee,
      };
    }));

    const totaux = {
      ca: consolidee.reduce((a, c) => a + c.ca, 0),
      charges: consolidee.reduce((a, c) => a + c.charges, 0),
      solde: consolidee.reduce((a, c) => a + c.solde, 0),
      devise: deviseConsolidee,
    };

    return NextResponse.json({ consolidee, totaux });
  }

  if (action === 'transfers') {
    // Pas de tenant_id sur cette table -- on ne garde que les transferts
    // dont les deux societes appartiennent au tenant appelant.
    const { data: mesCompanies } = await sb.from('companies').select('id').eq('tenant_id', tenantId);
    const mesIds = new Set((mesCompanies || []).map((c: any) => c.id));
    const { data } = await sb.from('intercompany_transfers').select('*').order('created_at', { ascending: false }).limit(200);
    const filtres = (data || []).filter((t: any) => mesIds.has(t.from_company_id) || mesIds.has(t.to_company_id)).slice(0, 50);
    return NextResponse.json({ transfers: filtres });
  }

  if (action === 'access' && companyId) {
    if (!(await companyAppartientAuTenant(companyId, tenantId))) return NextResponse.json({ error: 'Societe introuvable' }, { status: 404 });
    const { data } = await sb.from('company_access').select('*').eq('company_id', companyId);
    return NextResponse.json({ access: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

// POST — créer/modifier société, transfert, droits
export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'create_company') {
    const { nom, pays, metier, devise, couleur, siret } = body;
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser } } = await sb.auth.getUser(token);
    const { data, error } = await sb.from('companies').insert({ nom, pays, metier, devise: devise || 'EUR', couleur: couleur || '#C9A84C', siret: siret || null, owner_id: authUser?.id, tenant_id: tenantId }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, company: data });
  }

  if (action === 'update_company') {
    const { id, nom, pays, metier, devise, couleur, siret } = body;
    const { error } = await sb.from('companies').update({ nom, pays, metier, devise, couleur, siret: siret || null }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete_company') {
    const { id } = body;
    const { error } = await sb.from('companies').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'intercompany_transfer') {
    const { from_company_id, to_company_id, montant, devise, libelle } = body;
    if (!(await companyAppartientAuTenant(from_company_id, tenantId)) || !(await companyAppartientAuTenant(to_company_id, tenantId))) {
      return NextResponse.json({ error: 'Societe introuvable' }, { status: 404 });
    }
    const { error } = await sb.from('intercompany_transfers').insert({ from_company_id, to_company_id, montant: Number(montant), devise: devise || 'EUR', libelle, statut: 'effectué' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'set_access') {
    const { company_id, user_id, role } = body;
    if (!(await companyAppartientAuTenant(company_id, tenantId))) return NextResponse.json({ error: 'Societe introuvable' }, { status: 404 });
    const { error } = await sb.from('company_access').upsert({ company_id, user_id, role }, { onConflict: 'company_id,user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'remove_access') {
    const { company_id, user_id } = body;
    if (!(await companyAppartientAuTenant(company_id, tenantId))) return NextResponse.json({ error: 'Societe introuvable' }, { status: 404 });
    await sb.from('company_access').delete().eq('company_id', company_id).eq('user_id', user_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
