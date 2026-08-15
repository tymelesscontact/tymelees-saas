import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const COMMISSION_XYRA = 3; // pourcent, fixe

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('club_membres')
    .select('*').eq('user_id', auth.user.id).eq('statut', 'actif').maybeSingle();
  return membre || null;
}

export async function GET(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const sb = sbAdmin();
  const { data } = await sb.from('club_deals')
    .select('*')
    .or(`membre_prestataire.eq.${membre.id},membre_client.eq.${membre.id},membre_apporteur.eq.${membre.id}`)
    .order('created_at', { ascending: false });

  return NextResponse.json({ deals: data || [], moi: membre.id });
}

export async function POST(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  // ── Proposer un deal ────────────────────────────────────
  if (action === 'proposer') {
    const { membre_client, membre_apporteur, titre, description, montant,
            commission_apporteur_pct, demande_id } = body;
    if (!membre_client || !titre || !montant) {
      return NextResponse.json({ error: 'Client, titre et montant sont necessaires' }, { status: 400 });
    }
    if (membre_client === membre.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas contracter avec vous-meme' }, { status: 400 });
    }

    const m = Number(montant);
    const pctApporteur = membre_apporteur ? Number(commission_apporteur_pct || 0) : 0;
    const commApporteur = Math.round(m * pctApporteur) / 100;
    const commXyra = Math.round(m * COMMISSION_XYRA) / 100;

    const { data, error } = await sb.from('club_deals').insert({
      reference: 'CD-' + Date.now().toString(36).toUpperCase(),
      membre_prestataire: membre.id,
      membre_client,
      membre_apporteur: membre_apporteur || null,
      titre, description: description || null,
      montant: m,
      commission_apporteur_pct: pctApporteur,
      commission_apporteur_montant: commApporteur,
      commission_xyra_pct: COMMISSION_XYRA,
      commission_xyra_montant: commXyra,
      montant_net: m - commApporteur - commXyra,
      statut: 'propose',
      demande_id: demande_id || null,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deal: data });
  }

  // ── Accepter (par le client) ────────────────────────────
  if (action === 'accepter') {
    const { data: deal } = await sb.from('club_deals').select('*').eq('id', body.deal_id).single();
    if (!deal) return NextResponse.json({ error: 'Deal introuvable' }, { status: 404 });
    if (deal.membre_client !== membre.id) {
      return NextResponse.json({ error: 'Seul le client peut accepter' }, { status: 403 });
    }
    if (deal.statut !== 'propose') {
      return NextResponse.json({ error: 'Ce deal n est plus en attente' }, { status: 400 });
    }
    await sb.from('club_deals').update({ statut: 'accepte' }).eq('id', deal.id);
    return NextResponse.json({ success: true });
  }

  // ── Refuser ─────────────────────────────────────────────
  if (action === 'refuser') {
    const { data: deal } = await sb.from('club_deals').select('*').eq('id', body.deal_id).single();
    if (!deal || deal.membre_client !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    await sb.from('club_deals').update({ statut: 'refuse' }).eq('id', deal.id);
    return NextResponse.json({ success: true });
  }

  // ── Marquer livre (par le prestataire) ──────────────────
  if (action === 'livrer') {
    const { data: deal } = await sb.from('club_deals').select('*').eq('id', body.deal_id).single();
    if (!deal || deal.membre_prestataire !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    if (deal.statut !== 'paye') {
      return NextResponse.json({ error: 'Le paiement doit etre recu avant la livraison' }, { status: 400 });
    }
    await sb.from('club_deals')
      .update({ statut: 'livre', livre_le: new Date().toISOString() })
      .eq('id', deal.id);
    return NextResponse.json({ success: true });
  }

  // ── Valider la prestation (par le client) : libere les fonds ──
  if (action === 'valider') {
    const { data: deal } = await sb.from('club_deals').select('*').eq('id', body.deal_id).single();
    if (!deal || deal.membre_client !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    if (deal.statut !== 'livre') {
      return NextResponse.json({ error: 'La prestation doit etre livree' }, { status: 400 });
    }

    await sb.from('club_deals')
      .update({ statut: 'valide', valide_le: new Date().toISOString(), avis_client: body.note || null })
      .eq('id', deal.id);

    // Mise a jour de la reputation et du CA des membres concernes
    const { data: prest } = await sb.from('club_membres')
      .select('nb_deals,ca_genere,score_reputation').eq('id', deal.membre_prestataire).single();
    if (prest) {
      await sb.from('club_membres').update({
        nb_deals: (prest.nb_deals || 0) + 1,
        ca_genere: Number(prest.ca_genere || 0) + Number(deal.montant_net || 0),
        score_reputation: Math.min(100, (prest.score_reputation || 0) + 2),
      }).eq('id', deal.membre_prestataire);
    }
    if (deal.membre_apporteur) {
      const { data: app } = await sb.from('club_membres')
        .select('ca_genere,score_reputation').eq('id', deal.membre_apporteur).single();
      if (app) {
        await sb.from('club_membres').update({
          ca_genere: Number(app.ca_genere || 0) + Number(deal.commission_apporteur_montant || 0),
          score_reputation: Math.min(100, (app.score_reputation || 0) + 3),
        }).eq('id', deal.membre_apporteur);
      }
    }
    return NextResponse.json({ success: true });
  }

  // ── Payer (par le client) : genere le lien Stripe ───────
  if (action === 'payer') {
    const { data: deal } = await sb.from('club_deals').select('*').eq('id', body.deal_id).single();
    if (!deal || deal.membre_client !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    if (deal.statut !== 'accepte') {
      return NextResponse.json({ error: 'Le deal doit etre accepte avant paiement' }, { status: 400 });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: membre.email || undefined,
      line_items: [{
        price_data: {
          currency: (deal.devise || 'eur').toLowerCase(),
          product_data: { name: deal.titre, description: `Deal ${deal.reference} - Xyra Club` },
          unit_amount: Math.round(Number(deal.montant) * 100),
        },
        quantity: 1,
      }],
      metadata: { type: 'club_deal', deal_id: String(deal.id) },
      success_url: 'https://xyraio.fr/club/espace?deal=paye',
      cancel_url: 'https://xyraio.fr/club/espace',
    });

    await sb.from('club_deals').update({ reference_paiement: session.id }).eq('id', deal.id);
    return NextResponse.json({ success: true, url: session.url });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
