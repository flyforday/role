# Veillée — consignes pour les agents de code (Codex, Claude, etc.)

Ce fichier est lu automatiquement par Codex. Il complète `CLAUDE.md` (mêmes règles) et le `README.md`.

## Le projet

Veillée est une application web de jeu de rôle sur table avec un Maître du Jeu IA. **Le code est l'arbitre, l'IA est le conteur** : dés, PV, inventaire, or, combat et état du monde sont calculés et validés par le moteur ; l'IA ne fait que *proposer* des changements.

Le cahier des charges fait foi : `docs/PROMPT_PROJET.md`. Règles non négociables :
- aucune clé d'API côté client (tout passe par le relais Worker) ;
- offres gratuites uniquement ;
- interface, textes, commits et PR en **français** ;
- nom, règles, prompts et univers originaux (ne rien copier d'un jeu ou d'une aventure sous droits).

## Structure (monorepo npm workspaces)

```
apps/web         → front Vite + React + TypeScript + Tailwind
apps/worker      → Cloudflare Worker « role » : relais IA (Gemini → Groq → OpenRouter), limitation de débit, TTS, sert aussi le front
packages/engine  → moteur pur TypeScript (règles, dés, combat, applyChanges), sans dépendance au front
packages/prompts → prompt du MJ, schémas Zod, contexte, boucle de tour, scénarios prêts à jouer
docs/            → cahier des charges
supabase/        → ancien schéma SQL du multijoueur (remplacé par les salles Durable Object, voir plus bas)
```

## Commandes

Node.js 20 ou plus (la CI utilise Node 22).

```bash
npm install
npm run dev          # front sur http://localhost:5173 (Réglages → « MJ de démonstration » pour jouer sans clé)
npm run dev:worker   # relais sur http://localhost:8787 (copier apps/worker/.dev.vars.example en .dev.vars et y mettre une clé)
```

**Avant chaque push, les trois doivent passer** (c'est ce que fait la CI `tests`) :

```bash
npm run typecheck && npm test && npm run build
```

## Règles de code

- Toute nouvelle opération d'état proposée par l'IA doit être ajoutée à la fois dans `StateChange` (engine), `StateChangeSchema` (prompts), `GM_OUTPUT_SCHEMA` et `applyChanges`, **avec des tests de rejet**.
- Les garde-fous (`DEFAULT_LIMITS` dans `packages/engine/src/changes.ts`) bornent ce que l'IA peut faire : ne pas les contourner.
- Les modèles d'IA se règlent dans `apps/worker/wrangler.toml` (`[vars]`), jamais dans le front.
- Scénarios : type `Scenario` dans `packages/engine/src/scenario.ts`, données dans `packages/prompts/src/scenarios/`. Une adaptation sous CC BY-SA doit citer l'auteur et rester CC BY-SA.

## Secrets

Ne jamais commiter de clé ni de jeton. Fichiers ignorés par git : `.dev.vars`, `.env`, `.env.local`.
Secrets existants (fournis par Léo, jamais dans le dépôt) : `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` (secrets du Worker), `CLOUDFLARE_API_TOKEN` (secret GitHub Actions). L'identifiant de compte Cloudflare dans `wrangler.toml` est public.

## Déploiement — à lire absolument

- Fusionner sur `main` **déploie automatiquement** (workflow `deploy.yml`, variable de dépôt `AUTO_DEPLOY=true`) :
  - le Worker Cloudflare **`role`** → https://role.leo-lemaire.workers.dev (relais + application) ;
  - le projet Pages **`veillee-role`** → https://veillee-role.pages.dev (front).
- Le `name` dans `apps/worker/wrangler.toml` doit rester `"role"`.
- Le même compte Cloudflare héberge un autre jeu, **Vellune** (projet Pages `vellune-jeu`) : **ne jamais le modifier, le redéployer ni l'écraser**. Toujours vérifier le nom de la cible avant un `wrangler deploy` / `pages deploy`.
- Ne pas lancer de déploiement à la main : passer par une PR fusionnée sur `main`.
- Le check « Workers Builds: role » échoue sur chaque PR (intégration Git Cloudflare mal configurée) : il ne bloque pas. Seul le check **`tests`** compte.

## Multijoueur

Le multijoueur passe par des salles **Durable Object `Salle`** du Worker `role` (binding `SALLES`), rejointes par un code de 6 caractères, sans compte (PR #13). Le navigateur de l'hôte reste l'arbitre (moteur + IA) ; la salle stocke l'état, relaie et vérifie les droits. Supabase est en cours de retrait : ne pas ajouter de nouvelle dépendance à Supabase.

## Branches et pull requests

- Jamais de push direct sur `main` : une branche par sujet (`codex/<sujet>` par exemple), puis une PR vers `main`.
- Titre et description de PR en français : ce qui change, pourquoi, et comment c'est testé.
- Une PR = un sujet. Rebaser sur `main` avant de demander la fusion.
- Fusion quand le check `tests` est vert (la fusion déclenche le déploiement).
