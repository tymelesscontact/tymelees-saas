import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const DROIT_ENTREE = 50000;   // 500 EUR en centimes
const COTISATION   = 200000;  // 2000 EUR en centimes

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Paiement de l'adhesion au Club.
 * PAIEMENT UNIQUE, jamais d'abonnement : le renouvellement est manuel.
 * Premiere annee  : droit d'entree 500 EUR + cotisation 2000 EUR
 * Renouvellement  : cotisation 2000 EUR seule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { membre_id } = body;
    const etape = body.etape === 'cotisation' ? 'cotisation' : 'droit_entree';
    if (!membre_id) {
      return NextResponse.json({ error: 'membre_id requis' }, { status: 400 });
    }

    const sb = sbAdmin();
    const { data: membre } = await sb.from('club_membres').select('*').eq('id', membre_id).single();
    if (!membre) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    // Deux paiements distincts : le droit d'entree d'abord, la cotisation ensuite.
    // L'acces au club n'est ouvert qu'apres reglement de la cotisation.
    const premiereFois = etape === 'droit_entree';
    if (etape === 'droit_entree' && membre.droit_entree_paye) {
      return NextResponse.json({ error: "Le droit d'entree est deja regle" }, { status: 400 });
    }
    if (etape === 'cotisation' && !membre.droit_entree_paye) {
      return NextResponse.json({ error: "Le droit d'entree doit etre regle d'abord" }, { status: 400 });
    }

    const montant = etape === 'droit_entree' ? DROIT_ENTREE : COTISATION;
    const libelle = etape === 'droit_entree'
      ? "Xyra Club - droit d'entree"
      : "Xyra Club - cotisation annuelle";

    const lignes: any[] = [{
      price_data: {
        currency: 'eur',
        product_data: { name: libelle },
        unit_amount: montant,
      },
      quantity: 1,
    }];

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: membre.email || undefined,
      line_items: lignes,
      metadata: {
        type: 'club_adhesion',
        membre_id: String(membre_id),
        etape,
      },
      success_url: 'https://xyraio.fr/club/bienvenue?session={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://xyraio.fr/club/rejoindre',
    });

    await sb.from('club_membres')
      .update({ reference_paiement: session.id })
      .eq('id', membre_id);

    let emailEnvoye = false;
    if (membre.email && session.url) {
      const total = (montant / 100).toFixed(0);
      const detail = etape === 'droit_entree'
        ? "Droit d'entree : 500 &euro;<br/><span style=\"color:#4f4a43;\">La cotisation annuelle de 2 000 &euro; vous sera demandee ensuite. L'acces au club est ouvert apres son reglement.</span>"
        : "Cotisation annuelle : 2 000 &euro;<br/><span style=\"color:#4f4a43;\">Votre acces au club sera ouvert des reception.</span>";
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra Club <notifications@xyraio.fr>',
          to: membre.email,
          subject: etape === 'droit_entree' ? 'Votre candidature au Xyra Club a ete retenue' : 'Xyra Club - reglement de votre cotisation',
          html: `<div style="font-family:Georgia,serif;background:#0a0a0a;color:#f0ead6;padding:40px 32px;">
            <div style="font-size:26px;font-style:italic;color:#c9a96e;margin-bottom:24px;">Votre place vous attend</div>
            <div style="font-family:sans-serif;font-size:14px;line-height:1.8;color:#a39c8e;margin-bottom:28px;">
              Bonjour ${membre.nom || ''},<br/><br/>
              ${etape === 'droit_entree' ? "Votre candidature a ete examinee et retenue. Premiere etape : le droit d'entree." : "Il ne reste qu'a regler votre cotisation annuelle pour acceder au club."}
            </div>
            <div style="font-family:sans-serif;font-size:13px;color:#78716a;border-left:1px solid #c9a96e;padding-left:16px;margin-bottom:28px;line-height:1.9;">
              ${detail}<br/><strong style="color:#c9a96e;">Total : ${total} &euro;</strong>
            </div>
            <a href="${session.url}" style="display:inline-block;background:#c9a96e;color:#0a0a0a;padding:14px 30px;text-decoration:none;font-family:sans-serif;font-size:13px;">Regler mon adhesion</a>
            <div style="font-family:sans-serif;font-size:11px;color:#4f4a43;margin-top:32px;line-height:1.7;">
              Vous disposez de 15 jours apres reglement pour vous retracter.<br/>
              Xyra Club &mdash; adhesion reservee aux professionnels.
            </div>
          </div>`,
        });
        emailEnvoye = true;
      } catch (e) { console.error('Email lien paiement:', e); }
    }


    return NextResponse.json({
      success: true,
      url: session.url,
      montant: montant / 100,
      etape,
      premiere_adhesion: premiereFois,
      email_envoye: emailEnvoye,
      destinataire: membre.email,
    });
  } catch (e: any) {
    console.error('Club paiement:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
