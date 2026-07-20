import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient()

  const statutConnexion = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)

  const tenantId = await getTenantIdFromRequest(req)
  let qConv = sb.from("conduit").select("*")
  let qDevis = sb.from("devis").select("*")
  if (tenantId) { qConv = qConv.eq("tenant_id", tenantId); qDevis = qDevis.eq("tenant_id", tenantId); }
  const { data: conversations } = await qConv
  const { data: devisGeneres } = await qDevis

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
