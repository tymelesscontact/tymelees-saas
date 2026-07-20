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
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("company_id")
  const tenantId = await getTenantIdFromRequest(req)
  let q = sb.from("notes_frais").select("*").order("date", { ascending: false })
  if (tenantId) q = q.eq("tenant_id", tenantId)
  if (companyId) q = q.eq("company_id", companyId)
  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ notes: data || [] })
}
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body
  const tenantId = await getTenantIdFromRequest(req)
  const sb = getAdminClient()
  if (action === "create") {
    const { employe, date, categorie, marchand, montant, tva, justificatif, compte_cpt, projet, company_id } = body
    if (!employe || !montant || !date) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 })
    }
    const { data, error } = await sb
      .from("notes_frais")
      .insert({
        employe,
        date,
        categorie,
        marchand,
        montant,
        tva,
        statut: "en_attente",
        justificatif,
        compte_cpt,
        projet,
        tenant_id: tenantId,
        company_id: company_id || null,
      })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ note: data })
  }
  if (action === "update") {
    const { id, statut } = body
    if (!id || !statut) {
      return NextResponse.json({ success: false, error: "id et statut requis" }, { status: 400 })
    }
    const { error } = await sb.from("notes_frais").update({ statut }).eq("id", id)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
}
