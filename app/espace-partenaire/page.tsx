import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

// Client normal (lectures/écritures courantes)
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client admin (clé service_role) — uniquement pour créer/inviter de vrais comptes
// de connexion partenaire. Nécessite la variable d'env SUPABASE_SERVICE_ROLE_KEY.
const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendWhatsApp(to: string, message: string) {
  return fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      text: { body: message },
    }),
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

// Tente de créer un vrai compte de connexion (espace partenaire) pour cet email.
// Retourne l'id utilisateur + le lien d'activation, ou null si ça échoue (non bloquant).
async function creerAccesPortail(email: string): Promise<{ userId: string | null; inviteLink: string | null }> {
  try {
    const { data, error } = await sbAdmin.auth.admin.generateLink({ type: 'invite', email });
    if (error || !data?.user) return { userId: null, inviteLink: null };
    return { userId: data.user.id, inviteLink: (data as any)?.properties?.action_link || null };
  } catch (e) {
    return { userId: null, inviteLink: null };
  }
}

function genererPdfContrat(p: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Contrat de partenariat — Apporteur d\'affaires', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(11).text(`Entre Tymeless (ci-après "Xyra"), représentée par Curtiss — Fondateur Tymeless,`);
    doc.text(`et ${p.nom}${p.adresse ? ', domicilié(e) ' + p.adresse : ''} (ci-après "le Partenaire"),`);
    doc.moveDown(1);
    doc.fontSize(13).text('Conditions du partenariat', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Rôle : ${p.role || 'Apporteur d\'affaires'}`);
    doc.text(`Taux de commission : ${p.commission}%`);
    doc.text(`Date d'entrée en vigueur : ${new Date(p.created_at).toLocaleDateString('fr')}`);
    doc.text(`Durée : indéterminée, résiliable avec préavis de 30 jours`);
    doc.moveDown(1);
    doc.fontSize(13).text('Clauses standards', { underline: true });
    doc.moveDown(0.5);
    const clauses = [
      'Commission versée sous 30 jours après encaissement effectif du client.',
      'Taux de commission fixé contractuellement ci-dessus, révisable annuellement par accord des deux parties.',
      'Un lead est valide si le prospect n\'était pas déjà connu de Xyra depuis plus de 6 mois.',
      'La commission n\'est due que si le contrat est signé ET le paiement encaissé par Xyra.',
      'Résiliation possible par l\'une ou l\'autre des parties avec un préavis écrit de 30 jours.',
    ];
    clauses.forEach((c) => doc.fontSize(10).text(`• ${c}`, { indent: 10 }));
    doc.moveDown(2);
    doc.fontSize(11).text('Fait électroniquement.');
    doc.moveDown(1.5);
    doc.text('Pour Xyra : Curtiss — Fondateur Tymeless');
    doc.moveDown(1);
    doc.text(`Pour le Partenaire : ${p.nom}`);
    doc.end();
  });
}

