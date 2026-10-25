# Recette navigateur — Xyra TEST

Date : 22 octobre 2026  
Environnement : `https://xyratest1-xi.vercel.app`  
Compte : session owner TEST  
Méthode : navigation, lecture et créations internes minimales, explicitement autorisées, sous le préfixe `AUDIT-XYRA-*`. Aucun envoi, paiement, achat de module ou suppression.

## Résultats observés

| Écran | Résultat | Priorité | Action recommandée |
|---|---|---|---|
| Accueil | Brief IA indisponible ; message utilisateur sans action de reprise | P1 | diagnostiquer la route et afficher une reprise/fallback utile |
| Accueil / Notifications | alerte Lea figée sur `2026-09` alors que la session est le 22/10/2026 | P1 | calculer la période active ou masquer les alertes expirées |
| Wallet | solde et KPI à `0 €` tandis que l'historique liste encaissements, décaissements et opérations en attente | P1 | formule statique vérifiée : seuls les statuts `confirmé`, `viré` et `à_virer` entrent dans le solde ; contrôler les statuts réels des lignes avant de conclure à une erreur de calcul |
| CRM | 19 leads se chargent ; KPI conversion, CA pipeline et deals gagnés sont à zéro | P2 | vérifier les règles de qualification et le calcul des KPI |
| Clients | état vide cohérent : 0 client, score moyen `—`, aucune donnée démo affichée | P2 | recetter CRUD et droits avec des données `AUDIT-XYRA-*` |
| Fournisseurs | état vide cohérent : 0 fournisseur, aucune donnée démo affichée | P2 | recetter CRUD et commandes avec données test isolées |
| Devis | taux de conversion affiché `NaN%` quand la liste est vide | P1 | afficher `—` ou `0 %` et protéger la division par zéro |
| Facturation électronique | KPI `CA HT total` à 750 €, mais la liste affiche trois factures émises à 300 € chacune (900 €) | P1 | le composant additionne directement tous les `montant_ht` reçus : recetter la réponse API/les montants réels, le code de somme ne contient pas de filtre de statut |
| Annuaire | `0 contact` et `0 zone` sans erreur utilisateur | P0 | lecture tenant-scopée présente ; en revanche les suppressions et modifications de contacts/deals ne filtrent pas `tenant_id`, donc un identifiant deviné peut viser un autre tenant |
| Cartes virtuelles / Sécurité | champs plafond/pays/catégories et contrôles affichés, sans sauvegarde visible | P1 | implémenter persistance ou masquer l'onglet |
| Équipe | un état initial à `0 collaborateur` et `NaN%` a été affiché, puis les données ont fini par révéler 3 collaborateurs et une performance à 0 % | P1 | afficher un vrai état de chargement et ne calculer les KPI qu'après le chargement |
| Planning & Agenda | affiche d'abord `0 collaborateur` puis « Chargement... » ; une observation précédente achevée affichait 3 collaborateurs, cohérents avec l'Équipe une fois chargée | P1 | éviter l'état vide transitoire trompeur et ne rendre les KPI qu'après le chargement |
| Planning / Absences | état vide correct ; bouton de déclaration disponible, non activé | P2 | recetter déclaration/validation avec données test et rôles séparés |
| Formation équipe | aucun contenu, avec libellé `Chargement...` persistant | P1 | terminer le chargement ou afficher un état vide distinct |
| Stock | huit articles, alertes et commandes suggérées affichés ; données de démonstration non identifiées | P1 | étiqueter clairement les données test/démo ou partir d'un état vide réel |
| Deals | quatre opportunités datées d'avril à juin 2026, sans signaler l'obsolescence ni l'origine des données | P1 | afficher la provenance, une alerte d'expiration et un état vide propre |
| Prospection / LinkedIn | métriques `84`, `31`, `27`, `4` affichées ; déjà identifiées comme codées en dur dans le code | P1 | remplacer par données réelles ou masquer l'onglet |
| WhatsApp Lea | liste et panneau se chargent ; aucune conversation disponible | P2 | état vide correct ; recette d'envoi à réaliser seulement avec destinataire test autorisé |
| Notifications | bouton de test présent ; seule notification visible = alerte Lea périmée | P1 | recetter l'envoi uniquement avec canal de test autorisé ; corriger la donnée périmée |
| Club d'affaires | paywall Business Pro visible avant accès et achat à 19 €/mois proposé | P2 | verrou UI observé ; ne pas acheter pendant audit ; vérifier contrôle serveur plus tard |
| Paramètres / Support | formulaire de ticket accessible ; aucun ticket soumis | P0 | contrôle statique confirmé : `GET /api/tickets?admin=true` renvoie tous les tickets sans vérifier le rôle ; `repondre` n'impose ni session ni tenant ; corriger avant toute recette |

