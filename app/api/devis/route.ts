export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDevisHTML, DevisData } from '../../lib/generateDevis'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const OWNER_PHONE = process.env.OWNER_PHONE

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientPhone, service, description, montant, clientName, clientEmail } = body

  const numeroDevis = `TYM-${Date.now().toString().slice(-6)}`
  const dateDevis = new Date().toLocaleDateString('fr-FR')

  const devisData: DevisData = {
    clientName: clientName || 'Client',
    clientPhone,
    clientEmail,
    service,
    description,
    montant,
    dateDevis,
    numeroDevis
  }

  const htmlContent = generateDevisHTML(devisData)

  // Sauvegarder le devis dans Supabase
  await supabase.from('devis').insert({
    numero: numeroDevis,
    client_phone: clientPhone,
    client_name: clientName,
    service,
    description,
    montant,
    statut: 'en_attente',
    html: htmlContent
  })

  // Notifier Bénédicte sur WhatsApp
  const messageOwner = `🧾 *Nouveau devis à valider*\n\n` +
    `N° ${numeroDevis}\n` +
    `👤 Client : ${clientName || clientPhone}\n` +
    `📋 Service : ${service}\n` +
    `💰 Montant : ${montant}\n` +
    `📝 ${description}\n\n` +
    `Répondez *OUI ${numeroDevis}* pour envoyer au client\n` +
    `Répondez *NON ${numeroDevis}* pour annuler`

  await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: OWNER_PHONE,
      text: { body: messageOwner }
    })
  })

  return NextResponse.json({ success: true, numeroDevis })
}