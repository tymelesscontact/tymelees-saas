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

// Devises que Stripe compte SANS decimales : le montant se donne tel quel (10 000 XOF = 10000), et non
// multiplie par 100 comme pour l'euro (10,00 EUR = 1000). Liste officielle Stripe des devises "zero-decimal".
const DEVISES_SANS_DECIMALES = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];

// NON BRANCHE pour l'instant (decision du proprietaire : le comportement actuel des devises ne change pas).
// Montant a transmettre a Stripe (entier, dans la plus petite unite de la devise).
export function montantEnUnitesStripe(montant: number, devise: string): number {
  return DEVISES_SANS_DECIMALES.includes(String(devise).toUpperCase()) ? Math.round(montant) : Math.round(montant * 100);
}

// IBAN : 2 lettres (pays) + 2 chiffres (cle) + 11 a 30 caracteres, controle par la cle (modulo 97).
// Renvoie l'IBAN normalise (sans espaces, en majuscules) ou null s'il est invalide.
export function ibanValide(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null;
  const iban = valeur.replace(/[\s ]/g, '').toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) return null;
  const permute = iban.slice(4) + iban.slice(0, 4);
  let reste = 0;
  for (const c of permute) {
    const v = c >= 'A' && c <= 'Z' ? String(c.charCodeAt(0) - 55) : c;
    for (const chiffre of v) reste = (reste * 10 + Number(chiffre)) % 97;
  }
  return reste === 1 ? iban : null;
}

// BIC / SWIFT : 8 ou 11 caracteres. Renvoie le BIC normalise ou null.
export function bicValide(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null;
  const bic = valeur.replace(/\s/g, '').toUpperCase();
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic) ? bic : null;
}

// Somme d'un lot de lignes deja filtrees sur les statuts "confirme" et "vire" : une entree credite
// le montant NET de la commission Xyra (5% -- jamais a la disposition du client), tout le reste debite
// le montant plein. Sans ce retrait, le solde affiche incluait la commission : rien n'empechait de la
// virer par erreur au client.
export function sommeSolde(lignes: { type: string; montant: number | string; commission?: number | string | null }[]): number {
  let solde = 0;
  for (const t of lignes) {
    solde += t.type === 'entree' ? Number(t.montant) - Number(t.commission || 0) : -Number(t.montant);
  }
  return solde;
}
