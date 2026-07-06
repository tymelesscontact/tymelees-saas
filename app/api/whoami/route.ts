import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) {
    return NextResponse.json({ isOwner: false, email: null })
  }

  const sb = getAdminClient()
  const { data: userData, error } = await sb.auth.getUser(token)
  if (error || !userData?.user) {
    return NextResponse.json({ isOwner: false, email: null })
  }

  const ownerEmail = process.env.OWNER_EMAIL
  const isOwner = !!ownerEmail && userData.user.email?.toLowerCase() === ownerEmail.toLowerCase()

  return NextResponse.json({ isOwner, email: userData.user.email })
}
