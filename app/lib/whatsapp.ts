import { createClient } from '@supabase/supabase-js';

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
      if (t?.whatsapp_actif && t.whatsapp_phone_number_id && t.whatsapp_token) {
        phoneId = t.whatsapp_phone_number_id;
        token = t.whatsapp_token;
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
    return { ok: res.ok };
  } catch (e: any) {
    console.error('WhatsApp envoi:', e.message);
    return { ok: false, raison: e.message };
  }
}
