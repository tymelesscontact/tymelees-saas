import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
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
  if (action === "suspendre" || action === "bannir") {
    const { data: tenantActuel } = await sb.from("tenants").select("statut").eq("id", tenant_id).single()
    const nouveauStatut = action === "suspendre" ? "suspendu" : "banni"
    const { error } = await sb.from("tenants").update({
      statut: nouveauStatut,
      statut_avant_suspension: tenantActuel?.statut || "essai",
    }).eq("id", tenant_id)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, statut: nouveauStatut })
  }
  if (action === "reactiver") {
    const { data: tenantActuel } = await sb.from("tenants").select("statut_avant_suspension").eq("id", tenant_id).single()
    const statutRestaure = tenantActuel?.statut_avant_suspension || "essai"
    const { error } = await sb.from("tenants").update({
      statut: statutRestaure,
      statut_avant_suspension: null,
    }).eq("id", tenant_id)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, statut: statutRestaure })
  }
  if (action === "activer") {
    const { error } = await sb.from("tenants").update({ statut: "actif" }).eq("id", tenant_id)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, statut: "actif" })
  }
  return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
}
