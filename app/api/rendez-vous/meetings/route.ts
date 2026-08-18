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
    .select('id,nom').eq('user_id', auth.user.id).maybeSingle();
  return membre || null;
}

export async function GET(req: NextRequest) {
  const moi = await membreConnecte(req);
  if (!moi) return NextResponse.json({ error: 'non_membre' }, { status: 403 });
  const sb = sbAdmin();

  // Mes speed meetings, que je sois le client ou le collaborateur (les 2 sens)
  const { data, error } = await sb.from('rendez_vous')
    .select('*')
    .or(`client_id.eq.${moi.id},collaborateur_id.eq.${moi.id}`)
    .order('date_rdv', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rendez_vous: data || [] });
}

export async function POST(req: NextRequest) {
  const moi = await membreConnecte(req);
  if (!moi) return NextResponse.json({ error: 'non_membre' }, { status: 403 });
  const sb = sbAdmin();
  const body = await req.json();
  const { action } = body;

  if (action === 'proposer') {
    const { avec_membre_id, type_rdv_id, date_rdv, heure_debut, heure_fin, notes } = body;
    if (!avec_membre_id || !date_rdv || !heure_debut) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    if (avec_membre_id === moi.id) {
      return NextResponse.json({ error: 'Impossible de se proposer un rendez-vous a soi-meme' }, { status: 400 });
    }

    // Le collaborateur_id/client_id est symbolique ici : celui qui propose
    // est "client", celui qui recoit est "collaborateur" au sens de la table.
    const { data, error } = await sb.from('rendez_vous').insert({
      type_rdv_id: type_rdv_id || null,
      client_id: moi.id, client_nom: moi.nom,
      collaborateur_id: avec_membre_id,
      date_rdv, heure_debut, heure_fin: heure_fin || null,
      statut: 'propose',
      notes: notes || null,
      lien_meeting: `https://meet.jit.si/xyra-club-${Date.now().toString(36)}`,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notifier l'autre membre : retrouver ou creer la conversation, puis y poster
    try {
      const { data: conv } = await sb.from('club_conversations')
        .select('id')
        .or(`and(membre_a.eq.${moi.id},membre_b.eq.${avec_membre_id}),and(membre_a.eq.${avec_membre_id},membre_b.eq.${moi.id})`)
        .maybeSingle();

      let convId = conv?.id;
      if (!convId) {
        const { data: nouvelle } = await sb.from('club_conversations')
          .insert({ membre_a: moi.id, membre_b: avec_membre_id, jitsi_room: `xyra-club-${Date.now().toString(36)}` })
          .select('id').single();
        convId = nouvelle?.id;
      }

      if (convId) {
        await sb.from('club_messages').insert({
          conversation_id: convId, auteur_id: moi.id,
          contenu: `${moi.nom} vous propose un Speed Meeting le ${date_rdv} a ${heure_debut}.`,
          type: 'systeme',
        });
      }
    } catch (e) { /* non bloquant */ }

    return NextResponse.json({ success: true, rendez_vous: data });
  }

  if (action === 'repondre') {
    const { id, accepter } = body;
    const { data: rdv } = await sb.from('rendez_vous').select('*').eq('id', id).maybeSingle();
    if (!rdv) return NextResponse.json({ error: 'introuvable' }, { status: 404 });
    if (rdv.collaborateur_id !== moi.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { error } = await sb.from('rendez_vous')
      .update({ statut: accepter ? 'confirme' : 'refuse' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'annuler') {
    const { id } = body;
    const { data: rdv } = await sb.from('rendez_vous').select('*').eq('id', id).maybeSingle();
    if (!rdv) return NextResponse.json({ error: 'introuvable' }, { status: 404 });
    if (rdv.client_id !== moi.id && rdv.collaborateur_id !== moi.id) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { error } = await sb.from('rendez_vous').update({ statut: 'annule' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
