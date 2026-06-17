import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
    const { id, client, email, tel, service, montant, lignes, note } = await req.json();

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
          subject: `Votre devis ${id} — ${service}`,
          html: `
            <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="font-size:24px;font-weight:300;letter-spacing:0.15em;color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
              <div style="background:#0C0C1A;border:1px solid #1E1E36;padding:28px;margin:24px 0;">
                <h2 style="font-size:18px;font-weight:600;margin-bottom:4px;">Devis ${id}</h2>
                <p style="color:#5A5A7A;font-size:12px;margin-bottom:20px;">Pour ${client} · ${service}</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                  <tr><th style="text-align:left;padding-bottom:8px;color:#5A5A7A;">Description</th><th style="padding-bottom:8px;color:#5A5A7A;">Qté</th><th style="text-align:right;padding-bottom:8px;color:#5A5A7A;">PU</th><th style="text-align:right;padding-bottom:8px;color:#5A5A7A;">Total</th></tr>
                  ${lignesHtml}
                </table>
                <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:700;color:#C9A84C;">Total : ${montant}€</div>
                ${note ? `<p style="margin-top:16px;font-size:12px;color:#5A5A7A;">${note}</p>` : ''}
              </div>
              <p style="text-align:center;font-size:11px;color:#5A5A7A;">Pour valider ce devis, répondez simplement à cet email.</p>
            </div>
          `,
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
          `📋 *Devis ${id}*\n\n` +
          `Bonjour ${client},\n\n` +
          `Voici votre devis pour : ${service}\n` +
          `💰 Montant total : ${montant}€\n\n` +
          (note ? `${note}\n\n` : '') +
          `Pour valider ce devis, répondez simplement *OUI* à ce message. 🙏`;
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