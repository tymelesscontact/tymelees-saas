import { NextRequest, NextResponse } from "next/server"
import { getTenantFromRequest } from "../../lib/supabaseServer"

export async function GET(req: NextRequest) {
  const tenant = await getTenantFromRequest(req)
  if (!tenant) {
    return NextResponse.json({ plan: null, statut: null })
  }
  return NextResponse.json({
    plan: tenant.plan,
    statut: tenant.statut,
    societe: tenant.societe,
    trial_ends_at: tenant.trial_ends_at,
  })
}
