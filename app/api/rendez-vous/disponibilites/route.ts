import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Retrouve le membre du Club a partir du compte connecte.
async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('club_membres')
    .select('id').eq('user_id', auth.user.id).maybeSingle();
  return membre?.id || null;
}

export async function GET(req: NextRequest) {
  const sb = sbAdmin();
  const { searchParams } = new URL(req.url);
  const membreId = searchParams.get('membre_id');
  if (!membreId) return NextResponse.json({ error: 'membre_id requis' }, { status: 400 });

  const { data, error } = await sb.from('disponibilites')
    .select('*').eq('membre_id', membreId).eq('actif', true).order('jour_semaine');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ disponibilites: data || [] });
}

export async function POST(req: NextRequest) {
  const monId = await membreConnecte(req);
  if (!monId) return NextResponse.json({ error: 'non_membre' }, { status: 403 });

  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { jour_semaine, heure_debut, heure_fin } = body;
    if (jour_semaine === undefined || !heure_debut || !heure_fin) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    const { data, error } = await sb.from('disponibilites').insert({
      membre_id: monId, jour_semaine: Number(jour_semaine), heure_debut, heure_fin, actif: true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, disponibilite: data });
  }

  if (action === 'supprimer') {
    // Seul le proprietaire du creneau peut le retirer
    const { error } = await sb.from('disponibilites').delete().eq('id', body.id).eq('membre_id', monId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
