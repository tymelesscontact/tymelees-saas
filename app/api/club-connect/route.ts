import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Onboarding Stripe Connect (Express) pour les membres du Xyra Club apporteurs/prestataires de
// Club Deals. Objectif : quand un client paie un Deal, l'argent part DIRECTEMENT sur le compte
// Stripe du prestataire -- Xyra ne recoit jamais la somme totale, seulement sa commission (3%),
// automatiquement, via application_fee_amount + transfer_data.destination sur le PaymentIntent
// (voir app/api/club-deals/route.ts, action "payer"). Voir memoire du 22/09/2026 : le proprietaire
// a explicitement demande que Xyra n'encaisse jamais la somme du client pour ces deals.

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('club_membres')
    .select('*').eq('user_id', auth.user.id).in('statut', ['actif', 'fondateur']).maybeSingle();
  return membre || null;
}

// Verifie l'etat REEL du compte Stripe (jamais se fier a un statut mis en cache pour une decision
// financiere) et met a jour le cache d'affichage au passage.
async function statutReel(sb: any, membre: any): Promise<{ actif: boolean; statut: string }> {
  if (!membre.stripe_account_id) return { actif: false, statut: 'non_configure' };
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
    const compte = await stripe.accounts.retrieve(membre.stripe_account_id);
    const actif = !!compte.charges_enabled && !!compte.payouts_enabled;
    const statut = actif ? 'actif' : 'en_attente';
    if (statut !== membre.stripe_statut) {
      await sb.from('club_membres').update({ stripe_statut: statut }).eq('id', membre.id);
    }
    return { actif, statut };
  } catch (e) {
    return { actif: false, statut: 'erreur' };
  }
}

export async function GET(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
  const sb = sbAdmin();
  const { actif, statut } = await statutReel(sb, membre);
  return NextResponse.json({ statut, actif });
}

export async function POST(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  // ── Demarrer / reprendre la configuration du compte de paiement ──
  if (action === 'connecter') {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    let accountId = membre.stripe_account_id;
    if (!accountId) {
      const compte = await stripe.accounts.create({
        type: 'express',
        email: membre.email || undefined,
        business_type: 'individual',
        metadata: { club_membre_id: membre.id },
      });
      accountId = compte.id;
      await sb.from('club_membres').update({
        stripe_account_id: accountId,
        stripe_statut: 'en_attente',
        stripe_connecte_le: new Date().toISOString(),
      }).eq('id', membre.id);
    }

    const lien = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.nextUrl.origin}/club/espace?stripe=reprendre`,
      return_url: `${req.nextUrl.origin}/club/espace?stripe=retour`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ success: true, url: lien.url });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
