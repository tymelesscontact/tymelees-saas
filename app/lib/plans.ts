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
export const MULTI_PLANS = ["multi_societes", "multi_societes_pro", "holding", "enterprise", "owner"]

export const PAGE_ACCESS: Record<string, string[]> = {
  wallet: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  cartes: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  crm: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  devis: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  facturation: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  settings: ["starter", "business", "enterprise", ...MULTI_PLANS, "club_affaires", "owner"],
  notefrais: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  overview: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  investissement: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  compta: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  tresorerie: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  analytique: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  clients: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  partenaires: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  annuaire: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  wallet_membres: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  evenements: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  scoring: ["starter", "business", "enterprise", ...MULTI_PLANS, "owner"],
  equipe: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  planning: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  deals: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  stock: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  services: ["business", "enterprise", ...MULTI_PLANS, "owner"],
  notifications: ["starter", "business", "enterprise", ...MULTI_PLANS, "club_affaires", "owner"],
  prospection: ["enterprise", "owner"],
  club_affaires: ["enterprise", "club_affaires", "owner"],
  multi_societes: ["multi_societes", "multi_societes_pro", "holding", "enterprise", "owner"],
  signature: ["business", "enterprise", "owner"],
  formation: ["business", "enterprise", "owner"],
  deploiement: ["enterprise", "owner"],
  api: ["enterprise", "owner"],
}

export function hasAccess(plan: string, page: string): boolean {
  const allowed = PAGE_ACCESS[page]
  if (!allowed) return true
  return allowed.includes(plan)
}
