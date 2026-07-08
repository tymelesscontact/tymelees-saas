import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cle = searchParams.get("cle")

  if (!cle) {
    return NextResponse.json({ error: "cle manquante" }, { status: 400 })
  }

  const sb = getAdminClient()
  const { data, error } = await sb
    .from("secteurs_generes")
    .select("*")
    .eq("cle", cle)
    .single()

  if (error || !data) {
    return NextResponse.json({ profil: null }, { status: 404 })
  }

  return NextResponse.json({ profil: data })
}
