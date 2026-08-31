import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { envoyerWhatsApp } from '../../lib/whatsapp';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Genere automatiquement les notifications depuis les donnees reelles -- toujours filtre par societe
async function genererNotificationsAuto(tenantId: string) {
  const notifs: any[] = [];

  const { data: commissions } = await sb.from('wallet_transactions').select('*').eq('tenant_id', tenantId).eq('type', 'commission').eq('statut', 'à_virer');
  if (commissions?.length) {
    const total = commissions.reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    notifs.push({ type: 'commission', icon: '💰', urgence: 'haute', titre: `${commissions.length} commission(s) à virer`, message: `Total : ${total}€ en attente`, action_type: 'commission', lu: false });
  }

  const { data: conges } = await sb.from('conges').select('*').eq('tenant_id', tenantId).eq('statut', 'en_attente');
  if (conges?.length) {
    notifs.push({ type: 'conge', icon: '🏖', urgence: 'haute', titre: `${conges.length} demande(s) de congé`, message: 'En attente de validation', action_type: 'conge', lu: false });
  }

  const { data: acomptes } = await sb.from('acomptes').select('*').eq('tenant_id', tenantId).eq('statut', 'en_attente');
  if (acomptes?.length) {
    const total = acomptes.reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    notifs.push({ type: 'acompte', icon: '💸', urgence: 'haute', titre: `${acomptes.length} acompte(s) en attente`, message: `Total : ${total}€`, action_type: 'acompte', lu: false });
  }

  const { data: stock } = await sb.from('stock').select('art,qte,min').eq('tenant_id', tenantId);
  const critiques = (stock || []).filter((s: any) => Number(s.qte || 0) <= Number(s.min || 5));
  if (critiques.length) {
    notifs.push({ type: 'stock', icon: '📦', urgence: 'haute', titre: `${critiques.length} article(s) en stock critique`, message: critiques.slice(0, 3).map((s: any) => s.art).join(', '), action_type: 'stock', lu: false });
  }

  const { data: deals } = await sb.from('deals').select('*').eq('tenant_id', tenantId).not('etape', 'in', '("Gagné","Perdu")');
  const dealsInactifs = (deals || []).filter((d: any) => {
    const date = new Date(d.dernierContact || d.updated_at || d.created_at);
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) > 14;
  });
  if (dealsInactifs.length) {
    notifs.push({ type: 'deal', icon: '💼', urgence: 'normale', titre: `${dealsInactifs.length} deal(s) sans contact depuis 14j+`, message: dealsInactifs.slice(0, 2).map((d: any) => d.nom).join(', '), action_type: 'deal', lu: false });
  }

  const { data: factures } = await sb.from('factures').select('*').eq('tenant_id', tenantId).eq('statut', 'en_retard');
  if (factures?.length) {
    const total = factures.reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
    notifs.push({ type: 'facture', icon: '🧾', urgence: 'haute', titre: `${factures.length} facture(s) en retard`, message: `Total : ${total}€`, action_type: 'facture', lu: false });
  }

  const { data: leads } = await sb.from('crm_leads').select('*').eq('tenant_id', tenantId).eq('etape', 'Nouveau');
  if (leads?.length) {
    notifs.push({ type: 'crm_lead', icon: '🎯', urgence: 'normale', titre: `${leads.length} nouveau(x) lead(s) CRM`, message: 'À qualifier', action_type: 'crm', lu: false });
  }

  return notifs;
}

// Prend les situations detectees et les enregistre pour de vrai, sans jamais dupliquer
// une notification active (non traitee) du meme type -- c'est ce qui evite qu'une notification
// deja traitee revienne toute seule tant que la situation exacte n'a pas change.
async function synchroniserNotificationsAuto(tenantId: string) {
  const detectees = await genererNotificationsAuto(tenantId);
  if (!detectees.length) return;

  const { data: actives } = await sb.from('notifications').select('action_type,titre').eq('tenant_id', tenantId).eq('traite', false);
  const actifsParType = new Set((actives || []).map((n: any) => n.action_type));

  for (const n of detectees) {
    if (actifsParType.has(n.action_type)) continue;
    await sb.from('notifications').insert({ ...n, tenant_id: tenantId });
  }
}

