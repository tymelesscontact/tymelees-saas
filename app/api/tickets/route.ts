import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantFromRequest } from '../../lib/supabaseServer';
import { estAdministrateurPlateforme } from '../../lib/permissions';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient();
  const tenant = await getTenantFromRequest(req);
  const isAdmin = await estAdministrateurPlateforme(req);

  let query = sb.from('tickets_support').select('*').order('created_at', { ascending: false });
  if (!isAdmin) {
    if (!tenant) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    query = query.eq('tenant_id', tenant.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data });
}

export async function POST(req: NextRequest) {
  const sb = getAdminClient();
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { sujet, message, priorite } = body;
    const tenant = await getTenantFromRequest(req);
    if (!tenant) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    if (!tenant.email || !sujet || !message) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const { data, error } = await sb.from('tickets_support').insert({
      tenant_id: tenant.id, societe: tenant.societe || '', email: tenant.email, sujet, message,
      priorite: priorite || 'normale',
      statut: 'ouvert',
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    if (process.env.OWNER_WHATSAPP && process.env.WHATSAPP_TOKEN) {
      try {
        await fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: process.env.OWNER_WHATSAPP.replace(/\D/g, ''),
            text: { body: `🎫 Nouveau ticket support — ${tenant.societe || ''}\nSujet: ${sujet}\nPriorite: ${priorite || 'normale'}` },
          }),
        });
      } catch (e) { console.error('WhatsApp alert error:', e); }
    }

    return NextResponse.json({ success: true, ticket: data });
  }

  if (action === 'repondre') {
    if (!(await estAdministrateurPlateforme(req))) {
      return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 403 });
    }
    const { id, reponse, statut } = body;
    const { error } = await sb.from('tickets_support').update({
      reponse,
      statut: statut || 'résolu',
      resolved_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