## Écriture de recette autorisée

| Action | Donnée | Résultat immédiat | Résultat après rechargement | Conclusion |
|---|---|---|---|---|
| Clients / Ajouter | `AUDIT-XYRA-CLIENT-20261022` (Paris, métier Audit ; sans email ni téléphone) | toast de succès, mais compteur et liste toujours à 0 | compteur 1, fiche visible, score 50/100 | persistance confirmée ; rafraîchissement local défaillant après création |
| Fournisseurs / Ajouter | `AUDIT-XYRA-FOURNISSEUR-20261022` (catégorie Audit, délai J+0 ; sans contact ni IBAN) | toast de succès, compteur à 0 pendant le chargement | compteur 1 et ligne visible | persistance confirmée ; même rafraîchissement local défaillant après création |
| CRM / Nouveau lead | `AUDIT-XYRA-LEAD-20261022` (secteur Audit, source Recette navigateur ; sans contact, email ni téléphone) | création visible après retour de l'interface ; compteur passé de 19 à 20 | compteur 20 et carte du lead visible dans « Nouveau » | persistance confirmée ; le retour visuel n'a pas été exposé immédiatement dans l'arbre d'accessibilité, mais la carte est apparue et a survécu au rechargement |

## Complément — 23 octobre 2026

- Le formulaire d'ajout d'un collaborateur exige nom et email, puis l'interface annonce l'envoi d'un email d'invitation. Il n'a donc pas été soumis : l'audit ne déclenche pas de communication externe.
- Le contrôle Équipe/Planning confirme que leur incohérence apparente venait d'un rendu avant fin de chargement, et non d'une divergence persistante des effectifs observés.
- Revue statique Wallet : `calculerSolde` prend toutes les lignes tenant-scopées avec statut `confirmé`, `viré` ou `à_virer`, crédite les entrées nettes de commission et débite les sorties. Les lignes `en_attente` ne sont pas disponibles.
- Revue statique Facturation : le KPI `CA HT total` est la somme sans filtre des `montant_ht` retournés par `GET /api/factures?action=list`. L'écart visuel doit être recetté contre la réponse et les données TEST.
- Revue statique Annuaire : les lectures sont tenant-scopées. Les actions `supprimer_contact`, `valider_mise_en_relation`, `definir_montant` et `marquer_commission_payee` ciblent seulement `id`, sans `tenant_id` : faille d'isolation inter-tenant à corriger avant toute recette d'écriture.
- Revue statique Support : le paramètre URL `admin=true` suffit à lire tous les tickets via un client service-role ; la réponse à un ticket ne vérifie ni rôle, ni tenant. La création accepte aussi un `tenant_id` et un email fournis par le client. Ce module ne doit pas être utilisé tant que les contrôles serveur ne sont pas corrigés.

## Correctifs locaux en attente de TEST

- Annuaire : toutes les mutations sont désormais filtrées par `tenant_id`; le contact est vérifié avant une mise en relation; le montant est validé et la commission est imposée à 3 % côté serveur.
- Support : le paramètre `admin=true` est supprimé; les tickets sont lus par `tenant_id`; la création reprend l'identité du tenant côté serveur; la réponse est réservée à un administrateur plateforme identifié par `PLATFORM_ADMIN_EMAILS`.
- Ces correctifs ne sont pas encore déployés sur `xyratest1`; ils doivent être recettés avec un administrateur plateforme configuré sur l'environnement TEST.

## Limites de cette tranche

- L'état visuel et les données chargées sont vérifiés ; les routes réseau, logs serveur et policies RLS ne sont pas encore recettés dans le navigateur.
- Les seules écritures réalisées sont les trois créations internes tracées ci-dessus. Les boutons d'envoi WhatsApp/email, de paiement, d'achat de module et de suppression ne sont pas activés.
- Toute prochaine recette d'écriture exige un jeu de données TEST isolé et une validation immédiate pour l'action concernée.

## Séquence suivante

1. Continuer les créations internes sur les modules sans effet externe : équipe, planning, devis non envoyé, frais, événements et mission.
2. Vérifier chaque création par rechargement, historique et isolation tenant.
3. Corriger ou isoler les P0 avant de recetter paiements, droits, tickets support ou actions liées aux données financières.
4. Recetter par rôle : owner, admin/manager et salarié, avec un tenant distinct non propriétaire.
