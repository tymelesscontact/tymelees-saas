export const MAPPING_PLANS: Record<string, string> = {
  "starter": "starter",
  "démarreur": "starter",
  "demarreur": "starter",
  "business pro": "business",
  "business_pro": "business",
  "business": "business",
  "enterprise": "enterprise",
  "multi-sociétés": "multi_societes",
  "multi sociétés": "multi_societes",
  "multisociétés": "multi_societes",
  "multi_societes": "multi_societes",
  "multi-sociétés pro": "multi_societes_pro",
  "multi_societes_pro": "multi_societes_pro",
  "multisociétés pro": "multi_societes_pro",
  "holding": "holding",
  "club d'affaires": "club_affaires",
  "club_affaires": "club_affaires",
  "white-label starter": "white_label_starter",
  "white_label_starter": "white_label_starter",
  "white-label business": "white_label_business",
  "white_label_business": "white_label_business",
  "white-label enterprise": "white_label_enterprise",
  "white_label_enterprise": "white_label_enterprise",
  "owner": "owner",
  "propriétaire": "owner",
  "proprietaire": "owner",
}

export function normaliserPlan(planBrut: string | null | undefined): string {
  if (!planBrut) return "starter"
  const cle = planBrut.toLowerCase().trim()
  return MAPPING_PLANS[cle] || cle.replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "") || "starter"
}

export const PLAN_PRIX: Record<string, number> = {
  starter: 59,
  business: 129,
  enterprise: 249,
  multi_societes: 499,
  multi_societes_pro: 799,
  holding: 1200,
  club_affaires: 2000,
  owner: 0,
}

export const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  business: "Business Pro",
  enterprise: "Enterprise",
  multi_societes: "Multi-Sociétés",
  multi_societes_pro: "Multi-Sociétés Pro",
  holding: "Holding",
  club_affaires: "Club d'affaires",
  white_label_starter: "White-label Starter",
  white_label_business: "White-label Business",
  white_label_enterprise: "White-label Enterprise",
  owner: "Owner",
}
