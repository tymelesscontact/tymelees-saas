import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env manquantes")
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { reference, email, nom } = await req.json()

    if (!reference || !email) {
      return NextResponse.json({ success: false, error: "reference ou email manquant" }, { status: 400 })
    }

    const { data: devisRow, error: findErr } = await supabase
      .from("devis")
      .select("id,statut,client_email")
      .eq("reference", reference)
      .single()

    if (findErr || !devisRow) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 })
    }

    if (devisRow.statut === "signé" || devisRow.statut === "payé") {
      return NextResponse.json({ success: true, dejaSigne: true })
    }

    const { error: updateErr } = await supabase
      .from("devis")
      .update({ statut: "signé" })
      .eq("id", devisRow.id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    try {
      await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { societe: nom || email },
      })
    } catch (e) {
      console.log("Utilisateur existe probablement deja:", e)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("POST /api/devis/signer error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
