import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
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
