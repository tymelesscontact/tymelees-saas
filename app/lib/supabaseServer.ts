import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function getTenantIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) return null

  const sb = getAdminClient()
  const { data: userData, error: userError } = await sb.auth.getUser(token)
  if (userError || !userData?.user) return null

  const { data: tenant, error: tenantError } = await sb
    .from("tenants")
    .select("id")
    .eq("user_id", userData.user.id)
    .single()

  if (tenantError || !tenant) return null
  return tenant.id
}

export async function getTenantFromRequest(req: NextRequest): Promise<any | null> {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) return null

  const sb = getAdminClient()
  const { data: userData, error: userError } = await sb.auth.getUser(token)
  if (userError || !userData?.user) return null

  const { data: tenant, error: tenantError } = await sb
    .from("tenants")
    .select("*")
    .eq("user_id", userData.user.id)
    .single()

  if (tenantError || !tenant) return null
  return tenant
}
