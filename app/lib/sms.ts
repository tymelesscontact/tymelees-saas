/**
 * Envoi SMS via la passerelle "SMS Gateway for Android" (serveur cloud
 * public api.sms-gate.app). Un telephone Android sous la main sert de
 * relais, en utilisant son forfait SMS -- pas de cout tiers.
 *
 * Dernier recours quand WhatsApp echoue et qu'il n'y a pas d'email.
 * Ne fait rien si la passerelle n'est pas configuree -- pas d'erreur
 * bloquante, juste un echec signale dans les journaux.
 */
export function auFormatInternational(numero: string): string {
  const propre = numero.replace(/[\s.-]/g, '');
  if (propre.startsWith('+')) return propre;
  if (propre.startsWith('0')) return '+33' + propre.slice(1);
  return propre;
}

export async function envoyerSMS(numero: string, message: string) {
  const user = process.env.SMS_GATE_USERNAME;
  const pass = process.env.SMS_GATE_PASSWORD;

  if (!user || !pass) {
    console.error('SMS non envoye — passerelle SMS non configuree');
    return { ok: false, raison: 'sms_gate_non_configure' };
  }
  if (!numero) return { ok: false, raison: 'numero_absent' };

  try {
    const auth = Buffer.from(`${user}:${pass}`).toString('base64');
    const res = await fetch('https://api.sms-gate.app/3rdparty/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textMessage: { text: message },
        phoneNumbers: [auFormatInternational(numero)],
      }),
    });
    if (!res.ok) {
      const corps = await res.text();
      console.error('SMS passerelle a repondu', res.status, corps);
      return { ok: false, raison: corps };
    }
    return { ok: true };
  } catch (e: any) {
    console.error('SMS erreur:', e.message);
    return { ok: false, raison: e.message };
  }
}
