import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) return NextResponse.json({ ok: true });

    const type = message.type;
    const call = message.call;

    // ── APPEL DÉMARRÉ ─────────────────────────────────────────
    if (type === 'call-started') {
      await sb.from('vapi_calls').upsert({
        call_id: call.id,
        status: 'in-progress',
        prospect_name: call.customer?.name || '—',
        prospect_number: call.customer?.number || '—',
        started_at: new Date().toISOString(),
        assistant_id: call.assistantId,
        tenant_id: call.metadata?.tenant_id || null,
      });
    }

    // ── APPEL TERMINÉ ─────────────────────────────────────────
    if (type === 'call-ended') {
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
      const transcript = call.transcript || '';
      const rdvDetecte = /rendez-vous|rdv|meeting|appointment|lundi|mardi|mercredi|jeudi|vendredi|semaine/i.test(transcript);
      const interessé = /intéressé|parfait|super|oui|bien sûr|envoyer|d'accord/i.test(transcript);
      const pasInteressé = /pas intéressé|non merci|pas besoin|déjà|occupé/i.test(transcript);

      const statut = rdvDetecte ? 'rdv_fixé'
        : interessé ? 'intéressé'
        : pasInteressé ? 'pas_intéressé'
        : 'à_relancer';

      await sb.from('vapi_calls').upsert({
        call_id: call.id,
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
          heure: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          lu: false,
          tenant_id: call.metadata?.tenant_id || null,
        });
      }

      // Relance automatique si pas répondu
      if (call.endedReason === 'no-answer' || duration < 10) {
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

    // ── TRANSCRIPTION DISPONIBLE ──────────────────────────────
    if (type === 'transcript') {
      await sb.from('vapi_calls')
        .update({ transcript: message.transcript })
        .eq('call_id', call.id);
    }

    // ── MESSAGE EN COURS ──────────────────────────────────────
    if (type === 'speech-update') {
      // Mise à jour temps réel — optionnel
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Vapi webhook actif ✅' });
}