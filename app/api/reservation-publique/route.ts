import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant');
  if (!tenantId) return NextResponse.json({ error: 'tenant_manquant' }, { status: 400 });

  const { data: tenant } = await sb.from('tenants')
    .select('societe,logo_url,couleur_primaire,couleur_secondaire,couleur_accent')
    .eq('id', tenantId).maybeSingle();
  if (!tenant) return NextResponse.json({ error: 'societe_introuvable' }, { status: 404 });

  const { data: types } = await sb.from('types_rdv').select('*').eq('actif', true).order('nom');

  return NextResponse.json({ tenant, types: types || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, type_mission_id, client_nom, client_email, client_tel, date_mission, heure_debut, adresse, notes } = body;

  if (!tenant_id || !client_nom || !date_mission || !heure_debut) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const { data: tenant } = await sb.from('tenants').select('id').eq('id', tenant_id).maybeSingle();
  if (!tenant) return NextResponse.json({ error: 'societe_introuvable' }, { status: 404 });

  let serviceNom = 'Demande client';
  if (type_mission_id) {
    const { data: typePresta } = await sb.from('types_rdv').select('nom').eq('id', type_mission_id).maybeSingle();
    if (typePresta?.nom) serviceNom = typePresta.nom;
  }

  const { data: mission, error } = await sb.from('missions').insert({
    tenant_id, type_mission_id: type_mission_id || null, service: serviceNom,
    client_nom, client_email: client_email || null, client_tel: client_tel || null,
    date_mission, heure: heure_debut, adresse: adresse || null, notes: notes || null,
    statut: 'propose', cree_par: 'client',
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, mission });
}
