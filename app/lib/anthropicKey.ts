import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function cleChiffrement(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || '';
  return crypto.createHash('sha256').update(secret).digest();
}

export function chiffrer(texte: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', cleChiffrement(), iv);
  const chiffre = Buffer.concat([cipher.update(texte, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, chiffre]).toString('base64');
}

export function dechiffrer(valeur: string): string {
  const data = Buffer.from(valeur, 'base64');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const chiffre = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', cleChiffrement(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(chiffre), decipher.final()]).toString('utf8');
}

export async function getAnthropicKey(tenantId: string | null): Promise<string> {
  if (tenantId) {
    try {
      const { data } = await sb.from('tenants').select('anthropic_api_key').eq('id', tenantId).maybeSingle();
      if (data?.anthropic_api_key) {
        return dechiffrer(data.anthropic_api_key);
      }
    } catch (e) { /* repli sur la cle plateforme */ }
  }
  return process.env.ANTHROPIC_API_KEY!;
}
