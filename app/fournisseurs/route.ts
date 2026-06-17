import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await sb.from('fournisseurs').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fournisseurs: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, categorie, contact, iban, delai_livraison } = body;
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('fournisseurs').insert({ nom, categorie, contact, iban, delai_livraison }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, fournisseur: data });
  }

  // Commander = enregistre une transaction wallet réelle "à virer" pour ce fournisseur
  if (action === 'commander') {
    const { fournisseur_id, nom, montant, iban } = body;
    if (!nom || !montant) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const { error } = await sb.from('wallet_transactions').insert({
      type: 'fournisseur',
      libelle: `Commande — ${nom}`,
      montant: Number(montant),
      devise: 'EUR',
      methode: 'Virement SEPA',
      statut: 'à_virer',
      ref: `CMD-${Date.now()}`,
      destinataire_nom: nom,
      destinataire_iban: iban || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('fournisseurs').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}