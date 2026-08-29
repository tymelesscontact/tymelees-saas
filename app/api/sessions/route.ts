import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { randomUUID } from 'crypto';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function deviceLisible(userAgent: string): string {
  if (!userAgent) return 'Appareil inconnu';
  const nav = /Chrome/.test(userAgent) ? 'Chrome'
    : /Safari/.test(userAgent) ? 'Safari'
    : /Firefox/.test(userAgent) ? 'Firefox'
    : 'Navigateur';
  const os = /iPhone/.test(userAgent) ? 'iPhone'
    : /iPad/.test(userAgent) ? 'iPad'
    : /Mac/.test(userAgent) ? 'Mac'
    : /Windows/.test(userAgent) ? 'Windows'
    : /Android/.test(userAgent) ? 'Android'
    : 'Appareil';
  return `${os} — ${nav}`;
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const tokenActuel = req.cookies.get('session_id')?.value;

  const { data, error } = await sb.from('sessions_actives')
    .select('id, appareil, ip, created_at, derniere_activite, session_token')
    .eq('tenant_id', tenantId)
    .eq('revoquee', false)
    .order('derniere_activite', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions = (data || []).map(s => ({
    id: s.id,
    appareil: s.appareil,
    ip: s.ip,
    date: s.derniere_activite,
    actuelle: s.session_token === tokenActuel,
  }));

  const { data: historique } = await sb.from('sessions_actives')
    .select('id, appareil, ip, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(50);

  const logs = (historique || []).map(h => ({
    date: h.created_at,
    action: 'Connexion reussie',
    ip: h.ip,
    statut: 'ok',
  }));

  return NextResponse.json({ sessions, logs });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
    const { userId } = body;
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue';
    const sessionToken = randomUUID();

    await sb.from('sessions_actives').insert({
      tenant_id: tenantId,
      user_id: userId,
      session_token: sessionToken,
      appareil: deviceLisible(userAgent),
      ip,
    });

    const reponse = NextResponse.json({ success: true, sessionToken });
    reponse.cookies.set('session_id', sessionToken, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
    return reponse;
  }

  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });

  if (action === 'revoquer') {
    const { id } = body;
    await sb.from('sessions_actives').update({ revoquee: true }).eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'revoquer_toutes_sauf_actuelle') {
    const tokenActuel = req.cookies.get('session_id')?.value;
    let requete = sb.from('sessions_actives').update({ revoquee: true }).eq('tenant_id', tenantId);
    if (tokenActuel) requete = requete.neq('session_token', tokenActuel);
    await requete;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
