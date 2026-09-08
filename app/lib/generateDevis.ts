export interface DevisData {
  clientName: string
  clientPhone: string
  clientEmail?: string
  clientAdresse?: string
  service: string
  description: string
  montant: string | number
  dateDevis: string
  dateExpiration?: string
  numeroDevis: string
  lignes?: { desc?: string; qte?: number; pu?: number; tva?: number }[]
  tauxTva?: number
  tenant?: {
    societe?: string | null
    logoUrl?: string | null
    email?: string | null
    siteWeb?: string | null
    adresse?: string | null
    ville?: string | null
    codePostal?: string | null
    pays?: string | null
    telephone?: string | null
    siret?: string | null
    siren?: string | null
    formeJuridique?: string | null
    capitalSocial?: string | null
    rcsVille?: string | null
    tvaIntracommunautaire?: string | null
  }
}

function echap(valeur: unknown): string {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateDevisHTML(data: DevisData): string {
  const nomEntreprise = data.tenant?.societe || 'Xyra'
  const emailContact = data.tenant?.email || ''
  const siteWeb = data.tenant?.siteWeb || ''
  const adresseEntreprise = [data.tenant?.adresse, data.tenant?.codePostal, data.tenant?.ville, data.tenant?.pays]
    .filter(Boolean).join(', ')
  const logoHtml = data.tenant?.logoUrl
    ? `<img src="${echap(data.tenant.logoUrl)}" alt="${echap(nomEntreprise)}" style="max-height:48px;margin-bottom:4px;" />`
    : `<div class="logo">${echap(nomEntreprise)}</div>`

  // Mentions legales de l'emetteur : SIRET/SIREN/forme juridique/capital
  // social/RCS/TVA intracommunautaire, quand elles sont renseignees.
  const mentionsLegales = [
    data.tenant?.formeJuridique,
    data.tenant?.capitalSocial ? `Capital social ${data.tenant.capitalSocial}` : null,
    data.tenant?.siret ? `SIRET ${data.tenant.siret}` : (data.tenant?.siren ? `SIREN ${data.tenant.siren}` : null),
    data.tenant?.rcsVille ? `RCS ${data.tenant.rcsVille}` : null,
    data.tenant?.tvaIntracommunautaire ? `TVA intracom. ${data.tenant.tvaIntracommunautaire}` : null,
  ].filter(Boolean).join(' — ')

  // Detail des lignes : on utilise le detail reel (quantite/prix unitaire/TVA
  // par ligne) quand il existe. A defaut (anciens devis sans detail), on
  // retombe sur une ligne unique service + montant global, TVA moyenne.
  const tauxTvaDefaut = data.tauxTva ?? 20
  const lignesSource = (data.lignes && data.lignes.length > 0)
    ? data.lignes
    : [{ desc: data.service, qte: 1, pu: Number(data.montant) / (1 + tauxTvaDefaut / 100), tva: tauxTvaDefaut }]

  let totalHT = 0
  let totalTVA = 0
  const lignesHtml = lignesSource.map((l) => {
    const qte = Number(l.qte) || 1
    const pu = Number(l.pu) || 0
    const tva = l.tva !== undefined && l.tva !== null ? Number(l.tva) : tauxTvaDefaut
    const totalLigneHT = qte * pu
    totalHT += totalLigneHT
    totalTVA += totalLigneHT * (tva / 100)
    return `<tr>
        <td>${echap(l.desc || 'Prestation')}</td>
        <td style="text-align:center;">${qte}</td>
        <td style="text-align:right;">${pu.toFixed(2)} €</td>
        <td style="text-align:right;">${tva}%</td>
        <td style="text-align:right;">${totalLigneHT.toFixed(2)} €</td>
      </tr>`
  }).join('')
  const totalTTC = totalHT + totalTVA

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #c9a96e; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #1a1a1a; }
    .emetteur-mentions { font-size: 10px; color: #999; margin-top: 6px; max-width: 320px; }
    .devis-info { text-align: right; }
    .devis-info h2 { font-size: 22px; color: #c9a96e; margin: 0; }
    .devis-info p { margin: 4px 0; font-size: 13px; color: #555; }
    .client-section { background: #f9f7f4; padding: 20px; border-radius: 4px; margin-bottom: 24px; }
    .client-section h3 { color: #c9a96e; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; }
    .client-section p { margin: 4px 0; font-size: 14px; }
    .service-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .service-table th { background: #1a1a1a; color: #c9a96e; padding: 12px 15px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
    .service-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    .service-table tr:last-child td { border-bottom: none; }
    .totaux { width: 260px; margin-left: auto; margin-bottom: 30px; font-size: 13px; }
    .totaux div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .totaux .ttc { font-weight: bold; font-size: 18px; color: #c9a96e; border-bottom: none; padding-top: 10px; }
    .footer { border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #888; text-align: center; line-height: 1.6; }
    .validity { background: #fff9f0; border-left: 3px solid #c9a96e; padding: 12px 15px; margin-bottom: 20px; font-size: 13px; }
    .cgv { font-size: 10px; color: #999; margin-bottom: 20px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${logoHtml}
      ${adresseEntreprise ? `<div class="emetteur-mentions">${echap(adresseEntreprise)}</div>` : ''}
      ${mentionsLegales ? `<div class="emetteur-mentions">${echap(mentionsLegales)}</div>` : ''}
      ${emailContact || siteWeb ? `<div class="emetteur-mentions">${echap([emailContact, siteWeb].filter(Boolean).join(' — '))}</div>` : ''}
    </div>
    <div class="devis-info">
      <h2>DEVIS</h2>
      <p>N° ${echap(data.numeroDevis)}</p>
      <p>Date : ${echap(data.dateDevis)}</p>
    </div>
  </div>

  <div class="client-section">
    <h3>Client</h3>
    <p><strong>${echap(data.clientName || 'À compléter')}</strong></p>
    ${data.clientAdresse ? `<p>${echap(data.clientAdresse)}</p>` : ''}
    ${data.clientPhone ? `<p>${echap(data.clientPhone)}</p>` : ''}
    ${data.clientEmail ? `<p>${echap(data.clientEmail)}</p>` : ''}
  </div>

  <table class="service-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center;">Qté</th>
        <th style="text-align:right;">PU HT</th>
        <th style="text-align:right;">TVA</th>
        <th style="text-align:right;">Total HT</th>
      </tr>
    </thead>
    <tbody>${lignesHtml}</tbody>
  </table>

  <div class="totaux">
    <div><span>Total HT</span><span>${totalHT.toFixed(2)} €</span></div>
    <div><span>TVA</span><span>${totalTVA.toFixed(2)} €</span></div>
    <div class="ttc"><span>Total TTC</span><span>${totalTTC.toFixed(2)} €</span></div>
  </div>

  <div class="validity">
    Ce devis est valable jusqu'au ${echap(data.dateExpiration || '')}. Une fois signé électroniquement par le client, il vaut bon de commande et engage les deux parties.
  </div>

  <div class="cgv">
    Conditions générales : règlement intégral à réception de facture, selon les moyens de paiement indiqués sur celle-ci. Tout retard de paiement entraîne de plein droit l'application de pénalités calculées au taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (article L441-10 du Code de commerce). Aucun escompte n'est accordé pour paiement anticipé.
  </div>

  <div class="footer">
    <p>${echap(nomEntreprise)}${emailContact ? ' — ' + echap(emailContact) : ''}${siteWeb ? ' — ' + echap(siteWeb) : ''}</p>
  </div>
</body>
</html>
  `
}
