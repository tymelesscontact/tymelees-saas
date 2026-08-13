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
    if (!membre_id) {
      return NextResponse.json({ error: 'membre_id requis' }, { status: 400 });
    }

    const sb = sbAdmin();
    const { data: membre } = await sb.from('club_membres').select('*').eq('id', membre_id).single();
    if (!membre) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    // Le droit d'entree n'est du que si l'adhesion n'a jamais ete continue
    const premiereFois = !membre.droit_entree_paye;

    const lignes: any[] = [{
      price_data: {
        currency: 'eur',
        product_data: { name: "Xyra Club - cotisation annuelle" },
        unit_amount: COTISATION,
      },
      quantity: 1,
    }];
    if (premiereFois) {
      lignes.unshift({
        price_data: {
          currency: 'eur',
          product_data: { name: "Xyra Club - droit d'entree" },
          unit_amount: DROIT_ENTREE,
        },
        quantity: 1,
      });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: membre.email || undefined,
      line_items: lignes,
      metadata: {
        type: 'club_adhesion',
        membre_id: String(membre_id),
        droit_entree: premiereFois ? 'oui' : 'non',
      },
      success_url: 'https://xyraio.fr/club/bienvenue?session={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://xyraio.fr/club/rejoindre',
    });

    await sb.from('club_membres')
      .update({ reference_paiement: session.id })
      .eq('id', membre_id);

    let emailEnvoye = false;
    if (membre.email && session.url) {
      const total = ((premiereFois ? DROIT_ENTREE + COTISATION : COTISATION) / 100).toFixed(0);
      const detail = premiereFois
        ? "Droit d'entree : 500 &euro;<br/>Cotisation annuelle : 2 000 &euro;"
        : "Cotisation annuelle : 2 000 &euro;";
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra Club <notifications@xyraio.fr>',
          to: membre.email,
          subject: 'Votre candidature au Xyra Club a ete retenue',
          html: `<div style="font-family:Georgia,serif;background:#0a0a0a;color:#f0ead6;padding:40px 32px;">
            <div style="font-size:26px;font-style:italic;color:#c9a96e;margin-bottom:24px;">Votre place vous attend</div>
            <div style="font-family:sans-serif;font-size:14px;line-height:1.8;color:#a39c8e;margin-bottom:28px;">
              Bonjour ${membre.nom || ''},<br/><br/>
              Votre candidature a ete examinee et retenue. Il ne reste qu'a regler votre adhesion pour rejoindre le club.
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
      montant: (premiereFois ? DROIT_ENTREE + COTISATION : COTISATION) / 100,
      premiere_adhesion: premiereFois,
      email_envoye: emailEnvoye,
      destinataire: membre.email,
    });
  } catch (e: any) {
    console.error('Club paiement:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
