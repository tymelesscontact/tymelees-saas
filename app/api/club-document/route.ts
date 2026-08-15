import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

const TAILLE_MAX = 20 * 1024 * 1024; // 20 Mo

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const sb = sbAdmin();
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const { data: membre } = await sb.from('club_membres')
    .select('id,nom').eq('user_id', auth.user.id).in('statut', ['actif', 'fondateur']).maybeSingle();
  if (!membre) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const form = await req.formData();
  const fichier = form.get('fichier') as File | null;
  const conversationId = String(form.get('conversation_id') || '');

  if (!fichier || !conversationId) {
    return NextResponse.json({ error: 'Fichier et conversation necessaires' }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json({ error: 'Fichier trop volumineux (20 Mo maximum)' }, { status: 400 });
  }

  // L'expediteur doit etre partie a la conversation
  const { data: conv } = await sb.from('club_conversations')
    .select('*').eq('id', conversationId).single();
  if (!conv || (conv.membre_a !== membre.id && conv.membre_b !== membre.id)) {
    return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
  }

  const octets = Buffer.from(await fichier.arrayBuffer());
  const empreinte = createHash('sha256').update(octets).digest('hex');
  const nomSain = (fichier.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
  const chemin = `${conversationId}/${Date.now()}_${nomSain}`;

  const { error: errUpload } = await sb.storage.from('club-documents')
    .upload(chemin, octets, { contentType: fichier.type || 'application/octet-stream', upsert: false });
  if (errUpload) {
    return NextResponse.json({ error: errUpload.message }, { status: 500 });
  }

  // Un message porte le document dans le fil
  const { data: msg } = await sb.from('club_messages').insert({
    conversation_id: conversationId,
    auteur_id: membre.id,
    contenu: fichier.name || 'Document',
    type: 'document',
  }).select().single();

  const { data: doc, error } = await sb.from('club_documents').insert({
    conversation_id: conversationId,
    auteur_id: membre.id,
    message_id: msg?.id || null,
    nom: fichier.name || 'document',
    chemin,
    type: fichier.type || null,
    taille: fichier.size,
    empreinte,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const champ = conv.membre_a === membre.id ? 'lu_par_b' : 'lu_par_a';
  await sb.from('club_conversations')
    .update({ derniere_activite: new Date().toISOString(), [champ]: false })
    .eq('id', conversationId);

  return NextResponse.json({ success: true, document: doc, message: msg });
}
