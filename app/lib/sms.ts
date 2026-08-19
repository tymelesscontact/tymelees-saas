/**
 * Envoi SMS via Twilio, dernier recours quand WhatsApp echoue
 * et qu'il n'y a pas d'email. Ne fait rien si Twilio n'est pas
 * configure — pas d'erreur bloquante, juste un echec signale
 * dans les journaux.
 */
export async function envoyerSMS(numero: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const de = process.env.TWILIO_PHONE;

  if (!sid || !token || !de) {
    console.error('SMS non envoye — Twilio non configure');
    return { ok: false, raison: 'twilio_non_configure' };
  }
  if (!numero) return { ok: false, raison: 'numero_absent' };

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: numero.replace(/\s/g, ''),
        From: de,
        Body: message,
      }),
    });
    return { ok: res.ok };
  } catch (e: any) {
    console.error('SMS erreur:', e.message);
    return { ok: false, raison: e.message };
  }
}
