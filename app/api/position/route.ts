import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Un collaborateur envoie sa position, uniquement si une mission est en cours pour lui
export async function POST(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { data: moi } = await sb.from('equipe').select('id,tenant_id').eq('user_id', auth.user.id).maybeSingle();
  if (!moi) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const body = await req.json();
  const { latitude, longitude } = body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return NextResponse.json({ error: 'coordonnees_invalides' }, { status: 400 });
  }

  // Verifie qu'une mission est bien "en_cours" pour ce collaborateur en ce moment
  const { data: enCours } = await sb.from('missions_collaborateurs')
    .select('mission_id, missions!inner(id,statut)')
    .eq('collaborateur_id', moi.id)
    .in('missions.statut', ['en_route', 'en_cours'])
    .limit(1).maybeSingle();

  if (!enCours) return NextResponse.json({ error: 'aucune_mission_en_cours' }, { status: 403 });

  const { error } = await sb.from('positions_collaborateurs').upsert({
    tenant_id: moi.tenant_id, collaborateur_id: moi.id,
    mission_id: enCours.mission_id, latitude, longitude,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'collaborateur_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Bene recupere les positions de tous ses collaborateurs actuellement en mission
export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { data: positions } = await sb.from('positions_collaborateurs')
    .select('*, equipe(nom,prenom), missions(client_nom,adresse)')
    .eq('tenant_id', tenantId)
    .gte('updated_at', new Date(Date.now() - 30 * 60000).toISOString());

  return NextResponse.json({ positions: positions || [] });
}
