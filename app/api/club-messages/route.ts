import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function membreConnecte(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: membre } = await sb.from('club_membres')
    .select('*').eq('user_id', auth.user.id).in('statut', ['actif', 'fondateur']).maybeSingle();
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
    const { data: documents } = await sb.from('club_documents')
      .select('id,message_id,nom,type,taille,created_at,auteur_id')
      .eq('conversation_id', conversationId).is('supprime_le', null);
    const { data: dealsCommuns } = await sb.from('club_deals')
      .select('id,reference,titre,montant,statut,created_at')
      .or(`and(membre_prestataire.eq.${conv.membre_a},membre_client.eq.${conv.membre_b}),and(membre_prestataire.eq.${conv.membre_b},membre_client.eq.${conv.membre_a})`)
      .order('created_at', { ascending: false });

    // Marquer comme lu
    const champ = conv.membre_a === membre.id ? 'lu_par_a' : 'lu_par_b';
    await sb.from('club_conversations').update({ [champ]: true }).eq('id', conversationId);

    return NextResponse.json({ conversation: conv, messages: messages || [], documents: documents || [], deals: dealsCommuns || [], moi: membre.id });
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

  // ── Modifier un message : l'original est conserve ──────
  if (action === 'modifier') {
    const { message_id, contenu } = body;
    if (!contenu?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

    const { data: msg } = await sb.from('club_messages').select('*').eq('id', message_id).single();
    if (!msg || msg.auteur_id !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    if (msg.supprime_le) {
      return NextResponse.json({ error: 'Message supprime' }, { status: 400 });
    }

    const versions = Array.isArray(msg.versions) ? msg.versions : [];
    versions.push({ contenu: msg.contenu, le: new Date().toISOString() });

    const { error } = await sb.from('club_messages').update({
      contenu: contenu.trim(),
      contenu_original: msg.contenu_original || msg.contenu,
      modifie_le: new Date().toISOString(),
      versions,
    }).eq('id', message_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Supprimer : le message reste, marque comme supprime ─
  if (action === 'supprimer') {
    const { data: msg } = await sb.from('club_messages').select('*').eq('id', body.message_id).single();
    if (!msg || msg.auteur_id !== membre.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { error } = await sb.from('club_messages').update({
      contenu_original: msg.contenu_original || msg.contenu,
      supprime_le: new Date().toISOString(),
    }).eq('id', body.message_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Lien temporaire vers un document ───────────────────
  if (action === 'lien_document') {
    const { data: doc } = await sb.from('club_documents').select('*').eq('id', body.document_id).single();
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    const { data: conv } = await sb.from('club_conversations')
      .select('*').eq('id', doc.conversation_id).single();
    if (!conv || (conv.membre_a !== membre.id && conv.membre_b !== membre.id)) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }

    const { data: lien } = await sb.storage.from('club-documents')
      .createSignedUrl(doc.chemin, 300);
    if (!lien?.signedUrl) return NextResponse.json({ error: 'Document inaccessible' }, { status: 500 });
    return NextResponse.json({ success: true, url: lien.signedUrl, nom: doc.nom });
  }

  // ── Ouvrir un litige : seul moyen d'acceder aux echanges ─
  if (action === 'ouvrir_litige') {
    const { conversation_id, deal_id, contre, motif, description } = body;
    if (!contre || !motif) {
      return NextResponse.json({ error: 'Destinataire et motif necessaires' }, { status: 400 });
    }
    const { data, error } = await sb.from('club_litiges').insert({
      reference: 'LIT-' + Date.now().toString(36).toUpperCase(),
      conversation_id: conversation_id || null,
      deal_id: deal_id || null,
      ouvert_par: membre.id, contre, motif,
      description: description || null,
      statut: 'ouvert',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, litige: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
