import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function moiConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('equipe').select('id,tenant_id').eq('user_id', auth.user.id).maybeSingle();
  return membre;
}

// Le pointage d'aujourd'hui du collaborateur connecte, s'il existe
export async function GET(req: NextRequest) {
  const moi = await moiConnecte(req);
  if (!moi) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const { data: pointage } = await sb.from('pointages')
    .select('*').eq('employe_id', moi.id).eq('date', aujourdhui).maybeSingle();

  return NextResponse.json({ pointage: pointage || null });
}

export async function POST(req: NextRequest) {
  const moi = await moiConnecte(req);
  if (!moi) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const body = await req.json();
  const { action } = body;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (action === 'arrivee') {
    const { data: existant } = await sb.from('pointages')
      .select('id').eq('employe_id', moi.id).eq('date', aujourdhui).maybeSingle();
    if (existant) return NextResponse.json({ error: 'deja_pointe_aujourdhui' }, { status: 400 });

    const { data, error } = await sb.from('pointages').insert({
      employe_id: moi.id, tenant_id: moi.tenant_id, date: aujourdhui, heure_arrivee: heure,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, pointage: data });
  }

  if (action === 'depart') {
    const { data: existant } = await sb.from('pointages')
      .select('id,heure_arrivee').eq('employe_id', moi.id).eq('date', aujourdhui).maybeSingle();
    if (!existant) return NextResponse.json({ error: 'aucun_pointage_arrivee' }, { status: 400 });
    if (!existant.heure_arrivee) return NextResponse.json({ error: 'pas_darrivee_pointee' }, { status: 400 });

    const [hA, mA] = existant.heure_arrivee.split(':').map(Number);
    const [hD, mD] = heure.split(':').map(Number);
    const heuresTravaillees = Math.round(((hD * 60 + mD) - (hA * 60 + mA)) / 60 * 10) / 10;

    const { error } = await sb.from('pointages')
      .update({ heure_depart: heure, heures_travaillees: heuresTravaillees })
      .eq('id', existant.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, heures_travaillees: heuresTravaillees });
  }

  return NextResponse.json({ error: 'action_inconnue' }, { status: 400 });
}
