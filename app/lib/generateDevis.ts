export interface DevisData {
  clientName: string
  clientPhone: string
  clientEmail?: string
  service: string
  description: string
  montant: string
  dateDevis: string
  numeroDevis: string
}

export function generateDevisHTML(data: DevisData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #c9a96e; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #1a1a1a; }
    .tagline { font-size: 11px; color: #888; letter-spacing: 1px; margin-top: 4px; }
    .devis-info { text-align: right; }
    .devis-info h2 { font-size: 22px; color: #c9a96e; margin: 0; }
    .devis-info p { margin: 4px 0; font-size: 13px; color: #555; }
    .client-section { background: #f9f7f4; padding: 20px; border-radius: 4px; margin-bottom: 30px; }
    .client-section h3 { color: #c9a96e; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; }
    .client-section p { margin: 4px 0; font-size: 14px; }
    .service-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .service-table th { background: #1a1a1a; color: #c9a96e; padding: 12px 15px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
    .service-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    .service-table tr:last-child td { border-bottom: none; }
    .total-section { text-align: right; margin-bottom: 40px; }
    .total-box { display: inline-block; background: #1a1a1a; color: white; padding: 15px 30px; border-radius: 4px; }
    .total-box .label { font-size: 12px; color: #c9a96e; letter-spacing: 1px; text-transform: uppercase; }
    .total-box .amount { font-size: 24px; font-weight: bold; margin-top: 4px; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; text-align: center; }
    .validity { background: #fff9f0; border-left: 3px solid #c9a96e; padding: 12px 15px; margin-bottom: 30px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">TYMELESS</div>
      <div class="tagline">L'excellence du service sur mesure</div>
    </div>
    <div class="devis-info">
      <h2>DEVIS</h2>
      <p>N° ${data.numeroDevis}</p>
      <p>Date : ${data.dateDevis}</p>
    </div>
  </div>

  <div class="client-section">
    <h3>Client</h3>
    <p><strong>${data.clientName || 'À compléter'}</strong></p>
    <p>📱 ${data.clientPhone}</p>
    ${data.clientEmail ? `<p>✉️ ${data.clientEmail}</p>` : ''}
  </div>

  <table class="service-table">
    <thead>
      <tr>
        <th>Service</th>
        <th>Description</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${data.service}</strong></td>
        <td>${data.description}</td>
        <td><strong>${data.montant}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="label">Total TTC</div>
      <div class="amount">${data.montant}</div>
    </div>
  </div>

  <div class="validity">
    ⏳ Ce devis est valable 30 jours à compter de sa date d'émission.
  </div>

  <div class="footer">
    <p>Tymeless — conciergerie@tymeless.fr — tymeless.fr</p>
    <p>Paris, France | Disponible 24h/24, 7j/7</p>
  </div>
</body>
</html>
  `
}