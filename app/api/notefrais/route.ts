import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { calculerTva } from '../../lib/reglesTva';
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}
export async function GET(req: NextRequest) {
  const sb = getAdminClient()
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("company_id")
  const tenantId = await getTenantIdFromRequest(req)
  if (!tenantId) return NextResponse.json({ notes: [] })
  let q = sb.from("notes_frais").select("*").eq("tenant_id", tenantId).order("date", { ascending: false })
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (companyId && UUID.test(companyId)) q = q.eq("company_id", companyId)
  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data: budgetsData } = await sb.from("budgets_frais")
    .select("categorie,montant")
    .eq("tenant_id", tenantId || "00000000-0000-0000-0000-000000000000")
  const budgets: Record<string, number> = {}
  for (const b of (budgetsData || [])) budgets[b.categorie] = Number(b.montant)

  return NextResponse.json({ notes: data || [], budgets })
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
    // Accepte JJ/MM/AAAA et le convertit en AAAA-MM-JJ (format attendu par Postgres)
    let dateOk = date
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [j, m, a] = date.split('/')
      dateOk = `${a}-${m}-${j}`
    }
    if (typeof dateOk === 'string' && dateOk && !/^\d{4}-\d{2}-\d{2}$/.test(dateOk)) {
      return NextResponse.json({ success: false, error: `Date invalide : ${date}` }, { status: 400 })
    }
    if (!employe || !montant || !date) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 })
    }
    const calc = await calculerTva({
      categorie,
      payeur: body.payeur,
      sous_type: body.sous_type,
      tva,
      date: dateOk,
    })

    const { data, error } = await sb
      .from("notes_frais")
      .insert({
        employe,
        date: dateOk,
        categorie,
        marchand,
        montant,
        tva,
        statut: "en_attente",
        justificatif,
        compte_cpt: calc.compte_charge || compte_cpt,
        payeur: body.payeur || 'salarie',
        sous_type: body.sous_type || null,
        tva_deductible: calc.tva_deductible,
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
  if (action === "budgets") {
    const { budgets, company_id } = body;
    if (!tenantId) return NextResponse.json({ error: "non_connecte" }, { status: 401 });
    if (!budgets || typeof budgets !== "object") {
      return NextResponse.json({ error: "budgets requis" }, { status: 400 });
    }
    const lignes = Object.entries(budgets).map(([categorie, montant]) => ({
      tenant_id: tenantId,
      company_id: company_id || null,
      categorie,
      montant: Number(montant) || 0,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from("budgets_frais")
      .upsert(lignes, { onConflict: "tenant_id,company_id,categorie" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "update") {
    const { id, statut } = body
    if (!id || !statut) {
      return NextResponse.json({ success: false, error: "id et statut requis" }, { status: 400 })
    }
    if (!tenantId) return NextResponse.json({ success: false, error: "non_autorise" }, { status: 401 })
    const uq = sb.from("notes_frais").update({ statut }).eq("id", id).eq("tenant_id", tenantId)
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
