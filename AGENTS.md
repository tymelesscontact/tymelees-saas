<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:xyra-rules -->
# Projet Xyra / Tymeless — règles de travail

## Cycle obligatoire
Toute tâche qui aboutit à une modification suit cet ordre, sans saut d'étape :
OBSERVATION → ANALYSE → PROPOSITION → VALIDATION HUMAINE → MODIFICATION → TEST SUR TEST → VÉRIFICATION → VALIDATION FINALE → TRANSFERT VERS MAIN → PRODUCTION.
- OBSERVATION : lire le contenu réel des fichiers concernés. Jamais de supposition sur une structure, un nom de variable, un schéma de base.
- PROPOSITION : annoncer les fichiers + lignes + la nature exacte du changement + les risques + le plan de test. Passer par le plan mode pour tout changement de code.
- VALIDATION HUMAINE : ne rien écrire avant un accord humain explicite sur cette proposition précise.
- MODIFICATION : livrer des fichiers complets prêts à coller. Un seul sujet à la fois.
- TEST SUR TEST / VÉRIFICATION : build, lint, typecheck, puis le parcours concerné — exclusivement sur l'environnement TEST.
- VALIDATION FINALE / TRANSFERT VERS MAIN / PRODUCTION : jamais automatique, toujours déclenché explicitement par un humain.

## Interdit sans validation humaine explicite
- Refactoring non demandé ; suppression ou altération d'une fonctionnalité existante ; changement d'architecture non demandé.
- `git add`, `git commit`, `git push`, `git checkout`, `git merge`, `git rebase`, `git reset`.
- Installer ou mettre à jour une dépendance (`npm/pnpm/yarn install`, ajout à `package.json`).
- Toute commande SQL, toute migration appliquée, tout accès en écriture à la base de production.
- Modifier `CLAUDE.md`, `AGENTS.md`, `next.config.ts`, `middleware.ts`, `tsconfig.json`, `vercel.json`, `.env*`, `.claude/settings.json`.
- Activer un MCP en écriture, un hook, un sous-agent avec droits d'écriture, ou le mode d'acceptation automatique des modifications (Auto Mode).
- `/code-review --fix`, `/simplify`, ou tout mécanisme qui applique des changements sans étape de validation.
- Envoyer un email, une campagne ou un message réel ; déclencher un paiement.

## Environnements
- `test` = environnement principal de développement et de test fonctionnel → Vercel `xyratest1` (xyratest1-xi.vercel.app) → Supabase TEST `dqnqssezkvfbizkbaeeu`.
- `main` = production → Vercel Production → xyraio.fr → Supabase PROD.
- Toujours livrer et tester sur `test` avant `main`, sauf urgence critique confirmée.
- ATTENTION : le projet Vercel de production déploie AUSSI une Preview automatique pour la branche `test` (ex. tymelees-saas-yzel-git-test-*.vercel.app), qui hérite très probablement des variables de production, y compris Supabase. Cette Preview ne doit JAMAIS être utilisée pour tester quoi que ce soit — seul xyratest1-xi.vercel.app est l'environnement de test valide.
- Ne jamais modifier, désactiver ou reconfigurer cette Preview.

## Divulgation
- Ne jamais afficher la valeur d'un secret (`.env.local`, clés, tokens). On peut vérifier qu'une variable est référencée, jamais sa valeur.

## Si une vérification révèle une faille ou un comportement inattendu
Le dire clairement, expliquer comment c'est construit, proposer un correctif — sans l'appliquer.
<!-- END:xyra-rules -->
