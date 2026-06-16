import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: message },
    }),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const { data, error } = await sb
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const solde = (data || []).reduce((acc, t) => {
      if (t.statut !== 'confirmé' && t.statut !== 'viré') return acc;
      return t.type === 'entree' ? acc + Number(t.montant) : acc - Number(t.montant);
    }, 0);

    return NextResponse.json({ transactions: data, solde });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // ── ENCAISSER : génère un vrai lien de paiement Stripe ─────
  if (action === 'encaisser') {
    const { nom, montant, devise, methode, email, tel, ref } = body;
    if (!nom || !montant) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const commission = Number(montant) * 0.05;

    const { data: row, error: insertErr } = await sb
      .from('wallet_transactions')
      .insert({
        type: 'entree',
        libelle: `Paiement ${nom}`,
        montant: Number(montant),
        devise: devise || 'EUR',
        methode: methode || 'carte',
        statut: 'en_attente',
        ref: ref || `TYM-${Date.now()}`,
        commission,
        destinataire_nom: nom,
        destinataire_email: email || null,
        destinataire_tel: tel || null,
      })
      .select()
      .single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    let paymentUrl: string | null = null;

    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-22.dahlia' as any });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email || undefined,
        metadata: { type: 'wallet_payment', transaction_id: row.id },
        line_items: [{
          price_data: {
            currency: (devise || 'EUR').toLowerCase(),
            product_data: { name: `Paiement ${nom}`, description: ref || '' },
            unit_amount: Math.round(Number(montant) * 100),
          },
          quantity: 1,
        }],
        success_url: `https://xyraio.fr/dashboard?wallet=success`,
        cancel_url: `https://xyraio.fr/dashboard?wallet=cancelled`,
      });

      paymentUrl = session.url;

      await sb.from('wallet_transactions').update({
        stripe_session_id: session.id,
        stripe_payment_url: session.url,
      }).eq('id', row.id);
    } catch (e: any) {
      console.error('Stripe error:', e);
    }

    // Envoi du lien au client
    if (paymentUrl && email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <onboarding@resend.dev>',
          to: email,
          subject: `Lien de paiement — ${montant}${devise === 'USD' ? '$' : '€'}`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${nom},</p><p>Voici votre lien de paiement sécurisé :</p><p><a href="${paymentUrl}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer ${montant}${devise === 'USD' ? '$' : '€'}</a></p></div>`,
        });
      } catch (e) { console.error('Email error:', e); }
    }
    if (paymentUrl && tel) {
      try {
        await sendWhatsApp(tel, `Bonjour ${nom},\n\nVoici votre lien de paiement sécurisé pour ${montant}${devise === 'USD' ? '$' : '€'} :\n${paymentUrl}\n\nMerci 🙏`);
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    return NextResponse.json({ success: true, transaction: row, paymentUrl });
  }

  // ── PAYER : enregistre un virement à exécuter manuellement ──
  if (action === 'payer') {
    const { nom, montant, devise, methode, ref, type, destinataire_iban, destinataire_email, destinataire_tel } = body;
    if (!nom || !montant) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const { data: row, error } = await sb
      .from('wallet_transactions')
      .insert({
        type: type || 'sortie',
        libelle: nom,
        montant: Number(montant),
        devise: devise || 'EUR',
        methode: methode || 'Virement SEPA',
        statut: 'à_virer',
        ref: ref || `PAY-${Date.now()}`,
        destinataire_nom: nom,
        destinataire_iban: destinataire_iban || null,
        destinataire_email: destinataire_email || null,
        destinataire_tel: destinataire_tel || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, transaction: row });
  }

  // ── MARQUER COMME VIRÉ : après exécution manuelle du virement ─
  if (action === 'marquer_vire') {
    const { id } = body;
    const { error } = await sb.from('wallet_transactions').update({ statut: 'viré' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}