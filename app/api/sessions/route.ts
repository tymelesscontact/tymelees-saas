import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { randomUUID } from 'crypto';
import { estAutoriseGererEquipe } from '../../lib/permissions';

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

// Proprietaire/Admin : toutes les sessions de l'entreprise. Autres membres :
// uniquement les leurs (ni voir les appareils/IP des collegues, ni les deconnecter).
async function perimetreSessions(req: NextRequest, tenantId: string): Promise<{ toutes: boolean; userId: string | null }> {
  if (await estAutoriseGererEquipe(req, tenantId)) return { toutes: true, userId: null };
  const tokenAcces = req.cookies.get('sb-access-token')?.value;
  const { data: authData } = tokenAcces ? await sb.auth.getUser(tokenAcces) : { data: null };
  return { toutes: false, userId: authData?.user?.id || null };
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
  const perimetre = await perimetreSessions(req, tenantId);
  if (!perimetre.toutes && !perimetre.userId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const tokenActuel = req.cookies.get('session_id')?.value;

  let requeteSessions = sb.from('sessions_actives')
    .select('id, appareil, ip, created_at, derniere_activite, session_token')
    .eq('tenant_id', tenantId)
    .eq('revoquee', false);
  if (!perimetre.toutes) requeteSessions = requeteSessions.eq('user_id', perimetre.userId!);
  const { data, error } = await requeteSessions.order('derniere_activite', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions = (data || []).map(s => ({
    id: s.id,
    appareil: s.appareil,
    ip: s.ip,
    date: s.derniere_activite,
    actuelle: s.session_token === tokenActuel,
  }));

  let requeteHistorique = sb.from('sessions_actives')
    .select('id, appareil, ip, created_at')
    .eq('tenant_id', tenantId);
  if (!perimetre.toutes) requeteHistorique = requeteHistorique.eq('user_id', perimetre.userId!);
  const { data: historique } = await requeteHistorique
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
    const tokenAcces = req.cookies.get('sb-access-token')?.value;
    const { data: authData } = tokenAcces ? await sb.auth.getUser(tokenAcces) : { data: null };
    const userId = authData?.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
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

    const reponse = NextResponse.json({ success: true });
    reponse.cookies.set('session_id', sessionToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    });
    return reponse;
  }

  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });

  const perimetre = await perimetreSessions(req, tenantId);
  if (!perimetre.toutes && !perimetre.userId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });

  if (action === 'revoquer') {
    const { id } = body;
    let requete = sb.from('sessions_actives').update({ revoquee: true }).eq('id', id).eq('tenant_id', tenantId);
    if (!perimetre.toutes) requete = requete.eq('user_id', perimetre.userId!);
    await requete;
    return NextResponse.json({ success: true });
  }

  if (action === 'revoquer_toutes_sauf_actuelle') {
    const tokenActuel = req.cookies.get('session_id')?.value;
    let requete = sb.from('sessions_actives').update({ revoquee: true }).eq('tenant_id', tenantId);
    if (!perimetre.toutes) requete = requete.eq('user_id', perimetre.userId!);
    if (tokenActuel) requete = requete.neq('session_token', tokenActuel);
    await requete;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
