import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { envoyerWhatsApp } from '../../lib/whatsapp';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, "deals");
  if (!acces.ok) return acces.reponse;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ deals: [], partenaires: [], clients: [], etapes: [], caPipeline: 0, caGagne: 0, dealsInactifs: [] });
  let dealsQuery = sb.from('deals').select('*').eq('tenant_id', tenantId).order('updated_at', { ascending: false });
  if (companyId && UUID_RE.test(companyId)) dealsQuery = dealsQuery.eq('company_id', companyId);
  const { data: deals, error } = await dealsQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const idsDeals = (deals || []).map((d: { id: string }) => d.id);
  const { data: timeline } = idsDeals.length
    ? await sb.from('deals_timeline').select('*').in('deal_id', idsDeals).order('created_at', { ascending: false })
    : { data: [] };
  const { data: partenaires } = await sb.from('partenaires').select('id,nom,commission,email,tel').eq('tenant_id', tenantId).order('nom');
  const { data: clients } = await sb.from('clients').select('nom,email').eq('tenant_id', tenantId).order('nom');

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
  const acces = await verifierAccesModule(req, "deals");
  if (!acces.ok) return acces.reponse;
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  if (action === 'creer') {
    const { nom, valeur, prob, etape, client, email, tel, dead, source, desc, partenaire_id, commission_pct } = body;
    if (!nom) return NextResponse.json({ error: 'Nom du deal requis' }, { status: 400 });

    // Vérification doublon client
    if (client) {
      const { data: clientExist } = await sb.from('clients').select('id,nom').eq('tenant_id', tenantId).ilike('nom', `%${client}%`).limit(1);
      if (clientExist?.length) {
        return NextResponse.json({ success: false, doublon: true, message: `${client} est déjà un client Xyra. Créer un devis plutôt ?`, client: clientExist[0] });
      }
    }

    // Récupérer taux commission partenaire si associé
    let commissionPct = Number(commission_pct) || 0;
    let partenaireNom = '';
    if (partenaire_id) {
      const { data: p } = await sb.from('partenaires').select('nom,commission').eq('id', partenaire_id).eq('tenant_id', tenantId).maybeSingle();
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
      tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Ajouter entrée timeline
    await sb.from('deals_timeline').insert({ deal_id: data.id, type: 'creation', description: `Deal créé — ${etape || 'Identification'}` });
    return NextResponse.json({ success: true, deal: data });
  }

  if (action === 'modifier') {
    const { id } = body;
    // L'etat de reference est celui de la base, jamais celui envoye par le navigateur.
    const { data: avant } = await sb.from('deals').select('etape,valeur,commission_pct').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!avant) return NextResponse.json({ error: 'Deal introuvable' }, { status: 404 });
    const oldEtape = avant.etape;

    const CHAMPS_MODIFIABLES = ['nom', 'valeur', 'prob', 'etape', 'client', 'email', 'tel', 'dead', 'source', 'desc', 'partenaire_id', 'commission_pct', 'dernierContact', 'company_id'];
    const fields: Record<string, unknown> = {};
    for (const champ of CHAMPS_MODIFIABLES) if (body[champ] !== undefined) fields[champ] = body[champ];
    fields.updated_at = new Date().toISOString();
    if (fields.dernierContact === undefined) fields.dernierContact = new Date().toISOString().split('T')[0];

    // Recalculer commission si valeur ou partenaire change
    if (fields.valeur !== undefined || fields.commission_pct !== undefined) {
      const valeur = fields.valeur ?? avant.valeur ?? 0;
      const pct = fields.commission_pct ?? avant.commission_pct ?? 0;
      fields.commission_montant = Math.round(Number(valeur) * Number(pct) / 100);
    }

    const { error } = await sb.from('deals').update(fields).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Si passage en "Gagné" → créer transaction commission dans Wallet (une seule fois par deal)
    if (fields.etape === 'Gagné' && oldEtape !== 'Gagné') {
      const { data: deal } = await sb.from('deals').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
      const { data: commissionExistante } = await sb.from('wallet_transactions').select('id')
        .eq('ref', `DEAL-COMM-${id}`).eq('tenant_id', tenantId).limit(1).maybeSingle();
      if (deal?.partenaire_id && deal?.commission_montant > 0 && !commissionExistante) {
        await sb.from('wallet_transactions').insert({
          type: 'commission', libelle: `Commission deal "${deal.nom}" — ${deal.partenaire_nom}`,
          montant: deal.commission_montant, devise: 'EUR', methode: 'sepa',
          statut: 'à_virer', ref: `DEAL-COMM-${id}`,
          destinataire_nom: deal.partenaire_nom,
          tenant_id: tenantId || null,
        });
        await sb.from('notifications').insert({
          type: 'money', icon: '💰', urgence: 'haute',
          titre: `Commission à virer — ${deal.partenaire_nom}`,
          message: `Deal "${deal.nom}" gagné — commission : ${deal.commission_montant}€`,
          action_type: 'commission', lu: false,
          tenant_id: tenantId || null,
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
    const { data: dealCible } = await sb.from('deals').select('id').eq('id', deal_id).eq('tenant_id', tenantId).maybeSingle();
    if (!dealCible) return NextResponse.json({ error: 'Deal introuvable' }, { status: 404 });
    const { data, error } = await sb.from('deals_timeline').insert({ deal_id, type, description, operateur: 'Curtiss' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, entree: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('deals').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'relance_ia') {
    if (!body.deal?.id) return NextResponse.json({ error: 'Deal manquant' }, { status: 400 });
    // Donnees du prompt relues en base (le deal doit appartenir a l'entreprise).
    const { data: deal } = await sb.from('deals').select('*').eq('id', body.deal.id).eq('tenant_id', tenantId).maybeSingle();
    if (!deal) return NextResponse.json({ error: 'Deal introuvable' }, { status: 404 });
    const dernier = deal.dernierContact ? new Date(deal.dernierContact) : new Date(deal.updated_at || deal.created_at);
    deal.joursInactif = Math.floor((Date.now() - dernier.getTime()) / (1000 * 60 * 60 * 24));
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
    const { message, canal } = body;
    if (!body.deal?.id) return NextResponse.json({ error: 'Deal manquant' }, { status: 400 });
    // Destinataire relu en base : on ne relaie jamais vers un numero/email fourni par le navigateur.
    const { data: deal } = await sb.from('deals').select('id,nom,tel,email').eq('id', body.deal.id).eq('tenant_id', tenantId).maybeSingle();
    if (!deal) return NextResponse.json({ error: 'Deal introuvable' }, { status: 404 });
    try {
      if (canal === 'whatsapp' && deal.tel) await envoyerWhatsApp(deal.tel, message, tenantId);
      if (canal === 'email' && deal.email) await sendEmail(deal.email, `Suivi — ${deal.nom}`, `<p>${message.replace(/\n/g, '<br>')}</p>`);
      await sb.from('deals_timeline').insert({ deal_id: deal.id, type: 'relance', description: `Relance envoyée par ${canal}`, operateur: 'Curtiss' });
      await sb.from('deals').update({ dernierContact: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }).eq('id', deal.id).eq('tenant_id', tenantId);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'set_objectif') {
    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { objectif_ca } = body;
    // Stocke par tenant (onConflict tenant_id) -- avant, 'owner' etait ecrit
    // en dur pour tout le monde, donc tous les tenants s'ecrasaient l'un
    // l'autre sur la meme ligne.
    await sb.from('parametres').upsert({ tenant_id: tenantId, objectif_ca_deals: objectif_ca }, { onConflict: 'tenant_id' });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}