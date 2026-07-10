import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const STATUTS_VALIDES = ["actif", "suspendu", "banni", "essai"]

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

  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail || userData.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    return NextResponse.json({ success: false, error: "Reserve a l'owner" }, { status: 403 })
  }

  const body = await req.json()
  const { tenant_id, action } = body

  if (!tenant_id || !action) {
    return NextResponse.json({ success: false, error: "tenant_id ou action manquant" }, { status: 400 })
  }

  if (action === "supprimer") {
    const { error } = await sb.from("tenants").delete().eq("id", tenant_id)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  const mapAction: Record<string, string> = {
    activer: "actif",
    suspendre: "suspendu",
    bannir: "banni",
  }

  const nouveauStatut = mapAction[action]
  if (!nouveauStatut || !STATUTS_VALIDES.includes(nouveauStatut)) {
    return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
  }

  const { error } = await sb.from("tenants").update({ statut: nouveauStatut }).eq("id", tenant_id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, statut: nouveauStatut })
}
