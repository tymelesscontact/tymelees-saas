import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { normaliserPlan, hasAccess } from "./plans"

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) return null
  const sb = getAdminClient()
  const { data: userData, error } = await sb.auth.getUser(token)
  if (error || !userData?.user) return null
  return userData.user
}

export async function getTenantsForRequest(req: NextRequest): Promise<any[]> {
  const user = await getUserFromRequest(req)
  if (!user) return []

  const sb = getAdminClient()
  const { data: membres, error } = await sb
    .from("tenant_membres")
    .select("tenant_id, role, tenants(*)")
    .eq("user_id", user.id)

  if (error || !membres) return []
  return membres.map((m: any) => ({ ...m.tenants, role: m.role }))
}

export async function getTenantIdFromRequest(req: NextRequest): Promise<string | null> {
  const activeCookie = req.cookies.get("active_tenant_id")?.value
  const tenants = await getTenantsForRequest(req)
  if (tenants.length === 0) return null

  if (activeCookie && tenants.some(t => t.id === activeCookie)) {
    return activeCookie
  }

  return tenants[0].id
}

export async function getTenantFromRequest(req: NextRequest): Promise<any | null> {
  const tenantId = await getTenantIdFromRequest(req)
  if (!tenantId) return null

  const tenants = await getTenantsForRequest(req)
  return tenants.find(t => t.id === tenantId) || null
}

// Verifie que le tenant appelant a bien acces a ce module (plan ou module
// achete a la carte), en reutilisant exactement la meme regle que cote
// client (hasAccess). "page" peut etre une seule cle ou plusieurs (autorise
// si au moins une correspond).
export async function verifierAccesModule(req: NextRequest, page: string | string[]) {
  const tenant = await getTenantFromRequest(req)
  if (!tenant) {
    return { ok: false as const, reponse: NextResponse.json({ error: "Non authentifie" }, { status: 401 }) }
  }
  const plan = normaliserPlan(tenant.plan)

  let modulesActifs: string[] = []
  try {
    const sb = getAdminClient()
    const { data } = await sb.from("modules_actifs")
      .select("type_module")
      .eq("tenant_id", tenant.id)
      .eq("statut", "actif")
    modulesActifs = (data || []).map((m: any) => m.type_module).filter(Boolean)
  } catch { /* non bloquant */ }

  const pages = Array.isArray(page) ? page : [page]
  const autorise = pages.some(p => hasAccess(plan, p, modulesActifs))
  if (!autorise) {
    return { ok: false as const, reponse: NextResponse.json({ error: "Ce module n'est pas inclus dans votre forfait" }, { status: 403 }) }
  }
  return { ok: true as const, tenant, tenantId: tenant.id as string, plan }
}