// Porte d'entree generique -- n'importe quel module, actuel ou futur, appelle cette fonction
// pour creer une notification ET la dispatcher sur les bons canaux selon les preferences reelles du tenant
async function envoyerNotification(tenantId: string, params: {
  type: string; icon?: string; titre: string; message: string;
  urgence?: string; action_type?: string; action_id?: string;
}) {
  const { type, icon, titre, message, urgence, action_type, action_id } = params;

  await sb.from('notifications').insert({
    type, icon: icon || '🔔', titre, message,
    urgence: urgence || 'normale', action_type, action_id,
    canal: 'dashboard', lu: false, tenant_id: tenantId,
  });

  const { data: pref } = await sb.from('notif_preferences').select('*').eq('tenant_id', tenantId).eq('type', type).maybeSingle();
  const whatsappActif = pref?.whatsapp_actif ?? false;
  const emailActif = pref?.email_actif ?? false;

  if (!whatsappActif && !emailActif) return;

  const { data: tenant } = await sb.from('tenants').select('email,telephone_contact,telephone_entreprise,societe').eq('id', tenantId).single();
  if (!tenant) return;

  if (whatsappActif) {
    const tel = tenant.telephone_contact || tenant.telephone_entreprise;
    if (tel) { try { await envoyerWhatsApp(tel, `Xyra - ${titre}\n${message}`, tenantId); } catch (e) { /* non bloquant */ } }
  }

  if (emailActif && tenant.email) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: tenant.email,
        subject: titre,
        html: `<div style="font-family:sans-serif;padding:24px;"><h2>${titre}</h2><p>${message}</p></div>`,
      });
    } catch (e) { /* non bloquant */ }
  }
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  await synchroniserNotificationsAuto(tenantId);

  const { data: notifs, error } = await sb.from('notifications').select('*').eq('tenant_id', tenantId).eq('traite', false).order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: prefs } = await sb.from('notif_preferences').select('*').eq('tenant_id', tenantId);
  const nonLus = (notifs || []).filter((n: any) => !n.lu).length;

  return NextResponse.json({ notifications: notifs || [], preferences: prefs || [], nonLus });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'marquer_lu') {
    const { id } = body;
    if (id === 'all') {
      await sb.from('notifications').update({ lu: true }).eq('tenant_id', tenantId).eq('lu', false);
    } else {
      await sb.from('notifications').update({ lu: true }).eq('id', id).eq('tenant_id', tenantId);
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'traiter') {
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
    await sb.from('notifications').update({ traite: true, traite_at: new Date().toISOString(), lu: true }).eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'declencher') {
    await envoyerNotification(tenantId, body);
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    await sb.from('notifications').delete().eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'digest_quotidien') {
    const { data: tenant } = await sb.from('tenants').select('telephone_contact,telephone_entreprise').eq('id', tenantId).single();
    const tel = body.tel || tenant?.telephone_contact || tenant?.telephone_entreprise;
    if (!tel) return NextResponse.json({ error: 'Numéro manquant' }, { status: 400 });
    const autoNotifs = await genererNotificationsAuto(tenantId);
    if (!autoNotifs.length) {
      await envoyerWhatsApp(tel, 'Xyra - Bonjour ! Tout est a jour aujourd\'hui. Bonne journee.', tenantId);
      return NextResponse.json({ success: true, nb: 0 });
    }
    const priorites = autoNotifs.filter((n: any) => n.urgence === 'haute').slice(0, 3);
    const msg = `Xyra - Bonjour ! Vos priorites du jour :\n${priorites.map((n: any, i: number) => `${i + 1}. ${n.titre} - ${n.message}`).join('\n')}\nBonne journee !`;
    try { await envoyerWhatsApp(tel, msg, tenantId); } catch (e) { /* non bloquant */ }
    return NextResponse.json({ success: true, nb: priorites.length });
  }

  if (action === 'push_whatsapp') {
    const { tel, titre, message } = body;
    if (!tel) return NextResponse.json({ error: 'Numéro manquant' }, { status: 400 });
    try { await envoyerWhatsApp(tel, `Xyra - ${titre}\n${message}`, tenantId); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
    return NextResponse.json({ success: true });
  }

  if (action === 'update_preference') {
    const { type, push_actif, whatsapp_actif, email_actif, urgence, canal, seuil_montant, seuil_jours } = body;
    await sb.from('notif_preferences').upsert({ tenant_id: tenantId, type, push_actif, whatsapp_actif, email_actif, urgence, canal, seuil_montant, seuil_jours }, { onConflict: 'tenant_id,type' });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
