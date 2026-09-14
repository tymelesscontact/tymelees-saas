import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTenantIdFromRequest } from '../../lib/supabaseServer'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// API officielle du gouvernement francais (recherche-entreprises.api.gouv.fr) --
// publique, gratuite, sans cle, alimentee par le RNE/INPI (dirigeants reels) et
// l'INSEE. Distincte de l'API Sirene deja utilisee ailleurs dans le projet
// (api/profil-entreprise, api/abonnes) qui ne fait que verifier un SIRET deja
// connu -- ici on cherche de nouvelles entreprises par activite/ville.

function nomDirigeant(d: any): string {
  if (d.type_dirigeant === 'personne morale') return d.denomination || '—'
  return [d.prenoms, d.nom].filter(Boolean).join(' ') || '—'
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req)
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  let q = searchParams.get('q') || ''
  let codePostal = searchParams.get('code_postal') || ''

  if (!q && !codePostal) {
    const sb = getAdminClient()
    const { data: tenant } = await sb.from('tenants').select('secteur, code_postal').eq('id', tenantId).maybeSingle()
    if (!q) q = tenant?.secteur || ''
    if (!codePostal) codePostal = tenant?.code_postal || ''
  }

  if (!q) {
    return NextResponse.json({ error: 'Indique un secteur ou une activite a rechercher' }, { status: 400 })
  }

  try {
    const url = new URL('https://recherche-entreprises.api.gouv.fr/search')
    url.searchParams.set('q', q)
    if (codePostal) url.searchParams.set('code_postal', codePostal)
    url.searchParams.set('per_page', '15')
    url.searchParams.set('etat_administratif', 'A') // uniquement les entreprises actives

    const res = await fetch(url.toString())
    if (!res.ok) {
      return NextResponse.json({ error: 'Service de recherche indisponible pour le moment' }, { status: 502 })
    }
    const data = await res.json()

    const resultats = (data.results || []).map((r: any) => ({
      siren: r.siren,
      siret: r.siege?.siret || null,
      nom: r.nom_complet || r.nom_raison_sociale,
      adresse: r.siege?.adresse || null,
      ville: r.siege?.libelle_commune || null,
      code_postal: r.siege?.code_postal || null,
      activite: r.activite_principale || null,
      date_creation: r.date_creation || null,
      effectif: r.tranche_effectif_salarie || null,
      dirigeants: (r.dirigeants || []).map((d: any) => ({
        nom: nomDirigeant(d),
        qualite: d.qualite || null,
      })),
    }))

    return NextResponse.json({ resultats, total: data.total_results || resultats.length })
  } catch (error: any) {
    console.error('Recherche entreprises error:', error)
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
  }
}
