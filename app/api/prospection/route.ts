import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json()

    if (action === 'call') {
      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: params.phoneNumberId,
          customer: {
            number: params.tel,
            name: params.nom,
          },
          assistantId: params.assistantId,
          assistantOverrides: {
            variableValues: {
              nom_prospect: params.nom,
              societe: params.societe,
              secteur: params.secteur,
              service: params.service || '',
              nom_commercial: params.nom_commercial || 'Xyra',
            }
          }
        }),
      })
      const data = await response.json()
      return NextResponse.json({ success: true, call: data })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (error: any) {
    console.error('Prospection API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'calls' || action === 'assistants') {
    try {
      const response = await fetch(`https://api.vapi.ai/${action === 'calls' ? 'call?limit=50' : 'assistant'}`, {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      })
      const data = await response.json()
      return NextResponse.json({ success: true, [action]: data })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const sb = getAdminClient()

  const statutConnexion = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)

  const tenantId = await getTenantIdFromRequest(req)
  let conversations: any[] = []
  let devisGeneres: any[] = []
  if (tenantId) {
    const { data: conv } = await sb.from("conduit").select("*").eq("tenant_id", tenantId)
    const { data: dev } = await sb.from("devis").select("*").eq("tenant_id", tenantId)
    conversations = conv || []
    devisGeneres = dev || []
  }

  const totalConversations = conversations?.length || 0

  let totalMessagesClient = 0
  let totalMessagesLea = 0
  conversations?.forEach((c: any) => {
    try {
      const hist = c.historique ? JSON.parse(c.historique) : []
      hist.forEach((m: any) => {
        if (m.role === "user") totalMessagesClient++
        if (m.role === "assistant") totalMessagesLea++
      })
    } catch {}
  })

  const tauxReponse = totalMessagesClient > 0 ? Math.round((totalMessagesLea / totalMessagesClient) * 100) : 0

  const devisViaWhatsapp = (devisGeneres || []).filter((d: any) => d.client_tel)
  const devisAcceptes = devisViaWhatsapp.filter((d: any) => d.statut === "envoyé" || d.statut === "accepté")
  const montantTotal = devisViaWhatsapp.reduce((sum: number, d: any) => sum + (d.montant || 0), 0)

  const maintenant = Date.now()
  const conversationsEnAttente = (conversations || []).filter((c: any) => {
    try {
      const hist = c.historique ? JSON.parse(c.historique) : []
      const dernier = hist[hist.length - 1]
      return dernier?.role === "user" && !c.ia_pausee
    } catch {
      return false
    }
  })

  return NextResponse.json({
    statutConnexion,
    totalConversations,
    conversationsEnAttente: conversationsEnAttente.length,
    tauxReponse,
    devisGeneres: devisViaWhatsapp.length,
    devisAcceptes: devisAcceptes.length,
    montantTotal,
  })
}
