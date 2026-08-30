import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { chiffrer, dechiffrer } from '../../lib/anthropicKey';
import { estAutoriseGererEquipe } from '../../lib/permissions';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { data } = await sb.from('integrations_personnalisees')
    .select('id, nom, notes, cle_api, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const integrations = (data || []).map(i => {
    let cleMasquee = null;
    if (i.cle_api) {
      try {
        const vraieCle = dechiffrer(i.cle_api);
        cleMasquee = vraieCle.length > 4 ? '••••' + vraieCle.slice(-4) : '••••';
      } catch (e) {
        cleMasquee = '••••';
      }
    }
    return { id: i.id, nom: i.nom, notes: i.notes, cleMasquee, created_at: i.created_at };
  });

  return NextResponse.json({ integrations });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ success: false, error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  if (action === 'ajouter') {
    const { nom, cle_api, notes } = body;
    if (!nom || !nom.trim()) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });

    const cleChiffree = cle_api && cle_api.trim() ? chiffrer(cle_api.trim()) : null;
    const { data, error } = await sb.from('integrations_personnalisees').insert({
      tenant_id: tenantId,
      nom: nom.trim(),
      cle_api: cleChiffree,
      notes: notes?.trim() || null,
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, integration: { id: data.id, nom: data.nom, notes: data.notes } });
  }

  if (action === 'retirer') {
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
    const { error } = await sb.from('integrations_personnalisees').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
