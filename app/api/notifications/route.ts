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

// Génère automatiquement les notifications depuis les données réelles
async function genererNotificationsAuto() {
  const notifs: any[] = [];

  // Commissions à virer
  const { data: commissions } = await sb.from('wallet_transactions').select('*').eq('type', 'commission').eq('statut', 'à_virer');
  if (commissions?.length) {
    const total = commissions.reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    notifs.push({ type: 'money', icon: '💰', urgence: 'haute', titre: `${commissions.length} commission(s) à virer`, message: `Total : ${total}€ en attente`, action_type: 'commission', lu: false });
  }

  // Congés en attente
  const { data: conges } = await sb.from('conges').select('*').eq('statut', 'en_attente');
  if (conges?.length) {
    notifs.push({ type: 'info', icon: '🏖', urgence: 'haute', titre: `${conges.length} demande(s) de congé`, message: 'En attente de validation', action_type: 'conge', lu: false });
  }

  // Acomptes en attente
  const { data: acomptes } = await sb.from('acomptes').select('*').eq('statut', 'en_attente');
  if (acomptes?.length) {
    const total = acomptes.reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    notifs.push({ type: 'urgent', icon: '💸', urgence: 'haute', titre: `${acomptes.length} acompte(s) en attente`, message: `Total : ${total}€`, action_type: 'acompte', lu: false });
  }

  // Stock critique
  const { data: stock } = await sb.from('stock').select('art,qte,min');
  const critiques = (stock || []).filter((s: any) => Number(s.qte || 0) <= Number(s.min || 5));
  if (critiques.length) {
    notifs.push({ type: 'stock', icon: '📦', urgence: 'haute', titre: `${critiques.length} article(s) en stock critique`, message: critiques.slice(0, 3).map((s: any) => s.art).join(', '), action_type: 'stock', lu: false });
  }

  // Deals inactifs depuis +14 jours
  const { data: deals } = await sb.from('deals').select('*').not('etape', 'in', '("Gagné","Perdu")');
  const dealsInactifs = (deals || []).filter((d: any) => {
    const date = new Date(d.dernierContact || d.updated_at || d.created_at);
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) > 14;
  });
  if (dealsInactifs.length) {
    notifs.push({ type: 'info', icon: '💼', urgence: 'normale', titre: `${dealsInactifs.length} deal(s) sans contact depuis 14j+`, message: dealsInactifs.slice(0, 2).map((d: any) => d.nom).join(', '), action_type: 'deal', lu: false });
  }

  // Factures en retard
  const { data: factures } = await sb.from('factures').select('*').eq('statut', 'en_retard');
  if (factures?.length) {
    const total = factures.reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0);
    notifs.push({ type: 'urgent', icon: '🧾', urgence: 'haute', titre: `${factures.length} facture(s) en retard`, message: `Total : ${total}€`, action_type: 'facture', lu: false });
  }

  // Leads CRM nouveaux
  const { data: leads } = await sb.from('crm_leads').select('*').eq('etape', 'Nouveau');
  if (leads?.length) {
    notifs.push({ type: 'good', icon: '🎯', urgence: 'normale', titre: `${leads.length} nouveau(x) lead(s) CRM`, message: 'À qualifier', action_type: 'crm', lu: false });
  }

  return notifs;
}

export async function GET() {
  const { data: notifs, error } = await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: prefs } = await sb.from('notif_preferences').select('*');

  // Générer les notifs auto depuis données réelles
  const autoNotifs = await genererNotificationsAuto();

  // Compter non lus
  const nonLus = (notifs || []).filter((n: any) => !n.lu).length;

  return NextResponse.json({ notifications: notifs || [], autoNotifs, preferences: prefs || [], nonLus });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'marquer_lu') {
    const { id } = body;
    if (id === 'all') {
      await sb.from('notifications').update({ lu: true }).eq('lu', false);
    } else {
      await sb.from('notifications').update({ lu: true }).eq('id', id);
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'creer') {
    const { type, icon, titre, message, urgence, action_type, action_id, canal } = body;
    const { data, error } = await sb.from('notifications').insert({
      type: type || 'info', icon: icon || '🔔', titre, message,
      urgence: urgence || 'normale', action_type, action_id,
      canal: canal || 'dashboard', lu: false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, notification: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('notifications').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'digest_quotidien') {
    const ownerTel = body.tel || process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'Numéro WhatsApp owner manquant' }, { status: 400 });

    const autoNotifs = await genererNotificationsAuto();
    if (!autoNotifs.length) {
      await sendWhatsApp(ownerTel, 'Xyra - Bonjour ! Tout est a jour aujourd\'hui. Bonne journee.');
      return NextResponse.json({ success: true, nb: 0 });
    }

    const priorites = autoNotifs.filter((n: any) => n.urgence === 'haute').slice(0, 3);
    const msg = `Xyra - Bonjour Curtiss ! Vos 3 priorites du jour :

${priorites.map((n: any, i: number) => `${i + 1}. ${n.titre} - ${n.message}`).join('\n')}

Bonne journee !`;

    try { await sendWhatsApp(ownerTel, msg); } catch (e) { /* non bloquant */ }
    return NextResponse.json({ success: true, nb: priorites.length });
  }

  if (action === 'push_whatsapp') {
    const { tel, titre, message } = body;
    if (!tel) return NextResponse.json({ error: 'Numéro manquant' }, { status: 400 });
    try {
      await sendWhatsApp(tel, `Xyra - ${titre}\n${message}`);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'update_preference') {
    const { type, ...fields } = body;
    await sb.from('notif_preferences').upsert({ type, ...fields });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}