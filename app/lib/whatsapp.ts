import { createClient } from '@supabase/supabase-js';
import { chiffrer, dechiffrer } from './anthropicKey';

// Jeton WhatsApp Business stocke chiffre (prefixe 'enc:') ; les anciens jetons en
// clair restent lisibles et sont chiffres au prochain enregistrement.
export function jetonWhatsAppChiffre(jeton: string): string {
  return 'enc:' + chiffrer(jeton);
}
export function jetonWhatsAppLisible(valeur?: string | null): string | null {
  if (!valeur) return null;
  if (!valeur.startsWith('enc:')) return valeur;
  try { return dechiffrer(valeur.slice(4)); } catch { return null; }
}

/**
 * Numero ou envoyer les alertes propres a une entreprise (avis, NPS, cartes,
 * rapports...) : celui de l'entreprise elle-meme, jamais le numero global de la
 * plateforme (OWNER_WHATSAPP), sinon les donnees d'un client partent chez un autre.
 */
export async function telephoneAlerteTenant(tenantId?: string | null): Promise<string | null> {
  if (!tenantId) return null;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: t } = await sb.from('tenants')
    .select('telephone_contact,telephone_entreprise')
    .eq('id', tenantId).maybeSingle();
  return t?.telephone_contact || t?.telephone_entreprise || null;
}

/**
 * Envoi WhatsApp au nom du bon compte.
 * Chaque tenant peut connecter son propre numero WhatsApp Business.
 * A defaut, le compte Xyra est utilise.
 */
export async function envoyerWhatsApp(to: string, message: string, tenantId?: string | null) {
  if (!to) return { ok: false, raison: 'numero_absent' };

  let phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  let token = process.env.WHATSAPP_TOKEN;

  if (tenantId) {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: t } = await sb.from('tenants')
        .select('whatsapp_phone_number_id,whatsapp_token,whatsapp_actif')
        .eq('id', tenantId).maybeSingle();
      const jetonTenant = jetonWhatsAppLisible(t?.whatsapp_token);
      if (t?.whatsapp_actif && t.whatsapp_phone_number_id && jetonTenant) {
        phoneId = t.whatsapp_phone_number_id;
        token = jetonTenant;
      }
    } catch (e: any) {
      console.error('WhatsApp tenant:', e.message);
    }
  }

  if (!phoneId || !token) return { ok: false, raison: 'compte_non_configure' };

  const safe = message.replace(/[^\x00-\xFF]/g, '');
  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        text: { body: safe },
      }),
    });
    if (!res.ok) {
      const corpsErreur = await res.text();
      console.error('WhatsApp REFUSE par Meta, statut', res.status, ':', corpsErreur);
      return { ok: false, raison: corpsErreur };
    }
    return { ok: true };
  } catch (e: any) {
    console.error('WhatsApp envoi:', e.message);
    return { ok: false, raison: e.message };
  }
}
