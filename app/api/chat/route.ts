import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendWhatsApp(to: string, message: string) {
  const safe = message.replace(/[^\x00-\xFF]/g, '');
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: safe } }),
  });
}

async function askClaude(prompt: string, maxTokens = 300) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const espace = searchParams.get('espace');

  let query = sb.from('conversations').select('*').order('derniere_activite', { ascending: false });
  if (espace) query = query.eq('espace', espace);
  const { data: conversations, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: messages } = await sb.from('chat_messages').select('*').order('created_at', { ascending: true });

  const enriched = (conversations || []).map((c: any) => {
    const msgs = (messages || []).filter((m: any) => m.conversation_id === c.id);
    const nonLus = msgs.filter((m: any) => !m.lu && !m.moi).length;
    const dernierMsg = msgs[msgs.length - 1];
    return { ...c, messages: msgs, nonLus, dernierMsg };
  });

  return NextResponse.json({ conversations: enriched });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer_conversation') {
    const { espace, contact_nom, contact_type, contact_id, contact_tel, contact_email, premier_contact } = body;
    if (!contact_nom) return NextResponse.json({ error: 'Nom du contact requis' }, { status: 400 });

    const { data, error } = await sb.from('conversations').insert({
      espace: espace || 'externe', contact_nom, contact_type, contact_id, contact_tel, contact_email,
      jitsi_room: `xyra-${Date.now().toString(36)}`,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Message de bienvenue automatique si nouveau lead/client
    if (premier_contact && (contact_type === 'client' || contact_type === 'lead')) {
      const bienvenue = `Bonjour ${contact_nom} ! Bienvenue chez Xyra. Comment pouvons-nous vous aider aujourd'hui ?`;
      await sb.from('chat_messages').insert({ conversation_id: data.id, auteur: 'Xyra', contenu: bienvenue, moi: true, type: 'auto_ia' });
      await sb.from('conversations').update({ premier_message_envoye: true, derniere_activite: new Date().toISOString() }).eq('id', data.id);
      if (contact_tel) { try { await sendWhatsApp(contact_tel, bienvenue); } catch { /* non bloquant */ } }
    }

    return NextResponse.json({ success: true, conversation: data });
  }

  if (action === 'envoyer_message') {
    const { conversation_id, contenu, type, fichier_url, contact_tel } = body;
    if (!conversation_id || (!contenu && !fichier_url)) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const { data, error } = await sb.from('chat_messages').insert({
      conversation_id, auteur: 'Curtiss', contenu, moi: true, type: type || 'texte', fichier_url, lu: true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conversation_id);

    // Envoi réel WhatsApp si conversation externe avec téléphone
    if (contact_tel && type !== 'auto_ia') {
      try { await sendWhatsApp(contact_tel, contenu || '[Fichier joint]'); } catch { /* non bloquant */ }
    }

    return NextResponse.json({ success: true, message: data });
  }

  if (action === 'recevoir_message') {
    // Pour simuler/logger un message entrant (ex: réponse manuelle d'un client suivie sur WhatsApp directement)
    const { conversation_id, contenu, auteur, type, fichier_url } = body;
    const { data, error } = await sb.from('chat_messages').insert({
      conversation_id, auteur: auteur || 'Contact', contenu, moi: false, type: type || 'texte', fichier_url, lu: false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conversation_id);
    return NextResponse.json({ success: true, message: data });
  }

  if (action === 'marquer_lu') {
    const { conversation_id } = body;
    await sb.from('chat_messages').update({ lu: true }).eq('conversation_id', conversation_id).eq('moi', false);
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer_conversation') {
    const { id } = body;
    const { error } = await sb.from('conversations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'suggestion_reponse') {
    const { conversation_id, derniers_messages } = body;
    if (!derniers_messages?.length) return NextResponse.json({ error: 'Historique manquant' }, { status: 400 });
    try {
      const historique = derniers_messages.map((m: any) => `${m.moi ? 'Moi' : m.auteur}: ${m.contenu}`).join('\n');
      const prompt = `Voici les derniers messages d'une conversation professionnelle Xyra :\n${historique}\n\nPropose UNE suggestion de réponse courte et naturelle (2-3 phrases max) que je pourrais envoyer. Réponds uniquement avec le texte de la suggestion, rien d'autre.`;
      const suggestion = await askClaude(prompt, 200);
      return NextResponse.json({ success: true, suggestion });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'resume_conversation') {
    const { messages } = body;
    if (!messages?.length) return NextResponse.json({ error: 'Aucun message' }, { status: 400 });
    try {
      const historique = messages.map((m: any) => `${m.moi ? 'Moi' : m.auteur}: ${m.contenu}`).join('\n');
      const prompt = `Résume cette conversation professionnelle en 3-4 phrases, en français, en mettant en avant les points importants et les actions à prendre éventuelles :\n${historique}`;
      const resume = await askClaude(prompt, 300);
      return NextResponse.json({ success: true, resume });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'categoriser') {
    const { conversation_id, messages } = body;
    if (!messages?.length) return NextResponse.json({ error: 'Aucun message' }, { status: 400 });
    try {
      const historique = messages.slice(-10).map((m: any) => `${m.moi ? 'Moi' : m.auteur}: ${m.contenu}`).join('\n');
      const prompt = `Voici une conversation. Classe-la dans UNE seule catégorie parmi : nouveau_lead, suivi, vip, cloture. Réponds uniquement avec le mot de la catégorie, rien d'autre.\n\n${historique}`;
      const cat = (await askClaude(prompt, 20)).trim().toLowerCase();
      const validCats = ['nouveau_lead', 'suivi', 'vip', 'cloture'];
      const finalCat = validCats.includes(cat) ? cat : 'suivi';
      await sb.from('conversations').update({ categorie: finalCat }).eq('id', conversation_id);
      return NextResponse.json({ success: true, categorie: finalCat });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // Vérifie les conversations sans réponse depuis 1h et fait répondre Claude à la place
  if (action === 'verifier_inactivite') {
    const { data: conversations } = await sb.from('conversations').select('*').eq('espace', 'externe').eq('ia_actif', true);
    const { data: allMessages } = await sb.from('chat_messages').select('*').order('created_at', { ascending: true });
    let nbRepondus = 0;

    for (const conv of conversations || []) {
      const msgs = (allMessages || []).filter((m: any) => m.conversation_id === conv.id);
      if (!msgs.length) continue;
      const dernier = msgs[msgs.length - 1];
      if (dernier.moi) continue; // déjà répondu par moi
      const ilYA1h = Date.now() - new Date(dernier.created_at).getTime() > 60 * 60 * 1000;
      if (!ilYA1h) continue;
      // Ne pas répondre deux fois automatiquement à la suite
      if (dernier.type === 'auto_ia') continue;

      const historique = msgs.slice(-10).map((m: any) => `${m.moi ? 'Moi (Curtiss)' : m.auteur}: ${m.contenu}`).join('\n');
      const prompt = `Tu réponds au nom de Curtiss, fondateur de Xyra/Tymeless, car il n'a pas pu répondre depuis plus d'une heure. Voici la conversation :\n${historique}\n\nRédige une réponse courte, professionnelle et chaleureuse en français pour faire patienter et montrer que la demande est prise en compte, sans t'engager sur des détails que tu ne connais pas.`;
      const reponse = await askClaude(prompt, 250);

      await sb.from('chat_messages').insert({ conversation_id: conv.id, auteur: 'Xyra (IA)', contenu: reponse, moi: true, type: 'auto_ia', lu: true });
      await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conv.id);
      if (conv.contact_tel) { try { await sendWhatsApp(conv.contact_tel, reponse); } catch { /* non bloquant */ } }

      // Notification immédiate dashboard + WhatsApp à Curtiss
      await sb.from('notifications').insert({
        type: 'info', icon: '🤖', urgence: 'haute',
        titre: `Claude a répondu à ${conv.contact_nom}`,
        message: 'Aucune réponse depuis 1h — vérifie et reprends la main si besoin',
        action_type: 'chat', action_id: conv.id, lu: false,
      });
      const ownerTel = process.env.OWNER_WHATSAPP;
      if (ownerTel) { try { await sendWhatsApp(ownerTel, `Xyra - Claude a repondu a ${conv.contact_nom} (pas de reponse depuis 1h). Verifie la conversation.`); } catch { /* non bloquant */ } }

      nbRepondus++;
    }

    return NextResponse.json({ success: true, nbRepondus });
  }

  if (action === 'creer_action') {
    // Raccourci pour créer un devis/deal/note de frais depuis une conversation
    const { type, conversation_id, contact_nom, contact_email, contact_tel } = body;
    if (type === 'deal') {
      const { data, error } = await sb.from('deals').insert({ nom: `Deal — ${contact_nom}`, client: contact_nom, email: contact_email, tel: contact_tel, etape: 'Identification' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, type: 'deal', data });
    }
    if (type === 'devis') {
      const { data, error } = await sb.from('devis').insert({ client_nom: contact_nom, client_email: contact_email, client_tel: contact_tel, statut: 'brouillon' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, type: 'devis', data });
    }
    return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}