import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerSMS } from '../../lib/sms';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function genererCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function genererCodesSecours() {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
  }
  return codes;
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  const { data: tenant } = await sb.from('tenants').select('telephone_contact,telephone_entreprise').eq('id', tenantId).single();
  const tel = tenant?.telephone_contact || tenant?.telephone_entreprise;

  if (action === 'envoyer_code') {
    if (!tel) return NextResponse.json({ success: false, error: 'Aucun numero de telephone enregistre — remplissez d\'abord votre profil' }, { status: 400 });
    const code = genererCode();
    const expire = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await sb.from('tenants').update({ deux_fa_code_temp: code, deux_fa_code_expire: expire }).eq('id', tenantId);
    const resultat = await envoyerSMS(tel, `Xyra - Votre code de verification : ${code} (valable 5 minutes)`);
    if (!resultat.ok) return NextResponse.json({ success: false, error: 'Echec envoi SMS — verifiez que Twilio est bien configure' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'verifier_code') {
    const { code } = body;
    const { data: t } = await sb.from('tenants').select('deux_fa_code_temp,deux_fa_code_expire').eq('id', tenantId).single();
    if (!t?.deux_fa_code_temp) return NextResponse.json({ success: false, error: 'Aucun code en attente' }, { status: 400 });
    if (new Date(t.deux_fa_code_expire) < new Date()) return NextResponse.json({ success: false, error: 'Code expire, redemandez-en un' }, { status: 400 });
    if (t.deux_fa_code_temp !== code) return NextResponse.json({ success: false, error: 'Code incorrect' }, { status: 400 });
    await sb.from('tenants').update({ deux_fa_actif: true, deux_fa_code_temp: null, deux_fa_code_expire: null }).eq('id', tenantId);
    return NextResponse.json({ success: true });
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
