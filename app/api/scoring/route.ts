import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function askClaude(prompt: string, maxTokens = 400) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), text: { body: message.replace(/[^\x00-\xFF]/g, '') } }),
  });
}

function getSentiment(note: number): string {
  if (note >= 4) return 'positif';
  if (note === 3) return 'neutre';
  return 'négatif';
}

function getNPSCategorie(score: number): string {
  if (score >= 9) return 'promoteur';
  if (score >= 7) return 'passif';
  return 'détracteur';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const action = searchParams.get('action') || 'all';
  const tenantId = await getTenantIdFromRequest(req);

  let avisQuery = sb.from('avis').select('*').order('date_avis', { ascending: false });
  let npsQuery = sb.from('nps_reponses').select('*').order('created_at', { ascending: false });
  let csatQuery = sb.from('csat_reponses').select('*').order('created_at', { ascending: false });

  if (tenantId) {
    avisQuery = avisQuery.eq("tenant_id", tenantId);
    npsQuery = npsQuery.eq("tenant_id", tenantId);
    csatQuery = csatQuery.eq("tenant_id", tenantId);
  }
  if (companyId) {
    avisQuery = avisQuery.eq('company_id', companyId);
    npsQuery = npsQuery.eq('company_id', companyId);
    csatQuery = csatQuery.eq('company_id', companyId);
  }

  const [avisRes, npsRes, csatRes] = await Promise.all([avisQuery, npsQuery, csatQuery]);
  const avis = avisRes.data || [];
  const nps = npsRes.data || [];
  const csat = csatRes.data || [];

  // Calculs NPS
  const promoteurs = nps.filter(r => r.categorie === 'promoteur').length;
  const detracteurs = nps.filter(r => r.categorie === 'détracteur').length;
  const npsScore = nps.length > 0 ? Math.round(((promoteurs - detracteurs) / nps.length) * 100) : 0;

  // Calculs CSAT
  const csatScore = csat.length > 0 ? Math.round(csat.reduce((a, r) => a + r.score, 0) / csat.length * 20) : 0;

  // Note Google moyenne
  const avisGoogle = avis.filter(a => a.google);
  const noteGoogle = avisGoogle.length > 0 ? Math.round(avisGoogle.reduce((a, r) => a + r.note, 0) / avisGoogle.length * 10) / 10 : 0;

  // Note globale
  const noteMoyenne = avis.length > 0 ? Math.round(avis.reduce((a, r) => a + r.note, 0) / avis.length * 10) / 10 : 0;

  // Taux de réponse
  const avisAvecReponse = avis.filter(a => a.statut === 'répondu' || a.reponse_ia).length;
  const tauxReponse = avis.length > 0 ? Math.round(avisAvecReponse / avis.length * 100) : 0;

  // Score réputation global 0-100
  const scoreReputation = Math.round(
    (noteMoyenne / 5 * 40) +
    (Math.max(0, npsScore + 100) / 200 * 30) +
    (csatScore / 100 * 20) +
    (tauxReponse / 100 * 10)
  );

  // Analyse sentiment
  const sentiments = { positif: 0, neutre: 0, négatif: 0 };
  avis.forEach(a => { sentiments[a.sentiment as keyof typeof sentiments]++; });

  return NextResponse.json({
    avis, nps, csat,
    npsScore, csatScore, noteGoogle, noteMoyenne, tauxReponse, scoreReputation,
    promoteurs, detracteurs, passifs: nps.length - promoteurs - detracteurs,
    sentiments, totalAvis: avis.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'ajouter_avis') {
    const { client_nom, note, commentaire, service, source, google, company_id } = body;
    const sentiment = getSentiment(Number(note));
    const { data, error } = await sb.from('avis').insert({
      client_nom, note: Number(note), commentaire, service,
      source: source || 'direct', google: google || false,
      sentiment, statut: 'nouveau', company_id,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Alerte WhatsApp si avis négatif
    if (Number(note) <= 2 && process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra ALERTE AVIS NEGATIF : ${client_nom} a laisse ${note}/5 etoiles pour ${service||'votre service'}. Commentaire : "${(commentaire||'').slice(0,100)}". Repondez rapidement !`);
    }
    return NextResponse.json({ success: true, avis: data });
  }

  if (action === 'repondre_ia') {
    const { avis_id, client_nom, note, commentaire, service, secteur, company_id } = body;
    try {
      const prompt = `Tu es le responsable d'une entreprise de services premium (${secteur || 'services'}).
Rédige une réponse professionnelle et chaleureuse à cet avis client (3-4 phrases, français, adapté au secteur) :
Client : ${client_nom} | Note : ${note}/5 | Service : ${service} | Avis : "${commentaire}"

${Number(note) <= 2 ? "C'est un avis négatif : sois empathique, excuse-toi sincèrement, propose une solution concrète et invite à te recontacter en privé." : Number(note) === 3 ? "C'est un avis mitigé : remercie, reconnais les axes d'amélioration, montre ton engagement." : "C'est un avis positif : remercie sincèrement, personnalise la réponse au service mentionné, invite à revenir."}
Commence par "Bonjour ${client_nom},"`;

      const reponse = await askClaude(prompt, 300);
      await sb.from('avis').update({ reponse_ia: reponse, statut: 'répondu' }).eq('id', avis_id);
      return NextResponse.json({ success: true, reponse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'ajouter_nps') {
    const { client_nom, client_email, score, commentaire, company_id } = body;
    const categorie = getNPSCategorie(Number(score));
    await sb.from('nps_reponses').insert({ client_nom, client_email, score: Number(score), commentaire, categorie, company_id });

    // Routage intelligent
    if (Number(score) >= 9 && process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra NPS : ${client_nom} vous donne 9+/10 ! Invitez-le a laisser un avis Google maintenant.`);
    } else if (Number(score) <= 6 && process.env.OWNER_WHATSAPP) {
      await sendWhatsApp(process.env.OWNER_WHATSAPP, `Xyra NPS DETRACTEUR : ${client_nom} donne ${score}/10. Contactez-le rapidement en prive pour resoudre le probleme.`);
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_csat') {
    const { client_nom, service, score, commentaire, company_id } = body;
    await sb.from('csat_reponses').insert({ client_nom, service, score: Number(score), commentaire, company_id });
    return NextResponse.json({ success: true });
  }

  if (action === 'demander_avis_whatsapp') {
    const { client_tel, client_nom, service } = body;
    if (!client_tel) return NextResponse.json({ error: 'Numéro requis' }, { status: 400 });
    await sendWhatsApp(client_tel, `Bonjour ${client_nom}, merci d'avoir fait appel a nos services pour ${service||'votre prestation'}. Votre avis compte beaucoup pour nous ! Notez-nous sur Google en 1 minute : https://g.page/r/xyra/review`);
    return NextResponse.json({ success: true });
  }

  if (action === 'analyse_concurrentielle') {
    const { secteur, note_actuelle, nb_avis } = body;
    try {
      const analyse = await askClaude(`Tu es expert en réputation d'entreprise. Pour une entreprise de ${secteur} avec ${note_actuelle}/5 (${nb_avis} avis), donne une analyse concurrentielle rapide (3 phrases, français) : position sur le marché, benchmark sectoriel, 1 action prioritaire pour améliorer la réputation.`, 250);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'rapport_reputation_whatsapp') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const { scoreReputation, noteGoogle, npsScore, csatScore, totalAvis, tauxReponse } = body;
    try {
      const prompt = `Génère un rapport réputation WhatsApp (5 lignes max, français, emojis) :
Score réputation : ${scoreReputation}/100 | Note Google : ${noteGoogle}/5 | NPS : ${npsScore} | CSAT : ${csatScore}% | Avis total : ${totalAvis} | Taux réponse : ${tauxReponse}%
Commence par "Rapport Réputation Xyra —" et donne 1 point fort et 1 priorité.`;
      const message = await askClaude(prompt, 200);
      await sendWhatsApp(ownerTel, message);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}