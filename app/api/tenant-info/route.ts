import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantFromRequest } from "../../lib/supabaseServer"

export async function GET(req: NextRequest) {
  const tenant = await getTenantFromRequest(req)
  if (!tenant) {
    return NextResponse.json({ plan: null, statut: null, modules_actifs: [] })
  }

  // Modules achetes a la carte (table modules_actifs)
  let modules_actifs: string[] = []
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb.from("modules_actifs")
      .select("type_module")
      .eq("tenant_id", tenant.id)
      .eq("statut", "actif")
    modules_actifs = (data || []).map((m: any) => m.type_module).filter(Boolean)
  } catch { /* non bloquant */ }

  return NextResponse.json({
    plan: tenant.plan,
    statut: tenant.statut,
    societe: tenant.societe,
    trial_ends_at: tenant.trial_ends_at,
    email: tenant.email,
    secteur: tenant.secteur,
    secteur_overrides: tenant.secteur_overrides,
    siret: tenant.siret,
    modules_actifs,
  })
}
