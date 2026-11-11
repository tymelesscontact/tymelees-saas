import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { montantValide } from '../../lib/walletValidation';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// Numero suivant d'une serie (FA = facture, AV = avoir) pour l'annee en cours : plus grand numero existant + 1.
// Un index unique (tenant_id, numero) garantit qu'aucun doublon ne peut etre enregistre.
async function numeroSuivant(tenantId: string, prefixe: 'FA' | 'AV'): Promise<string> {
  const annee = new Date().getFullYear();
  const { data } = await sb.from('factures').select('numero').eq('tenant_id', tenantId).like('numero', `${prefixe}-${annee}-%`);
  let max = 0;
  for (const r of (data || [])) { const n = parseInt(String(r.numero).split('-')[2] || '0', 10); if (n > max) max = n; }
  return `${prefixe}-${annee}-${String(max + 1).padStart(4, '0')}`;
}

async function genererPdfFacture(facture: any): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const nomEntreprise = facture.tenant_snapshot?.societe || 'Xyra';
  const logoUrl = facture.tenant_snapshot?.logo_url;
  let logoBuffer: Buffer | null = null;
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl);
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.error('Logo facture, telechargement echoue:', e);
    }
  }

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, 45, { height: 30 });
      } catch (e) {
        console.error('Logo facture, rendu echoue:', e);
        doc.fontSize(24).fillColor('#C9A84C').text(nomEntreprise, 50, 50);
      }
    } else {
      doc.fontSize(24).fillColor('#C9A84C').text(nomEntreprise, 50, 50);
    }
    // Mentions obligatoires (art. 242 nonies A ann. II CGI, art. L441-9 et L441-10 code de commerce)
    const ts = facture.tenant_snapshot || {};
    const dateFr = (d: any) => { if (!d) return ''; const x = new Date(d); return isNaN(x.getTime()) ? String(d) : x.toLocaleDateString('fr-FR'); };
    const vendeur = [
      [ts.adresse, [ts.code_postal, ts.ville].filter(Boolean).join(' '), ts.pays && ts.pays !== 'France' ? ts.pays : ''].filter(Boolean).join(', '),
      [ts.forme_juridique, ts.capital_social ? `au capital de ${ts.capital_social} €` : ''].filter(Boolean).join(' '),
      [ts.siren ? `SIREN ${ts.siren}` : '', ts.siret ? `SIRET ${ts.siret}` : '', ts.rcs_ville ? `RCS ${ts.rcs_ville}` : ''].filter(Boolean).join(' · '),
      ts.tva_intracommunautaire ? `TVA intracommunautaire ${ts.tva_intracommunautaire}` : '',
      [ts.telephone_entreprise, ts.email].filter(Boolean).join(' · '),
    ].filter(Boolean);
    doc.fontSize(8).fillColor('#666666');
    vendeur.forEach((ligne, i) => doc.text(ligne, 300, 50 + i * 11, { width: 245, align: 'right' }));

    doc.fontSize(10).fillColor('#888888')
      .text(`${facture.type_document === 'avoir' ? 'AVOIR' : 'Facture'} n° ${facture.numero}`, 50, 110)
      .text(`Date d'émission : ${dateFr(facture.date_emission || facture.created_at) || new Date().toLocaleDateString('fr-FR')}`, 50, 124)
      .text(`Date d'échéance : ${dateFr(facture.date_echeance) || 'à réception'}`, 50, 138);
    doc.fontSize(10).fillColor('#333333')
      .text('Facturé à :', 300, 110, { width: 245, align: 'right' })
      .text(`${facture.client_nom}${facture.siren ? ' · SIREN ' + facture.siren : ''}`, 300, 124, { width: 245, align: 'right' });
    if (facture.client_adresse) doc.fontSize(9).fillColor('#666666').text(facture.client_adresse, 300, 138, { width: 245, align: 'right' });
    if (facture.client_email) doc.fontSize(9).fillColor('#666666').text(facture.client_email, 300, facture.client_adresse ? 150 : 138, { width: 245, align: 'right' });

    doc.moveTo(50, 165).lineTo(545, 165).strokeColor('#dddddd').stroke();

    doc.fontSize(11).fillColor('#111111')
      .text('Description', 50, 180)
      .text('Montant HT', 420, 180, { width: 125, align: 'right' });

    doc.fontSize(11).fillColor('#333333')
      .text(facture.description || 'Prestation de services', 50, 205, { width: 360 })
      .text(`${Number(facture.montant_ht).toFixed(2)} €`, 420, 205, { width: 125, align: 'right' });

    const tauxTva = Number(facture.taux_tva);
    doc.text(`TVA (${facture.taux_tva}%)`, 50, 235)
      .text(`${Number(facture.montant_tva).toFixed(2)} €`, 420, 235, { width: 125, align: 'right' });
    if (tauxTva === 0) doc.fontSize(9).fillColor('#666666').text('TVA non applicable, art. 293 B du CGI', 50, 250);

    doc.moveTo(50, 268).lineTo(545, 268).strokeColor('#dddddd').stroke();

    doc.fontSize(16).fillColor('#C9A84C')
      .text(`Total TTC : ${Number(facture.montant_ttc).toFixed(2)} €`, 50, 282, { width: 495, align: 'right' });

    // Conditions de paiement (pas pour un avoir)
    const pro = facture.type_client !== 'particulier';
    const conditions = facture.type_document === 'avoir' ? ['Cet avoir annule la facture indiquée dans la désignation ; il vient en déduction des sommes dues.'] : [
      `Paiement à effectuer au plus tard le ${dateFr(facture.date_echeance) || 'jour de réception'}. Pas d'escompte pour paiement anticipé.`,
      pro ? "En cas de retard de paiement : pénalités au taux de 3 fois le taux d'intérêt légal, exigibles dès le lendemain de l'échéance, et indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 du code de commerce)." : '',
    ].filter(Boolean);
    doc.fontSize(8).fillColor('#666666');
    let y = 680;
    for (const c of conditions) { doc.text(c, 50, y, { width: 495 }); y += 22; }

    doc.fontSize(8).fillColor('#999999')
      .text(`${nomEntreprise}${ts.siren ? ' — SIREN ' + ts.siren : ''}`, 50, 760, { width: 495, align: 'center' });

    doc.end();
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // Le vrai PDF (celui envoye au client), pour l'apercu a l'ecran
  if (action === 'pdf') {
    const tenantId = await getTenantIdFromRequest(req);
    const id = searchParams.get('id') || '';
    if (!tenantId || !UUID_RE.test(id)) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: facture } = await sb.from('factures').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    const pdf = await genererPdfFacture(facture);
    return new NextResponse(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${facture.numero}.pdf"` } });
  }

  if (action === 'list') {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) return NextResponse.json({ factures: [] });
    const companyId = searchParams.get('company_id');
    let query = sb.from('factures').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(200);
    if (companyId && UUID_RE.test(companyId)) query = query.or(`company_id.eq.${companyId},company_id.is.null`);
    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ factures: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantIdPost = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (['creer', 'envoyer_paiement', 'marquer_payee', 'relancer'].includes(action)) {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!(await estAutoriseGererEquipe(req, tenantIdPost))) {
      // Seule exception : la facture automatique de fin de mission, declenchee par
      // api/planning-missions quand un salarie passe sa mission en "termine".
      // Mission du tenant, terminee, devis lie, pas encore facture ; montant relu en base.
      let factureFinMission = false;
      if (action === 'creer' && body.mission_id && body.devis_id) {
        const { data: missionFin } = await sb.from('missions').select('id,devis_id,statut,client_nom,client_email,client_tel')
          .eq('id', body.mission_id).eq('tenant_id', tenantIdPost).maybeSingle();
        if (missionFin && missionFin.statut === 'termine' && missionFin.devis_id === body.devis_id) {
          const { data: dejaFacturee } = await sb.from('factures').select('id')
            .eq('tenant_id', tenantIdPost).eq('devis_id', body.devis_id).limit(1).maybeSingle();
          const { data: devisFin } = await sb.from('devis').select('*')
            .eq('id', body.devis_id).eq('tenant_id', tenantIdPost).maybeSingle();
          if (!dejaFacturee && devisFin) {
            // Montant, TVA et client relus en base : rien ne vient du navigateur du salarie
            body.montant_ht = devisFin.montant;
            body.taux_tva = devisFin.taux_tva ?? undefined;
            body.client_nom = missionFin.client_nom || devisFin.client_nom || body.client_nom;
            body.client_email = missionFin.client_email || devisFin.client_email || null;
            body.client_tel = missionFin.client_tel || devisFin.client_tel || null;
            factureFinMission = true;
          }
        }
      }
      if (!factureFinMission) {
        return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
      }
    }
  }

  // ── CRÉER UNE FACTURE ───────────────────────────────────────
  if (action === 'creer') {
    const { client_nom, client_email, client_tel, siren, type_client, description, montant_ht, taux_tva, devis_id, client_adresse } = body;
    if (!client_nom || !montant_ht) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const tenantIdCreer = await getTenantIdFromRequest(req);
    if (!tenantIdCreer) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    // Facture automatique de fin de mission : jamais deux fois pour le meme devis (admin compris)
    if (body.mission_id && devis_id) {
      const { data: dejaFactureeMission } = await sb.from('factures').select('id')
        .eq('tenant_id', tenantIdCreer).eq('devis_id', devis_id).limit(1).maybeSingle();
      if (dejaFactureeMission) return NextResponse.json({ success: true, deja_facturee: true, facture_id: dejaFactureeMission.id });
    }
    let numero = await numeroSuivant(tenantIdCreer, 'FA');

    const montantHT = montantValide(montant_ht);
    if (montantHT === null) return NextResponse.json({ error: 'Montant HT invalide' }, { status: 400 });
    const tauxTVA = Number(taux_tva ?? 20);
    if (!Number.isFinite(tauxTVA) || tauxTVA < 0 || tauxTVA > 100) {
      return NextResponse.json({ error: 'Taux de TVA invalide' }, { status: 400 });
    }
    const montantTVA = Math.round(montantHT * tauxTVA) / 100;
    const montantTTC = montantHT + montantTVA;

    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30);

    const statutDgfip = type_client === 'administration' ? 'a_transmettre' : 'non_applicable';

    const tenantId = await getTenantIdFromRequest(req);
    const { data: tenantRow } = await sb
      .from('tenants')
      .select('societe,logo_url,adresse,ville,code_postal,pays,telephone_entreprise,email,site_web,couleur_primaire,tva_intracommunautaire,siret,siren,forme_juridique,capital_social,rcs_ville')
      .eq('id', tenantId)
      .maybeSingle();
    const tenantSnapshot = tenantRow ? {
      societe: tenantRow.societe,
      logo_url: tenantRow.logo_url,
      adresse: tenantRow.adresse,
      ville: tenantRow.ville,
      code_postal: tenantRow.code_postal,
      pays: tenantRow.pays,
      telephone_entreprise: tenantRow.telephone_entreprise,
      email: tenantRow.email,
      site_web: tenantRow.site_web,
      couleur_primaire: tenantRow.couleur_primaire,
      tva_intracommunautaire: tenantRow.tva_intracommunautaire,
      siret: tenantRow.siret,
      siren: tenantRow.siren,
      forme_juridique: tenantRow.forme_juridique,
      capital_social: tenantRow.capital_social,
      rcs_ville: tenantRow.rcs_ville,
    } : null;

    // Si un devis d'origine est fourni, on ne le relie que s'il appartient bien
    // au meme tenant (sinon, quelqu'un pourrait rattacher une facture a un
    // devis d'un autre tenant en forgeant l'id).
    let devisIdValide: string | null = null;
    if (devis_id) {
      const { data: devisCheck } = await sb.from('devis').select('id').eq('id', devis_id).eq('tenant_id', tenantId).maybeSingle();
      devisIdValide = devisCheck?.id || null;
    }

    const ligneFacture: any = {
      numero,
      tenant_id: tenantId,
      type_document: 'facture',
      client_adresse: typeof client_adresse === 'string' && client_adresse.trim() ? client_adresse.trim().slice(0, 300) : null,
      tenant_snapshot: tenantSnapshot,
      devis_id: devisIdValide,
      client_nom,
      client_email: client_email || null,
      client_tel: client_tel || null,
      siren: siren || null,
      type_client: type_client || 'entreprise',
      description: description || '',
      montant_ht: montantHT,
      taux_tva: tauxTVA,
      montant_tva: montantTVA,
      montant_ttc: montantTTC,
      statut: 'émise',
      statut_dgfip: statutDgfip,
      date_echeance: echeance.toISOString().split('T')[0],
      // Rattachee a la societe active, sinon invisible dans la liste filtree par societe
      company_id: (typeof body.company_id === 'string' && UUID_RE.test(body.company_id)) ? body.company_id : null,
    };
    // Deux creations simultanees : le numero deja pris est refuse par la base, on prend le suivant
    let row: any = null; let error: any = null;
    for (let essai = 0; essai < 3; essai++) {
      ({ data: row, error } = await sb.from('factures').insert(ligneFacture).select().single());
      if (!error || error.code !== '23505') break;
      ligneFacture.numero = numero = await numeroSuivant(tenantId as string, 'FA');
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, facture: row });
  }

  // Un avoir ou une facture annulee ne se paie pas et ne se relance pas
  if (['envoyer_paiement', 'marquer_payee', 'relancer'].includes(action) && tenantIdPost && body.id) {
    const { data: cible } = await sb.from('factures').select('type_document,statut').eq('id', body.id).eq('tenant_id', tenantIdPost).maybeSingle();
    if (cible?.type_document === 'avoir') return NextResponse.json({ error: 'Action impossible sur un avoir' }, { status: 409 });
    if (cible?.statut === 'annulée') return NextResponse.json({ error: 'Facture annulée par un avoir' }, { status: 409 });
  }

  // ── AVOIR : annule une facture emise (une facture ne se supprime jamais) ──
  if (action === 'avoir') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!(await estAutoriseGererEquipe(req, tenantIdPost))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    const motif = String(body.motif || '').trim().slice(0, 300);
    const { data: origine } = await sb.from('factures').select('*').eq('id', id).eq('tenant_id', tenantIdPost).maybeSingle();
    if (!origine) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    if (origine.type_document === 'avoir') return NextResponse.json({ error: 'Un avoir ne peut pas être annulé par un avoir' }, { status: 400 });
    const { data: dejaAvoir } = await sb.from('factures').select('numero').eq('tenant_id', tenantIdPost).eq('facture_origine_id', id).limit(1).maybeSingle();
    if (dejaAvoir) return NextResponse.json({ error: `Cette facture est déjà annulée par l'avoir ${dejaAvoir.numero}` }, { status: 409 });
    const ligneAvoir: any = {
      numero: await numeroSuivant(tenantIdPost, 'AV'),
      tenant_id: tenantIdPost, type_document: 'avoir', facture_origine_id: origine.id,
      tenant_snapshot: origine.tenant_snapshot, company_id: origine.company_id || null,
      client_nom: origine.client_nom, client_email: origine.client_email, client_tel: origine.client_tel,
      client_adresse: origine.client_adresse || null, siren: origine.siren, type_client: origine.type_client,
      description: `Avoir sur la facture ${origine.numero}${motif ? ' — ' + motif : ''}`,
      montant_ht: -Math.abs(Number(origine.montant_ht)), taux_tva: origine.taux_tva,
      montant_tva: -Math.abs(Number(origine.montant_tva)), montant_ttc: -Math.abs(Number(origine.montant_ttc)),
      statut: 'émise', statut_dgfip: origine.statut_dgfip, date_echeance: new Date().toISOString().split('T')[0],
    };
    let avoir: any = null; let errAv: any = null;
    for (let essai = 0; essai < 3; essai++) {
      ({ data: avoir, error: errAv } = await sb.from('factures').insert(ligneAvoir).select().single());
      if (!errAv || errAv.code !== '23505') break;
      ligneAvoir.numero = await numeroSuivant(tenantIdPost, 'AV');
    }
    if (errAv) return NextResponse.json({ error: errAv.message }, { status: 500 });
    await sb.from('factures').update({ statut: 'annulée' }).eq('id', origine.id).eq('tenant_id', tenantIdPost);
    return NextResponse.json({ success: true, avoir });
  }

  // ── GÉNÉRER + ENVOYER LE LIEN DE PAIEMENT STRIPE ────────────
  if (action === 'envoyer_paiement') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    const { data: facture, error: ferr } = await sb.from('factures').select('*').eq('id', id).eq('tenant_id', tenantIdPost).maybeSingle();
    if (ferr || !facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

    let paymentUrl: string | null = null;
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: facture.client_email || undefined,
        metadata: { type: 'facture_payment', facture_id: facture.id },
        line_items: [{
          price_data: {
            currency: 'eur',
            // Stripe refuse une chaine vide pour "description" (meme bug corrige dans le Wallet) : une
            // facture sans description faisait toujours echouer la creation du lien de paiement.
            product_data: facture.description ? { name: `Facture ${facture.numero}`, description: facture.description } : { name: `Facture ${facture.numero}` },
            unit_amount: Math.round(Number(facture.montant_ttc) * 100),
          },
          quantity: 1,
        }],
        success_url: `${req.nextUrl.origin}/dashboard?facture=success`,
        cancel_url: `${req.nextUrl.origin}/dashboard?facture=cancelled`,
      });

      paymentUrl = session.url;
      await sb.from('factures').update({ stripe_session_id: session.id, stripe_payment_url: session.url }).eq('id', id);
    } catch (e: any) {
      console.error('Stripe error:', e);
      return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 });
    }

    if (facture.client_email) {
      try {
        const pdfBuffer = await genererPdfFacture(facture);
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: facture.client_email,
          subject: `Facture ${facture.numero} — ${facture.montant_ttc}€`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${facture.client_nom},</p><p>Voici votre facture ${facture.numero} d'un montant de <strong>${facture.montant_ttc}€</strong>, en pièce jointe.</p><p><a href="${paymentUrl}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer ${facture.montant_ttc}€</a></p></div>`,
          attachments: [{ filename: `Facture-${facture.numero}.pdf`, content: pdfBuffer.toString('base64') }],
        });
      } catch (e) { console.error('Email error:', e); }
    }
    if (facture.client_tel) {
      try {
        await envoyerWhatsApp(facture.client_tel, `Bonjour ${facture.client_nom},\n\nVotre facture ${facture.numero} (${facture.montant_ttc}€) est disponible.\nPayer ici : ${paymentUrl}\n\nMerci 🙏`, tenantIdPost);
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    return NextResponse.json({ success: true, paymentUrl });
  }

  // ── MARQUER PAYÉE MANUELLEMENT (chèque, espèces, virement reçu) ─
  if (action === 'marquer_payee') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    const { data: factureMaj, error } = await sb.from('factures').update({ statut: 'payée' }).eq('id', id).eq('tenant_id', tenantIdPost).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (factureMaj) {
      try {
        await sb.from('notifications').insert({
          tenant_id: tenantIdPost, type: 'facture', icon: '💰', urgence: 'normale',
          titre: `Facture payee : ${factureMaj.client_nom || 'client'}`, message: `${factureMaj.montant_ttc || 0}€ — ${factureMaj.numero || ''}`,
          action_type: 'facture', action_id: factureMaj.id, lu: false, traite: false,
        });
      } catch (e) { /* non bloquant */ }
    }
    return NextResponse.json({ success: true });
  }

  // ── RELANCER UNE FACTURE IMPAYÉE ─────────────────────────────
  if (action === 'relancer') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { id } = body;
    const { data: facture, error: ferr } = await sb.from('factures').select('*').eq('id', id).eq('tenant_id', tenantIdPost).maybeSingle();
    if (ferr || !facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

    const lien = facture.stripe_payment_url || '';
    let envoye = false;
    let raisonEchec = '';
    if (facture.client_email) {
      try {
        const pdfBuffer = await genererPdfFacture(facture);
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: erreurRelance } = await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: facture.client_email,
          subject: `Rappel — Facture ${facture.numero} en attente de paiement`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${facture.client_nom},</p><p>Petit rappel : votre facture ${facture.numero} d'un montant de <strong>${facture.montant_ttc}€</strong> est toujours en attente de paiement (facture jointe).</p>${lien ? `<p><a href="${lien}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer maintenant</a></p>` : ''}</div>`,
          attachments: [{ filename: `Facture-${facture.numero}.pdf`, content: pdfBuffer.toString('base64') }],
        });
        if (erreurRelance) { console.error('Email error:', erreurRelance.message); raisonEchec = 'email refusé : ' + erreurRelance.message; }
        else envoye = true;
      } catch (e: any) { console.error('Email error:', e); raisonEchec = 'email : ' + (e?.message || 'erreur'); }
    }
    if (facture.client_tel) {
      try {
        const envoiWa = await envoyerWhatsApp(facture.client_tel, `Bonjour ${facture.client_nom}, petit rappel pour votre facture ${facture.numero} (${facture.montant_ttc}€) toujours en attente.${lien ? `\nPayer : ${lien}` : ''}`, tenantIdPost);
        if (envoiWa?.ok) envoye = true;
        else if (!raisonEchec) raisonEchec = 'WhatsApp indisponible et pas d\'email client';
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    if (!facture.client_email && !facture.client_tel) raisonEchec = 'aucun email ni téléphone client sur la facture';
    // "En retard" seulement si l'echeance est vraiment depassee (et la facture pas payee)
    const aujourdhui = new Date().toISOString().split('T')[0];
    if (facture.date_echeance && facture.date_echeance < aujourdhui && !['payée', 'payee'].includes(facture.statut)) {
      await sb.from('factures').update({ statut: 'en_retard' }).eq('id', id).eq('tenant_id', tenantIdPost);
    }
    return NextResponse.json({ success: true, envoye, raison: envoye ? undefined : (raisonEchec || 'envoi impossible') });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
