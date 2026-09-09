import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
async function sendEmail(to: string, subject: string, html: string, attachments?: { filename: string; content: string }[]) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Xyra <contrats@xyraio.fr>', to, subject, html, attachments }),
    });
    const responseBody = await res.text();
    if (!res.ok) {
      console.error('Resend error:', res.status, responseBody);
      return { ok: false, status: res.status, body: responseBody };
    }
    return { ok: true, status: res.status, body: responseBody };
  } catch (e: any) {
    console.error('Email exception:', e);
    return { ok: false, error: e.message };
  }
}

// PDF du document signe + certificat de signature electronique (qui a signe,
// quand, avec quelle IP, empreinte du document) -- PDFKit, deja utilise pour
// devis/factures, aucune nouvelle dependance.
async function genererPdfContrat(contrat: any, tenantInfo: { societe?: string | null; logo_url?: string | null } | null): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const nomEntreprise = tenantInfo?.societe || 'Xyra';
  let logoBuffer: Buffer | null = null;
  if (tenantInfo?.logo_url) {
    try {
      const res = await fetch(tenantInfo.logo_url);
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.error('Logo contrat, telechargement echoue:', e);
    }
  }

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    if (logoBuffer) {
      try { doc.image(logoBuffer, 50, 45, { height: 30 }); }
      catch (e) { doc.fontSize(18).fillColor('#C9A84C').text(nomEntreprise, 50, 50); }
    } else {
      doc.fontSize(18).fillColor('#C9A84C').text(nomEntreprise, 50, 50);
    }
    doc.fontSize(9).fillColor('#888888')
      .text(`Reference ${contrat.reference}`, 50, 85)
      .text(`Document : ${contrat.titre}`, 50, 98);
    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#dddddd').stroke();

    doc.fontSize(11).fillColor('#111111').text(contrat.contenu_final || '', 50, 140, { width: 495, align: 'left' });

    // Certificat de signature electronique -- sur une nouvelle page pour
    // rester clairement separe du contenu contractuel lui-meme.
    doc.addPage();
    doc.fontSize(16).fillColor('#C9A84C').text('CERTIFICAT DE SIGNATURE ELECTRONIQUE', 50, 50, { width: 495 });
    doc.moveTo(50, 80).lineTo(545, 80).strokeColor('#dddddd').stroke();

    const ligne = (label: string, valeur: string, y: number) => {
      doc.fontSize(9).fillColor('#888888').text(label, 50, y);
      doc.fontSize(11).fillColor('#111111').text(valeur || '—', 200, y, { width: 345 });
    };
    let y = 100;
    ligne('Document', contrat.titre || '', y); y += 24;
    ligne('Reference', contrat.reference || '', y); y += 24;
    ligne('Signe par', `${contrat.signature_nom_tape || contrat.signataire_nom || ''} (${contrat.signataire_email || ''})`, y); y += 24;
    ligne('Role', contrat.signataire_role || '', y); y += 24;
    ligne('Verification du code effectuee le', contrat.code_verifie_a ? new Date(contrat.code_verifie_a).toLocaleString('fr-FR') : '', y); y += 24;
    ligne('Signature electronique le', contrat.signe_a ? new Date(contrat.signe_a).toLocaleString('fr-FR') : '', y); y += 24;
    ligne('Adresse IP du signataire', contrat.signature_ip || '', y); y += 24;
    doc.fontSize(9).fillColor('#888888').text('Empreinte du document (SHA-256)', 50, y); y += 14;
    doc.fontSize(8).fillColor('#333333').font('Courier').text(contrat.document_hash || '', 50, y, { width: 495 }); doc.font('Helvetica');
    y += 40;

    doc.fontSize(8).fillColor('#999999').text(
      "Cette empreinte est calculee a partir du contenu exact du document, du nom tape par le signataire et de l'horodatage de signature. Toute modification ulterieure du contenu produirait une empreinte differente, ce qui permet de detecter une alteration.",
      50, y, { width: 495 }
    );

    doc.end();
  });
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'contrats';
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q: any) {
    q = q.eq('tenant_id', tenantId);
    if (companyId && UUID_RE.test(companyId)) q = q.eq('company_id', companyId);
    return q;
  }
  if (!tenantId) return NextResponse.json({ modeles: [], contrats: [] });
  if (action === 'modeles') {
    // Les modeles du tenant + la bibliotheque generique fournie par la
    // plateforme (tenant_id null) -- jamais les modeles d'un autre tenant.
    const { data } = await sb.from('contrats_modeles')
      .select('*')
      .eq('actif', true)
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .order('nom');
    return NextResponse.json({ modeles: data || [] });
  }
  if (action === 'contrats') {
    const { data } = await scoped(sb.from('contrats').select('*').order('created_at', { ascending: false }));
    return NextResponse.json({ contrats: data || [] });
  }
  if (action === 'pdf') {
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    const { data } = await sb.from('contrats').select('reference,document_pdf_base64').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!data?.document_pdf_base64) return NextResponse.json({ error: 'Document non disponible' }, { status: 404 });
    const pdfBytes = Buffer.from(data.document_pdf_base64, 'base64');
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Document-signe-${data.reference}.pdf"`,
      },
    });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'generer') {
    const { modele_id, titre, source_type, source_id, variables, company_id, signataire_nom, signataire_email, signataire_role } = body;
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { data: modele } = await sb.from('contrats_modeles').select('*').eq('id', modele_id).eq('tenant_id', tenantId).maybeSingle();
    if (!modele) return NextResponse.json({ success: false, error: 'Modele introuvable' }, { status: 404 });
    let contenu = modele.contenu;
    for (const [cle, valeur] of Object.entries(variables || {})) {
      contenu = contenu.split(`{{${cle}}}`).join(String(valeur));
    }
    const reference = `CTR-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await sb.from('contrats').insert({
      tenant_id: tenantId, company_id, modele_id, titre: titre || modele.nom, type: modele.type,
      source_type, source_id, contenu_final: contenu, variables,
      signataire_nom, signataire_email, signataire_role,
      statut: 'brouillon', reference, nom_membre: signataire_nom,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, contrat: data });
  }
  if (action === 'envoyer') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { id, message_perso, email_copie } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!contrat) return NextResponse.json({ success: false, error: 'Contrat introuvable' }, { status: 404 });
    const lien_token = crypto.randomBytes(24).toString('hex');
    const code_verification = String(Math.floor(100000 + Math.random() * 900000));
    const lien_expire_le = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from('contrats').update({ lien_token, code_verification, statut: 'envoye', tentatives_code: 0, lien_expire_le }).eq('id', id);
    const lien = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr'}/signature/${lien_token}`;
    const messageBloc = message_perso ? `<p>${message_perso}</p>` : '';
    const r1 = await sendEmail(contrat.signataire_email, `Document a signer - ${contrat.titre}`,
      `<p>Bonjour ${contrat.signataire_nom},</p>${messageBloc}<p>Un document est pret pour votre signature electronique.</p><p><a href="${lien}">Consulter et signer le document</a></p><p>Votre code de verification vous sera demande sur la page de signature.</p>`);
    const r2 = await sendEmail(contrat.signataire_email, `Votre code de verification - ${contrat.titre}`,
      `<p>Votre code de verification pour signer le document : <strong>${code_verification}</strong></p>`);
    if (email_copie) {
      await sendEmail(email_copie, `Copie — Document envoye pour signature - ${contrat.titre}`,
        `<p>Copie pour information : le document "${contrat.titre}" a ete envoye a ${contrat.signataire_nom} (${contrat.signataire_email}) pour signature electronique.</p>`);
    }
    return NextResponse.json({ success: true, lien });
  }
  if (action === 'verifier_code') {
    const { lien_token, code } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('lien_token', lien_token).single();
    if (!contrat) return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    if (contrat.lien_expire_le && new Date(contrat.lien_expire_le) < new Date()) {
      return NextResponse.json({ success: false, error: 'Ce lien a expire — demandez un nouvel envoi du document' }, { status: 410 });
    }
    if ((contrat.tentatives_code || 0) >= 5) {
      return NextResponse.json({ success: false, error: 'Trop de tentatives — demandez un nouvel envoi du document' }, { status: 429 });
    }
    if (contrat.code_verification !== code) {
      await sb.from('contrats').update({ tentatives_code: (contrat.tentatives_code || 0) + 1 }).eq('id', contrat.id);
      return NextResponse.json({ success: false, error: 'Code incorrect' }, { status: 400 });
    }
    await sb.from('contrats').update({ code_verifie_a: new Date().toISOString() }).eq('id', contrat.id);
    let branding = { logo_url: null, couleur_primaire: '#C9A84C', couleur_secondaire: '#0A0A16', couleur_accent: '#2EC9B0', societe: 'Xyra' };
    if (contrat.tenant_id) {
      const { data: t } = await sb.from('tenants').select('societe,logo_url,couleur_primaire,couleur_secondaire,couleur_accent').eq('id', contrat.tenant_id).single();
      if (t) branding = { logo_url: t.logo_url, couleur_primaire: t.couleur_primaire || '#C9A84C', couleur_secondaire: t.couleur_secondaire || '#0A0A16', couleur_accent: t.couleur_accent || '#2EC9B0', societe: t.societe };
    }
    return NextResponse.json({ success: true, contrat: { titre: contrat.titre, contenu_final: contrat.contenu_final, signataire_nom: contrat.signataire_nom, statut: contrat.statut }, branding });
  }
  if (action === 'signer') {
    const { lien_token, nom_tape } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('lien_token', lien_token).single();
    if (!contrat) return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    if (contrat.lien_expire_le && new Date(contrat.lien_expire_le) < new Date()) {
      return NextResponse.json({ success: false, error: 'Ce lien a expire — demandez un nouvel envoi du document' }, { status: 410 });
    }
    if (!contrat.code_verifie_a) return NextResponse.json({ success: false, error: 'Verification requise avant signature' }, { status: 403 });
    if (contrat.statut === 'signe') return NextResponse.json({ success: false, error: 'Document deja signe' }, { status: 400 });
    const ip = req.headers.get('x-forwarded-for') || 'inconnue';
    const signeA = new Date().toISOString();
    const hash = crypto.createHash('sha256').update(contrat.contenu_final + nom_tape + signeA).digest('hex');
    await sb.from('contrats').update({
      statut: 'signe', signe_a: signeA, signature_ip: ip,
      signature_nom_tape: nom_tape, document_hash: hash,
    }).eq('id', contrat.id);
    const dateSignature = new Date(signeA).toLocaleString('fr-FR');
    const preuve = `<p>Document : <strong>${contrat.titre}</strong></p><p>Signe par : ${nom_tape} (${contrat.signataire_email})</p><p>Date : ${dateSignature}</p><p>Adresse IP : ${ip}</p><p>Empreinte du document : ${hash}</p>`;

    let tenantInfo: { societe?: string | null; logo_url?: string | null; email?: string | null } | null = null;
    if (contrat.tenant_id) {
      const { data: t } = await sb.from('tenants').select('societe,logo_url,email').eq('id', contrat.tenant_id).single();
      tenantInfo = t || null;
    }
    let pdfAttachments: { filename: string; content: string }[] | undefined;
    try {
      const pdfBuffer = await genererPdfContrat(
        { ...contrat, signe_a: signeA, signature_ip: ip, signature_nom_tape: nom_tape, document_hash: hash },
        tenantInfo
      );
      const pdfBase64 = pdfBuffer.toString('base64');
      await sb.from('contrats').update({ document_pdf_base64: pdfBase64 }).eq('id', contrat.id);
      pdfAttachments = [{ filename: `Document-signe-${contrat.reference}.pdf`, content: pdfBase64 }];
    } catch (e) {
      console.error('Generation PDF contrat echouee:', e);
    }

    await sendEmail(contrat.signataire_email, `Confirmation de signature - ${contrat.titre}`, `<p>Bonjour ${contrat.signataire_nom},</p><p>Votre signature electronique a bien ete enregistree.</p>${preuve}`, pdfAttachments);
    if (contrat.tenant_id) {
      if (tenantInfo?.email) {
        await sendEmail(tenantInfo.email, `Document signe - ${contrat.titre}`, `<p>Le document a ete signe electroniquement.</p>${preuve}`, pdfAttachments);
      }
      try {
        await sb.from('notifications').insert({
          tenant_id: contrat.tenant_id, type: 'contrat', icon: '📝', urgence: 'normale',
          titre: `Contrat signe : ${contrat.titre}`, message: `Signe par ${nom_tape}`,
          action_type: 'contrat', action_id: contrat.id, lu: false, traite: false,
        });
      } catch (e) { /* non bloquant */ }
    }
    return NextResponse.json({ success: true });
  }
  if (action === 'annuler') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    const { data: c } = await sb.from('contrats').select('statut').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!c) return NextResponse.json({ success: false, error: 'Contrat introuvable' }, { status: 404 });
    if (c.statut === 'signe') return NextResponse.json({ success: false, error: 'Impossible d annuler un contrat deja signe' }, { status: 400 });
    const { error } = await sb.from('contrats').update({ statut: 'annule' }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  // ── CRÉER UN MODÈLE DE CONTRAT ────────────────────────────
  if (action === 'creer_modele') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { nom, type, pays, contenu, champs_requis } = body;
    if (!nom || !String(nom).trim()) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    if (!contenu || !String(contenu).trim()) return NextResponse.json({ success: false, error: 'Contenu requis' }, { status: 400 });
    const { data, error } = await sb.from('contrats_modeles').insert({
      tenant_id: tenantId,
      nom: String(nom).trim(),
      type: type ? String(type).trim() : 'generique',
      pays: pays || 'FR',
      contenu: String(contenu),
      champs_requis: Array.isArray(champs_requis) ? champs_requis : [],
      actif: true,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, modele: data });
  }

  // ── MODIFIER UN MODÈLE DE CONTRAT ─────────────────────────
  if (action === 'modifier_modele') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { id, nom, type, pays, contenu, champs_requis, actif } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id manquant' }, { status: 400 });
    const champsMaj: any = {};
    if (nom !== undefined) champsMaj.nom = String(nom).trim();
    if (type !== undefined) champsMaj.type = type;
    if (pays !== undefined) champsMaj.pays = pays;
    if (contenu !== undefined) champsMaj.contenu = String(contenu);
    if (champs_requis !== undefined) champsMaj.champs_requis = Array.isArray(champs_requis) ? champs_requis : [];
    if (actif !== undefined) champsMaj.actif = !!actif;
    const { data, error } = await sb.from('contrats_modeles').update(champsMaj).eq('id', id).eq('tenant_id', tenantId).select().maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ success: false, error: 'Modele introuvable' }, { status: 404 });
    return NextResponse.json({ success: true, modele: data });
  }

  // ── DUPLIQUER UN MODÈLE (generique -> copie propre au tenant) ─
  if (action === 'dupliquer_modele') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id manquant' }, { status: 400 });
    // On ne duplique que ce que ce tenant a le droit de voir : le sien, ou
    // un modele generique (tenant_id null) -- jamais celui d'un autre tenant.
    const { data: source } = await sb.from('contrats_modeles').select('nom,type,pays,contenu,champs_requis').eq('id', id).or(`tenant_id.eq.${tenantId},tenant_id.is.null`).maybeSingle();
    if (!source) return NextResponse.json({ success: false, error: 'Modele introuvable' }, { status: 404 });
    const { data, error } = await sb.from('contrats_modeles').insert({
      tenant_id: tenantId,
      nom: source.nom + ' (copie)',
      type: source.type,
      pays: source.pays,
      contenu: source.contenu,
      champs_requis: source.champs_requis,
      actif: true,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, modele: data });
  }

  // ── SUPPRIMER UN MODÈLE DE CONTRAT ────────────────────────
  if (action === 'supprimer_modele') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id manquant' }, { status: 400 });
    // Un modele deja utilise par un vrai contrat n'est jamais supprime (ca
    // casserait l'historique) -- il est simplement desactive, il disparait
    // de la liste proposee mais les contrats existants restent intacts.
    const { data: enUsage } = await sb.from('contrats').select('id').eq('modele_id', id).eq('tenant_id', tenantId).limit(1);
    if (enUsage && enUsage.length > 0) {
      const { error } = await sb.from('contrats_modeles').update({ actif: false }).eq('id', id).eq('tenant_id', tenantId);
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, desactive: true });
    }
    const { error } = await sb.from('contrats_modeles').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
