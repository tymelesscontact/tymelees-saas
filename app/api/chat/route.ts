import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { envoyerPartout } from '../../lib/rappels';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerWhatsApp } from '../../lib/whatsapp';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


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
  const tenantId = await getTenantIdFromRequest(req);
  const { searchParams } = new URL(req.url);
  const espace = searchParams.get('espace');
  const companyId = searchParams.get('company_id');

  let query = tenantId ? sb.from('conversations').select('*').eq('tenant_id', tenantId).order('derniere_activite', { ascending: false }) : sb.from('conversations').select('*').order('derniere_activite', { ascending: false });
  if (espace) query = query.eq('espace', espace);
  if (companyId && UUID_RE.test(companyId)) query = query.eq('company_id', companyId);
  const { data: conversations, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const idsConv = (conversations || []).map((c: any) => c.id);
  const { data: messages } = idsConv.length
    ? await sb.from('chat_messages').select('*').in('conversation_id', idsConv).order('created_at', { ascending: true })
    : { data: [] };

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
  const tenantId = await getTenantIdFromRequest(req);

  if (action === 'creer_conversation') {
    const { espace, contact_nom, contact_type, contact_id, contact_tel, contact_email, premier_contact } = body;
    if (!contact_nom) return NextResponse.json({ error: 'Nom du contact requis' }, { status: 400 });

    // Retrouver une conversation existante plutot que d'en creer une seconde
    if (tenantId && (contact_email || contact_tel)) {
      let qExist = sb.from('conversations').select('*').eq('tenant_id', tenantId).eq('espace', espace || 'externe');
      if (contact_email) qExist = qExist.eq('contact_email', contact_email);
      else qExist = qExist.eq('contact_tel', contact_tel);
      const { data: existante } = await qExist.order('derniere_activite', { ascending: false }).limit(1).maybeSingle();
      if (existante) {
        return NextResponse.json({ success: true, conversation: existante, existante: true });
      }
    }

    const { data, error } = await sb.from('conversations').insert({
      espace: espace || 'externe', contact_nom, contact_type, contact_id, contact_tel, contact_email,
      jitsi_room: `xyra-${Date.now().toString(36)}`,
      tenant_id: tenantId,
      company_id: body.company_id && UUID_RE.test(body.company_id) ? body.company_id : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Message de bienvenue automatique si nouveau lead/client
    if (premier_contact && (contact_type === 'client' || contact_type === 'lead')) {
      const bienvenue = `Bonjour ${contact_nom} ! Bienvenue chez Xyra. Comment pouvons-nous vous aider aujourd'hui ?`;
      await sb.from('chat_messages').insert({ conversation_id: data.id, auteur: 'Xyra', contenu: bienvenue, moi: true, type: 'auto_ia' });
      await sb.from('conversations').update({ premier_message_envoye: true, derniere_activite: new Date().toISOString() }).eq('id', data.id);
      if (contact_tel) { try { await envoyerWhatsApp(contact_tel, bienvenue, tenantId); } catch { /* non bloquant */ } }
    }

    return NextResponse.json({ success: true, conversation: data });
  }

  if (action === 'envoyer_message') {
    const { conversation_id, contenu, type, fichier_url, contact_tel, contact_email } = body;
    if (!conversation_id || (!contenu && !fichier_url)) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    let expediteur = 'Moi';
    if (tenantId) {
      const { data: t } = await sb.from('tenants').select('societe').eq('id', tenantId).maybeSingle();
      if (t?.societe) expediteur = t.societe;
    }

    const { data, error } = await sb.from('chat_messages').insert({
      conversation_id, auteur: expediteur, contenu, moi: true, type: type || 'texte', fichier_url, lu: true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conversation_id);

    // Envoi reel : WhatsApp d'abord, email si echec, SMS en dernier recours
    let canalUtilise = null;
    if ((contact_tel || contact_email) && type !== 'auto_ia') {
      try {
        canalUtilise = await envoyerPartout(contact_tel || null, contact_email || null, contenu || '[Fichier joint]', tenantId || '');
      } catch (e: any) { canalUtilise = null; }
    }

    // Groupe : le message part a chaque participant qui a un telephone.
    // Meta ne permet pas a une entreprise de creer un groupe WhatsApp,
    // donc chacun le recoit individuellement.
    if (!contact_tel && type !== 'auto_ia') {
      const { data: conv } = await sb.from('conversations')
        .select('est_groupe').eq('id', conversation_id).maybeSingle();
      if (conv?.est_groupe) {
        const { data: participants } = await sb.from('conversation_participants')
          .select('nom,tel').eq('conversation_id', conversation_id);
        const texte = `${expediteur} : ${contenu || '[Fichier joint]'}`;
        for (const p of (participants || [])) {
          if (p.tel) {
            try { await envoyerWhatsApp(p.tel, texte, tenantId); } catch { /* non bloquant */ }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: data, canalUtilise, echecTotal: (contact_tel || contact_email) && type !== 'auto_ia' && !canalUtilise });
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
    const { data: c } = await sb.from('conversations').select('tenant_id').eq('id', conversation_id).maybeSingle();
    if (!c || (tenantId && c.tenant_id !== tenantId)) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    await sb.from('chat_messages').update({ lu: true }).eq('conversation_id', conversation_id).eq('moi', false);
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer_conversation') {
    const { id } = body;
    const { data: c } = await sb.from('conversations').select('tenant_id').eq('id', id).maybeSingle();
    if (!c || (tenantId && c.tenant_id !== tenantId)) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
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
    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    let qConv = sb.from('conversations').select('*').eq('espace', 'externe').eq('ia_actif', true).eq('tenant_id', tenantId);
    const { data: conversations } = await qConv;
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

      const historique = msgs.slice(-10).map((m: any) => `${m.moi ? 'Moi' : m.auteur}: ${m.contenu}`).join('\n');
      const prompt = `Tu réponds au nom de l'entreprise, car personne n'a pu répondre depuis plus d'une heure. Voici la conversation :\n${historique}\n\nRédige une réponse courte, professionnelle et chaleureuse en français pour faire patienter et montrer que la demande est prise en compte, sans t'engager sur des détails que tu ne connais pas.`;
      const reponse = await askClaude(prompt, 250);

      await sb.from('chat_messages').insert({ conversation_id: conv.id, auteur: 'Xyra (IA)', contenu: reponse, moi: true, type: 'auto_ia', lu: true });
      await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conv.id);
      if (conv.contact_tel) { try { await envoyerWhatsApp(conv.contact_tel, reponse, tenantId); } catch { /* non bloquant */ } }

      // Notification immédiate dashboard + WhatsApp au responsable
      await sb.from('notifications').insert({
        type: 'info', icon: '🤖', urgence: 'haute',
        titre: `Claude a répondu à ${conv.contact_nom}`,
        message: 'Aucune réponse depuis 1h — vérifie et reprends la main si besoin',
        action_type: 'chat', action_id: conv.id, lu: false,
        tenant_id: tenantId || null,
      });
      const ownerTel = process.env.OWNER_WHATSAPP;
      if (ownerTel) { try { await envoyerWhatsApp(ownerTel, `Xyra - Claude a repondu a ${conv.contact_nom} (pas de reponse depuis 1h). Verifie la conversation.`, tenantId); } catch { /* non bloquant */ } }

      nbRepondus++;
    }

    return NextResponse.json({ success: true, nbRepondus });
  }

  if (action === 'creer_action') {
    // Raccourci pour créer un devis/deal/note de frais depuis une conversation
    const { type, conversation_id, contact_nom, contact_email, contact_tel } = body;
    if (type === 'deal') {
      const { data, error } = await sb.from('deals').insert({ nom: `Deal — ${contact_nom}`, client_nom: contact_nom, client_email: contact_email, client_tel: contact_tel, etape: 'Identification', tenant_id: tenantId }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, type: 'deal', data });
    }
    if (type === 'reception') {
      // Reception de marchandise annoncee par un fournisseur
      const { article_id, quantite, numero_lot, date_peremption, note } = body;
      if (!article_id || !quantite) {
        return NextResponse.json({ error: 'Article et quantite necessaires' }, { status: 400 });
      }
      const resStock = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr'}/api/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
        body: JSON.stringify({
          action: 'mouvement', article_id, type: 'reception',
          quantite: Number(quantite), numero_lot: numero_lot || null,
          date_peremption: date_peremption || null,
          note: note || `Annonce par ${contact_nom} dans le chat`,
        }),
      });
      const dataStock = await resStock.json();
      if (!dataStock.success) return NextResponse.json({ error: dataStock.error || 'Erreur stock' }, { status: 500 });
      return NextResponse.json({ success: true, type: 'reception', data: dataStock });
    }

    if (type === 'devis') {
      const { data, error } = await sb.from('devis').insert({ client_nom: contact_nom, client_email: contact_email, client_tel: contact_tel, statut: 'brouillon', tenant_id: tenantId }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, type: 'devis', data });
    }
    return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
  }

  // ── Contexte du contact : ce que Xyra sait de lui ───────
  if (action === 'contexte') {
    const { conversation_id } = body;
    if (!conversation_id) return NextResponse.json({ error: 'conversation_id requis' }, { status: 400 });

    const { data: conv } = await sb.from('conversations')
      .select('*').eq('id', conversation_id).maybeSingle();
    if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    if (tenantId && conv.tenant_id !== tenantId) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }

    const email = conv.contact_email;
    const tel = conv.contact_tel;
    const nom = conv.contact_nom;
    const filtreTenant = (q: any) => tenantId ? q.eq('tenant_id', tenantId) : q;

    const [devisRes, facturesRes, commandesRes, dealsRes, partenaireRes, equipeRes] = await Promise.all([
      email ? filtreTenant(sb.from('devis').select('id,reference,montant,statut,created_at').eq('client_email', email)).order('created_at', { ascending: false }).limit(5) : { data: [] },
      email ? filtreTenant(sb.from('factures').select('id,numero,montant_ttc,statut,date_emission').eq('client_email', email)).order('date_emission', { ascending: false }).limit(5) : { data: [] },
      email ? filtreTenant(sb.from('commandes').select('id,reference,montant_total,statut,created_at').eq('client_email', email)).order('created_at', { ascending: false }).limit(5) : { data: [] },
      nom ? filtreTenant(sb.from('deals').select('id,nom,valeur,etape').eq('client_nom', nom)).limit(5) : { data: [] },
      email ? filtreTenant(sb.from('partenaires').select('id,nom,commission,statut').eq('email', email)).maybeSingle() : { data: null },
      email ? filtreTenant(sb.from('equipe').select('id,nom,statut').eq('email', email)).maybeSingle() : { data: null },
    ]);

    const devis = devisRes.data || [];
    const factures = facturesRes.data || [];
    const commandes = commandesRes.data || [];

    return NextResponse.json({
      success: true,
      contact: { nom, email, tel, type: conv.contact_type },
      devis, factures, commandes,
      deals: dealsRes.data || [],
      partenaire: (partenaireRes as any)?.data || null,
      employe: (equipeRes as any)?.data || null,
      resume: {
        ca_facture: factures.filter((f: any) => f.statut === 'payée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0),
        impaye: factures.filter((f: any) => f.statut !== 'payée' && f.statut !== 'annulée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0),
        devis_en_attente: devis.filter((d: any) => d.statut === 'envoyé' || d.statut === 'brouillon').length,
        commandes_en_cours: commandes.filter((c: any) => c.statut !== 'livrée' && c.statut !== 'annulée').length,
      },
    });
  }

  // ── Lien temporaire vers un fichier du chat ────────────
  if (action === 'lien_fichier') {
    const { chemin, conversation_id } = body;
    if (!chemin) return NextResponse.json({ error: 'chemin requis' }, { status: 400 });

    if (conversation_id) {
      const { data: c } = await sb.from('conversations')
        .select('tenant_id').eq('id', conversation_id).maybeSingle();
      if (!c || (tenantId && c.tenant_id !== tenantId)) {
        return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
      }
    }

    const { data: lien } = await sb.storage.from('chat-fichiers').createSignedUrl(chemin, 600);
    if (!lien?.signedUrl) return NextResponse.json({ error: 'Fichier inaccessible' }, { status: 404 });
    return NextResponse.json({ success: true, url: lien.signedUrl });
  }

  // ── Recherche dans les conversations ───────────────────
  if (action === 'rechercher') {
    const terme = String(body.terme || '').trim();
    if (terme.length < 2) {
      return NextResponse.json({ error: 'Au moins deux caracteres' }, { status: 400 });
    }

    let qConv = sb.from('conversations').select('id,contact_nom,contact_type,espace');
    if (tenantId) qConv = qConv.eq('tenant_id', tenantId);
    const { data: convs } = await qConv;
    const ids = (convs || []).map((c: any) => c.id);
    if (!ids.length) return NextResponse.json({ success: true, resultats: [] });

    const { data: msgs } = await sb.from('chat_messages')
      .select('*')
      .in('conversation_id', ids)
      .ilike('contenu', `%${terme}%`)
      .order('created_at', { ascending: false })
      .limit(60);

    const resultats = (msgs || []).map((m: any) => {
      const conv = (convs || []).find((c: any) => c.id === m.conversation_id);
      return {
        message_id: m.id,
        conversation_id: m.conversation_id,
        contact_nom: conv?.contact_nom || 'Contact',
        contact_type: conv?.contact_type || null,
        espace: conv?.espace || null,
        auteur: m.auteur,
        moi: m.moi,
        type: m.type,
        contenu: m.contenu,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({ success: true, resultats, terme });
  }

  // ── Creer un groupe ────────────────────────────────────
  if (action === 'creer_groupe') {
    const { titre, participants, espace } = body;
    if (!titre?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    if (!Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ error: 'Au moins deux participants' }, { status: 400 });
    }

    const { data: conv, error } = await sb.from('conversations').insert({
      espace: espace || 'externe',
      contact_nom: titre.trim(),
      est_groupe: true,
      titre_groupe: titre.trim(),
      jitsi_room: `xyra-groupe-${Date.now().toString(36)}`,
      tenant_id: tenantId,
      company_id: body.company_id && UUID_RE.test(body.company_id) ? body.company_id : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const lignes = participants
      .filter((p: any) => p?.nom)
      .map((p: any) => ({
        conversation_id: conv.id,
        nom: p.nom,
        email: p.email || null,
        tel: p.tel || null,
        type: p.type || null,
      }));
    if (lignes.length) await sb.from('conversation_participants').insert(lignes);

    return NextResponse.json({ success: true, conversation: conv, participants: lignes.length });
  }

  // ── Les participants d'un groupe ───────────────────────
  if (action === 'participants') {
    const { conversation_id } = body;
    const { data: c } = await sb.from('conversations')
      .select('tenant_id').eq('id', conversation_id).maybeSingle();
    if (!c || (tenantId && c.tenant_id !== tenantId)) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { data } = await sb.from('conversation_participants')
      .select('*').eq('conversation_id', conversation_id).order('ajoute_le');
    return NextResponse.json({ success: true, participants: data || [] });
  }

  // ── Ajouter ou retirer un participant ──────────────────
  if (action === 'ajouter_participant' || action === 'retirer_participant') {
    const { conversation_id } = body;
    const { data: c } = await sb.from('conversations')
      .select('tenant_id').eq('id', conversation_id).maybeSingle();
    if (!c || (tenantId && c.tenant_id !== tenantId)) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }

    if (action === 'ajouter_participant') {
      const { nom, email, tel, type } = body;
      if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
      const { error } = await sb.from('conversation_participants')
        .insert({ conversation_id, nom, email: email || null, tel: tel || null, type: type || null });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await sb.from('conversation_participants')
        .delete().eq('id', body.participant_id).eq('conversation_id', conversation_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}