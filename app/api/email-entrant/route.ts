import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Reception d'email entrant (Resend "Inbound") pour le module Chat.
// Objectif : quand un client repond par email a un message envoye depuis
// une conversation Xyra, la reponse doit reapparaitre dans le Chat du
// Dashboard -- jusqu'ici seul WhatsApp avait ce chemin retour.
//
// Fonctionnement : chaque email sortant du Chat porte un Reply-To du type
// conv-<conversation_id>@reply.xyraio.fr (voir app/lib/rappels.ts). Resend
// route tout ce sous-domaine vers ce webhook des qu'un email y arrive.
//
// Securite : ce endpoint est anonyme par nature (n'importe qui peut nous
// envoyer un email). La seule garantie que l'appel vient vraiment de
// Resend est la signature Svix (svix-id/svix-timestamp/svix-signature +
// secret whsec_...) -- sans signature valide, on rejette, on ne traite
// jamais le corps de la requete.

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Retire la citation automatique que les clients mail ajoutent sous une
// reponse ("Le ... a ecrit :", "On ... wrote:", lignes commencant par ">"),
// pour ne garder que le texte reellement tape par la personne. Heuristique
// simple, pas parfaite pour tous les clients mail, mais couvre les cas
// courants (Gmail FR/EN, Outlook, Apple Mail).
function nettoyerReponseEmail(texte: string): string {
  const lignes = texte.split(/\r?\n/);
  const motifsEntete = [
    /^Le\s.+\s(a\s)?(écrit|ecrit)\s*:?\s*$/i,
    /^On\s.+\swrote:?\s*$/i,
    /^-{2,}\s*Message d'origine\s*-{2,}/i,
    /^-{2,}\s*Original Message\s*-{2,}/i,
  ];
  for (let i = 0; i < lignes.length; i++) {
    if (motifsEntete.some(m => m.test(lignes[i].trim()))) {
      return lignes.slice(0, i).join('\n').trim();
    }
  }
  let fin = lignes.length;
  while (fin > 0 && lignes[fin - 1].trim().startsWith('>')) fin--;
  return lignes.slice(0, fin).join('\n').trim();
}

function verifierSignatureSvix(id: string, timestamp: string, corps: string, entete: string, secret: string): boolean {
  if (!secret.startsWith('whsec_')) return false;
  const cleSecrete = Buffer.from(secret.slice('whsec_'.length), 'base64');
  const contenuSigne = `${id}.${timestamp}.${corps}`;
  const attendu = crypto.createHmac('sha256', cleSecrete).update(contenuSigne).digest('base64');
  const attenduBuf = Buffer.from(attendu, 'base64');
  // svix-signature peut contenir plusieurs signatures espacees (rotation de cle) : "v1,xxx v1,yyy"
  const signatures = entete.split(' ').map(s => s.split(',')[1]).filter(Boolean);
  return signatures.some(sig => {
    try {
      const sigBuf = Buffer.from(sig, 'base64');
      return sigBuf.length === attenduBuf.length && crypto.timingSafeEqual(sigBuf, attenduBuf);
    } catch { return false; }
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  const corps = await req.text();

  if (!secret || !svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'signature_absente' }, { status: 401 });
  }

  // Fenetre de 5 minutes -- refuse un evenement rejoue trop vieux ou horodate dans le futur.
  const maintenant = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (!ts || Math.abs(maintenant - ts) > 300) {
    return NextResponse.json({ error: 'horodatage_invalide' }, { status: 401 });
  }

  if (!verifierSignatureSvix(svixId, svixTimestamp, corps, svixSignature, secret)) {
    return NextResponse.json({ error: 'signature_invalide' }, { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(corps); } catch { return NextResponse.json({ error: 'corps_invalide' }, { status: 400 }); }

  if (event?.type !== 'email.received') {
    return NextResponse.json({ success: true, ignore: true });
  }

  const destinataires: string[] = event?.data?.to || [];
  let conversationId: string | null = null;
  for (const dest of destinataires) {
    const m = /conv-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})@reply\.xyraio\.fr/i.exec(dest);
    if (m) { conversationId = m[1]; break; }
  }
  if (!conversationId) {
    // Pas une reponse a une conversation Xyra connue -- on ignore proprement
    // (200 pour eviter que Resend ne re-essaie en boucle), on journalise juste.
    console.error('email-entrant: destinataire sans conversation reconnue', destinataires);
    return NextResponse.json({ success: true, ignore: true });
  }

  const { data: conv } = await sb.from('conversations').select('id,tenant_id,contact_nom').eq('id', conversationId).maybeSingle();
  if (!conv) {
    console.error('email-entrant: conversation introuvable', conversationId);
    return NextResponse.json({ success: true, ignore: true });
  }

  // Le webhook ne contient que les metadonnees -- le corps du mail se recupere via l'API.
  // Cle dediee (RESEND_API_KEY_RECEPTION, acces complet) : RESEND_API_KEY
  // (utilisee partout ailleurs pour l'envoi) n'a que les droits d'envoi et
  // ne peut pas lire les emails recus -- confirme par Resend (404
  // "Inbound email not found" avec une cle sending-only).
  let contenu = '';
  const emailId = event?.data?.email_id;
  const cleReception = process.env.RESEND_API_KEY_RECEPTION;
  if (emailId && cleReception) {
    try {
      const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${cleReception}` },
      });
      if (res.ok) {
        const detail = await res.json();
        contenu = (detail.text || '').trim();
        if (!contenu && detail.html) {
          contenu = String(detail.html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        contenu = nettoyerReponseEmail(contenu);
      } else {
        console.error('email-entrant: Resend a repondu', res.status, await res.text());
      }
    } catch (e: any) {
      console.error('email-entrant: recuperation du corps', e.message);
    }
  }
  if (!contenu) contenu = `(email sans contenu lisible — sujet : ${event?.data?.subject || 'sans sujet'})`;

  const { data: message, error } = await sb.from('chat_messages').insert({
    conversation_id: conv.id,
    auteur: conv.contact_nom || event?.data?.from || 'Contact',
    contenu,
    moi: false,
    type: 'texte',
    lu: false,
    email_message_id: event?.data?.message_id || null,
  }).select().single();
  if (error) {
    console.error('email-entrant: insertion message', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', conv.id);

  await sb.from('notifications').insert({
    type: 'info', icon: '📧', urgence: 'normale',
    titre: `Réponse email de ${conv.contact_nom || 'un contact'}`,
    message: contenu.slice(0, 140),
    action_type: 'chat', action_id: conv.id, lu: false,
    tenant_id: conv.tenant_id || null,
  });

  return NextResponse.json({ success: true, message });
}
