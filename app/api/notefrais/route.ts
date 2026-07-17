import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const sb = getAdminClient()
  const { data, error } = await sb
    .from("notes_frais")
    .select("*")
    .order("créé_à", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const notes = (data || []).map((n: any) => ({
    id: n.identifiant,
    employe: n.employé,
    date: n.date,
    categorie: n.catégorie,
    marchand: n.marchand,
    montant: n.montant,
    tva: n.tva,
    statut: n.statut,
    justificatif: n.justificatif,
    compte_cpt: n.compte_cpt,
    projet: n.projet,
  }))

  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body
  const sb = getAdminClient()

  if (action === "create") {
    const { employe, date, categorie, marchand, montant, tva, justificatif, compte_cpt, projet } = body

    if (!employe || !montant || !date) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const { data, error } = await sb
      .from("notes_frais")
      .insert({
        "employé": employe,
        date,
        "catégorie": categorie,
        marchand,
        montant,
        tva,
        statut: "en_attente",
        justificatif,
        compte_cpt,
        projet,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const note = {
      id: data.identifiant,
      employe: data.employé,
      date: data.date,
      categorie: data.catégorie,
      marchand: data.marchand,
      montant: data.montant,
      tva: data.tva,
      statut: data.statut,
      justificatif: data.justificatif,
      compte_cpt: data.compte_cpt,
      projet: data.projet,
    }

    return NextResponse.json({ note })
  }

  if (action === "update") {
    const { id, statut } = body
    if (!id || !statut) {
      return NextResponse.json({ success: false, error: "id et statut requis" }, { status: 400 })
    }

    const { error } = await sb.from("notes_frais").update({ statut }).eq("identifiant", id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "action inconnue" }, { status: 400 })
}
