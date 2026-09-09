import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

// Service role : le tenant_id est verifie et impose dans chaque requete
// (.eq('tenant_id', tenantId)) -- meme pattern que le reste de l'app.
// Avant cette route, le composant IbanMondial parlait directement a
// Supabase depuis le navigateur (cle anon), sans jamais filtrer par
// tenant : n'importe quel utilisateur connecte voyait les IBAN de tous
// les tenants (faille corrigee).
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ ibans: [] });

  const { data, error } = await sb.from('wallet_ibans').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ibans: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'ajouter') {
    const { pays, iban, banque, bic, pour } = body;
    if (!pays || !iban) return NextResponse.json({ error: 'Pays et IBAN requis' }, { status: 400 });

    const { data, error } = await sb.from('wallet_ibans').insert({
      pays, iban, banque: banque || null, bic: bic || null, pour: pour || null,
      tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, iban: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('wallet_ibans').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
