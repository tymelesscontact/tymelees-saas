import { NextRequest, NextResponse } from "next/server"
import { getTenantsForRequest } from "../../lib/supabaseServer"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenant_id } = body

  if (!tenant_id) {
    return NextResponse.json({ success: false, error: "tenant_id manquant" }, { status: 400 })
  }

  const tenants = await getTenantsForRequest(req)
  const found = tenants.find((t: any) => t.id === tenant_id)

  if (!found) {
    return NextResponse.json({ success: false, error: "Societe non autorisee" }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set("active_tenant_id", tenant_id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  })
  return res
}
