export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { generateDevisHTML } from "../../lib/generateDevis"
import { getTenantIdFromRequest } from "../../lib/supabaseServer"
import { estAutoriseSignerDevisManuel } from "../../lib/permissions"
type DevisData = {
  clientName: string
  clientPhone: string
  clientEmail?: string
  clientAdresse?: string
  service: string
  description: string
  montant: number | string
  dateDevis: string
  dateExpiration?: string
  numeroDevis: string
  lignes?: { desc?: string; qte?: number; pu?: number; tva?: number }[]
  tauxTva?: number
  remise?: number
  tenant?: {
    societe?: string | null
    logoUrl?: string | null
    email?: string | null
    siteWeb?: string | null
    adresse?: string | null
    ville?: string | null
    codePostal?: string | null
    pays?: string | null
    telephone?: string | null
    siret?: string | null
    siren?: string | null
    formeJuridique?: string | null
    capitalSocial?: string | null
    rcsVille?: string | null
    tvaIntracommunautaire?: string | null
  }
}
function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env manquantes")
  }
  return createClient(supabaseUrl, supabaseKey)
}
export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req)
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Non autorise" }, { status: 401 })
    }
    const supabase = getSupabase()
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
    const OWNER_PHONE = process.env.OWNER_PHONE
    const body = await req.json()
    const {
      clientPhone,
      service,
      description,
      montant,
      clientName,
      clientEmail,
      clientAdresse,
      lignes,
      notes,
      taux_tva,
      statut,
      validite,
      remise,
    } = body
    // Numerotation sequentielle par tenant (TYM-2026-0001...) plutot qu'un
    // suffixe de timestamp, previsible et non traçable dans le temps.
    const { count: nbDevisExistants } = await supabase
      .from("devis")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
    const anneeDevis = new Date().getFullYear()
    const numeroDevis = `TYM-${anneeDevis}-${String((nbDevisExistants || 0) + 1).padStart(4, "0")}`
    const tokenPublic = crypto.randomBytes(24).toString("hex")
    const validiteJours = Math.min(365, Math.max(1, Number(validite) || 30))
    const expireLe = new Date(Date.now() + validiteJours * 24 * 60 * 60 * 1000).toISOString()
    const dateDevis = new Date().toLocaleDateString("fr-FR")
    const dateExpiration = new Date(expireLe).toLocaleDateString("fr-FR")

    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("societe,logo_url,adresse,ville,code_postal,pays,telephone_entreprise,email,site_web,couleur_primaire,tva_intracommunautaire,siret,siren,forme_juridique,capital_social,rcs_ville")
      .eq("id", tenantId)
      .maybeSingle()
    const tenantSnapshot = tenantRow ? {
      societe: tenantRow.societe,
      logo_url: tenantRow.logo_url,
      adresse: tenantRow.adresse,
      ville: tenantRow.ville,
      code_postal: tenantRow.code_postal,
      pays: tenantRow.pays,
      telephone_entreprise: tenantRow.telephone_entreprise,
      email: tenantRow.email,
      site_web: tenantRow.site_web,
      couleur_primaire: tenantRow.couleur_primaire,
      tva_intracommunautaire: tenantRow.tva_intracommunautaire,
      siret: tenantRow.siret,
      siren: tenantRow.siren,
      forme_juridique: tenantRow.forme_juridique,
      capital_social: tenantRow.capital_social,
      rcs_ville: tenantRow.rcs_ville,
    } : null

    const devisData: DevisData = {
      clientName: clientName || "Client",
      clientPhone,
      clientEmail,
      clientAdresse,
      service,
      description,
      montant,
      dateDevis,
      dateExpiration,
      numeroDevis,
      lignes,
      tauxTva: taux_tva ?? 20,
      remise: Number(remise) || 0,
      tenant: tenantSnapshot ? {
        societe: tenantSnapshot.societe,
        logoUrl: tenantSnapshot.logo_url,
        email: tenantSnapshot.email,
        siteWeb: tenantSnapshot.site_web,
        adresse: tenantSnapshot.adresse,
        ville: tenantSnapshot.ville,
        codePostal: tenantSnapshot.code_postal,
        pays: tenantSnapshot.pays,
        telephone: tenantSnapshot.telephone_entreprise,
        siret: tenantSnapshot.siret,
        siren: tenantSnapshot.siren,
        formeJuridique: tenantSnapshot.forme_juridique,
        capitalSocial: tenantSnapshot.capital_social,
        rcsVille: tenantSnapshot.rcs_ville,
        tvaIntracommunautaire: tenantSnapshot.tva_intracommunautaire,
      } : undefined,
    }
    const htmlContent = generateDevisHTML({
      ...devisData,
      montant: String(devisData.montant)
    })
    const { error: insertError } = await supabase.from("devis").insert({
      tenant_id: tenantId,
      reference: numeroDevis,
      token_public: tokenPublic,
      expire_le: expireLe,
      tenant_snapshot: tenantSnapshot,
      client_tel: clientPhone,
      client_nom: clientName || "Client",
      client_email: clientEmail || null,
      client_adresse: clientAdresse || null,
      service,
      description,
      montant,
      lignes: lignes || null,
      notes: notes || null,
      taux_tva: taux_tva ?? 20,
      remise: Number(remise) || 0,
      statut: statut || "brouillon",
      html: htmlContent,
    })
    if (insertError) {
      console.error("Erreur insertion Supabase:", insertError)
      return NextResponse.json(
        { success: false, error: "Erreur enregistrement devis" },
        { status: 500 }
      )
    }
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID && OWNER_PHONE) {
      const messageOwner =
        `Nouveau devis a valider\n\n` +
        `N ${numeroDevis}\n` +
        `Client : ${clientName || clientPhone}\n` +
        `Service : ${service}\n` +
        `Montant : ${montant}\n` +
        `${description}\n\n` +
        `Repondez OUI ${numeroDevis} pour envoyer au client\n` +
        `Repondez NON ${numeroDevis} pour annuler`
      await fetch(
        `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: OWNER_PHONE,
            text: { body: messageOwner },
          }),
        }
      )
    }
    return NextResponse.json({
      success: true,
      numeroDevis,
      tokenPublic,
    })
  } catch (error) {
    console.error("Erreur API /api/devis:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 }
    )
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req)
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Non autorise" }, { status: 401 })
    }
    const supabase = getSupabase()
    const body = await req.json()
    const { id, ...champs } = body
    if (!id) {
      return NextResponse.json({ success: false, error: "id manquant" }, { status: 400 })
    }

    const CHAMPS_AUTORISES = ["statut", "client_nom", "client_email", "client_tel", "service", "montant", "notes"]
    const STATUTS_AUTORISES = ["brouillon", "envoyé", "signé", "payé", "refusé"]
    const champsInterdits = Object.keys(champs).filter((c) => !CHAMPS_AUTORISES.includes(c))
    if (champsInterdits.length > 0) {
      return NextResponse.json({ success: false, error: "champs_non_autorises", champs: champsInterdits }, { status: 400 })
    }
    if (champs.statut !== undefined && !STATUTS_AUTORISES.includes(champs.statut)) {
      return NextResponse.json({ success: false, error: "statut_invalide" }, { status: 400 })
    }
    if (champs.montant !== undefined && (typeof champs.montant !== "number" || champs.montant <= 0)) {
      return NextResponse.json({ success: false, error: "montant_invalide" }, { status: 400 })
    }

    if (champs.statut === "signé" && !(await estAutoriseSignerDevisManuel(req, tenantId))) {
      return NextResponse.json({ success: false, error: "reserve_au_proprietaire_ou_autorise" }, { status: 403 })
    }
    const { data, error } = await supabase
      .from("devis")
      .update(champs)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select("id")
    if (error) {
      console.error("Erreur modification devis:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 })
    }

    // Le document envoye/signe doit refleter la derniere version du devis :
    // on le regenere des qu'un champ de contenu (pas juste le statut) change,
    // pour eviter qu'un client garde un lien vers une version perimee.
    const CHAMPS_CONTENU = ["client_nom", "client_email", "client_tel", "service", "montant", "notes"]
    const contenuModifie = Object.keys(champs).some((c) => CHAMPS_CONTENU.includes(c))
    if (contenuModifie) {
      const { data: devisComplet } = await supabase
        .from("devis")
        .select("reference,client_nom,client_email,client_tel,client_adresse,service,description,montant,taux_tva,remise,lignes,created_at,expire_le,tenant_snapshot")
        .eq("id", id)
        .maybeSingle()
      if (devisComplet) {
        const ts: any = devisComplet.tenant_snapshot || {}
        const htmlRegenere = generateDevisHTML({
          clientName: devisComplet.client_nom || "Client",
          clientPhone: devisComplet.client_tel,
          clientEmail: devisComplet.client_email,
          clientAdresse: devisComplet.client_adresse,
          service: devisComplet.service,
          description: devisComplet.description,
          montant: devisComplet.montant,
          dateDevis: new Date(devisComplet.created_at).toLocaleDateString("fr-FR"),
          dateExpiration: devisComplet.expire_le ? new Date(devisComplet.expire_le).toLocaleDateString("fr-FR") : undefined,
          numeroDevis: devisComplet.reference,
          lignes: devisComplet.lignes || undefined,
          tauxTva: devisComplet.taux_tva ?? 20,
          remise: devisComplet.remise ?? 0,
          tenant: {
            societe: ts.societe, logoUrl: ts.logo_url, email: ts.email, siteWeb: ts.site_web,
            adresse: ts.adresse, ville: ts.ville, codePostal: ts.code_postal, pays: ts.pays,
            telephone: ts.telephone_entreprise, siret: ts.siret, siren: ts.siren,
            formeJuridique: ts.forme_juridique, capitalSocial: ts.capital_social, rcsVille: ts.rcs_ville,
            tvaIntracommunautaire: ts.tva_intracommunautaire,
          },
        })
        await supabase.from("devis").update({ html: htmlRegenere }).eq("id", id).eq("tenant_id", tenantId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("PATCH /api/devis error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req)
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Non autorise" }, { status: 401 })
    }
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: "id manquant" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("devis")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select("id")
    if (error) {
      console.error("Erreur suppression devis:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/devis error:", e)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    if (action === 'list') {
      const tenantId = await getTenantIdFromRequest(req)
      if (!tenantId) return NextResponse.json({ devis: [] })
      const companyId = searchParams.get('company_id')
      let query = supabase.from('devis').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
      if (companyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
        query = query.eq('company_id', companyId)
      }
      const { data, error } = await query
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ devis: data || [] })
    }
    if (action === 'public') {
      const reference = searchParams.get('reference')
      const token = searchParams.get('token')
      if (!reference || !token) {
        return NextResponse.json({ error: 'parametres manquants' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('devis')
        .select('id,tenant_id,reference,client_nom,client_email,service,description,montant,taux_tva,devise,statut,lignes,notes,created_at,expire_le,tenant_snapshot,html')
        .eq('reference', reference)
        .eq('token_public', token)
        .single()
      if (error || !data || (data.expire_le && new Date(data.expire_le) < new Date())) {
        return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
      }
      // Premiere consultation reelle par le client : on passe le statut de
      // "envoyé" a "vu" (jamais l'inverse, jamais si deja signe/refuse/paye).
      if (data.statut === 'envoyé') {
        try {
          await supabase.from('devis').update({ statut: 'vu' }).eq('id', data.id)
          if (data.tenant_id) {
            await supabase.from('notifications').insert({
              tenant_id: data.tenant_id, type: 'devis', icon: '👀', urgence: 'normale',
              titre: `Devis consulte par ${data.client_nom || 'un client'}`,
              message: `Reference ${reference}`,
              action_type: 'devis', action_id: data.id, lu: false, traite: false,
            })
          }
        } catch (e) { /* non bloquant pour l'affichage du devis */ }
        data.statut = 'vu'
      }
      const { expire_le, id, tenant_id, ...devisPublic } = data
      return NextResponse.json({ devis: devisPublic })
    }
    return NextResponse.json({ error: 'action invalide' }, { status: 400 })
  } catch (e: any) {
    console.error('GET /api/devis error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
