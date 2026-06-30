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

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET() {
  const { data: deals, error } = await sb.from('deals').select('*').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: timeline } = await sb.from('deals_timeline').select('*').order('created_at', { ascending: false });
  const { data: partenaires } = await sb.from('partenaires').select('id,nom,commission,email,tel').order('nom');
  const { data: clients } = await sb.from('clients').select('nom,email').order('nom');

  const enriched = (deals || []).map((d: any) => {
    const dealTimeline = (timeline || []).filter((t: any) => t.deal_id === d.id);
    
    // Jours sans contact
    const dernierContact = d.dernierContact ? new Date(d.dernierContact) : new Date(d.updated_at || d.created_at);
    const joursInactif = Math.floor((Date.now() - dernierContact.getTime()) / (1000 * 60 * 60 * 24));
    
    // Score automatique
    let score = 50;
    if (d.prob >= 70) score += 20;
    if (d.valeur >= 5000) score += 15;
    if (joursInactif <= 7) score += 15; else if (joursInactif > 30) score -= 20;
    if (d.etape === 'Négociation' || d.etape === 'Proposition') score += 10;
    score = Math.max(0, Math.min(100, score));

    return { ...d, timeline: dealTimeline, joursInactif, scoreCalcule: score };
  });

  // KPIs
  const etapes = ['Identification', 'Qualification', 'Proposition', 'Négociation', 'Closing', 'Gagné', 'Perdu'];
  const caPipeline = enriched.filter((d: any) => !['Gagné', 'Perdu'].includes(d.etape)).reduce((a: number, d: any) => a + Number(d.valeur || 0) * (d.prob || 50) / 100, 0);
  const caGagne = enriched.filter((d: any) => d.etape === 'Gagné').reduce((a: number, d: any) => a + Number(d.valeur || 0), 0);
  const dealsInactifs = enriched.filter((d: any) => d.joursInactif > 14 && !['Gagné', 'Perdu'].includes(d.etape));

  return NextResponse.json({ deals: enriched, partenaires: partenaires || [], clients: clients || [], etapes, caPipeline, caGagne, dealsInactifs });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, valeur, prob, etape, client, email, tel, dead, source, desc, partenaire_id, commission_pct } = body;
    if (!nom) return NextResponse.json({ error: 'Nom du deal requis' }, { status: 400 });

    // Vérification doublon client
    if (client) {
      const { data: clientExist } = await sb.from('clients').select('id,nom').ilike('nom', `%${client}%`).limit(1);
      if (clientExist?.length) {
        return NextResponse.json({ success: false, doublon: true, message: `${client} est déjà un client Xyra. Créer un devis plutôt ?`, client: clientExist[0] });
      }
    }

    // Récupérer taux commission partenaire si associé
    let commissionPct = Number(commission_pct) || 0;
    let partenaireNom = '';
    if (partenaire_id) {
      const { data: p } = await sb.from('partenaires').select('nom,commission').eq('id', partenaire_id).single();
      if (p) { partenaireNom = p.nom; if (!commissionPct) commissionPct = p.commission || 0; }
    }
    const commissionMontant = Math.round(Number(valeur || 0) * commissionPct / 100);

    const { data, error } = await sb.from('deals').insert({
      nom, valeur: Number(valeur) || 0, prob: Number(prob) || 50,
      etape: etape || 'Identification', client, email, tel,
      dead, source, desc, partenaire_id: partenaire_id || null,
      partenaire_nom: partenaireNom, commission_pct: commissionPct,
      commission_montant: commissionMontant,
      dernierContact: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Ajouter entrée timeline
    await sb.from('deals_timeline').insert({ deal_id: data.id, type: 'creation', description: `Deal créé — ${etape || 'Identification'}` });
    return NextResponse.json({ success: true, deal: data });
  }

  if (action === 'modifier') {
    const { id, ...fields } = body;
    const oldEtape = fields._oldEtape;
    delete fields._oldEtape;
    fields.updated_at = new Date().toISOString();
    if (fields.dernierContact === undefined) fields.dernierContact = new Date().toISOString().split('T')[0];

    // Recalculer commission si valeur ou partenaire change
    if (fields.valeur !== undefined || fields.commission_pct !== undefined) {
      const { data: current } = await sb.from('deals').select('valeur,commission_pct').eq('id', id).single();
      const valeur = fields.valeur ?? current?.valeur ?? 0;
      const pct = fields.commission_pct ?? current?.commission_pct ?? 0;
      fields.commission_montant = Math.round(Number(valeur) * Number(pct) / 100);
    }

    const { error } = await sb.from('deals').update(fields).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Si passage en "Gagné" → créer transaction commission dans Wallet
    if (fields.etape === 'Gagné' && oldEtape !== 'Gagné') {
      const { data: deal } = await sb.from('deals').select('*').eq('id', id).single();
      if (deal?.partenaire_id && deal?.commission_montant > 0) {
        await sb.from('wallet_transactions').insert({
          type: 'commission', libelle: `Commission deal "${deal.nom}" — ${deal.partenaire_nom}`,
          montant: deal.commission_montant, devise: 'EUR', methode: 'sepa',
          statut: 'à_virer', ref: `DEAL-COMM-${Date.now()}`,
          destinataire_nom: deal.partenaire_nom,
        });
        await sb.from('notifications').insert({
          type: 'money', icon: '💰', urgence: 'haute',
          titre: `Commission à virer — ${deal.partenaire_nom}`,
          message: `Deal "${deal.nom}" gagné — commission : ${deal.commission_montant}€`,
          action_type: 'commission', lu: false,
        });
      }
      await sb.from('deals_timeline').insert({ deal_id: id, type: 'gagné', description: `Deal gagné — CA : ${deal?.valeur}€` });
    } else if (fields.etape && fields.etape !== oldEtape) {
      await sb.from('deals_timeline').insert({ deal_id: id, type: 'etape', description: `Étape : ${oldEtape || '?'} → ${fields.etape}` });
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_timeline') {
    const { deal_id, type, description } = body;
    const { data, error } = await sb.from('deals_timeline').insert({ deal_id, type, description, operateur: 'Curtiss' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, entree: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('deals').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'relance_ia') {
    const { deal } = body;
    if (!deal) return NextResponse.json({ error: 'Deal manquant' }, { status: 400 });
    try {
      const prompt = `Tu es commercial chez Xyra. Génère un message de relance personnalisé (WhatsApp ou email) pour ce deal :
Deal : "${deal.nom}"
Client : ${deal.client}
Valeur : ${deal.valeur}€
Étape : ${deal.etape}
Inactif depuis : ${deal.joursInactif} jours
Source : ${deal.source || 'non précisée'}
Notes : ${deal.desc || 'aucune'}

Message court, naturel, non commercial, en français. 3-4 phrases max. Objectif : relancer la conversation sans être insistant.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return NextResponse.json({ success: true, message: data.content?.[0]?.text || '' });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'envoyer_relance') {
    const { deal, message, canal } = body;
    try {
      if (canal === 'whatsapp' && deal.tel) await sendWhatsApp(deal.tel, message);
      if (canal === 'email' && deal.email) await sendEmail(deal.email, `Suivi — ${deal.nom}`, `<p>${message.replace(/\n/g, '<br>')}</p>`);
      await sb.from('deals_timeline').insert({ deal_id: deal.id, type: 'relance', description: `Relance envoyée par ${canal}`, operateur: 'Curtiss' });
      await sb.from('deals').update({ dernierContact: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }).eq('id', deal.id);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'set_objectif') {
    const { objectif_ca } = body;
    // Stocker dans parametres
    await sb.from('parametres').upsert({ user_id: 'owner', objectif_ca_deals: objectif_ca });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}