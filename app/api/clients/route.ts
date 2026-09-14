import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { createClient } from '@supabase/supabase-js';
import { envoyerWhatsApp } from '../../lib/whatsapp';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function coutTotalEmploye(salaireBrut: number) {
  return salaireBrut + Math.round(salaireBrut * 0.42);
}

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, "clients");
  if (!acces.ok) return acces.reponse;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ clients: [] });

  // Rentabilite reelle par client : CA encaisse (factures payees) vs cout
  // reel engage (part du cout salarial des employes qui ont travaille pour
  // ce client ce mois-ci, repartie a parts egales entre leurs missions du
  // mois -- pas de suivi horaire fiable disponible pour une repartition plus
  // fine, donc on reste honnete sur cette approximation).
  if (searchParams.get('vue') === 'rentabilite') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const moisR = searchParams.get('mois') || new Date().toISOString().slice(0, 7);
    const [{ data: clientsR }, { data: facturesR }, { data: missionsR }, { data: equipeR }] = await Promise.all([
      sb.from('clients').select('id,nom,email').eq('tenant_id', tenantId),
      sb.from('factures').select('client_email,client_nom,montant_ttc,statut,date_emission,created_at').eq('tenant_id', tenantId).eq('statut', 'payée'),
      sb.from('missions').select('client_id,employe_id,statut,date_mission').eq('tenant_id', tenantId).eq('statut', 'termine'),
      sb.from('equipe').select('id,salaire,salaire_brut').eq('tenant_id', tenantId),
    ]);

    const nbMissionsParEmploye: Record<string, number> = {};
    for (const m of missionsR || []) {
      if (String(m.date_mission || '').slice(0, 7) !== moisR) continue;
      nbMissionsParEmploye[m.employe_id] = (nbMissionsParEmploye[m.employe_id] || 0) + 1;
    }
    const coutParEmploye: Record<string, number> = {};
    for (const e of equipeR || []) coutParEmploye[e.id] = coutTotalEmploye(Number(e.salaire_brut || e.salaire || 0));

    const lignes = (clientsR || []).map((c: any) => {
      const facturesClient = (facturesR || []).filter((f: any) => ((c.email && f.client_email === c.email) || f.client_nom === c.nom) && String(f.date_emission || f.created_at || '').slice(0, 7) === moisR);
      const caEncaisse = facturesClient.reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
      const missionsClient = (missionsR || []).filter((m: any) => m.client_id === c.id && String(m.date_mission || '').slice(0, 7) === moisR);
      const coutEngage = missionsClient.reduce((a: number, m: any) => {
        const cout = coutParEmploye[m.employe_id] || 0;
        const nb = nbMissionsParEmploye[m.employe_id] || 1;
        return a + cout / nb;
      }, 0);
      const marge = caEncaisse - coutEngage;
      return {
        client_id: c.id, nom: c.nom, nbMissions: missionsClient.length,
        caEncaisse, coutEngage: Math.round(coutEngage), marge: Math.round(marge),
        margePct: coutEngage > 0 ? Math.round((marge / coutEngage) * 1000) / 10 : null,
      };
    }).filter((l: any) => l.nbMissions > 0 || l.caEncaisse > 0);

    return NextResponse.json({ mois: moisR, lignes });
  }
  let clientsQuery = sb.from('clients').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (companyId && UUID_RE.test(companyId)) clientsQuery = clientsQuery.eq('company_id', companyId);
  const { data: clients, error } = await clientsQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: factures } = await sb.from('factures').select('client_email,client_nom,montant_ttc,statut').eq('tenant_id', tenantId);
  const { data: echanges } = await sb.from('client_echanges').select('*').order('created_at', { ascending: false });

  const enriched = (clients || []).map((c: any) => {
    const facturesClient = (factures || []).filter(
      (f: any) => (c.email && f.client_email === c.email) || f.client_nom === c.nom
    );
    const ca = facturesClient.filter((f: any) => f.statut === 'payée').reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
    const payees = facturesClient.filter((f: any) => f.statut === 'payée').length;
    const enRetard = facturesClient.filter((f: any) => f.statut === 'en_retard').length;
    const score = Math.max(0, Math.min(100, 50 + payees * 8 - enRetard * 15));
    const echangesClient = (echanges || []).filter((e: any) => e.client_id === c.id);
    return { ...c, ca, score, factures_payees: payees, factures_retard: enRetard, echanges: echangesClient };
  });

  return NextResponse.json({ clients: enriched });
}

export async function POST(req: NextRequest) {
  const acces = await verifierAccesModule(req, "clients");
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    const { nom, email, tel, ville, metier, pays } = body;
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('clients').insert({
      nom, email, tel, ville, metier, pays: pays || '🇫🇷', statut: 'actif', vip: false, tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    try {
      await sb.from('notifications').insert({
        tenant_id: tenantId, type: 'client', icon: '👤', urgence: 'normale',
        titre: `Nouveau client : ${nom}`, message: ville ? `${ville}` : '',
        action_type: 'client', action_id: data.id, lu: false, traite: false,
      });
    } catch (e) { /* non bloquant */ }
    return NextResponse.json({ success: true, client: data });
  }

  if (action === 'toggle_vip') {
    if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    const { id, vip } = body;
    const { error } = await sb.from('clients').update({ vip, statut: vip ? 'VIP' : 'actif' }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'modifier') {
    if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    const { id, ...fields } = body;
    const { error } = await sb.from('clients').update(fields).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    const { id } = body;
    const { error } = await sb.from('clients').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_whatsapp') {
    const { id, tel, message } = body;
    if (!tel || !message) return NextResponse.json({ error: 'Téléphone et message requis' }, { status: 400 });
    try {
      await envoyerWhatsApp(tel, message, tenantId);
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi WhatsApp' }, { status: 500 });
    }
    await sb.from('client_echanges').insert({ client_id: id, type: 'WhatsApp', message, sens: 'envoyé' });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_email') {
    const { id, email, subject, message } = body;
    if (!email || !message) return NextResponse.json({ error: 'Email et message requis' }, { status: 400 });
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: email,
        subject: subject || 'Message de Xyra',
        html: `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${message}</div>`,
      });
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }
    await sb.from('client_echanges').insert({ client_id: id, type: 'Email', message, sens: 'envoyé' });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}