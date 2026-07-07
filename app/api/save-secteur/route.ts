import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantFromRequest } from "../../lib/supabaseServer"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const tenant = await getTenantFromRequest(req)
  if (!tenant) {
    return NextResponse.json({ success: false, error: "Non connecte" }, { status: 401 })
  }

  const body = await req.json()
  const { secteur } = body

  if (!secteur) {
    return NextResponse.json({ success: false, error: "secteur manquant" }, { status: 400 })
  }

  const sb = getAdminClient()
  const { error } = await sb.from("tenants").update({ secteur }).eq("id", tenant.id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
