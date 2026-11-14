import { telechargerLogoSecurise } from './urlExterne';

// PDF d'une facture ou d'un avoir (mentions obligatoires incluses). Partage entre l'ecran
// de l'entreprise (/api/factures) et l'espace client (/api/espace-client).
export async function genererPdfFacture(facture: any): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const nomEntreprise = facture.tenant_snapshot?.societe || 'Xyra';
  const logoUrl = facture.tenant_snapshot?.logo_url;
  let logoBuffer: Buffer | null = null;
  if (logoUrl) {
    try {
      logoBuffer = await telechargerLogoSecurise(logoUrl);
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
