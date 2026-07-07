import { NextRequest, NextResponse } from "next/server"
import { getTenantsForRequest } from "../../lib/supabaseServer"

export async function GET(req: NextRequest) {
  const tenants = await getTenantsForRequest(req)
  return NextResponse.json({
    tenants: tenants.map((t: any) => ({
      id: t.id,
      societe: t.societe,
      plan: t.plan,
      role: t.role,
    })),
  })
}