export async function GET() {
  const { data: parts, error } = await sb.from('partenaires').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: leads } = await sb.from('leads_partenaires').select('*').order('created_at', { ascending: false });
  const { data: docs } = await sb.from('partner_documents').select('*').order('created_at', { ascending: false });
  const { data: msgs } = await sb.from('partner_messages').select('*').order('created_at', { ascending: true });
  const { data: commTx } = await sb.from('wallet_transactions').select('*').eq('type', 'commission');

  const enriched = (parts || []).map((p: any) => {
    // un lead peut avoir été déposé via le dashboard interne (partenaire_id = p.id)
    // ou via l'espace partenaire lui-même (partenaire_id = p.user_id) — on accepte les deux.
    const pLeads = (leads || []).filter((l: any) => l.partenaire_id === p.id || (p.user_id && l.partenaire_id === p.user_id));
    const pDocs = (docs || []).filter((d: any) => d.partenaire_id === p.id);
    const pMsgs = (msgs || []).filter((m: any) => m.partenaire_id === p.id);
    const pTx = (commTx || []).filter((t: any) => t.destinataire_nom === p.nom);

    const leadsMapped = pLeads.map((l: any) => ({
      id: l.id, nom: l.nom, statut: l.statut, ca: Number(l.ca_estime || 0),
      date: l.created_at ? new Date(l.created_at).toLocaleDateString('fr') : '',
    }));

    const ca = leadsMapped.filter((l: any) => l.statut === 'gagné').reduce((a: number, l: any) => a + l.ca, 0);
    const contrats = leadsMapped.filter((l: any) => l.statut === 'gagné').length;
    const commissionTheorique = Math.round(ca * (Number(p.commission) || 0) / 100);
    const commissionEnregistree = pTx.reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    const dues = Math.max(0, commissionTheorique - commissionEnregistree);
    const paye = pTx.filter((t: any) => t.statut === 'viré').reduce((a: number, t: any) => a + Number(t.montant || 0), 0);

    return {
      ...p,
      comm: p.commission, // alias de compatibilité pour le dashboard interne
      ca, contrats, leads: leadsMapped, docs: pDocs, msgs: pMsgs, dues, paye, commissionTheorique,
      accesPortail: !!p.user_id,
    };
  });

  return NextResponse.json({ partenaires: enriched });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, role, comm, email, tel, adresse, rib } = body;
    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });

    const { userId, inviteLink } = await creerAccesPortail(email);

    const insertPayload: any = {
      nom, role: role || "Apporteur d'affaires", commission: Number(comm) || 15, email, tel, adresse, rib,
      user_id: userId,
    };
    if (userId) insertPayload.id = userId; // aligne l'id du partenaire sur son compte de connexion

    const { data, error } = await sb.from('partenaires').insert(insertPayload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('partner_documents').insert({ partenaire_id: data.id, nom: 'Contrat de partenariat', type: 'Contrat', statut: 'envoyé' });

    try {
      const accesHtml = inviteLink
        ? `<p>Votre espace partenaire est prêt : <a href="${inviteLink}">cliquez ici pour créer votre mot de passe et vous connecter</a>.</p>`
        : `<p>Votre accès à l'espace partenaire vous sera envoyé séparément.</p>`;
      await sendEmail(email, 'Bienvenue chez Xyra — Votre partenariat', `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${nom},</p><p>Bienvenue dans le réseau partenaires Xyra ! Votre taux de commission est fixé à <strong>${comm || 15}%</strong>.</p>${accesHtml}</div>`);
      if (tel) await sendWhatsApp(tel, `Bonjour ${nom}, bienvenue chez Xyra ! Votre partenariat est actif avec un taux de commission de ${comm || 15}%. 🤝${inviteLink ? ' Vérifiez vos emails pour activer votre espace partenaire.' : ''}`);
    } catch (e) { /* l'enregistrement réussit même si l'envoi échoue */ }

    return NextResponse.json({ success: true, partenaire: data, accesCree: !!userId });
  }

  // Pour les partenaires créés avant cette mise à jour, sans compte de connexion encore lié.
  if (action === 'inviter_portail') {
    const { id } = body;
    const { data: p, error: errP } = await sb.from('partenaires').select('*').eq('id', id).single();
    if (errP || !p) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    if (p.user_id) return NextResponse.json({ error: 'Ce partenaire a déjà un accès portail' }, { status: 400 });
    if (!p.email) return NextResponse.json({ error: 'Email manquant pour ce partenaire' }, { status: 400 });

    const { userId, inviteLink } = await creerAccesPortail(p.email);
    if (!userId) return NextResponse.json({ error: 'Échec de la création du compte (vérifie SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 });

    await sb.from('partenaires').update({ user_id: userId }).eq('id', id);

    try {
      const accesHtml = inviteLink ? `<p><a href="${inviteLink}">Cliquez ici pour créer votre mot de passe et vous connecter</a>.</p>` : '';
      await sendEmail(p.email, 'Votre espace partenaire Xyra est prêt', `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${p.nom},</p><p>Votre espace partenaire est maintenant prêt.</p>${accesHtml}</div>`);
      if (p.tel) await sendWhatsApp(p.tel, `Bonjour ${p.nom}, votre espace partenaire Xyra est prêt ! Vérifiez vos emails pour vous connecter. 🤝`);
    } catch (e) { /* non bloquant */ }

    return NextResponse.json({ success: true });
  }

  if (action === 'modifier') {
    const { id, ...fields } = body;
    const { error } = await sb.from('partenaires').update(fields).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('partenaires').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_lead') {
    const { partenaire_id, nom, statut, ca } = body;
    if (!partenaire_id || !nom) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const { data: p } = await sb.from('partenaires').select('nom,commission').eq('id', partenaire_id).single();
    const caNum = Number(ca) || 0;
    const commission = Math.round(caNum * (Number(p?.commission) || 0) / 100);
    const { data, error } = await sb.from('leads_partenaires').insert({
      partenaire_id, nom_partenaire: p?.nom || '', nom, statut: statut || 'en cours', ca_estime: caNum, commission,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, lead: data });
  }

  if (action === 'modifier_lead') {
    const { id, ...fields } = body;
    const { error } = await sb.from('leads_partenaires').update(fields).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_document') {
    const { partenaire_id, nom, type, statut } = body;
    if (!partenaire_id || !nom) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const { data, error } = await sb.from('partner_documents').insert({ partenaire_id, nom, type, statut: statut || 'valide' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, document: data });
  }

  if (action === 'payer_commission') {
    const { id } = body;
    const { data: p, error: errP } = await sb.from('partenaires').select('*').eq('id', id).single();
    if (errP || !p) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });

    const { data: leads } = await sb.from('leads_partenaires').select('*');
    const pLeads = (leads || []).filter((l: any) => l.partenaire_id === p.id || (p.user_id && l.partenaire_id === p.user_id));
    const { data: commTx } = await sb.from('wallet_transactions').select('*').eq('type', 'commission').eq('destinataire_nom', p.nom);

    const ca = pLeads.filter((l: any) => l.statut === 'gagné').reduce((a: number, l: any) => a + Number(l.ca_estime || 0), 0);
    const commissionTheorique = Math.round(ca * (Number(p.commission) || 0) / 100);
    const commissionEnregistree = (commTx || []).reduce((a: number, t: any) => a + Number(t.montant || 0), 0);
    const dues = Math.max(0, commissionTheorique - commissionEnregistree);

    if (dues <= 0) return NextResponse.json({ error: 'Aucune commission due pour ce partenaire' }, { status: 400 });

    const { data: tx, error: errTx } = await sb.from('wallet_transactions').insert({
      type: 'commission',
      libelle: `Commission ${p.nom}`,
      montant: dues,
      devise: 'EUR',
      methode: 'sepa',
      statut: 'à_virer',
      ref: `COMM-${Date.now()}`,
      destinataire_nom: p.nom,
      destinataire_iban: p.rib || null,
      destinataire_email: p.email || null,
      destinataire_tel: p.tel || null,
    }).select().single();

    if (errTx) return NextResponse.json({ error: errTx.message }, { status: 500 });
    return NextResponse.json({ success: true, transaction: tx, montant: dues });
  }

  if (action === 'envoyer_message') {
    const { partenaire_id, message, tel, moi } = body;
    if (!partenaire_id || !message) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const estMoi = moi !== false;
    const { data, error } = await sb.from('partner_messages').insert({ partenaire_id, message, moi: estMoi }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    let whatsappEnvoye = false;
    if (estMoi && tel) {
      try { await sendWhatsApp(tel, message); whatsappEnvoye = true; } catch (e) { /* message gardé en interne même si l'envoi échoue */ }
    }
    return NextResponse.json({ success: true, message: data, whatsappEnvoye });
  }

  if (action === 'generer_contrat_pdf') {
    const { id } = body;
    const { data: p, error } = await sb.from('partenaires').select('*').eq('id', id).single();
    if (error || !p) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    const pdfBuffer = await genererPdfContrat(p);
    return NextResponse.json({ success: true, pdfBase64: pdfBuffer.toString('base64'), filename: `Contrat_${p.nom.replace(/\s/g, '_')}.pdf` });
  }

  if (action === 'envoyer_email') {
    const { email, subject, message, partenaire_id } = body;
    if (!email || !message) return NextResponse.json({ error: 'Email et message requis' }, { status: 400 });
    try {
      await sendEmail(email, subject || 'Message de Xyra', `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${message}</div>`);
    } catch (e) {
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }
    if (partenaire_id) await sb.from('partner_messages').insert({ partenaire_id, message: `[Email] ${subject || ''} — ${message}`, moi: true });
    return NextResponse.json({ success: true });
  }

  if (action === 'analyse_ia') {
    const { partenaire } = body;
    if (!partenaire) return NextResponse.json({ error: 'Données partenaire manquantes' }, { status: 400 });
    try {
      const prompt = `Tu es un analyste commercial pour Xyra, une plateforme SaaS B2B. Voici les données réelles d'un partenaire apporteur d'affaires :
Nom : ${partenaire.nom}
Rôle : ${partenaire.role}
Taux de commission : ${partenaire.comm}%
CA apporté (leads gagnés) : ${partenaire.ca}€
Nombre de leads soumis : ${partenaire.leads?.length || 0}
Leads gagnés : ${partenaire.leads?.filter((l: any) => l.statut === 'gagné').length || 0}
Leads en cours : ${partenaire.leads?.filter((l: any) => l.statut === 'en cours' || l.statut === 'proposition').length || 0}
Commission due non réglée : ${partenaire.dues}€
Commission déjà versée : ${partenaire.paye}€

Rédige une analyse courte et concrète (4-6 phrases) en français, avec une recommandation business actionnable pour ce partenaire spécifique. Pas de formules génériques, base-toi sur les chiffres fournis.`;

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const claudeData = await claudeRes.json();
      const analyse = claudeData.content?.[0]?.text || "Analyse indisponible pour le moment.";
      return NextResponse.json({ success: true, analyse });
    } catch (e) {
      return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}