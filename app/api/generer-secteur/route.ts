import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function normaliserCle(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { metier } = body

    if (!metier || !metier.trim()) {
      return NextResponse.json({ error: "metier manquant" }, { status: 400 })
    }

    const sb = getAdminClient()
    const cleNormalisee = normaliserCle(metier)

    const { data: existant } = await sb
      .from("secteurs_generes")
      .select("*")
      .eq("cle", cleNormalisee)
      .single()

    if (existant) {
      return NextResponse.json({ profil: existant, reutilise: true })
    }

    const prompt = `Tu es un expert en organisation d'entreprise. Genere un profil sectoriel complet en JSON strict pour le metier suivant: "${metier}".

Le JSON doit avoir EXACTEMENT cette structure (reponds UNIQUEMENT le JSON, sans texte avant ni apres, sans balises markdown):
{
  "label": "emoji + nom du secteur",
  "termes": {
    "mission": "mot pour designer une intervention/prestation au singulier",
    "missions": "au pluriel",
    "client": "mot pour designer un client au singulier",
    "clients": "au pluriel",
    "service": "mot pour designer une prestation au singulier",
    "services": "au pluriel",
    "collaborateur": "mot pour designer un employe",
    "stock": "mot pour designer les fournitures/matieres premieres",
    "commande": "mot pour designer une commande/reservation",
    "rdv": "mot pour designer un rendez-vous",
    "produit": "mot pour designer un produit/prestation vendue",
    "devis": "mot pour designer un devis/proposition commerciale"
  },
  "services": ["4 a 8 exemples de services typiques de ce metier"],
  "stockCategories": ["4 a 7 categories de stock/fournitures typiques"],
  "kpiMission": "nom du KPI principal (ex: Consultations, Couverts, Chantiers)",
  "couleur": "code hexadecimal d'une couleur adaptee (ex: #C9A84C)",
  "normes": ["2 a 5 normes ou obligations reglementaires si le secteur est reglemente, sinon tableau vide"]
}`

    const iaRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const iaData = await iaRes.json()
    const texteGenere = iaData.content?.[0]?.text || ""

    let profilGenere
    try {
      const jsonMatch = texteGenere.match(/\{[\s\S]*\}/)
      profilGenere = JSON.parse(jsonMatch ? jsonMatch[0] : texteGenere)
    } catch (parseError) {
      return NextResponse.json({ error: "Erreur de generation du profil" }, { status: 500 })
    }

    const { data: nouveauProfil, error: insertError } = await sb
      .from("secteurs_generes")
      .insert([{
        cle: cleNormalisee,
        metier_original: metier,
        label: profilGenere.label,
        termes: profilGenere.termes,
        services: profilGenere.services,
        stock_categories: profilGenere.stockCategories,
        kpi_mission: profilGenere.kpiMission,
        couleur: profilGenere.couleur || "#C9A84C",
        normes: profilGenere.normes || [],
      }])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ profil: nouveauProfil, reutilise: false })
  } catch (e: any) {
    console.error("Erreur generation secteur:", e)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
