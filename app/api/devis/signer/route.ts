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
    const { reference, token, nom } = await req.json()

    if (!reference || !token) {
      return NextResponse.json({ success: false, error: "parametres manquants" }, { status: 400 })
    }

    const { data: devisRow, error: findErr } = await supabase
      .from("devis")
      .select("id,statut,client_email,tenant_id,client_nom,montant,expire_le")
      .eq("reference", reference)
      .eq("token_public", token)
      .single()

    if (findErr || !devisRow || (devisRow.expire_le && new Date(devisRow.expire_le) < new Date())) {
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

    if (devisRow.tenant_id) {
      try {
        await supabase.from("notifications").insert({
          tenant_id: devisRow.tenant_id,
          type: "devis",
          icon: "✅",
          urgence: "normale",
          titre: `Devis signé par ${devisRow.client_nom || "un client"}`,
          message: `${devisRow.montant || 0}€ — Reference ${reference}`,
          action_type: "devis",
          action_id: devisRow.id,
          lu: false,
          traite: false,
        })
      } catch (e) { /* non bloquant */ }
    }

    // Securite : on ne cree jamais un compte avec un email fourni par l'appelant.
    // Uniquement l'email deja enregistre sur le devis en base (celui du vrai client).
    let compteCree = false
    if (devisRow.client_email) {
      try {
        await supabase.auth.admin.createUser({
          email: devisRow.client_email,
          email_confirm: true,
          user_metadata: { societe: nom || devisRow.client_email },
        })
        compteCree = true
      } catch (e) {
        console.log("Utilisateur existe probablement deja:", e)
      }
    } else {
      console.log("Signature devis", reference, ": pas de client_email en base, compte non cree")
    }

    return NextResponse.json({ success: true, compteCree })
  } catch (e: any) {
    console.error("POST /api/devis/signer error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
