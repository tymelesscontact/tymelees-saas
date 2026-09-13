# Feuille de route — Audit complet Xyra

Document vivant. Chaque module du Dashboard a sa fiche : rôle, fichiers,
connexions BDD, boutons/actions, problèmes trouvés. Mis à jour à chaque
sujet réglé — statut `✅ réglé` / `🟡 en cours` / `🔴 à faire` / `🔍 à auditer`.

Toute correction issue de ce document suit le cycle normal (`AGENTS.md`) :
OBSERVATION → ANALYSE → PROPOSITION → VALIDATION HUMAINE → MODIFICATION →
TEST → VÉRIFICATION → VALIDATION FINALE → MAIN. Ce document ne fait que
lister ce qui a été trouvé — rien n'est corrigé ici sans validation.

Dernière mise à jour : 2026-09-13.

---

## 0. Architecture générale

- Entrée du Dashboard tenant : [app/mon-espace/xyra.jsx](../app/mon-espace/xyra.jsx)
  (le fichier `app/dashboard/tymeless.jsx` en est une variante proche, à
  comparer un jour — voir §Constats transverses).
- Un seul composant géant : state `page` (id du module actif), un objet
  `pageMap` associe chaque id à son composant `app/modules/Page*.tsx`.
  Sidebar construite depuis le tableau `NAV` (groupes + items).
