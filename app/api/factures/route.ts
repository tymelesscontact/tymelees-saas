import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

async function genererPdfFacture(facture: any): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(24).fillColor('#C9A84C').text('XYRA', 50, 50);
    doc.fontSize(10).fillColor('#888888')
      .text(`Facture ${facture.numero}`, 50, 85)
      .text(`Date : ${facture.date_emission || new Date().toLocaleDateString('fr-FR')}`, 50, 100)
      .text(`Facturé à : ${facture.client_nom}${facture.siren ? ' · SIREN ' + facture.siren : ''}`, 50, 115);

    doc.moveTo(50, 145).lineTo(545, 145).strokeColor('#dddddd').stroke();

    doc.fontSize(11).fillColor('#111111')
      .text('Description', 50, 165)
      .text('Montant HT', 420, 165, { width: 125, align: 'right' });

    doc.fontSize(11).fillColor('#333333')
      .text(facture.description || 'Prestation de services', 50, 190)
      .text(`${Number(facture.montant_ht).toFixed(2)} €`, 420, 190, { width: 125, align: 'right' });

    doc.text(`TVA (${facture.taux_tva}%)`, 50, 215)
      .text(`${Number(facture.montant_tva).toFixed(2)} €`, 420, 215, { width: 125, align: 'right' });

    doc.moveTo(50, 245).lineTo(545, 245).strokeColor('#dddddd').stroke();

    doc.fontSize(16).fillColor('#C9A84C')
      .text(`Total TTC : ${Number(facture.montant_ttc).toFixed(2)} €`, 50, 260, { width: 495, align: 'right' });

    doc.fontSize(9).fillColor('#999999')
      .text('Xyra — Document généré automatiquement', 50, 750, { width: 495, align: 'center' });

    doc.end();
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const tenantId = await getTenantIdFromRequest(req);
    let query = sb.from('factures').select('*').order('created_at', { ascending: false }).limit(200);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ factures: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // ── CRÉER UNE FACTURE ───────────────────────────────────────
  if (action === 'creer') {
    const { client_nom, client_email, client_tel, siren, type_client, description, montant_ht, taux_tva } = body;
    if (!client_nom || !montant_ht) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const { count } = await sb.from('factures').select('*', { count: 'exact', head: true });
    const annee = new Date().getFullYear();
    const numero = `FA-${annee}-${String((count || 0) + 1).padStart(4, '0')}`;

    const montantHT = Number(montant_ht);
    const tauxTVA = Number(taux_tva ?? 20);
    const montantTVA = Math.round(montantHT * tauxTVA) / 100;
    const montantTTC = montantHT + montantTVA;

    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30);

    const statutDgfip = type_client === 'administration' ? 'a_transmettre' : 'non_applicable';

    const tenantId = await getTenantIdFromRequest(req);
    const { data: row, error } = await sb.from('factures').insert({
      numero,
      tenant_id: tenantId,
      client_nom,
      client_email: client_email || null,
      client_tel: client_tel || null,
      siren: siren || null,
      type_client: type_client || 'entreprise',
      description: description || '',
      montant_ht: montantHT,
      taux_tva: tauxTVA,
      montant_tva: montantTVA,
      montant_ttc: montantTTC,
      statut: 'émise',
      statut_dgfip: statutDgfip,
      date_echeance: echeance.toISOString().split('T')[0],
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, facture: row });
  }

  // ── GÉNÉRER + ENVOYER LE LIEN DE PAIEMENT STRIPE ────────────
  if (action === 'envoyer_paiement') {
    const { id } = body;
    const { data: facture, error: ferr } = await sb.from('factures').select('*').eq('id', id).single();
    if (ferr || !facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

    let paymentUrl: string | null = null;
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: facture.client_email || undefined,
        metadata: { type: 'facture_payment', facture_id: facture.id },
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Facture ${facture.numero}`, description: facture.description || '' },
            unit_amount: Math.round(Number(facture.montant_ttc) * 100),
          },
          quantity: 1,
        }],
        success_url: `https://xyraio.fr/dashboard?facture=success`,
        cancel_url: `https://xyraio.fr/dashboard?facture=cancelled`,
      });

      paymentUrl = session.url;
      await sb.from('factures').update({ stripe_session_id: session.id, stripe_payment_url: session.url }).eq('id', id);
    } catch (e: any) {
      console.error('Stripe error:', e);
      return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 });
    }

    if (facture.client_email) {
      try {
        const pdfBuffer = await genererPdfFacture(facture);
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: facture.client_email,
          subject: `Facture ${facture.numero} — ${facture.montant_ttc}€`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${facture.client_nom},</p><p>Voici votre facture ${facture.numero} d'un montant de <strong>${facture.montant_ttc}€</strong>, en pièce jointe.</p><p><a href="${paymentUrl}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer ${facture.montant_ttc}€</a></p></div>`,
          attachments: [{ filename: `Facture-${facture.numero}.pdf`, content: pdfBuffer.toString('base64') }],
        });
      } catch (e) { console.error('Email error:', e); }
    }
    if (facture.client_tel) {
      try {
        await sendWhatsApp(facture.client_tel, `Bonjour ${facture.client_nom},\n\nVotre facture ${facture.numero} (${facture.montant_ttc}€) est disponible.\nPayer ici : ${paymentUrl}\n\nMerci 🙏`);
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    return NextResponse.json({ success: true, paymentUrl });
  }

  // ── MARQUER PAYÉE MANUELLEMENT (chèque, espèces, virement reçu) ─
  if (action === 'marquer_payee') {
    const { id } = body;
    const { error } = await sb.from('factures').update({ statut: 'payée' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── RELANCER UNE FACTURE IMPAYÉE ─────────────────────────────
  if (action === 'relancer') {
    const { id } = body;
    const { data: facture, error: ferr } = await sb.from('factures').select('*').eq('id', id).single();
    if (ferr || !facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

    const lien = facture.stripe_payment_url || '';
    let envoye = false;
    if (facture.client_email) {
      try {
        const pdfBuffer = await genererPdfFacture(facture);
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: facture.client_email,
          subject: `Rappel — Facture ${facture.numero} en attente de paiement`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${facture.client_nom},</p><p>Petit rappel : votre facture ${facture.numero} d'un montant de <strong>${facture.montant_ttc}€</strong> est toujours en attente de paiement (facture jointe).</p>${lien ? `<p><a href="${lien}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer maintenant</a></p>` : ''}</div>`,
          attachments: [{ filename: `Facture-${facture.numero}.pdf`, content: pdfBuffer.toString('base64') }],
        });
        envoye = true;
      } catch (e) { console.error('Email error:', e); }
    }
    if (facture.client_tel) {
      try {
        await sendWhatsApp(facture.client_tel, `Bonjour ${facture.client_nom}, petit rappel pour votre facture ${facture.numero} (${facture.montant_ttc}€) toujours en attente.${lien ? `\nPayer : ${lien}` : ''}`);
        envoye = true;
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    await sb.from('factures').update({ statut: 'en_retard' }).eq('id', id);
    return NextResponse.json({ success: true, envoye });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}