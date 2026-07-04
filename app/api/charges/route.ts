import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await sb.from('charges').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charges: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer' || action === 'modifier') {
    const { id, categorie, libelle, montant, frequence } = body;
    if (action === 'modifier' && id) {
      const { error } = await sb.from('charges').update({ categorie, libelle, montant: Number(montant), frequence }).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    const { data, error } = await sb.from('charges').insert({ categorie, libelle, montant: Number(montant), frequence: frequence || 'mensuelle' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, charge: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('charges').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}