import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { data: tenant } = await sb.from('tenants').select('secteur, secteur_overrides').eq('id', tenantId).single();
  const { data: historique } = await sb.from('secteur_historique')
    .select('ancien_secteur, nouveau_secteur, changed_by, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    secteur: tenant?.secteur || null,
    overrides: tenant?.secteur_overrides || {},
    historique: historique || [],
  });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'verifier_donnees') {
    const [{ count: nbClients }, { count: nbMissions }, { count: nbDevis }, { count: nbFactures }] = await Promise.all([
      sb.from('clients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      sb.from('missions').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      sb.from('devis').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      sb.from('factures').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    ]);
    const total = (nbClients || 0) + (nbMissions || 0) + (nbDevis || 0) + (nbFactures || 0);
    return NextResponse.json({ success: true, aDesDonnees: total > 0, detail: { clients: nbClients || 0, missions: nbMissions || 0, devis: nbDevis || 0, factures: nbFactures || 0 } });
  }

  if (action === 'changer') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ success: false, error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { nouveauSecteur, confirme } = body;
    if (!nouveauSecteur) return NextResponse.json({ success: false, error: 'Secteur manquant' }, { status: 400 });
    if (!confirme) return NextResponse.json({ success: false, error: 'Confirmation requise' }, { status: 400 });

    const { data: tenant } = await sb.from('tenants').select('secteur, email').eq('id', tenantId).single();
    const ancienSecteur = tenant?.secteur || null;

    await sb.from('tenants').update({ secteur: nouveauSecteur, secteur_overrides: null }).eq('id', tenantId);
    await sb.from('secteur_historique').insert({
      tenant_id: tenantId,
      ancien_secteur: ancienSecteur,
      nouveau_secteur: nouveauSecteur,
      changed_by: tenant?.email || null,
    });

    return NextResponse.json({ success: true });
  }

  if (action === 'modifier_terme') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ success: false, error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { cle, valeur } = body;
    if (!cle || !valeur) return NextResponse.json({ success: false, error: 'Cle et valeur requises' }, { status: 400 });

    const { data: tenant } = await sb.from('tenants').select('secteur_overrides').eq('id', tenantId).single();
    const overrides = { ...(tenant?.secteur_overrides || {}), [cle]: valeur };
    await sb.from('tenants').update({ secteur_overrides: overrides }).eq('id', tenantId);

    return NextResponse.json({ success: true, overrides });
  }

  if (action === 'reinitialiser_termes') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ success: false, error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    await sb.from('tenants').update({ secteur_overrides: null }).eq('id', tenantId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
