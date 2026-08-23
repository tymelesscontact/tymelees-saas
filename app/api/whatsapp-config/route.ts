import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Configuration du compte WhatsApp Business du tenant.
 * Le jeton n'est JAMAIS renvoye au navigateur : quiconque l'obtient
 * peut envoyer des messages au nom de l'entreprise.
 */
export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { data } = await sb.from('tenants')
    .select('whatsapp_numero,whatsapp_phone_number_id,whatsapp_actif,whatsapp_token')
    .eq('id', tenantId).maybeSingle();

  return NextResponse.json({
    success: true,
    numero: data?.whatsapp_numero || '',
    phone_number_id: data?.whatsapp_phone_number_id || '',
    actif: !!data?.whatsapp_actif,
    jeton_enregistre: !!data?.whatsapp_token,
  });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const champs: any = {};

  if (body.whatsapp_numero !== undefined) champs.whatsapp_numero = body.whatsapp_numero || null;
  if (body.whatsapp_phone_number_id !== undefined) champs.whatsapp_phone_number_id = body.whatsapp_phone_number_id || null;
  // Le jeton n'est ecrase que si un nouveau est fourni
  if (body.whatsapp_token) champs.whatsapp_token = body.whatsapp_token;

  if (body.whatsapp_actif !== undefined) {
    if (body.whatsapp_actif) {
      const { data: actuel } = await sb.from('tenants')
        .select('whatsapp_phone_number_id,whatsapp_token').eq('id', tenantId).maybeSingle();
      const idFinal = champs.whatsapp_phone_number_id ?? actuel?.whatsapp_phone_number_id;
      const jetonFinal = champs.whatsapp_token ?? actuel?.whatsapp_token;
      if (!idFinal || !jetonFinal) {
        return NextResponse.json({
          error: "L'identifiant du numero et le jeton sont necessaires pour activer",
        }, { status: 400 });
      }
    }
    champs.whatsapp_actif = !!body.whatsapp_actif;
  }

  if (!Object.keys(champs).length) {
    return NextResponse.json({ error: 'Rien a enregistrer' }, { status: 400 });
  }

  const { error } = await sb.from('tenants').update(champs).eq('id', tenantId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
