import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DOMAINE_RE = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

async function ajouterDomaineVercel(domaine: string) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return { ok: false, raison: 'vercel_non_configure' };
  }
  try {
    const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: domaine }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, raison: data?.error?.code === 'domain_already_in_use' ? 'domaine_deja_utilise' : 'erreur_vercel' };
    }
    return { ok: true, verifie: !!data.verified, verification: data.verification || null };
  } catch (e: any) {
    return { ok: false, raison: 'erreur_connexion' };
  }
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { data, error } = await sb.from('tenants')
    .select('domaine_custom, domaine_statut, domaine_verification')
    .eq('id', tenantId).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ domaine: data });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'demander') {
    const { domaine } = body;
    if (!domaine || typeof domaine !== 'string' || !DOMAINE_RE.test(domaine.trim())) {
      return NextResponse.json({ success: false, error: 'Format de domaine invalide' }, { status: 400 });
    }
    const domainePropre = domaine.trim().toLowerCase();

    const resultat = await ajouterDomaineVercel(domainePropre);

    const misAJour: any = {
      domaine_custom: domainePropre,
      domaine_statut: resultat.ok ? (resultat.verifie ? 'actif' : 'en_verification') : 'en_attente_manuelle',
      domaine_verification: resultat.ok ? (resultat.verification || null) : null,
    };
    await sb.from('tenants').update(misAJour).eq('id', tenantId);

    return NextResponse.json({
      success: true,
      automatise: resultat.ok,
      statut: misAJour.domaine_statut,
      verification: misAJour.domaine_verification,
      raisonEchec: resultat.ok ? null : resultat.raison,
    });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
