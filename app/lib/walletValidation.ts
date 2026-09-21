// Regles de validation du Wallet (utilisees par app/api/wallet/route.ts).
// Fichier a part pour pouvoir les tester sans reseau ni base.

// Devises proposees par l'ecran (app/lib/ui.tsx).
export const DEVISES_AUTORISEES = ['EUR', 'XOF', 'USD', 'GBP', 'MAD', 'AED', 'CAD', 'CHF', 'JPY', 'CNY', 'NGN', 'KES', 'GHS', 'BRL', 'SAR'];

// Un paiement sortant ne peut etre que d'un de ces types : JAMAIS une "entree" (credit), qui gonflerait
// le solde. Les entrees viennent uniquement du paiement reel confirme par Stripe.
export const TYPES_SORTIE_AUTORISES = ['sortie', 'remboursement', 'commission', 'fournisseur'];

export const MONTANT_MAX = 1_000_000_000;
export const MAX_ENCAISSEMENTS_PAR_HEURE = 30;
export const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
export const TEL_RE = /^\+?[0-9 ()\-.]{6,20}$/;

export function echapHtml(valeur: unknown): string {
  return String(valeur ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Montant strictement positif, fini et raisonnable, sinon null.
export function montantValide(valeur: unknown): number | null {
  if (typeof valeur !== 'number' && typeof valeur !== 'string') return null;
  // Saisie a la francaise : "1 200,50" est accepte (espaces retires, virgule = decimale).
  const texte = typeof valeur === 'string' ? valeur.replace(/[\s ]/g, '').replace(',', '.') : valeur;
  if (typeof texte === 'string' && texte === '') return null;
  const n = Number(texte);
  return Number.isFinite(n) && n > 0 && n <= MONTANT_MAX ? n : null;
}

// Somme d'un lot de lignes deja filtrees sur les statuts "confirme" et "vire" : une entree credite,
// tout le reste debite.
export function sommeSolde(lignes: { type: string; montant: number | string }[]): number {
  let solde = 0;
  for (const t of lignes) solde += t.type === 'entree' ? Number(t.montant) : -Number(t.montant);
  return solde;
}