- **Contrôle d'accès par plan** : `PAGE_ACCESS` (par id de module) +
  `MODULES_PAR_SECTEUR` (par secteur d'activité, ex. conciergerie/BTP/hôtel)
  filtrent ce qui apparaît dans la sidebar. Chaque `Page*.tsx` revérifie lui
  même via `hasAccess(plan, "id")` (import `app/lib/plans.ts`) et affiche
  `<UpgradeWall/>` si non autorisé.
  ⚠️ **Ce contrôle est 100% côté client, purement déclaratif.** Aucune route
  API vérifiée cette session ne revérifie le `plan` de l'abonnement — elles
  vérifient seulement que le `tenant_id` appelant est bien le propriétaire
  de la donnée. Concrètement : un tenant Starter (59€) qui appelle
  directement une route API "Business" (ex. `/api/deals`, `/api/tresorerie`)
  reçoit une vraie réponse, sans blocage serveur. Le paywall ne protège que
  l'UI, pas la donnée. Voir Constats transverses.
- Secteur d'activité (`profil`) vient de `/api/get-secteur` /
  `/api/save-secteur` / `/api/generer-secteur` (génération IA de nouveaux
  métiers non listés).
- Multi-société : sélecteur en haut de la sidebar (`/api/mes-societes`,
  `/api/changer-societe`, `/api/ajouter-societe`), indépendant du module
  "Multi-Sociétés" (`PageMultiSocietes.tsx`, plans multi_* uniquement).

## 1. Constats transverses (touchent plusieurs modules)

| # | Constat | Statut | Détail |
|---|---|---|---|
| T1 | Paywall client-side uniquement, aucune vérification `plan` côté serveur | 🟡 largement réglé (12/09/2026) | Nouvelle fonction `verifierAccesModule` (`app/lib/supabaseServer.ts`) réutilisant exactement la règle client (`hasAccess`). Ajoutée sur 20 routes à consommateur unique/homogène (cartes, clients, deals, tresorerie, analytique, partenaires, annuaire, scoring, fournisseurs, multi-societes, notifications, api-xyra, notefrais + ocr + justificatif, planning-missions, absences, position, evenements, contrats). Build vérifié, testé par l'utilisateur sur `test` — tous les modules habituels fonctionnent normalement. **Volontairement pas touché** : les routes partagées par plusieurs pages à des niveaux d'accès différents (`wallet`, `factures`, `devis`, `crm`, `chat`, `equipe`, `stock`, `charges`, `whoami`, `signalements`, `ia`, `services-catalogue`, `produits-catalogue`) — les restreindre casserait un usage légitime (ex. l'Accueil, ouvert à tous, lit `/api/wallet`) ; nécessiterait un contrôle par action précise plutôt que par route entière, chantier séparé si voulu. |
| T2 | `hasAccess(plan,"crm")` dans [PageDeals.tsx:88](../app/modules/PageDeals.tsx#L88) au lieu de `"deals"` | ✅ réglé (10/09/2026) | Clé corrigée en `"deals"`. Testé et poussé sur `test`. |
| T3 | `hasAccess(plan,"signatures")` dans [PageSignatures.tsx:123](../app/modules/PageSignatures.tsx#L123) au lieu de `"signature"` | ✅ réglé (10/09/2026) | Clé corrigée en `"signature"`. Testé et poussé sur `test`. |
| T4 | `hasAccess(plan,"compta")` dans [PageFacturation.tsx:114](../app/modules/PageFacturation.tsx#L114) au lieu de `"facturation"` | ✅ réglé (10/09/2026) | Clé corrigée en `"facturation"`. Testé et poussé sur `test`. |
| T5 | `hasAccess(plan,"deploiement")` dans [PageAPI.tsx:96](../app/modules/PageAPI.tsx#L96) au lieu de `"api"` | ✅ réglé (11/09/2026) | Corrigé au passage pendant le nettoyage label/clé de `UpgradeWall` (voir T21). |
| T6 | `IbanMondial` ([app/mon-espace/xyra.jsx](../app/mon-espace/xyra.jsx)), utilisé dans Wallet & Paiements | ✅ réglé et testé (10/09/2026) | Corrigé : nouvelle route `app/api/wallet-ibans/route.ts` (service-role + `tenant_id` imposé) ; `IbanMondial` passe désormais par `fetch()` au lieu d'un client Supabase direct côté navigateur ; colonne `tenant_id` ajoutée sur `wallet_ibans` + policy `isolation_tenant_wallet_ibans` (`appartient_au_tenant`) remplaçant l'ancienne policy ouverte `using(true)`. Testé en conditions réelles sur `test` (ajout/suppression d'IBAN) — OK. |
| T7 | Deux fichiers dashboard quasi-identiques : `app/mon-espace/xyra.jsx` (customer, routé `/mon-espace`) et `app/dashboard/tymeless.jsx` (owner, routé `/dashboard`) | 🟡 en partie réglé | Comprendre pourquoi les deux existent : ce n'est pas un bug — `app/login/page.tsx` route vers l'un ou l'autre selon le rôle (owner vs client). Le vrai souci est la **duplication de code** entre les deux. Premier pas fait le 11/09 : le composant `UpgradeWall` (+ `MODULE_PRICES`/`MODULE_PREVIEWS`) a été extrait en un seul fichier partagé `app/modules/UpgradeWall.tsx`, importé par les deux dashboards — un seul endroit à corriger désormais pour ce composant. Le reste des ~900 lignes de chaque fichier (sidebar, state, pageMap) reste dupliqué — chantier de fond, pas commencé. |
| T8 | Menu réel vs code | ✅ non-problème | Le premier menu collé était partiel. Le second collage (complet, avec "Bientôt disponible") correspond exactement au `NAV` du code — même ordre, mêmes 24 items + 10 items "à venir", mêmes badges. Pas de filtrage anormal, le compte Tymeless voit tout. |
| T9 | Cluster "business" abandonné (16 tables) | ✅ réglé (09/09/2026) | Supprimé — voir séance du jour. |
| T10 | Annuaire/Réseau cassé (`reseau_contacts`/`reseau_deals` inexistantes en base) | 🔴 à faire — reporté à plus tard | Décision explicite : on s'en occupe après. Ne pas commencer sans feu vert. |
| T11 | 13 tables mortes supplémentaires trouvées (`escrow_transactions`, `payment_links`, `payment_customers`, `annuaire`, `demandes_missions`, `inscriptions_evenements`, `investissement_declenchements`, `investissement_recommandations`, `kpi_annuels`, `kpi_mensuels`, `payouts`, `transactions`, `commissions`) | 🟡 12 à trier | `investissement_recommandations` sortie du lot (13/09/2026) : remise en service avec l'ajout de `tenant_id`, voir fiche Investissement IA. Les 12 autres restent 0 ligne, 0 usage code — à trier. `investissement_declenchements`/`kpi_annuels`/`kpi_mensuels` restent délibérément hors périmètre (moteur de règles par employé jamais fini, non nécessaire au rôle du module). |
| T12 | Policy publique `companies` (boutique) | 🔴 bloqué | Migration refusée par le classifieur auto-mode (volume de migrations). La boutique publique (lookup société par slug) reste cassée pour visiteurs anonymes. |
| T13 | RLS : ~35 tables "fonctionnalité jamais construite" restantes sur les 91 initiales | 🔍 en attente d'arbitrage | Recommandation : ne pas créer de policy tant que la fonctionnalité n'est pas réellement développée (éviter policies spéculatives sur un schéma pas encore figé). |
| T22 | `/api/wallet-membres` (page "Wallet & Membres") totalement ouvert — aucune vérification | ✅ réglé (12/09/2026) | Découvert en travaillant sur T1 : cette page n'est pas un module client, c'est le tableau de bord interne listant **tous les clients Xyra** (société, forfait, MRR, statut) — et la route ne vérifiait ni session ni identité. N'importe qui, même non connecté, pouvait lire la liste complète des clients et leur chiffre d'affaires, et même changer le forfait ou suspendre n'importe quel client (`upgrade`/`downgrade`/`suspendre`/`reactiver` sans contrôle). Corrigé en ajoutant la même vérification `estOwner()` déjà utilisée sur `/api/deploiement` (compare l'email de la session à `OWNER_EMAIL`) sur GET et POST. Build vérifié. `/api/deploiement` (page "Déploiement Tenant", même famille) avait déjà cette protection sur l'essentiel de ses actions — non retouché. |

## 2. Fiches par module

Légende statut : ✅ audité et sain · 🟡 audité, problèmes mineurs notés ·
🔴 audité, problèmes sérieux notés · 🔍 pas encore audité en profondeur.

### ACCUEIL

#### 🏠 Accueil — `PageAccueil.tsx`
- **Statut** : 🟡
- Vue d'accueil : notifications, résumé. Utilise aussi en parallèle
  `PageOverview.tsx` (id `overview`, "Vue d'ensemble" dans BUSINESS) qui,
  lui, calcule le vrai pipeline devis/factures (voir séance précédente :
  8 KPIs, score santé business).
- Corrigé cette session : client Supabase passé en service-role (routes
  concernées), sinon tout s'affichait à 0 à cause du bug JWT/anon-key.
- **Reste à vérifier** : bouton par bouton, cohérence avec `PageOverview`
  (redondance ou complémentarité réelle ?).

### MON ESPACE

#### 💳 Wallet & Paiements — `PageWallet.tsx` / `api/wallet`
- **Statut** : 🔴 (à cause de T6, `IbanMondial`)
- Encaissement (lien Stripe), paiement sortant (virement à exécuter
  manuellement), historique. Déjà audité et sécurisé cette session
  (service-role + tenant_id partout dans `api/wallet/route.ts`).
- Contient `IbanMondial` → **fuite cross-tenant confirmée (T6)**.
- Contient aussi le "Convertisseur" (calcul local, pas de faille).

#### ◈ Cartes Virtuelles — `PageCartes.tsx` / `api/cartes`
- **Statut** : 🔴 (paywall composant réglé — T17, 11/09/2026)
- **Rôle** : cartes bancaires virtuelles par collaborateur/projet, transactions, approbations de dépenses, budgets par projet, analyse IA des dépenses.
- **Tables** : `cartes_virtuelles`, `cartes_transactions`, `cartes_budgets_projet`.
- **Problèmes trouvés** :
  - ✅ **Réglé (T17)** : `hasAccess(plan,"cartes",modulesActifs)` + `<UpgradeWall/>` ajoutés. Le verrou sidebar reste purement visuel (`xyra.jsx`/`tymeless.jsx` laissent `setPage()` s'exécuter même sur un item "🔒") mais le composant lui-même bloque désormais correctement l'affichage pour un plan non autorisé.
  - `api/cartes/route.ts` action `create` (l.71-86) : pas de garde `if(!tenantId)` avant l'insert (contrairement aux autres actions) → un appel non authentifié crée une carte `tenant_id: null` (client service-role, bypass RLS).
  - `ajouter_transaction` (l.119-129) : insère sans `tenant_id` alors que les lectures filtrent dessus → transaction invisible ensuite dans l'historique/les approbations (bug fonctionnel, pas juste sécurité).
  - `approuver_transaction` (l.136-142) : `update().eq('id',id)` **sans** `.eq('tenant_id',tenantId)` → un autre tenant connaissant/devinant un id de transaction pourrait l'approuver (fuite cross-tenant en écriture).
  - Fuites `error.message` brutes : l.84, 126, 152, 160.
  - Onglet "🛡 Sécurité" (plafonds, pays autorisés, toggles) entièrement cosmétique : aucun bouton Enregistrer, aucun `onClick` sur les toggles — faux boutons.

### BUSINESS

#### ◈ Vue d'ensemble — `PageOverview.tsx`
- **Statut** : 🟡
- Calcule pipeline devis signés + factures impayées, réutilisé aussi dans
  Trésorerie/Wallet. Fixé cette session (service-role).

#### ◎ CRM — `PageCRM.tsx` / `api/crm`
- **Statut** : ✅ (mineur)
- **Rôle** : pipeline commercial (leads, étapes, score), relances IA (WhatsApp/email) via Claude, analytics conversion.
- **Tables** : `crm_leads`.
- Module sain : `hasAccess` correct, toutes les requêtes bien filtrées par `tenant_id`, tous les boutons ont leur action API. Seul point : fuites `error.message` brutes sur plusieurs branches d'erreur.

#### ◧ Devis — `PageDevis.tsx` / `api/devis`
- **Statut** : 🟡
- Pipeline connu (signature, calcul CA). Manques déjà identifiés plus tôt
  dans l'engagement (non corrigés, hors sujet du jour) :
  - pas de capture IP/horodatage réelle à la signature (contrats, oui —
    devis, non) ;
  - création silencieuse d'un compte Supabase Auth à la signature, non
    annoncée au client ;
  - `getSupabase()` dans `devis/route.ts` a un fallback silencieux vers la
    clé anon (à vérifier si encore le cas après les corrections de la
    session précédente) ;
  - fuite de `error.message` brut sur certaines routes.

#### ◐ Investissement IA — `PageInvestissement.tsx` — `api/investissement`
- **Statut** : ✅ réglé, build vérifié (13/09/2026) — module reconstruit pour de vrai (T15, 2/3)
- **Rôle** : l'IA analyse la vraie situation financière du tenant (CA réel via `factures` payées, charges réelles) et propose des investissements chiffrés (budget, ROI, délai) ; le patron valide ou refuse pour de vrai.
- **Ce qui a changé** : nouvelle route `app/api/investissement/route.ts` — `GET` renvoie les recommandations réelles + un portefeuille calculé sur celles validées ; `POST action:'generer'` calcule le CA/charges/marge réels du tenant, interroge Claude (`askClaude`, même pattern que `scoring`/`analytique`) avec un prompt demandant un JSON strict, parse et persiste le résultat (`investissement_recommandations`, colonne `tenant_id` ajoutée — table prévue à l'origine mais jamais dotée de cette colonne, même défaut que `formations_equipe`) ; `POST action:'valider'/'rejeter'` change réellement le statut. `PageInvestissement.tsx` entièrement réécrit sur ces vraies données ; l'onglet Scénarios calcule désormais 3 projections (+15/+35/+60%) sur le vrai CA au lieu de 3 montants fixes ; l'onglet Plan d'action affiche la description de la dernière recommandation validée au lieu d'un plan à 4 étapes toujours identique.
- **Volontairement hors périmètre** (décidé avec l'utilisateur) : les tables `investissement_declenchements`/`kpi_mensuels`/`kpi_annuels` (T11) restent mortes — elles étaient conçues pour un moteur de règles automatique par employé (`regle_id` pointant vers une table de règles qui n'existe même pas), jamais fini, hors du rôle demandé pour ce module.
  - Ce module facture pourtant 24€/mois (`MODULE_PRICES.investissement`) pour une fonctionnalité qui n'existe pas côté backend.

#### ◉ Comptabilité — `PageCompta.tsx` — pas de route dédiée (agrège `/api/wallet`, `/api/factures`, `/api/charges`, `/api/fournisseurs` + 1 requête directe client)
- **Statut** : 🟡 (le point le plus sérieux vérifié non-problème — T20)
- **Rôle** : journal comptable, bilan, TVA, charges/fournisseurs, conseils IA fiscaux, exports FEC/CSV/PDF — reconstruit à partir des vraies transactions Wallet/Factures.
- **Problèmes trouvés** :
  - 🟢 **Vérifié, non-problème (T20)** : `PageCompta.tsx:25-30` instancie un client Supabase directement dans le navigateur et fait `sb.from('notes_frais').select('tva').eq('statut','validé')` sans `.eq('tenant_id', ...)` explicite dans le code — mais la policy RLS sur `notes_frais` filtre déjà par tenant côté base, donc aucune fuite réelle possible (contrairement à T6 où la policy était ouverte). Reste un pattern à éviter pour la lisibilité, pas une faille.
  - Boutons "fantômes" dans l'onglet Export : `Export Excel`, `Rapport PDF mensuel`, `Envoyer à l'expert-comptable` ne font qu'un `showToast` — seuls `exportFEC`/`exportCSV`/l'aperçu bilan PDF sont réellement implémentés.
  - Hérite des mêmes failles que la fiche Fournisseurs ci-dessus (`creer`/`commander` sans garde `tenantId`).
  - `hasAccess` correct.

#### 🧾 Notes de Frais — `PageNoteFrais.tsx` / `api/notefrais`
- **Statut** : 🔴 (paywall composant réglé — T17, 11/09/2026)
- **Rôle** : saisie de notes de frais avec OCR (Claude Vision), workflow de validation, écriture Wallet automatique, export FEC, budgets par catégorie.
- **Tables** : `notes_frais`, `budgets_frais`, `wallet_transactions`.
- **Problèmes trouvés** :
  - ✅ **Réglé (T17)** : import `hasAccess`/`UpgradeWall` + garde ajoutés. Un tenant Starter (module réservé Business+) est désormais bien bloqué.
  - `action==='create'` (`api/notefrais/route.ts:36-93`) : aucune garde `if(!tenantId)` avant l'insert → note de frais possible avec `tenant_id: null` si la session a expiré.
  - Fuites `error.message` brutes sur GET et POST.
  - Boutons fantômes (Export Excel, Envoyer à l'expert-comptable, Rapport PDF mensuel) — seul l'export FEC est réel.
  - Onglet Analytics : liste d'employés en dur au lieu d'être dérivée des vraies notes.
  - Point positif : le flux principal (liste, validation, remboursement → écriture Wallet réelle) est bien implémenté et correctement scopé par tenant.

#### ◑ Trésorerie 90 jours — `PageTresorerie.tsx` / `api/tresorerie`
- **Statut** : ✅ audité et sécurisé cette session (service-role, colonne
  `tenant_id` ajoutée sur `tresorerie_lignes_manuelles`).

#### ◒ Analytique & CA — `PageAnalytique.tsx` / `api/analytique`
- **Statut** : 🟡 — client déjà passé en service-role cette session ;
  logique interne (calculs CA/pays/prédictions) pas encore relue en détail.

### RÉSEAU

#### ◬ Clients — `PageClients.tsx` / `api/clients`
- **Statut** : 🟡 — vulnérabilité tenant_id déjà corrigée sur create/modifier/
  supprimer/toggle_vip (commits récents : "Faille grave corrigée"). Reste à
  vérifier le reste des boutons.

#### ⊞ Fournisseurs — `PageFournisseurs.tsx` / `api/fournisseurs`
- **Statut** : 🔴 (paywall composant réglé — T17, 11/09/2026)
- **Rôle** : carnet fournisseurs (coordonnées, IBAN, délais), chat, déclenchement de commandes/virements.
- **Tables** : `fournisseurs`, `wallet_transactions` (via action `commander`).
- **Problèmes trouvés** :
  - ✅ **Réglé (T17)** : `hasAccess(plan,"fournisseurs",modulesActifs)` + `<UpgradeWall/>` ajoutés. Un tenant Starter ne peut plus faire de CRUD sur ses fournisseurs sans avoir le plan ou le module à la carte.
  - Action `creer` (l.24-33) : pas de garde `if(!tenantId)` avant l'insert (contrairement à `modifier`/`supprimer`) → tenant_id null possible.
  - Action `commander` (l.59-61, déclenche un virement SEPA simulé dans `wallet_transactions`) : **aucune** vérification de `tenantId`, malgré l'impact financier de l'action — un appel non authentifié insère une transaction wallet `tenant_id: null`.
  - Fuites `error.message` brutes : l.17, 32, 48, 56, 75.

#### ◈ Espace revendeur — `PageRevendeur.tsx` / `api/revendeur`
- **Statut** : 🟡
- **Rôle** : back-office white-label pour partenaires revendeurs — gestion de leurs clients (créer/activer/suspendre), personnalisation de marque.
- **Tables** : `revendeurs`, `tenants`.
- **Problèmes trouvés** :
  - Pas de `hasAccess()` côté composant, mais **sans risque réel** : l'API exige une ligne active dans `revendeurs` liée au `tenant_id` (contrôle serveur réel, indépendant du plan déclaré) — juste un défaut de cohérence UX, pas une fuite.
  - Toutes les requêtes DB correctement scopées par `tenant_id`/`revendeur_id` — rien à signaler côté isolation.
  - Fuites `error.message` brutes : l.121, 135, 147.
  - Mineur : `creer_client` avale silencieusement l'échec de l'invitation Supabase Auth (juste un `console.error`) et crée quand même le tenant avec `user_id: null`, sans le signaler dans l'UI (toast de succès générique).

#### ⬡ Partenaires & AA — `PagePartenaires.tsx` / `api/partenaires`
- **Statut** : 🟡 — client déjà passé en service-role cette session.

#### ◈ Club d'affaires — `PageClubAffaires.tsx` / `api/club*`
- **Statut** : 🟡 — c'est le vrai réseau `club_*`, fonctionnel et déjà
  largement audité/sécurisé lors des sessions précédentes (règlement,
  contrat_id, RLS complète).

#### 🏢 Multi-Sociétés — `PageMultiSocietes.tsx` / `api/multi-societes`
- **Statut** : ✅ audité et sécurisé cette session (réécriture complète,
  faille cross-tenant corrigée, `tenant_id` manquant à la création corrigé).

#### ◱ Réseau & Annuaire — `PageAnnuaire.tsx` / `api/annuaire`
- **Statut** : 🔴 cassé — voir T10. Reporté après validation utilisateur.

#### ◆ Événements — `PageEvenements.tsx` / `api/evenements`
- **Statut** : 🟡
- **Rôle** : création/gestion d'événements networking, inscriptions publiques, check-in, invitations WhatsApp, rappels J-7/J-1, ROI IA.
- **Tables** : `evenements`, `evenements_inscrits`, `club_membres` (vérif fondateur).
- **Problèmes trouvés** :
  - Seul des 4 modules de ce lot à avoir un contrôle d'accès cohérent (`hasAccess(plan,"evenements")` correspond bien à la clé réelle).
  - Action `create` (l.86-100) : pour la portée `société`/`public`, aucune exigence de `tenantId` — un appel non authentifié avec `portee:'public'` crée un événement visible publiquement (`tenant_id: null`). Risque de spam/événements factices.
  - Fuites `error.message` brutes : l.123, 177.
  - Le bouton "📱 Inviter" (le réseau) n'envoie en réalité qu'**un seul** WhatsApp au numéro du owner (`OWNER_WHATSAPP`) — le libellé laisse croire à une diffusion réseau, c'est en fait juste une notification interne.
  - Reste (list/inscrits/rappels/checkin) correctement filtré par tenant/club.

#### ★ Réputation & NPS — `PageScoring.tsx` / `api/scoring`
- **Statut** : 🟡 — client déjà passé en service-role cette session.

### OPÉRATIONS

#### ⊞ Équipe — `PageEquipe.tsx` / `api/equipe` (+ `api/pointage`, `api/absences`)
- **Statut** : 🔴
- **Rôle** : module RH annoncé "16 modules RH, pointage GPS, paie automatique" — fiches collaborateurs, pointage, congés, arrêts, paie, contrats, documents, évaluations, formations, carrière, juridique.
- **Tables** : `equipe`, `pointages`, `conges`, `absences`, `acomptes`, `evaluations`, `formations_equipe`, `missions`, `tenant_membres`, `wallet_transactions`.
- **Problèmes trouvés** (isolation tenant correcte partout, `hasAccess` correct — mais énormément de boutons fictifs) :
  - **"Pointage GPS" entièrement fictif** : le bouton "⏰ Pointer" ne fait qu'un `setEquipe` local, n'appelle jamais `POST /api/pointage` (qui existe pourtant côté backend) — aucune capture GPS réelle nulle part (`navigator.geolocation` absent). Le vrai suivi GPS existant (`positions_collaborateurs`/`/api/position`) ne sert qu'à la carte du module Planning, pas à Équipe.
  - Onglet "Congés" : demandes affichées en dur, boutons "Approuver"/"Refuser" ne modifient que l'état local — jamais d'appel aux actions réelles `valider_conge`/`refuser_conge` qui existent côté API.
  - "+ Déclarer un arrêt" : idem, local uniquement, sans appeler `POST /api/absences` (action `declarer`) — pourtant correctement utilisée ailleurs, depuis `PagePlanning.tsx`. Deux implémentations RH incohérentes dans le même produit.
  - Onglets Paie/Contrats/Documents/Évaluations/Formations/Carrière/Juridique : quasiment tous les boutons ne font qu'un `showToast`, sans aucun appel réseau, alors que le backend expose déjà `ajouter_evaluation`/`ajouter_formation`/`generer_fiche_paie` — fonctionnalités prêtes côté serveur, jamais branchées côté UI.
  - Données RH sensibles (salaire, NSS, RIB, adresse) de **tous** les employés renvoyées à quiconque charge la page — l'accès n'est géré que par plan d'abonnement, jamais par rôle utilisateur : un simple collaborateur invité verrait les données RH de tous ses collègues.
  - Fuites `error.message` brutes sur plusieurs endpoints.

#### ⊡ Planning & Agenda — `PagePlanning.tsx` / `api/planning-missions` (+ `api/absences`, `api/position`, `api/signalements`)
- **Statut** : 🟡
- **Rôle** : dispatch quotidien des missions, gestion des absences, suivi GPS temps réel des collaborateurs sur carte, signalements terrain.
- **Tables** : `missions`, `missions_collaborateurs`, `absences`, `positions_collaborateurs`, `liste_attente_planning`, `equipe`, `devis`, `factures`.
- **Problèmes trouvés** :
  - Action `presence_collaborateur` (`api/planning-missions/route.ts:208-216`) met à jour `missions_collaborateurs` en filtrant seulement par `mission_id`/`collaborateur_id`, **sans vérifier que la mission appartient au tenant appelant** — IDOR potentiel si ces UUID fuitaient/étaient devinés.
  - Fuites `error.message` brutes sur plusieurs actions.
  - Sinon module sain : toutes les autres requêtes bien filtrées/écrites par `tenant_id`, `hasAccess` correct, aucune donnée factice détectée.

#### ⊕ Prospection Auto — `PageProspection.tsx` / `api/prospection` (Enterprise uniquement)
- **Statut** : 🔴
- **Rôle annoncé** : hub SIRENE · Bot vocal · Bot WhatsApp · LinkedIn — leads à prospecter, séquences email IA, bot WhatsApp (Lea), agent vocal IA sortant (Lea/Vapi), stats LinkedIn.
- **Tables** : `crm_leads`, `relance_sequences/etapes/contacts`, `conduit`, `devis`, `secteurs_generes`.
- **Problèmes trouvés** :
  - **L'agent vocal "Lea" (fonctionnalité phare de ce module, module facturé 29€/mois) est entièrement non fonctionnel.** L'UI envoie `POST /api/prospection` (`action:'call'`) et lit `GET ?action=calls`, mais la route API **n'exporte qu'un `GET`** qui ignore tout paramètre `action` et renvoie toujours les stats du bot WhatsApp — aucun `POST`, aucune intégration Vapi trouvée nulle part dans le code (`ASSISTANT_ID`/`PHONE_ID` codés en dur côté UI sans rien derrière). Les boutons "🎙 Lea appelle maintenant", "Appeler", "Lancer" échouent silencieusement (405/aucune action), l'historique reste vide en permanence — mise en scène UI sans aucun backend.
  - Pas de vraie recherche SIRENE : l'onglet "SIRENE/Leads" ne fait qu'un `GET /api/crm` filtré côté client — aucune route de recherche SIRENE n'existe. Le message d'aide qui y renvoie est trompeur.
  - Onglets "LinkedIn" et "Stats" : chiffres 100% en dur (`84`, `31`, `27`, `4`, `71`, `12%`, `8 400€`), aucun fetch, présentés comme des KPI réels.
  - Bot WhatsApp et RelanceIA (email), eux, sont réels et correctement scopés par tenant — aucun problème là-dessus.

#### 📋 Deals & Opportunités — `PageDeals.tsx` / `api/deals`
- **Statut** : 🟢 — T2 réglé (clé de paywall corrigée) ; API déjà auditée/
  corrigée cette session (bug `set_objectif` partagé entre tous les tenants).

#### ⊟ Stock — `PageStock.tsx` / `api/stock`
- **Statut** : 🟡 — client déjà passé en service-role cette session.

#### ⊛ Produits & Services — `PageServices.tsx` / `api/services-catalogue`
- **Statut** : 🟡 — client déjà passé en service-role cette session.

### DÉVELOPPEMENT

#### 💬 Chat — `PageChat.tsx` / `api/chat`, `api/email-entrant`
- **Statut** : 🟡 (IDOR réglé, réception email en cours de branchement)
- **Nouveau (09/09/2026)** : réception des réponses email dans le Chat.
  Avant, seul WhatsApp avait un vrai aller-retour (webhook Meta) — une
  réponse par email n'apparaissait jamais dans le Dashboard (constaté par
  l'utilisateur en testant T14/T6). Construit : `api/email-entrant`
  (webhook Resend "Inbound", vérifié par signature Svix), `Reply-To
  conv-<id>@reply.xyraio.fr` ajouté aux emails sortants du Chat
  (`app/lib/rappels.ts`), route ouverte dans `middleware.ts`
  (`API_OUVERTES`). Code poussé sur `test` (commit `a29ded3`).
  **Reste à faire côté utilisateur, hors de portée de ce projet** :
  enregistrement MX pour `reply.xyraio.fr`, domaine de réception +
  webhook `email.received` côté Resend, variable Vercel
  `RESEND_WEBHOOK_SECRET`. Sans ça le code est en place mais ne reçoit
  encore rien.
  Piste WhatsApp/Meta non connectée sur `test` (diagnostiquée : `tenants.
  whatsapp_actif = false` pour Tymeless, dépend ensuite du token Meta
  plateforme) — reportée, à traiter séparément sur demande.
- **Rôle** : messagerie interne équipe + clients/partenaires (relai WhatsApp/email/SMS), visio Jitsi, suggestions/résumés IA, création rapide de deal/devis/réception stock depuis une conversation.
- **Tables** : `conversations`, `chat_messages`, `conversation_participants`, `deals`, `devis`, `notifications`, `tenants`, `equipe`, `partenaires`, `factures`, `commandes`.
- **Problèmes trouvés** :
  - **IDOR confirmé** sur `marquer_lu`, `supprimer_conversation`, `lien_fichier`, `participants`, `ajouter_participant`/`retirer_participant` (`api/chat/route.ts:185-199, 372-387, 462-495`) : le contrôle est `if (!c || (tenantId && c.tenant_id !== tenantId))`. Si `tenantId` est `null` (appel non authentifié), la condition `tenantId && ...` est court-circuitée à `false` → **le contrôle est entièrement désactivé** : un appelant anonyme connaissant/devinant un `conversation_id` peut supprimer une conversation, la marquer comme lue, obtenir une URL signée d'un fichier privé, ou modifier ses participants, sur N'IMPORTE QUEL tenant. Il faut exiger `tenantId` non nul ET correspondant (`!tenantId || c.tenant_id !== tenantId`), pas juste conditionner dessus.
  - `verifier_inactivite` (`api/chat/route.ts:249`) charge **tous** les messages de **tous** les tenants sans filtre avant de filtrer côté JS — exécuté toutes les 5 min par onglet ouvert (coût + design à revoir).
  - Fuites `error.message` brutes à de nombreux endroits.
  - `chat` n'a aucune entrée dans `PAGE_ACCESS` → accessible à tous les plans sans distinction (à confirmer si voulu).

#### 💬 WhatsApp — Lea — `PageConversationsWhatsapp.tsx` / `api/conversations-whatsapp`
- **Statut** : 🟡
- **Rôle** : conversations gérées par l'agent IA WhatsApp "Lea", reprise de main humaine, réactivation IA.
- **Tables** : `conduit`, `tenants` (config WhatsApp).
- **Problèmes trouvés** : module globalement sain (toutes les requêtes filtrées par `tenant_id`, token WhatsApp jamais renvoyé au client). Fuite mineure `error.message` sur le GET. Comme Chat, aucune entrée `"conversations_whatsapp"` dans `PAGE_ACCESS` (accessible à tous les plans sans distinction — à confirmer si voulu, module normalement lié à Enterprise).

#### 🔔 Notifications — `PageNotifications.tsx` / `api/notifications`
- **Statut** : 🔴
- **Rôle** : centre de notifications temps réel (stock critique, factures en retard, congés, acomptes, deals inactifs, leads CRM…), config canaux par type, digest WhatsApp quotidien.
- **Tables** : `notifications`, `notif_preferences`, `wallet_transactions`, `conges`, `acomptes`, `stock`, `deals`, `factures`, `crm_leads`, `tenants`.
- **Problèmes trouvés** :
  - Bouton "🔔 Tester" : `showToast` seul, rien n'est réellement envoyé.
  - Onglet "⚙ Configuration" purement local : chaque toggle appelle `setConfig()` mais jamais la fonction `_updatePref` (existe, jamais invoquée) qui appellerait pourtant bien `POST /api/notifications action=update_preference` — **les préférences ne sont jamais sauvegardées**, elles se réinitialisent à chaque rechargement.
  - Onglet "📱 WhatsApp auto" entièrement en dur, toggles et "Tester ce message" ne font que `showToast` — les vraies routes (`push_whatsapp`, `digest_quotidien`) existent côté API mais ne sont jamais appelées.
  - Code mort : plusieurs états chargés (`_notifsReal`, `_autoNotifs`, `_prefs`, `_nonLus`) jamais utilisés dans le rendu.
  - Fuite `error.message` brute.
  - `hasAccess` correct.

#### ✦ Contrats & Signatures — `PageSignatures.tsx` / `api/contrats`
- **Statut** : 🟢 — T3 réglé (clé de paywall corrigée, plus d'accès libre).
  Par ailleurs déjà bien avancé cette session : modèles CDI/CDD/apprentissage,
  bibliothèque Xyra + modèles tenant, actions créer/dupliquer/supprimer.
  Manque connu : multi-signataires (bloque la convention de stage).

#### 🧾 Facturation Électronique — `PageFacturation.tsx` / `api/factures`
- **Statut** : 🟢 — T4 réglé (clients Starter ne sont plus bloqués à tort).
  Reste à auditer : conformité Factur-X/Chorus Pro annoncée dans
  `MODULE_PREVIEWS` mais jamais confirmée comme réellement implémentée.

#### ⊿ Formation équipe — `PageFormation.tsx` — `api/equipe`
- **Statut** : ✅ réglé et testé (13/09/2026) — module reconstruit pour de vrai (T15, 1/3)
- **Rôle** : suivi des formations de l'équipe + bibliothèque de vidéos de formation réelles par métier.
- **Ce qui a changé** : `formations_equipe` avait déjà une vraie table et une vraie action `ajouter_formation` côté API, jamais branchées côté écran — colonne `tenant_id` manquante ajoutée (migration), nouvelle action `maj_formation` (statut/score), `PageFormation.tsx` entièrement réécrit sur les vraies données (`GET /api/equipe`), KPIs recalculés dessus, formulaire d'ajout + boutons Démarrer/Terminer persistant réellement.
- **Bibliothèque vidéo** : nouvelle table `formations_catalogue` + bucket Storage public `formations-videos`. 10 vidéos de formation produites (script réel fourni par l'utilisateur, `Tymeless_Scripts_Formation.docx`) : Réception, Bagagiste, Conciergerie, Femmes de chambre, Normes de luxe, Nettoyage hôtel, Protocole général, HACCP, Yachts, Jet privé. Pipeline Remotion (scratchpad, hors dépôt Xyra) : photos réelles Wikimedia Commons par point/situation (jamais deux modules sur la même image), voix off en français via Microsoft Edge TTS (neuronal, gratuit, illimité — remplace la voix macOS de secours et l'API ElevenLabs dont le quota gratuit est épuisé jusqu'au 13/10/2026). Plusieurs allers-retours de correction avec l'utilisateur (images non représentatives, voix robotique, yacht pas assez luxueux) avant validation de l'état actuel.
- **Limite connue, assumée** : contenu pédagogique de bonnes pratiques générales du secteur, pas les procédures internes exactes de Tymeless — à corriger par l'utilisateur si besoin. Pas de vraie vidéo filmée (texte + voix + photos fixes), faute de solution de génération vidéo gratuite.

#### ◇ API Xyra — `PageAPI.tsx` / `api/api-xyra`
- **Statut** : 🟡 — voir T5 (mineur, sans effet réel). Client déjà passé en
  service-role cette session.

#### ⚙ Paramètres — `PageSettings.tsx` / multiples routes (`profil-entreprise`, `2fa`, `ia-config`, `domaine`, `integrations`, `whatsapp-config`, `secteur`, `equipe`, `rgpd`, `tickets`, `sessions`, `branding`, `change-password`…)
- **Statut** : 🟡
- **Rôle** : hub de configuration — profil entreprise (SIRET auto via INSEE), profil utilisateur, mot de passe, abonnement Stripe/Flutterwave, branding, 2FA + sessions actives, intégrations (clé chiffrée/masquée), bot WhatsApp, clé Claude BYOK (chiffrée), préférences notifs, secteur métier, gestion équipe, domaine personnalisé (Vercel), support, RGPD (export/suppression compte).
- **Problèmes trouvés** :
  - Bon comportement général : aucun secret renvoyé en clair (clé Claude = booléen seul, clés d'intégrations masquées, token WhatsApp/2FA/session jamais transmis).
  - Fuites `error.message` brutes sur la quasi-totalité des routes utilisées (pattern transversal déjà noté ailleurs).
  - Pas de `hasAccess` interne au composant (repose uniquement sur le verrou sidebar) — risque faible car `settings` est de toute façon ouvert à presque tous les plans.

### Hors sidebar mais lié

#### Admin plateforme — `api/abonnes` (liste/gère tous les tenants)
- **Statut** : ✅ sécurisé cette session (faille grave corrigée : aucun
  contrôle avant → n'importe quel tenant pouvait gérer tous les autres).

### BIENTÔT DISPONIBLE (10 modules)
Non construits (`PageBientot`, pages vitrines statiques). Hors périmètre
d'audit tant qu'ils ne sont pas développés : Gestion de projet, Marketing &
Campagnes, Organisation & Wiki, Booking public, Application mobile, IBAN
bancaire réel, Avance sur factures, Académie Xyra, Traduction auto, Centre
d'appels IA.

---

## 3. Constats transverses — suite (issus des audits modules)

| # | Constat | Statut | Détail |
|---|---|---|---|
| T14 | IDOR sur Chat (`api/chat/route.ts`) | ✅ réglé et testé (10/09/2026) | Motif `tenantId && c.tenant_id !== tenantId` : si `tenantId` est `null` (appel non authentifié), le contrôle était court-circuité et désactivé. Touchait `marquer_lu`, `supprimer_conversation`, `contexte` (6e cas trouvé pendant la correction, pas dans l'audit initial), `lien_fichier`, `participants`, `ajouter_participant`/`retirer_participant`. Corrigé partout en `!tenantId \|\| c.tenant_id !== tenantId`. Testé en conditions réelles sur `test` — OK. |
| T15 | Modules entièrement factices facturés comme réels | 🟡 2/3 réglé | **Formation équipe** (13/09/2026) : ✅ reconstruit pour de vrai, voir fiche module ci-dessus. **Investissement IA** (13/09/2026) : ✅ reconstruit pour de vrai, voir fiche module ci-dessous. **Agent vocal "Lea"** dans Prospection Auto (module 29€/mois) : toujours aucun backend. Décision prise : construire les trois pour de vrai plutôt que les retirer de la facturation. |
| T16 | Modules RH (Équipe) : très nombreux boutons qui ne persistent rien | 🔴 à faire | Pointage GPS, congés, arrêts, paie, contrats, évaluations, formations, carrière, juridique : la plupart des actions ne font qu'un `showToast` local alors que le backend expose déjà les vraies actions (non branchées côté UI). Risque : l'entreprise croit avoir un dossier RH à jour alors que rien n'est enregistré. |
| T17 | Paywall absent au niveau composant sur plusieurs modules (pas seulement des clés inversées T2/T3/T4) | ✅ réglé (11/09/2026) | Garde `hasAccess(plan,"x",modulesActifs)` + `<UpgradeWall/>` ajoutés sur Cartes Virtuelles, Fournisseurs, Notes de Frais — dans le même chantier que le déploiement des modules à la carte (T21). |
| T18 | `error.message` brut renvoyé au client | 🟡 à faire (transversal, priorité basse) | Quasi tous les modules audités renvoient le message d'erreur Postgres/Supabase brut au front. Pas une fuite critique en soi mais à nettoyer un jour (messages génériques côté client, détail en log serveur). |
| T19 | Deux fichiers dashboard divergents (`chat`/`conversations_whatsapp` sans entrée `PAGE_ACCESS`) | 🔍 à vérifier | Ces deux modules sont accessibles à tous les plans sans distinction — à confirmer si c'est voulu (gratuit pour tous) ou un oubli lors de l'ajout de ces modules à `PAGE_ACCESS`. |
| T20 | Requête Supabase directe côté navigateur sans filtre tenant (2e cas après T6) | 🟢 vérifié — non-problème | `PageCompta.tsx` lit `notes_frais.tva` directement depuis le client, sans `.eq('tenant_id',...)` en apparence. Vérifié : la policy RLS sur `notes_frais` filtre déjà correctement par tenant côté base — la requête ne peut donc pas remonter les données d'un autre tenant, contrairement à T6 où la policy était ouverte. Laissé tel quel (pas une faille), mais reste un pattern à éviter pour la lisibilité (client direct plutôt que route API). |
| T21 | Achat de modules à la carte (add-on) | ✅ réglé et testé bout-en-bout (12/09/2026) | Fonctionnalité complète livrée en 3 étapes (voir §5) : déblocage piloté par la table `modules_actifs`, bouton "Débloquer — X€/mois" sur `UpgradeWall` (partagé entre les deux dashboards), paiement Stripe (`checkout.session.completed` → active le module), reverrouillage automatique sur `customer.subscription.deleted`. Testé en conditions réelles sur `test` avec une carte de test Stripe : paiement → webhook → module débloqué au rechargement du dashboard. **Point ouvert, non tranché** : le reverrouillage n'a lieu qu'à l'annulation complète de l'abonnement Stripe, pas au premier échec de paiement — un client qui ne paie plus garde l'accès pendant toute la durée des relances automatiques de Stripe (plusieurs jours/semaines). |

Statut d'audit : **tous les modules de la sidebar ont maintenant une fiche**
(0 restant en 🔍, hors les 10 modules "Bientôt disponible" hors périmètre).

## 4. Prochaines étapes proposées

Bilan mis à jour (12/09/2026) : **réglés et testés** — T2, T3, T4, T5, T6,
T14, T17, T21 (modules à la carte), T22 (fuite totale sur `/api/wallet-membres`,
découverte pendant T1). **Largement réglé** — T1 (20 routes protégées côté
serveur, voir détail dans le tableau du haut ; reste une poignée de routes
partagées volontairement non touchées, cf. T1 dans le tableau). **Vérifié
non-problème** — T20. **Pas réglé, en partie seulement** — T7 (seul le
composant `UpgradeWall` est mutualisé ; les ~900 lignes de chaque dashboard
— sidebar, state, pageMap — restent dupliquées entre `xyra.jsx` et
`tymeless.jsx`, chantier non commencé). **Toujours ouverts** : T9 est fait,
T10 (Annuaire/Réseau cassé, reporté), T11 (13 tables mortes à trier), T12
(policy `companies` bloquée), T13 (arbitrage RLS en attente), T15/T16
(modules factices — décision produit à prendre), T18 (fuites `error.message`,
priorité basse), T19 (chat/conversations_whatsapp sans entrée `PAGE_ACCESS`).

Proposition de priorisation pour la suite (à valider avec toi) :
1. **T15/T16** — décision produit : construire réellement Investissement IA/
   Formation/agent vocal Lea, ou les retirer de la facturation tant qu'ils
   ne sont pas prêts.
2. Le point ouvert de T21 (reverrouillage seulement à l'annulation complète
   de l'abonnement, pas au premier impayé) — à trancher si tu veux un
   comportement plus strict.
3. **T7 complet** — si tu veux vraiment fusionner les deux dashboards (gros
   chantier, pas juste `UpgradeWall`).
4. Le reste (T10/T11/T12/T13, T18, T19) au fil de l'eau.

Dis-moi par où on continue.

## 5. Modules à la carte (add-on) — fonctionnalité livrée (12/09/2026)

Objectif : sur les plans Starter et Business (là où des modules sont
verrouillés), permettre d'acheter un module verrouillé à l'unité (abonnement
mensuel récurrent) sans changer de forfait. Non proposé sur les plans qui
ont déjà tout (Enterprise+).

Livré en 3 étapes, chacune commitée et testée séparément :
- **Étape 1 — fondation** : table `modules_actifs` (déjà existante, jusque-là
  inutilisée) branchée partout. `hasAccess(plan, page, modulesActifs)` accepte
  désormais une liste de modules actifs en plus du plan. `/api/tenant-info`
  renvoie la liste des modules actifs du tenant. Les ~25 composants
  `Page*.tsx` + les deux dashboards (`xyra.jsx`/`tymeless.jsx`) la reçoivent
  et la respectent (sidebar + garde interne).
- **Étape 2 — bouton et paiement** : `/api/create-checkout` gère un nouveau
  cas `module` (session Stripe `mode:subscription`, prix construit depuis
  `MODULE_PRICES`, sans Price ID à créer côté Stripe). `UpgradeWall` (mutualisé
  entre les deux dashboards dans `app/modules/UpgradeWall.tsx`) affiche le
  bouton "Débloquer — X€/mois" sur Starter/Business uniquement.
- **Étape 3 — déblocage/reverrouillage automatique** : `/api/stripe-webhook`
  active la ligne `modules_actifs` (`statut:'actif'`) sur
  `checkout.session.completed`, et la repasse à `statut:'annulé'` sur
  `customer.subscription.deleted`.

**Testé bout-en-bout sur `test`** le 12/09 : paiement avec carte de test
Stripe (`4242 4242 4242 4242`) → webhook reçu → ligne `modules_actifs`
créée → module débloqué au rechargement du dashboard. Les deux clés Stripe
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) sont configurées sur Vercel
`xyratest1`.

**Point ouvert (T21)** : le reverrouillage n'a lieu qu'à l'annulation
complète de l'abonnement Stripe côté client, pas au premier paiement échoué
— un client qui ne paie plus garde l'accès pendant toute la durée des
relances automatiques de Stripe (plusieurs jours/semaines) avant que
l'abonnement ne soit définitivement annulé.

**Reporté, non commencé** : brancher Flutterwave et Swan sur ce même flux
(demandé, pas encore fait) ; décider si les 3 cartes de `UpgradeWall`
doivent toujours s'afficher ou seulement selon le plan actuel.
