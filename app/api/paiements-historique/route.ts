import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient();

  const { data: abosData } = await sb
    .from('abonnements_paiements')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: businessData } = await sb
    .from('paiements')
    .select('*')
    .order('date_transaction', { ascending: false });

  const { data: tenantsData } = await sb
    .from('tenants')
    .select('id, societe, email');

  const tenantsMap: Record<string, string> = {};
  (tenantsData || []).forEach((t: any) => { tenantsMap[t.id] = t.societe; });

  const abonnements = (abosData || []).map((p: any) => ({
    date: p.created_at,
    categorie: 'Abonnement Xyra',
    entite: p.societe,
    montant: p.montant,
    devise: p.devise,
    methode: p.provider,
    statut: 'confirmé',
    reference: p.reference,
  }));

  const business = (businessData || []).map((p: any) => ({
    date: p.date_transaction || p.created_at,
    categorie: 'Activité tenant',
    entite: tenantsMap[p.tenant_id] || p.libelle || '—',
    montant: p.montant,
    devise: p.devise,
    methode: p.methode,
    statut: p.statut,
    reference: p.reference,
  }));

  const tout = [...abonnements, ...business].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({ paiements: tout });
}
