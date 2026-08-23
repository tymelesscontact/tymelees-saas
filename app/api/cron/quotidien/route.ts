import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { envoyerPartout } from '../../../lib/rappels';
import { envoyerRappelMission } from '../../../lib/rappels';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Tache quotidienne, declenchee par Vercel Cron.
 * Proteg par CRON_SECRET pour qu'elle ne soit pas appelable
 * publiquement par n'importe qui connaissant l'adresse.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  }

  const resultats: any = { relances: null, rappels: null };

  // 1 - Les relances commerciales dues aujourd'hui
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr';
    const r = await fetch(`${site}/api/relance`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'traiter_envois_dus' }),
    });
    resultats.relances = await r.json();
  } catch (e: any) {
    resultats.relances = { error: e.message };
  }

  // 2 - Les rappels de mission pour demain (24h avant)
  try {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const dateDemain = demain.toISOString().slice(0, 10);

    const { data: missions } = await sb.from('missions_planning')
      .select('id,tenant_id')
      .eq('date_mission', dateDemain)
      .eq('rappel_24h_envoye', false)
      .in('statut', ['propose', 'confirme']);

    let envoyes = 0;
    for (const m of (missions || [])) {
      try {
        await envoyerRappelMission(m.id, m.tenant_id, 'tous');
        envoyes++;
      } catch (e: any) { console.error('Rappel cron:', e.message); }
    }
    resultats.rappels = { missions_traitees: envoyes };
  } catch (e: any) {
    resultats.rappels = { error: e.message };
  }

  // 3 - Liste d'attente : notifier si une mission a ete annulee/liberee a une date attendue
  try {
    const { data: attentes } = await sb.from('liste_attente_planning')
      .select('*').eq('notifie', false);

    let notifiesAttente = 0;
    for (const a of (attentes || [])) {
      const { data: missionsCeJour } = await sb.from('missions')
        .select('id').eq('tenant_id', a.tenant_id).eq('date_mission', a.date_souhaitee)
        .neq('statut', 'annule');

      // Simplification : si moins de 5 missions ce jour-la, on considere qu'il y a de la place
      if ((missionsCeJour || []).length < 5) {
        await envoyerPartout(a.client_tel || null, a.client_email || null,
          `Bonne nouvelle : un creneau s'est libere le ${a.date_souhaitee}. Contactez-nous pour reserver !`,
          a.tenant_id);
        await sb.from('liste_attente_planning').update({ notifie: true }).eq('id', a.id);
        notifiesAttente++;
      }
    }
    resultats.listeAttente = { notifies: notifiesAttente };
  } catch (e: any) {
    resultats.listeAttente = { error: e.message };
  }

  return NextResponse.json({ success: true, resultats, executee_le: new Date().toISOString() });
}
