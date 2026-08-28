import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const sb = getAdminClient();

  const { data: tenant } = await sb.from('tenants').select('societe, email').eq('id', tenantId).single();
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 404 });

  const { data: abosData } = await sb
    .from('abonnements_paiements')
    .select('*')
    .eq('tenant_email', tenant.email)
    .order('created_at', { ascending: false });

  const { data: businessData } = await sb
    .from('paiements')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date_transaction', { ascending: false });

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
    entite: tenant.societe || p.libelle || '—',
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
