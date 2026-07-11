import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantsForRequest } from "../../lib/supabaseServer"
import { normaliserPlan } from "../../lib/plans"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const QUOTAS: Record<string, number> = {
  multi_societes: 5,
  multi_societes_pro: 10,
  holding: 999,
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) {
    return NextResponse.json({ success: false, error: "Non connecte" }, { status: 401 })
  }

  const sb = getAdminClient()
  const { data: userData, error: userError } = await sb.auth.getUser(token)
  if (userError || !userData?.user) {
    return NextResponse.json({ success: false, error: "Session invalide" }, { status: 401 })
  }

  const tenants = await getTenantsForRequest(req)
  if (tenants.length === 0) {
    return NextResponse.json({ success: false, error: "Aucune societe existante" }, { status: 400 })
  }

  const planActuel = normaliserPlan(tenants[0].plan)
  const quota = QUOTAS[planActuel] || 1

  if (tenants.length >= quota) {
    return NextResponse.json({
      success: false,
      error: "quota_atteint",
      message: `Vous avez atteint la limite de ${quota} societes pour votre plan. Passez a un plan superieur pour en ajouter davantage.`,
    }, { status: 403 })
  }

  const body = await req.json()
  const { societe, metier, categorie, pays, taille } = body

  if (!societe) {
    return NextResponse.json({ success: false, error: "Nom de societe requis" }, { status: 400 })
  }

  const { data: tenantRow, error: insertError } = await sb.from("tenants").insert([{
    user_id: userData.user.id,
    societe,
    email: userData.user.email,
    pays: pays || "",
    metier: metier || "",
    categorie: categorie || "",
    taille: taille || "",
    plan: planActuel,
    plan_price: 0,
    statut: "essai",
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  }]).select().single()

  if (insertError || !tenantRow) {
    return NextResponse.json({ success: false, error: insertError?.message || "Erreur creation" }, { status: 500 })
  }

  await sb.from("tenant_membres").insert([{
    user_id: userData.user.id,
    tenant_id: tenantRow.id,
    role: "owner",
  }])

  return NextResponse.json({ success: true, tenant: tenantRow })
}
