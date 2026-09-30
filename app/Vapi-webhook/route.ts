import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';
import { fuseauDuTenant, heureLocale } from '../lib/fuseauHoraire';

type VapiCall = {
  id?: string;
  assistantId?: string;
  startedAt?: string;
  endedAt?: string;
  endedReason?: string;
  transcript?: string;
  customer?: { name?: string; number?: string };
  metadata?: { tenant_id?: string };
};

function getSb() {
  // Vapi appelle ce webhook sans session (pas d'utilisateur connecte) -- la
  // cle anon ne peut donc satisfaire aucune policy RLS `appartient_au_tenant`.
  // Cle service-role obligatoire ici, comme partout ou un appel serveur-a-
  // serveur doit ecrire en base sans contexte utilisateur.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    // Authentification avant toute lecture du JSON. Une absence de secret est un
    // echec ferme, pas un mode degrade qui laisserait ce point d'entree public.
    // Methode documentee par Vapi : credential "Bearer Token" (Authorization: Bearer <secret>,
    // ou l'ancien en-tete X-Vapi-Secret). HMAC accepte aussi (x-vapi-signature, hex du corps brut).
    const rawBody = await req.text();
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook non authentifie' }, { status: 401 });
    }
    const egalTempsConstant = (a: string, b: string) => {
      const ba = Buffer.from(a);
      const bb = Buffer.from(b);
      return ba.length === bb.length && timingSafeEqual(ba, bb);
    };
    const authorization = req.headers.get('authorization') || '';
    const jetonBearer = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    const jetonLegacy = req.headers.get('x-vapi-secret') || '';
    const signature = (req.headers.get('x-vapi-signature') || '').replace(/^sha256=/, '');
    const signatureAttendue = createHmac('sha256', secret).update(rawBody).digest('hex');
    const authentifie =
      (!!jetonBearer && egalTempsConstant(jetonBearer, secret)) ||
      (!!jetonLegacy && egalTempsConstant(jetonLegacy, secret)) ||
      (!!signature && egalTempsConstant(signature, signatureAttendue));
    if (!authentifie) {
      return NextResponse.json({ error: 'Webhook non authentifie' }, { status: 401 });
    }

    let body: {
      message?: {
        type?: string;
        call?: VapiCall;
        transcript?: string;
        status?: string;
        endedReason?: string;
        artifact?: { transcript?: string };
      };
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
    }

    const sb = getSb();
    const { message } = body;

    if (!message) return NextResponse.json({ ok: true });

    const type = message.type;
    const call = message.call;
    if (!call?.id) {
      return NextResponse.json({ error: 'Evenement Vapi incomplet' }, { status: 400 });
    }

    // Une seule ligne par appel : upsert() sans cle de conflit inserait une nouvelle
    // ligne a chaque message. On met a jour la ligne existante, sinon on la cree.
    // creerSeulement : le demarrage ne doit pas ecraser un appel deja termine
    // (Vapi ne garantit pas l'ordre d'arrivee des messages).
    const enregistrerAppel = async (champs: Record<string, unknown>, creerSeulement = false) => {
      const { data: existant } = await sb.from('vapi_calls').select('id').eq('call_id', call.id).limit(1).maybeSingle();
      if (existant) {
        if (!creerSeulement) await sb.from('vapi_calls').update(champs).eq('id', existant.id);
      } else {
        await sb.from('vapi_calls').insert({ call_id: call.id, ...champs });
      }
    };

    // Noms reels des messages Vapi (doc officielle) : "status-update" (status
    // "in-progress") au demarrage, "end-of-call-report" a la fin. Les anciens
    // noms "call-started" / "call-ended" n'existent pas chez Vapi ; gardes par securite.
    const appelDemarre = type === 'call-started' || (type === 'status-update' && message.status === 'in-progress');
    const appelTermine = type === 'call-ended' || type === 'end-of-call-report';

    // ── APPEL DÉMARRÉ ─────────────────────────────────────────
    if (appelDemarre) {
      await enregistrerAppel({
        status: 'in-progress',
        prospect_name: call.customer?.name || '—',
        prospect_number: call.customer?.number || '—',
        started_at: new Date().toISOString(),
        assistant_id: call.assistantId,
        tenant_id: call.metadata?.tenant_id || null,
      }, true);
    }

    // ── APPEL TERMINÉ ─────────────────────────────────────────
    if (appelTermine) {
      const duration = call.endedAt && call.startedAt
        ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : 0;

      // Score basé sur la durée
      const score = duration < 30 ? 10
        : duration < 60 ? 30
        : duration < 120 ? 50
        : duration < 300 ? 75
        : 90;

      // Résumé IA basé sur transcript
      const transcript = message.artifact?.transcript || call.transcript || '';
      const endedReason = message.endedReason || call.endedReason;
      const rdvDetecte = /rendez-vous|rdv|meeting|appointment|lundi|mardi|mercredi|jeudi|vendredi|semaine/i.test(transcript);
      const interessé = /intéressé|parfait|super|oui|bien sûr|envoyer|d'accord/i.test(transcript);
      const pasInteressé = /pas intéressé|non merci|pas besoin|déjà|occupé/i.test(transcript);

      const statut = rdvDetecte ? 'rdv_fixé'
        : interessé ? 'intéressé'
        : pasInteressé ? 'pas_intéressé'
        : 'à_relancer';

      await enregistrerAppel({
        status: 'ended',
        prospect_name: call.customer?.name || '—',
        prospect_number: call.customer?.number || '—',
        started_at: call.startedAt,
        ended_at: call.endedAt,
        duration,
        score,
        statut,
        rdv_detecte: rdvDetecte,
        transcript,
        tenant_id: call.metadata?.tenant_id || null,
        updated_at: new Date().toISOString(),
      });

      // Si RDV détecté → notifier
      if (rdvDetecte) {
        await sb.from('notifications').insert({
          type: 'good',
          icon: '📅',
          titre: `RDV fixé par Lea avec ${call.customer?.name || call.customer?.number}`,
          // Heure du pays de l'entreprise : le serveur Vercel tourne en heure universelle (UTC).
          heure: heureLocale(new Date(), await fuseauDuTenant(call.metadata?.tenant_id)),
          lu: false,
          tenant_id: call.metadata?.tenant_id || null,
        });
      }

      // Relance automatique si pas répondu
      if (endedReason === 'no-answer' || duration < 10) {
        await sb.from('vapi_relances').insert({
          call_id: call.id,
          prospect_number: call.customer?.number,
          prospect_name: call.customer?.name || '—',
          tentatives: 1,
          prochaine_relance: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2h
          statut: 'planifiée',
          assistant_id: call.assistantId,
          tenant_id: call.metadata?.tenant_id || null,
        });
      }
    }

    // ── TRANSCRIPTION EN DIRECT ───────────────────────────────
    // Les messages "transcript" ne contiennent qu'un morceau de phrase : les
    // enregistrer ecrasait la transcription. La transcription complete arrive
    // dans "end-of-call-report" (artifact.transcript), enregistree ci-dessus.

    // ── MESSAGE EN COURS ──────────────────────────────────────
    if (type === 'speech-update') {
      // Mise à jour temps réel — optionnel
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: 'Erreur interne du webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Vapi webhook actif ✅' });
}
