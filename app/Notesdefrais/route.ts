import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const { data, error } = await sb
      .from('notes_frais')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Map compte_cpt → compteCpt for frontend
    const notes = (data || []).map(n => ({ ...n, compteCpt: n.compte_cpt }));
    return NextResponse.json({ notes });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // Créer une note
  if (action === 'create') {
    const { data, error } = await sb
      .from('notes_frais')
      .insert({
        employe: body.employe,
        date: body.date,
        categorie: body.categorie,
        marchand: body.marchand,
        montant: body.montant,
        tva: body.tva,
        statut: 'en_attente',
        justificatif: body.justificatif,
        compte_cpt: body.compte_cpt,
        projet: body.projet,
        tenant_id: body.tenant_id || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data });
  }

  // Mettre à jour le statut
  if (action === 'update') {
    const { data, error } = await sb
      .from('notes_frais')
      .update({ statut: body.statut })
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Si validé → créer écriture comptable dans compta
    if (body.statut === 'validé') {
      await sb.from('ecritures_comptables').insert({
        date: data.date,
        libelle: data.marchand + ' — ' + data.employe,
        compte: data.compte_cpt,
        montant_ht: data.montant - data.tva,
        tva: data.tva,
        montant_ttc: data.montant,
        type: 'charge',
        source: 'note_frais',
        reference: data.id,
      }).catch(() => {}); // silencieux si table pas encore créée
    }

    return NextResponse.json({ note: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}