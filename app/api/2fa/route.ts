import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'crypto';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estProprietaireDuTenant } from '../../lib/permissions';
import { signerJeton2FA, verifierJeton2FA, DUREE_JETON_2FA_SECONDES } from '../../lib/deuxFa';

async function envoyerCodeParEmail(to: string, code: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: 'Xyra <notifications@xyraio.fr>',
    to,
    subject: 'Votre code de verification Xyra',
    html: `<div style="font-family:sans-serif;padding:24px;background:#06060E;color:#EAE6DE;"><h2 style="color:#C9A84C">Code de verification</h2><p style="font-size:28px;letter-spacing:4px;font-weight:700;">${code}</p><p>Valable 5 minutes.</p></div>`,
  });
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Codes tires avec le generateur cryptographique du serveur (Math.random est previsible).
function genererCode() {
  return String(randomInt(100000, 1000000));
}

const ALPHABET_SECOURS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function segmentSecours(longueur: number) {
  let s = '';
  for (let i = 0; i < longueur; i++) s += ALPHABET_SECOURS[randomInt(0, ALPHABET_SECOURS.length)];
  return s;
}

function genererCodesSecours() {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(segmentSecours(4) + '-' + segmentSecours(4));
  }
  return codes;
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  // Identifiant de la personne connectee : le jeton 2FA est signe pour elle seule.
  const tokenAcces = req.cookies.get('sb-access-token')?.value;
  const { data: authData } = tokenAcces ? await sb.auth.getUser(tokenAcces) : { data: null };
  const userId = authData?.user?.id;
  if (!userId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });

  const { data: tenant } = await sb.from('tenants').select('telephone_contact,telephone_entreprise,email,deux_fa_actif').eq('id', tenantId).single();
  const tel = tenant?.telephone_contact || tenant?.telephone_entreprise;

  // Changer les reglages de securite de l'entreprise (couper la 2FA, refaire les codes de secours) :
  // reserve au proprietaire, et -- si la 2FA est active -- a quelqu'un qui l'a deja passee.
  // Sans cela, quiconque connait le mot de passe pouvait desactiver la 2FA sans aucun code.
  if (action === 'desactiver' || action === 'generer_codes_secours') {
    if (!(await estProprietaireDuTenant(req, tenantId))) {
      return NextResponse.json({ success: false, error: 'Reserve au proprietaire du compte' }, { status: 403 });
    }
    if (tenant?.deux_fa_actif && !(await verifierJeton2FA(req.cookies.get('deux_fa_verified')?.value, userId))) {
      return NextResponse.json({ success: false, error: 'Verification 2FA requise' }, { status: 403 });
    }
  }

  if (action === 'envoyer_code') {
    if (!tenant?.email) return NextResponse.json({ success: false, error: 'Aucun email enregistre' }, { status: 400 });
    const code = genererCode();
    const expire = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await sb.from('tenants').update({ deux_fa_code_temp: code, deux_fa_code_expire: expire }).eq('id', tenantId);
    try {
      await envoyerCodeParEmail(tenant.email, code);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: 'Echec envoi email : ' + e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'verifier_code') {
    const { code } = body;
    const { data: t } = await sb.from('tenants').select('deux_fa_code_temp,deux_fa_code_expire').eq('id', tenantId).single();
    if (!t?.deux_fa_code_temp) return NextResponse.json({ success: false, error: 'Aucun code en attente' }, { status: 400 });
    if (new Date(t.deux_fa_code_expire) < new Date()) return NextResponse.json({ success: false, error: 'Code expire, redemandez-en un' }, { status: 400 });
    if (t.deux_fa_code_temp !== code) return NextResponse.json({ success: false, error: 'Code incorrect' }, { status: 400 });
    await sb.from('tenants').update({ deux_fa_actif: true, deux_fa_code_temp: null, deux_fa_code_expire: null }).eq('id', tenantId);
    const reponse1 = NextResponse.json({ success: true });
    reponse1.cookies.set('deux_fa_verified', await signerJeton2FA(userId), { path: '/', maxAge: DUREE_JETON_2FA_SECONDES, sameSite: 'lax', httpOnly: true, secure: true });
    return reponse1;
  }

  if (action === 'verifier_code_secours') {
    const { code } = body;
    const { data: t } = await sb.from('tenants').select('codes_secours').eq('id', tenantId).single();
    const codes: string[] = t?.codes_secours || [];
    if (!codes.includes(code)) return NextResponse.json({ success: false, error: 'Code de secours invalide' }, { status: 400 });
    const nouveauxCodes = codes.filter(c => c !== code);
    await sb.from('tenants').update({ codes_secours: nouveauxCodes }).eq('id', tenantId);
    const reponse2 = NextResponse.json({ success: true, codesRestants: nouveauxCodes.length });
    reponse2.cookies.set('deux_fa_verified', await signerJeton2FA(userId), { path: '/', maxAge: DUREE_JETON_2FA_SECONDES, sameSite: 'lax', httpOnly: true, secure: true });
    return reponse2;
  }

  if (action === 'generer_codes_secours') {
    const codes = genererCodesSecours();
    await sb.from('tenants').update({ codes_secours: codes }).eq('id', tenantId);
    return NextResponse.json({ success: true, codes });
  }

  if (action === 'desactiver') {
    await sb.from('tenants').update({ deux_fa_actif: false, codes_secours: null }).eq('id', tenantId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
