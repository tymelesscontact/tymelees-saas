import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

async function sendWhatsApp(to: string, message: string) {
  await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: message },
    }),
  })
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient()
  const { data, error } = await sb
    .from("conduit")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const conversations = (data || []).map((c: any) => {
    let historique = []
    try {
      historique = c.historique ? JSON.parse(c.historique) : []
    } catch {
      historique = []
    }
    return { ...c, historique }
  })

  return NextResponse.json({ conversations })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, whatsapp, message, messageIndex } = body
  const sb = getAdminClient()

  if (action === "envoyer") {
    if (!whatsapp || !message) {
      return NextResponse.json({ success: false, error: "whatsapp et message requis" }, { status: 400 })
    }
    try {
      await sendWhatsApp(whatsapp, message)
    } catch (e) {
      return NextResponse.json({ success: false, error: "Erreur envoi WhatsApp" }, { status: 500 })
    }
    const { data: existing } = await sb.from("conduit").select("historique").eq("whatsapp", whatsapp).single()
    let historique = []
    try {
      historique = existing?.historique ? JSON.parse(existing.historique) : []
    } catch {
      historique = []
    }
    historique.push({ role: "owner", content: message })
    await sb.from("conduit").update({ historique: JSON.stringify(historique), ia_pausee: true }).eq("whatsapp", whatsapp)
    return NextResponse.json({ success: true })
  }

  if (action === "reactiver_ia") {
    if (!whatsapp) {
      return NextResponse.json({ success: false, error: "whatsapp requis" }, { status: 400 })
    }
    await sb.from("conduit").update({ ia_pausee: false }).eq("whatsapp", whatsapp)
    return NextResponse.json({ success: true })
  }

  if (action === "supprimer_message") {
    if (!whatsapp || messageIndex === undefined) {
      return NextResponse.json({ success: false, error: "whatsapp et messageIndex requis" }, { status: 400 })
    }
    const { data: existing } = await sb.from("conduit").select("historique").eq("whatsapp", whatsapp).single()
    let historique = []
    try {
      historique = existing?.historique ? JSON.parse(existing.historique) : []
    } catch {
      historique = []
    }
    historique.splice(messageIndex, 1)
    await sb.from("conduit").update({ historique: JSON.stringify(historique) }).eq("whatsapp", whatsapp)
    return NextResponse.json({ success: true })
  }

  if (action === "supprimer_conversation") {
    if (!whatsapp) {
      return NextResponse.json({ success: false, error: "whatsapp requis" }, { status: 400 })
    }
    await sb.from("conduit").delete().eq("whatsapp", whatsapp)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
}
