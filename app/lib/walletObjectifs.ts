// Epargne automatique par objectif (Wallets Projets) : a chaque vraie entree d'argent confirmee
// dans le Wallet, un pourcentage configurable est "fleche" vers chaque objectif actif du tenant.
// Ce n'est jamais un vrai transfert -- le solde disponible du Wallet (calculerSolde) n'est jamais
// diminue par ceci. Juste un suivi honnete de ce qui a reellement ete encaisse, pour visualiser une
// progression vers un but (ex: "Fonds d'urgence", cible 5000e, 10% de chaque entree).
//
// Appelee aux 3 endroits ou une entree devient reellement "confirmee" :
// - app/api/stripe-webhook/route.ts (cas 'wallet_payment', 'facture_payment', 'club_deal')
export async function allouerObjectifs(
  sbClient: any,
  tenantId: string,
  walletTransactionId: string,
  montantNet: number
): Promise<void> {
  if (!(montantNet > 0)) return;
  const { data: objectifs } = await sbClient.from('wallet_objectifs')
    .select('id,pourcentage_allocation')
    .eq('tenant_id', tenantId)
    .eq('actif', true);
  if (!objectifs || objectifs.length === 0) return;

  const lignes = objectifs
    .map((o: any) => ({
      tenant_id: tenantId,
      objectif_id: o.id,
      wallet_transaction_id: walletTransactionId,
      montant: Math.round(montantNet * Number(o.pourcentage_allocation || 0) / 100 * 100) / 100,
    }))
    .filter((l: any) => l.montant > 0);

  if (lignes.length > 0) await sbClient.from('wallet_objectifs_mouvements').insert(lignes);
}
