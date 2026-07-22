import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantFromRequest } from '../../lib/supabaseServer';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient();
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get('admin') === 'true';
  const tenant = await getTenantFromRequest(req);
  const tenantEmail = tenant?.email;

  let query = sb.from('tickets_support').select('*').order('created_at', { ascending: false });
  if (!isAdmin) {
    if (!tenantEmail) return NextResponse.json({ tickets: [] });
    query = query.eq('email', tenantEmail);
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
    const { tenant_id, societe, email, sujet, message, priorite } = body;
    if (!email || !sujet || !message) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const { data, error } = await sb.from('tickets_support').insert({
      tenant_id, societe, email, sujet, message,
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
            text: { body: `🎫 Nouveau ticket support — ${societe}\nSujet: ${sujet}\nPriorite: ${priorite || 'normale'}` },
          }),
        });
      } catch (e) { console.error('WhatsApp alert error:', e); }
    }

    return NextResponse.json({ success: true, ticket: data });
  }

  if (action === 'repondre') {
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
