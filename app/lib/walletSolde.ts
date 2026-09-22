// Calcul du solde reel du Wallet, partage entre tous les endroits qui doivent
// verifier "l'entreprise a-t-elle vraiment cet argent disponible ?" avant de
// creer une sortie (app/api/wallet/route.ts, app/api/partenaires/route.ts...).
// Extrait de app/api/wallet/route.ts pour eviter de dupliquer cette logique
// financiere a plusieurs endroits (et donc de risquer qu'elle diverge).
import { sommeSolde } from './walletValidation';

// Solde reel : somme de TOUTES les transactions (par pages de 1000), pas seulement des 100 dernieres
// affichees dans la liste. Un encaissement ne compte qu'une fois confirme par Stripe ; un paiement
// sortant compte des sa creation ("a_virer"), pas seulement une fois "Marque vire" -- creer un paiement
// reserve deja la somme, pour qu'un second paiement ne puisse pas venir la redemander en double avant
// que le premier soit reellement execute a la banque.
export async function calculerSolde(sbClient: any, tenantId: string, companyId: string | null): Promise<number> {
  const TAILLE = 1000;
  let solde = 0;
  for (let page = 0; page < 200; page++) {
    let q = sbClient.from('wallet_transactions').select('type,montant,commission')
      .eq('tenant_id', tenantId).in('statut', ['confirmé', 'viré', 'à_virer'])
      .order('created_at', { ascending: true }).order('id', { ascending: true })
      .range(page * TAILLE, page * TAILLE + TAILLE - 1);
    if (companyId) q = q.eq('company_id', companyId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    solde += sommeSolde(data || []);
    if (!data || data.length < TAILLE) break;
  }
  return solde;
}
