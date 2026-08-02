import { createClient } from '@supabase/supabase-js'

export type ResultatTva = {
  tva_deductible: number
  taux_applique: number
  compte_charge: string | null
  compte_tiers: string | null
  cree_une_dette: boolean
  justification: string
  base_legale: string
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Calcule la TVA reellement deductible et le traitement comptable d'une note de frais.
 * Les regles viennent de la table regles_tva, versionnee par date : une depense de 2025
 * est jugee avec les regles en vigueur en 2025.
 */
export async function calculerTva(params: {
  categorie: string
  payeur?: string | null
  sous_type?: string | null
  tva?: number | null
  date?: string | null
}): Promise<ResultatTva> {
  const sb = client()
  const categorie = params.categorie || 'Autre'
  const payeur = params.payeur || 'salarie'
  const sousType = params.sous_type || null
  const tva = Number(params.tva || 0)
  const dateRef = params.date || new Date().toISOString().slice(0, 10)

  // 1. Regle de TVA : categorie + sous_type, valide a la date de la depense
  let q = sb.from('regles_tva').select('*')
    .eq('categorie', categorie)
    .lte('date_debut', dateRef)
  const { data: regles } = await q

  const applicables = (regles || []).filter((r: any) =>
    (!r.date_fin || r.date_fin >= dateRef) &&
    (sousType ? r.sous_type === sousType : !r.sous_type)
  )
  const regle = applicables[0]
    || (regles || []).find((r: any) => !r.sous_type)
    || null

  // 2. Regle de payeur : determine s'il y a une dette et vers quel compte
  const { data: reglesPayeur } = await sb.from('regles_tva').select('*')
    .eq('categorie', '*')
    .eq('payeur', payeur)
    .lte('date_debut', dateRef)
  const reglePayeur = (reglesPayeur || [])[0] || null

  const taux = regle ? Number(regle.taux_deduction) : 0
  const deductible = Math.round(tva * taux * 100) / 100

  // La TVA n'est recuperable que si la facture est au nom de l'entreprise.
  // Une avance personnelle non refacturee ne remplit pas cette condition.
  const justif: string[] = []
  if (regle) {
    justif.push(`${categorie}${sousType ? ' / ' + sousType : ''} : TVA deductible a ${Math.round(taux * 100)}%`)
    if (regle.commentaire) justif.push(regle.commentaire)
  } else {
    justif.push(`Aucune regle trouvee pour ${categorie} - TVA non deduite par precaution`)
  }
  if (reglePayeur?.commentaire) justif.push(reglePayeur.commentaire)

  return {
    tva_deductible: deductible,
    taux_applique: taux,
    compte_charge: regle?.compte_charge || null,
    compte_tiers: reglePayeur?.compte_tiers || null,
    cree_une_dette: payeur !== 'societe',
    justification: justif.join(' — '),
    base_legale: regle?.base_legale || 'Non determinee',
  }
}
