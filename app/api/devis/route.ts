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
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
      lignes,
      notes,
      taux_tva,
      statut,
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

    const htmlContent = generateDevisHTML({
  ...devisData,
  montant: String(devisData.montant)
})

    const { error: insertError } = await supabase.from("devis").insert({
      reference: numeroDevis,
      client_tel: clientPhone,
      client_nom: clientName || "Client",
      client_email: clientEmail || null,
      service,
      description,
      montant,
      lignes: lignes || null,
      notes: notes || null,
      taux_tva: taux_tva ?? 20,
      statut: statut || "brouillon",
      html: htmlContent,
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
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, ...champs } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "id manquant" }, { status: 400 })
    }

    const { error } = await supabase.from("devis").update(champs).eq("id", id)

    if (error) {
      console.error("Erreur modification devis:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("PATCH /api/devis error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "id manquant" }, { status: 400 })
    }

    const { error } = await supabase.from("devis").delete().eq("id", id)

    if (error) {
      console.error("Erreur suppression devis:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/devis error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'test_minimal') { return NextResponse.json({ok:true}); }

    if (action === 'test_count') {
      const { data, error } = await supabase.from('devis').select('id')
      return NextResponse.json({ count: data ? data.length : 0, err: error ? error.message : null })
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ devis: data || [] })
    }

    if (action === 'public') {
      const reference = searchParams.get('reference')
      if (!reference) {
        return NextResponse.json({ error: 'reference manquante' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('devis')
        .select('reference,client_nom,client_email,service,description,montant,taux_tva,devise,statut,lignes,notes,created_at')
        .eq('reference', reference)
        .single()
      if (error || !data) {
        return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
      }
      return NextResponse.json({ devis: data })
    }

    return NextResponse.json({ error: 'action invalide' }, { status: 400 })
  } catch (e: any) {
    console.error('GET /api/devis error:', e)
    return NextResponse.json({ error: 'Erreur serveur', debug: String(e && e.message), stack: String(e && e.stack) }, { status: 500 })
  }
}
