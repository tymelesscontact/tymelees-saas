import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { data, error } = await sb.from('types_rdv')
    .select('*').eq('actif', true).order('nom');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ types: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, duree_minutes, prix, devise, description, delai_reservation, buffer_avant, buffer_apres } = body;
    if (!nom?.trim() || !duree_minutes) {
      return NextResponse.json({ error: 'Nom et duree necessaires' }, { status: 400 });
    }
    const { data, error } = await sb.from('types_rdv').insert({
      nom: nom.trim(), duree_minutes: Number(duree_minutes),
      prix: Number(prix || 0), devise: devise || 'EUR',
      description: description || null,
      delai_reservation: delai_reservation || null,
      buffer_avant: Number(buffer_avant || 0),
      buffer_apres: Number(buffer_apres || 0),
      actif: true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, type: data });
  }

  if (action === 'modifier') {
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const champs: any = {};
    for (const c of ['nom', 'description', 'devise']) if (body[c] !== undefined) champs[c] = body[c];
    for (const c of ['duree_minutes', 'prix', 'buffer_avant', 'buffer_apres']) if (body[c] !== undefined) champs[c] = Number(body[c]);
    if (body.actif !== undefined) champs.actif = !!body.actif;
    const { error } = await sb.from('types_rdv').update(champs).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { error } = await sb.from('types_rdv').update({ actif: false }).eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
