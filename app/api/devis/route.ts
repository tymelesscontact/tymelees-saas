export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateDevisHTML } from "../../lib/generateDevis"

type DevisData = {
  clientName: string
  clientPhone: string
  clientEmail?: string
  service: string
  description: string
  montant: number | string
  dateDevis: string
  numeroDevis: string
}

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env manquantes")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
    const OWNER_PHONE = process.env.OWNER_PHONE

    const body = await req.json()

    const {
      clientPhone,
      service,
      description,
      montant,
      clientName,
      clientEmail,
    } = body

    const numeroDevis = `TYM-${Date.now().toString().slice(-6)}`
    const dateDevis = new Date().toLocaleDateString("fr-FR")

    const devisData: DevisData = {
      clientName: clientName || "Client",
      clientPhone,
      clientEmail,
      service,
      description,
      montant,
      dateDevis,
      numeroDevis,
    }

    const htmlContent = generateDevisHTML(devisData)

    const { error: insertError } = await supabase.from("devis").insert({
      numero: numeroDevis,
      client_phone: clientPhone,
      client_name: clientName || "Client",
      client_email: clientEmail || null,
      service,
      description,
      montant,
      statut: "en_attente",
      html: htmlContent,
      date_devis: dateDevis,
    })

    if (insertError) {
      console.error("Erreur insertion Supabase:", insertError)
      return NextResponse.json(
        { success: false, error: "Erreur enregistrement devis" },
        { status: 500 }
      )
    }

    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID && OWNER_PHONE) {
      const messageOwner =
        `📄 *Nouveau devis à valider*\n\n` +
        `N° ${numeroDevis}\n` +
        `👤 Client : ${clientName || clientPhone}\n` +
        `📁 Service : ${service}\n` +
        `💰 Montant : ${montant}\n` +
        `📝 ${description}\n\n` +
        `Répondez *OUI ${numeroDevis}* pour envoyer au client\n` +
        `Répondez *NON ${numeroDevis}* pour annuler`

      await fetch(
        `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: OWNER_PHONE,
            text: { body: messageOwner },
          }),
        }
      )
    }

    return NextResponse.json({
      success: true,
      numeroDevis,
    })
  } catch (error) {
    console.error("Erreur API /api/devis:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 }
    )
  }
}