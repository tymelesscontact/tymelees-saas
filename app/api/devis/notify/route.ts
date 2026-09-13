import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../../lib/supabaseServer';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase env manquantes');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// PDF reel joint a l'email, en plus du lien -- meme structure que le
// document HTML genere a la creation (generateDevis.ts), mais dessine
// avec PDFKit (deja utilise pour les factures, pas de nouvelle dependance).
async function genererPdfDevis(devis: any): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const ts = devis.tenant_snapshot || {}
  const nomEntreprise = ts.societe || 'Xyra'
  let logoBuffer: Buffer | null = null
  if (ts.logo_url) {
    try {
      const res = await fetch(ts.logo_url)
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      console.error('Logo devis, telechargement echoue:', e)
    }
  }

  const mentionsLegales = [
    ts.forme_juridique,
    ts.capital_social ? `Capital social ${ts.capital_social}` : null,
    ts.siret ? `SIRET ${ts.siret}` : (ts.siren ? `SIREN ${ts.siren}` : null),
    ts.rcs_ville ? `RCS ${ts.rcs_ville}` : null,
    ts.tva_intracommunautaire ? `TVA intracom. ${ts.tva_intracommunautaire}` : null,
  ].filter(Boolean).join(' — ')
  const adresseEntreprise = [ts.adresse, ts.code_postal, ts.ville, ts.pays].filter(Boolean).join(', ')

  const tauxTvaDefaut = devis.taux_tva ?? 20
  const lignesSource = (devis.lignes && devis.lignes.length > 0)
    ? devis.lignes
    : [{ desc: devis.service, qte: 1, pu: Number(devis.montant) / (1 + tauxTvaDefaut / 100), tva: tauxTvaDefaut }]

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    if (logoBuffer) {
      try { doc.image(logoBuffer, 50, 45, { height: 34 }) }
      catch (e) { doc.fontSize(20).fillColor('#C9A84C').text(nomEntreprise, 50, 50) }
    } else {
      doc.fontSize(20).fillColor('#C9A84C').text(nomEntreprise, 50, 50)
    }
    let yEmetteur = 85
    doc.fontSize(8).fillColor('#999999')
    if (adresseEntreprise) { doc.text(adresseEntreprise, 50, yEmetteur, { width: 280 }); yEmetteur += 12 }
    if (mentionsLegales) { doc.text(mentionsLegales, 50, yEmetteur, { width: 280 }); yEmetteur += 12 }

    doc.fontSize(20).fillColor('#c9a96e').text('DEVIS', 350, 50, { width: 195, align: 'right' })
    doc.fontSize(10).fillColor('#555555')
      .text(`N° ${devis.reference}`, 350, 78, { width: 195, align: 'right' })
      .text(`Date : ${devis.dateDevis}`, 350, 92, { width: 195, align: 'right' })

    let y = 140
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').stroke()
    y += 15

    doc.fontSize(9).fillColor('#c9a96e').text('CLIENT', 50, y)
    y += 14
    doc.fontSize(11).fillColor('#111111').text(devis.client_nom || 'À compléter', 50, y)
    y += 15
    doc.fontSize(9).fillColor('#333333')
    if (devis.client_adresse) { doc.text(devis.client_adresse, 50, y, { width: 300 }); y += 13 }
    if (devis.client_tel) { doc.text(devis.client_tel, 50, y); y += 13 }
    if (devis.client_email) { doc.text(devis.client_email, 50, y); y += 13 }
    y += 15

    doc.rect(50, y, 495, 20).fill('#1a1a1a')
    doc.fontSize(9).fillColor('#c9a96e')
      .text('Description', 55, y + 6)
      .text('Qté', 300, y + 6, { width: 40, align: 'center' })
      .text('PU HT', 340, y + 6, { width: 60, align: 'right' })
      .text('TVA', 405, y + 6, { width: 40, align: 'right' })
      .text('Total HT', 450, y + 6, { width: 90, align: 'right' })
    y += 26

    let totalHT = 0
    let totalTVA = 0
    for (const l of lignesSource) {
      if (y > 700) { doc.addPage(); y = 50 }
      const qte = Number(l.qte) || 1
      const pu = Number(l.pu) || 0
      const tva = l.tva !== undefined && l.tva !== null ? Number(l.tva) : tauxTvaDefaut
      const totalLigne = qte * pu
      totalHT += totalLigne
      totalTVA += totalLigne * (tva / 100)
      doc.fontSize(9).fillColor('#333333')
        .text(l.desc || 'Prestation', 55, y, { width: 240 })
        .text(String(qte), 300, y, { width: 40, align: 'center' })
        .text(`${pu.toFixed(2)} €`, 340, y, { width: 60, align: 'right' })
        .text(`${tva}%`, 405, y, { width: 40, align: 'right' })
        .text(`${totalLigne.toFixed(2)} €`, 450, y, { width: 90, align: 'right' })
      y += 18
      doc.moveTo(50, y - 4).lineTo(545, y - 4).strokeColor('#eeeeee').stroke()
    }

    const remise = devis.remise || 0
    const montantRemise = totalHT * (remise / 100)
    const totalTTC = totalHT + totalTVA - montantRemise

    y += 10
    if (y > 680) { doc.addPage(); y = 50 }
    doc.fontSize(10).fillColor('#333333')
      .text('Total HT', 350, y, { width: 100 }).text(`${totalHT.toFixed(2)} €`, 450, y, { width: 90, align: 'right' })
    y += 16
    doc.text('TVA', 350, y, { width: 100 }).text(`${totalTVA.toFixed(2)} €`, 450, y, { width: 90, align: 'right' })
    y += 16
    if (remise > 0) {
      doc.text(`Remise (${remise}%)`, 350, y, { width: 100 }).text(`-${montantRemise.toFixed(2)} €`, 450, y, { width: 90, align: 'right' })
      y += 16
    }
    doc.fontSize(13).fillColor('#c9a96e').text('Total TTC', 350, y, { width: 100 }).text(`${totalTTC.toFixed(2)} €`, 450, y, { width: 90, align: 'right' })
    y += 32

    if (devis.dateExpiration) {
      doc.fontSize(9).fillColor('#777777').text(
        `Ce devis est valable jusqu'au ${devis.dateExpiration}. Une fois signé électroniquement par le client, il vaut bon de commande et engage les deux parties.`,
        50, y, { width: 495 }
      )
      y += 30
    }

    doc.fontSize(7).fillColor('#999999').text(
      "Conditions générales : règlement intégral à réception de facture, selon les moyens de paiement indiqués sur celle-ci. Tout retard de paiement entraîne de plein droit l'application de pénalités calculées au taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (article L441-10 du Code de commerce). Aucun escompte n'est accordé pour paiement anticipé.",
      50, y, { width: 495 }
    )

    doc.end()
  })
}

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: message },
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    // id transmis par le front est en realite la reference du devis (ex: TYM-123456)
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'id manquant' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: devisRow, error: findErr } = await supabase
      .from('devis')
      .select('reference,client_nom,client_email,client_tel,client_adresse,service,montant,lignes,notes,token_public,taux_tva,remise,created_at,expire_le,tenant_snapshot')
      .eq('reference', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (findErr || !devisRow) {
      return NextResponse.json({ success: false, error: 'Devis introuvable' }, { status: 404 });
    }

    // Toutes les infos envoyees viennent du devis en base, jamais du corps de la requete.
    const { reference, client_nom: client, client_email: email, client_tel: tel, service, montant, lignes, notes: note, token_public: tokenPublic } = devisRow;
    const lienSignature = tokenPublic
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr'}/devis/${reference}?t=${tokenPublic}`
      : null;

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await genererPdfDevis({
        ...devisRow,
        dateDevis: devisRow.created_at ? new Date(devisRow.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
        dateExpiration: devisRow.expire_le ? new Date(devisRow.expire_le).toLocaleDateString('fr-FR') : null,
      });
    } catch (e) {
      console.error('Generation PDF devis echouee:', e);
    }

    const results: { email: boolean; whatsapp: boolean } = { email: false, whatsapp: false };

    const lignesHtml = (lignes || [])
      .map((l: any) => `<tr><td style="padding:8px 0;border-bottom:1px solid #1E1E3633;">${l.desc}</td><td style="padding:8px 0;text-align:center;border-bottom:1px solid #1E1E3633;">${l.qte}</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${l.pu}€</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${(l.qte * l.pu).toFixed(2)}€</td></tr>`)
      .join('');

    // ── ENVOI EMAIL via Resend ──────────────────────────────
    if (email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: email,
          subject: `Votre devis ${reference} — ${service}`,
          html: `
            <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="font-size:24px;font-weight:300;letter-spacing:0.15em;color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
              <div style="background:#0C0C1A;border:1px solid #1E1E36;padding:28px;margin:24px 0;">
                <h2 style="font-size:18px;font-weight:600;margin-bottom:4px;">Devis ${reference}</h2>
                <p style="color:#5A5A7A;font-size:12px;margin-bottom:20px;">Pour ${client} · ${service}</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                  <tr><th style="text-align:left;padding-bottom:8px;color:#5A5A7A;">Description</th><th style="padding-bottom:8px;color:#5A5A7A;">Qté</th><th style="text-align:right;padding-bottom:8px;color:#5A5A7A;">PU</th><th style="text-align:right;padding-bottom:8px;color:#5A5A7A;">Total</th></tr>
                  ${lignesHtml}
                </table>
                <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:700;color:#C9A84C;">Total : ${montant}€</div>
                ${note ? `<p style="margin-top:16px;font-size:12px;color:#5A5A7A;">${note}</p>` : ''}
              </div>
              ${lienSignature ? `<p style="text-align:center;margin-top:20px;"><a href="${lienSignature}" style="background:#C9A84C;color:#000;padding:12px 28px;text-decoration:none;font-weight:700;border-radius:6px;display:inline-block;">Consulter et signer le devis</a></p>` : ''}
            </div>
          `,
          attachments: pdfBuffer ? [{ filename: `Devis-${reference}.pdf`, content: pdfBuffer.toString('base64') }] : undefined,
        });
        results.email = true;
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    // ── ENVOI WHATSAPP ───────────────────────────────────────
    if (tel) {
      try {
        const msg =
          `📋 *Devis ${reference}*\n\n` +
          `Bonjour ${client},\n\n` +
          `Voici votre devis pour : ${service}\n` +
          `💰 Montant total : ${montant}€\n\n` +
          (note ? `${note}\n\n` : '') +
          (lienSignature ? `👉 Consultez et signez votre devis ici :\n${lienSignature}` : `Nous revenons vers vous rapidement pour la suite.`);
        const res = await sendWhatsApp(tel, msg);
        results.whatsapp = res.ok;
      } catch (e) {
        console.error('WhatsApp error:', e);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Devis notify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}