import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const DUREE_INTENTION_SECONDES = 15 * 60;

function secretInscription() {
  return process.env.REGISTRATION_INTENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function signer(payload: string) {
  const secret = secretInscription();
  if (!secret) throw new Error('Secret de signature manquant');
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function POST(req: NextRequest) {
  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ success: false, error: 'Corps JSON invalide' }, { status: 400 });
  }

  const emailNormalise = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalise)) {
    return NextResponse.json({ success: false, error: 'Email invalide' }, { status: 400 });
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${emailNormalise}.${issuedAt}.${randomUUID()}`;
  const response = NextResponse.json({ success: true });
  response.cookies.set('registration_intent', `${payload}.${signer(payload)}`, {
    path: '/',
    maxAge: DUREE_INTENTION_SECONDES,
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  });
  return response;
}

export function verifierIntentionInscription(token: string | undefined, email: string) {
  if (!token) return false;
  const parties = token.split('.');
  if (parties.length < 4) return false;
  const signature = parties.pop()!;
  const payload = parties.join('.');
  const signatureAttendue = signer(payload);
  const recu = Buffer.from(signature);
  const attendu = Buffer.from(signatureAttendue);
  if (recu.length !== attendu.length || !timingSafeEqual(recu, attendu)) return false;

  const issuedAt = Number(parties[1]);
  return (
    parties[0] === email.trim().toLowerCase() &&
    Number.isInteger(issuedAt) &&
    issuedAt >= Math.floor(Date.now() / 1000) - DUREE_INTENTION_SECONDES &&
    issuedAt <= Math.floor(Date.now() / 1000) + 30
  );
}
