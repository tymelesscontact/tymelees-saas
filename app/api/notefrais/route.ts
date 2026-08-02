import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}
export async function GET(req: NextRequest) {
  const sb = getAdminClient()
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("company_id")
  const tenantId = await getTenantIdFromRequest(req)
  let q = sb.from("notes_frais").select("*").order("date", { ascending: false })
  if (tenantId) q = q.eq("tenant_id", tenantId)
  if (companyId) q = q.eq("company_id", companyId)
  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ notes: data || [] })
}
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body
  const tenantId = await getTenantIdFromRequest(req)
  const sb = getAdminClient()
  if (action === "create") {
    const { employe, date, categorie, marchand, montant, tva, justificatif, compte_cpt, projet, company_id,
              justificatif_chemin, justificatif_nom, justificatif_type, justificatif_taille,
              justificatif_empreinte, justificatif_depose_le } = body
    if (!employe || !montant || !date) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 })
    }
    const { data, error } = await sb
      .from("notes_frais")
      .insert({
        employe,
        date,
        categorie,
        marchand,
        montant,
        tva,
        statut: "en_attente",
        justificatif,
        compte_cpt,
        projet,
        tenant_id: tenantId,
        company_id: (typeof company_id === 'string'
          && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(company_id))
          ? company_id : null,
        justificatif_chemin: justificatif_chemin || null,
        justificatif_nom: justificatif_nom || null,
        justificatif_type: justificatif_type || null,
        justificatif_taille: justificatif_taille || null,
        justificatif_empreinte: justificatif_empreinte || null,
        justificatif_depose_le: justificatif_depose_le || null,
      })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ note: data })
  }
  if (action === "update") {
    const { id, statut } = body
    if (!id || !statut) {
      return NextResponse.json({ success: false, error: "id et statut requis" }, { status: 400 })
    }
    let uq = sb.from("notes_frais").update({ statut }).eq("id", id)
    if (tenantId) uq = uq.eq("tenant_id", tenantId)
    const { data: note, error } = await uq.select().single()

    // Note validee -> vraie ligne dans le Wallet (donc visible en Compta et Tresorerie)
    if (!error && note && statut === "validé") {
      const { error: errTx } = await sb.from("wallet_transactions").insert({
        type: "note_frais",
        libelle: `Note de frais ${note.employe || ""} — ${note.marchand || ""}`.trim(),
        montant: Number(note.montant || 0),
        devise: "EUR",
        methode: "sepa",
        statut: "à_virer",
        ref: `NDF-${note.id}`,
        destinataire_nom: note.employe || "",
        tenant_id: note.tenant_id || tenantId || null,
        company_id: note.company_id || null,
      })
      if (errTx) console.error("Note de frais: transaction wallet non creee:", errTx.message)
    }

    // Note remboursee -> la transaction passe en vire
    if (!error && note && statut === "remboursé") {
      const { error: errMaj } = await sb.from("wallet_transactions")
        .update({ statut: "viré" })
        .eq("ref", `NDF-${note.id}`)
      if (errMaj) console.error("Note de frais: transaction wallet non mise a jour:", errMaj.message)
    }
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
}
