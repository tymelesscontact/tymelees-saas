import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env manquantes")
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { reference, token } = await req.json()

    if (!reference || !token) {
      return NextResponse.json({ success: false, error: "parametres manquants" }, { status: 400 })
    }

    const { data: devisRow, error: findErr } = await supabase
      .from("devis")
      .select("id,statut,client_nom,tenant_id,montant")
      .eq("reference", reference)
      .eq("token_public", token)
      .single()

    if (findErr || !devisRow) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 })
    }

    if (devisRow.statut === "signé" || devisRow.statut === "payé") {
      return NextResponse.json({ success: false, error: "deja_signe" }, { status: 409 })
    }
    if (devisRow.statut === "refusé") {
      return NextResponse.json({ success: true, dejaRefuse: true })
    }

    const { error: updateErr } = await supabase
      .from("devis")
      .update({ statut: "refusé" })
      .eq("id", devisRow.id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    if (devisRow.tenant_id) {
      try {
        await supabase.from("notifications").insert({
          tenant_id: devisRow.tenant_id,
          type: "devis",
          icon: "❌",
          urgence: "normale",
          titre: `Devis refuse par ${devisRow.client_nom || "un client"}`,
          message: `${devisRow.montant || 0}€ — Reference ${reference}`,
          action_type: "devis",
          action_id: devisRow.id,
          lu: false,
          traite: false,
        })
      } catch (e) { /* non bloquant */ }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("POST /api/devis/refuser error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
