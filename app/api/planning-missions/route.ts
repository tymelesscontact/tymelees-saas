import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { envoyerSMS } from '../../lib/sms';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collaborateurId = searchParams.get('collaborateur_id');
  const dateDebut = searchParams.get('date_debut');
  const dateFin = searchParams.get('date_fin');

  let q = sb.from('missions_planning').select('*, missions_collaborateurs(collaborateur_id, role, statut_presence)')
    .eq('tenant_id', tenantId).order('date_mission');
  if (dateDebut) q = q.gte('date_mission', dateDebut);
  if (dateFin) q = q.lte('date_mission', dateFin);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let missions = data || [];
  if (collaborateurId) {
    missions = missions.filter((m: any) =>
      (m.missions_collaborateurs || []).some((c: any) => c.collaborateur_id === collaborateurId)
    );
  }

  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const {
      type_mission_id, client_id, client_nom, client_email, client_tel,
      date_mission, heure_debut, heure_fin, adresse, notes,
      collaborateur_ids, acompte_montant, recurrence_frequence, company_id, cree_par,
    } = body;

    if (!date_mission || !heure_debut) {
      return NextResponse.json({ error: 'Date et heure necessaires' }, { status: 400 });
    }
    if (!collaborateur_ids || !Array.isArray(collaborateur_ids) || collaborateur_ids.length === 0) {
      return NextResponse.json({ error: 'Au moins un collaborateur necessaire' }, { status: 400 });
    }

    // Verifie que tous les collaborateurs appartiennent bien au tenant
    const { data: valides } = await sb.from('equipe').select('id')
      .in('id', collaborateur_ids).eq('tenant_id', tenantId);
    if (!valides || valides.length !== collaborateur_ids.length) {
      return NextResponse.json({ error: 'Un collaborateur est invalide' }, { status: 403 });
    }

    const { data: mission, error } = await sb.from('missions_planning').insert({
      tenant_id: tenantId, company_id: company_id || null,
      type_mission_id: type_mission_id || null,
      client_id: client_id || null, client_nom: client_nom || null,
      client_email: client_email || null, client_tel: client_tel || null,
      date_mission, heure_debut, heure_fin: heure_fin || null,
      adresse: adresse || null, notes: notes || null,
      acompte_montant: acompte_montant || null,
      recurrence_frequence: recurrence_frequence || null,
      cree_par: cree_par || 'equipe',
      statut: 'propose',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const liaisons = collaborateur_ids.map((id: string) => ({ mission_id: mission.id, collaborateur_id: id }));
    await sb.from('missions_collaborateurs').insert(liaisons);

    return NextResponse.json({ success: true, mission });
  }

  if (action === 'modifier_statut') {
    const { id, statut } = body;
    const valides = ['propose', 'confirme', 'en_cours', 'termine', 'annule', 'reporte'];
    if (!valides.includes(statut)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    const { error } = await sb.from('missions_planning')
      .update({ statut }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Rappel de mission — WhatsApp d'abord, email si echec, SMS en dernier recours
  if (action === 'envoyer_rappel') {
    const { id, cible } = body; // cible: 'client' | 'collaborateurs' | 'tous'
    const { data: mission } = await sb.from('missions_planning')
      .select('*, missions_collaborateurs(collaborateur_id)').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!mission) return NextResponse.json({ error: 'introuvable' }, { status: 404 });

    const texteClient = `Rappel : votre rendez-vous du ${mission.date_mission} a ${mission.heure_debut} approche.`;
    const texteCollab = `Rappel : mission le ${mission.date_mission} a ${mission.heure_debut} chez ${mission.client_nom || 'un client'}.`;

    async function envoyerPartout(tel: string | null, email: string | null, texte: string) {
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

    let envoyesClient = 0, envoyesCollab = 0;

    if ((cible === 'client' || cible === 'tous') && (mission.client_tel || mission.client_email)) {
      const canal = await envoyerPartout(mission.client_tel, mission.client_email, texteClient);
      if (canal) envoyesClient = 1;
    }

    if (cible === 'collaborateurs' || cible === 'tous') {
      const ids = (mission.missions_collaborateurs || []).map((c: any) => c.collaborateur_id);
      if (ids.length) {
        const { data: collabs } = await sb.from('equipe').select('id,tel,email').in('id', ids);
        for (const c of (collabs || [])) {
          const canal = await envoyerPartout(c.tel, c.email, texteCollab);
          if (canal) envoyesCollab++;
        }
      }
    }

    const champRappel = cible === 'client' ? { rappel_24h_envoye: true } : {};
    if (Object.keys(champRappel).length) await sb.from('missions_planning').update(champRappel).eq('id', id);

    return NextResponse.json({ success: true, envoyesClient, envoyesCollab });
  }

  if (action === 'presence_collaborateur') {
    const { mission_id, collaborateur_id, statut_presence } = body;
    const valides = ['prevu', 'arrive', 'termine', 'absent'];
    if (!valides.includes(statut_presence)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    const { error } = await sb.from('missions_collaborateurs')
      .update({ statut_presence }).eq('mission_id', mission_id).eq('collaborateur_id', collaborateur_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
