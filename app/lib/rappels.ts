import { createClient } from '@supabase/supabase-js';
import { envoyerWhatsApp } from './whatsapp';
import { envoyerSMS } from './sms';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Essaie WhatsApp, puis email, puis SMS en dernier recours.
 * Utilisee par la route normale ET par la tache quotidienne (cron),
 * qui n'a pas de session utilisateur.
 */
export async function envoyerPartout(tel: string | null, email: string | null, texte: string, tenantId: string) {
  if (tel) {
    try {
      const wa = await envoyerWhatsApp(tel, texte, tenantId);
      if (wa?.ok) return 'whatsapp';
    } catch (e: any) { console.error('Rappel WhatsApp:', e.message); }
  }
  if (email) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>', to: email, subject: 'Rappel de rendez-vous',
        html: `<p>${texte}</p>`,
      });
      return 'email';
    } catch (e: any) { console.error('Rappel email:', e.message); }
  }
  if (tel) {
    try {
      const sms = await envoyerSMS(tel, texte);
      if (sms?.ok) return 'sms';
    } catch (e: any) { console.error('Rappel SMS:', e.message); }
  }
  return null;
}

/**
 * Envoie le rappel d'une mission au client et/ou aux collaborateurs.
 * tenantId est fourni directement (pas via une session) — utilisable
 * aussi bien par une route normale que par le cron.
 */
export async function envoyerRappelMission(missionId: string, tenantId: string, cible: 'client' | 'collaborateurs' | 'tous') {
  const { data: mission } = await sb.from('missions_planning')
    .select('*, missions_collaborateurs(collaborateur_id)').eq('id', missionId).eq('tenant_id', tenantId).maybeSingle();
  if (!mission) return { success: false, error: 'introuvable' };

  const texteClient = `Rappel : votre rendez-vous du ${mission.date_mission} a ${mission.heure_debut} approche.`;
  const texteCollab = `Rappel : mission le ${mission.date_mission} a ${mission.heure_debut} chez ${mission.client_nom || 'un client'}.`;

  let envoyesClient = 0, envoyesCollab = 0;

  if ((cible === 'client' || cible === 'tous') && (mission.client_tel || mission.client_email)) {
    const canal = await envoyerPartout(mission.client_tel, mission.client_email, texteClient, tenantId);
    if (canal) envoyesClient = 1;
  }

  if (cible === 'collaborateurs' || cible === 'tous') {
    const ids = (mission.missions_collaborateurs || []).map((c: any) => c.collaborateur_id);
    if (ids.length) {
      const { data: collabs } = await sb.from('equipe').select('id,tel,email').in('id', ids);
      for (const c of (collabs || [])) {
        const canal = await envoyerPartout(c.tel, c.email, texteCollab, tenantId);
        if (canal) envoyesCollab++;
      }
    }
  }

  const champRappel = cible === 'client' ? { rappel_24h_envoye: true } : {};
  if (Object.keys(champRappel).length) await sb.from('missions_planning').update(champRappel).eq('id', missionId);

  return { success: true, envoyesClient, envoyesCollab };
}
