import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('club_membres')
    .select('*').eq('user_id', auth.user.id).eq('statut', 'actif').maybeSingle();
  return membre || null;
}

export async function GET(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const sb = sbAdmin();
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');

  // Les messages d'une conversation
  if (conversationId) {
    const { data: conv } = await sb.from('club_conversations')
      .select('*').eq('id', conversationId).single();
    if (!conv || (conv.membre_a !== membre.id && conv.membre_b !== membre.id)) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { data: messages } = await sb.from('club_messages')
      .select('*').eq('conversation_id', conversationId).order('created_at');

    // Marquer comme lu
    const champ = conv.membre_a === membre.id ? 'lu_par_a' : 'lu_par_b';
    await sb.from('club_conversations').update({ [champ]: true }).eq('id', conversationId);

    return NextResponse.json({ conversation: conv, messages: messages || [], moi: membre.id });
  }

  // La liste des conversations
  const { data: convs } = await sb.from('club_conversations')
    .select('*')
    .or(`membre_a.eq.${membre.id},membre_b.eq.${membre.id}`)
    .order('derniere_activite', { ascending: false });

  return NextResponse.json({ conversations: convs || [], moi: membre.id });
}

export async function POST(req: NextRequest) {
  const membre = await membreConnecte(req);
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  // Ouvrir une conversation avec un membre, ou retrouver l'existante
  if (action === 'ouvrir') {
    const autre = body.membre_id;
    if (!autre || autre === membre.id) {
      return NextResponse.json({ error: 'Membre invalide' }, { status: 400 });
    }
    // Ordre stable pour que la contrainte unique fonctionne dans les deux sens
    const [a, b] = [membre.id, autre].sort();

    const { data: existante } = await sb.from('club_conversations')
      .select('*').eq('membre_a', a).eq('membre_b', b).maybeSingle();
    if (existante) return NextResponse.json({ success: true, conversation: existante });

    const { data, error } = await sb.from('club_conversations').insert({
      membre_a: a, membre_b: b,
      jitsi_room: 'xyraclub-' + Date.now().toString(36),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, conversation: data });
  }

  // Envoyer un message
  if (action === 'envoyer') {
    const { conversation_id, contenu } = body;
    if (!conversation_id || !contenu?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }
    const { data: conv } = await sb.from('club_conversations')
      .select('*').eq('id', conversation_id).single();
    if (!conv || (conv.membre_a !== membre.id && conv.membre_b !== membre.id)) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }

    const { data, error } = await sb.from('club_messages').insert({
      conversation_id, auteur_id: membre.id, contenu: contenu.trim(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // L'autre n'a pas lu
    const champ = conv.membre_a === membre.id ? 'lu_par_b' : 'lu_par_a';
    await sb.from('club_conversations')
      .update({ derniere_activite: new Date().toISOString(), [champ]: false })
      .eq('id', conversation_id);

    return NextResponse.json({ success: true, message: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
