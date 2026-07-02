import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: message.replace(/[^\x00-\xFF]/g, '') } }),
  });
}

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'cartes';
  const carteId = searchParams.get('carte_id');

  if (action === 'cartes') {
    const { data } = await sb.from('cartes_virtuelles').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ cartes: data || [] });
  }

  if (action === 'transactions' && carteId) {
    const { data } = await sb.from('cartes_transactions').select('*').eq('carte_id', carteId).order('date_transaction', { ascending: false }).limit(50);
    return NextResponse.json({ transactions: data || [] });
  }

  if (action === 'transactions_all') {
    const { data } = await sb.from('cartes_transactions').select('*, cartes_virtuelles(nom,couleur)').order('date_transaction', { ascending: false }).limit(100);
    return NextResponse.json({ transactions: data || [] });
  }

  if (action === 'budgets') {
    const { data } = await sb.from('cartes_budgets_projet').select('*');
    return NextResponse.json({ budgets: data || [] });
  }

  if (action === 'en_attente') {
    const { data } = await sb.from('cartes_transactions').select('*, cartes_virtuelles(nom)').eq('statut', 'en_attente').order('created_at', { ascending: false });
    return NextResponse.json({ transactions: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'create') {
    const { nom, limite, devise, couleur, type, collaborateur, projet, ephemere } = body;
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const prefixes = ['4532', '5261', '4111'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const { data, error } = await sb.from('cartes_virtuelles').insert({
      nom, limite: Number(limite), devise: devise || 'EUR', couleur: couleur || '#4B7BFF',
      type: type || 'standard', collaborateur, projet,
      ephemere: ephemere || false,
      statut: ephemere ? 'éphémère' : 'active',
      numero: `${prefix} •••• •••• ${suffix}`,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, carte: data });
  }

  if (action === 'toggle') {
    const { id, statut_actuel } = body;
    const nouveau = statut_actuel === 'active' ? 'bloquée' : 'active';
    await sb.from('cartes_virtuelles').update({ statut: nouveau, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true, nouveau_statut: nouveau });
  }

  if (action === 'delete') {
    await sb.from('cartes_virtuelles').delete().eq('id', body.id);
    return NextResponse.json({ success: true });
  }

  if (action === 'update_solde') {
    const { id, montant, sens } = body;
    const { data: carte } = await sb.from('cartes_virtuelles').select('solde,limite,nom,ephemere').eq('id', id).single();
    if (!carte) return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
    const nouveau = sens === 'debit' ? Number(carte.solde) + Number(montant) : Math.max(0, Number(carte.solde) - Number(montant));
    const updates: any = { solde: nouveau, updated_at: new Date().toISOString() };
    if (carte.ephemere && sens === 'debit') updates.statut = 'expirée';
    await sb.from('cartes_virtuelles').update(updates).eq('id', id);
    // Alerte si > 80%
    const pct = (nouveau / Number(carte.limite)) * 100;
    if (pct >= 80 && process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra Alerte carte : ${carte.nom} a utilise ${Math.round(pct)}% de son plafond (${nouveau}/${carte.limite})`);
    }
    return NextResponse.json({ success: true, nouveau_solde: nouveau });
  }

  if (action === 'ajouter_transaction') {
    const { carte_id, libelle, montant, sens, categorie, approbation_requise } = body;
    const statut = approbation_requise ? 'en_attente' : 'approuvé';
    const { data, error } = await sb.from('cartes_transactions').insert({ carte_id, libelle, montant: Number(montant), sens: sens || 'debit', categorie: categorie || 'Autres', statut }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (statut === 'approuvé') {
      await sb.from('cartes_virtuelles').update({ solde: Number(montant), updated_at: new Date().toISOString() }).eq('id', carte_id);
    }
    if (approbation_requise && process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra Approbation requise : ${libelle} - ${montant}EUR sur carte. Repondez OUI pour approuver.`);
    }
    return NextResponse.json({ success: true, transaction: data });
  }

  if (action === 'approuver_transaction') {
    const { id, carte_id, montant } = body;
    await sb.from('cartes_transactions').update({ statut: 'approuvé', approuve_par: 'Owner', updated_at: new Date().toISOString() }).eq('id', id);
    const { data: carte } = await sb.from('cartes_virtuelles').select('solde').eq('id', carte_id).single();
    if (carte) await sb.from('cartes_virtuelles').update({ solde: Number(carte.solde) + Number(montant) }).eq('id', carte_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'analyser_ia') {
    const { cartes } = body;
    try {
      const resume = (cartes || []).map((c: any) => `${c.nom}: ${c.solde}/${c.limite} ${c.devise} (${Math.round(c.solde/c.limite*100)}%)`).join(', ');
      const analyse = await askClaude(`Analyse ces dépenses par carte virtuelle et identifie anomalies ou points d'attention (3 phrases max, français) : ${resume}. Donne 1 point fort et 1 recommandation.`);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'create_budget') {
    const { projet, budget_total } = body;
    const { error } = await sb.from('cartes_budgets_projet').insert({ projet, budget_total: Number(budget_total) });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}