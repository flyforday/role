# Veillée — jeu de rôle avec Maître du Jeu IA

Veillée est une application web de jeu de rôle sur table. Les joueurs décrivent librement ce que tentent leurs personnages, un Maître du Jeu (MJ) IA raconte la suite, et **le code arbitre** : dés, points de vie, inventaire, or, combat et état du monde sont gérés et validés par le moteur, jamais décidés par l'IA.

- Solo (sauvegarde dans le navigateur, export/import JSON) ou multijoueur (Supabase, lien d'invitation, temps réel).
- Gratuit pour un petit groupe : uniquement des offres gratuites (Cloudflare Workers, Gemini, Groq, OpenRouter, Supabase).
- Aucune clé d'API dans le navigateur : tout passe par un relais (Cloudflare Worker).
- Interface en français.

Le cahier des charges complet est dans [`docs/PROMPT_PROJET.md`](docs/PROMPT_PROJET.md).

## Sommaire

1. [Architecture](#architecture)
2. [Règles du jeu](#règles-du-jeu)
3. [Démarrer en local](#démarrer-en-local)
4. [Créer les comptes gratuits](#créer-les-comptes-gratuits)
5. [Déployer](#déployer)
6. [Multijoueur (Supabase)](#multijoueur-supabase)
7. [Fonctionnement d'un tour](#fonctionnement-dun-tour)
8. [Quotas des offres gratuites](#quotas-des-offres-gratuites)
9. [État d'avancement](#état-davancement)

## Architecture

```
apps/web         → front Vite + React + TypeScript + Tailwind
apps/worker      → Cloudflare Worker : relais IA (bascule, BYOK, limitation de débit) + hébergement du front
packages/engine  → moteur de jeu pur TypeScript : règles, dés à graine injectable, applyChanges, combat
packages/prompts → prompt du MJ, schémas Zod, construction du contexte, parsing, boucle d'un tour, résumé glissant
supabase/        → schéma SQL du multijoueur (tables, règles RLS, temps réel)
```

Le **même Worker** (`role`) sert l'application web (fichiers statiques de `apps/web/dist`) et l'API `/api/*` : une seule adresse, pas de CORS à configurer.

### Fournisseurs d'IA

Le Worker expose une interface unique `LLMProvider.complete(messages, options) → flux de texte` avec trois adaptateurs : **Gemini** (par défaut), **Groq**, **OpenRouter** (modèles `:free`). En cas d'erreur 429, 5xx ou réseau, il bascule automatiquement sur le suivant (ordre réglé par `PROVIDER_ORDER`). Les modèles se configurent dans `apps/worker/wrangler.toml` (`GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL`), jamais dans le front.

Dans les réglages du jeu, chaque joueur peut aussi choisir :
- **Ma propre clé (BYOK)** : la clé reste dans son navigateur et n'est envoyée au relais qu'avec chaque requête, sans jamais être enregistrée côté serveur.
- **Modèle local (expérimental)** : WebLLM dans le navigateur via WebGPU, sans quota (chargé à la demande, ~2 Go).
- **MJ de démonstration** : un MJ scripté hors ligne pour essayer l'interface sans IA.

### Qui est l'arbitre ?

- En solo, le moteur tourne dans le navigateur du joueur.
- En multijoueur, le navigateur de **l'hôte** est l'arbitre : il reçoit les actions des joueurs, appelle l'IA via le relais, lance les dés, applique les changements validés et écrit l'état dans Supabase. Les règles RLS empêchent tout autre joueur de modifier l'état. L'hôte doit donc garder son onglet ouvert pendant la partie.

## Règles du jeu

Règles maison, légères et originales :

- **6 caractéristiques** : Force, Agilité, Endurance, Intelligence, Perception, Charisme. Modificateurs de −2 à +3, dont la somme vaut 6 à la création.
- **Test** : 1d20 + modificateur ≥ difficulté (Facile 8, Moyen 12, Difficile 16, Héroïque 20). Un 20 naturel réussit toujours (critique), un 1 naturel échoue toujours.
- **PV** : 10 + 2 × Endurance au niveau 1, puis 5 + Endurance par niveau. **Défense** : 10 + Agilité.
- **Niveaux** : XP totale requise = 50 × n × (n − 1) (niveau 2 à 100 XP, 3 à 300, 4 à 600…).
- **Combat** : initiative 1d20 + Agilité ; attaque 1d20 + caractéristique de l'arme contre la Défense ; dégâts de l'arme (doublés en critique). Les ennemis proposés par l'IA sont bornés par le code (PV, attaque, défense).
- **Garde-fous** sur ce que l'IA propose (`DEFAULT_LIMITS` dans `packages/engine/src/changes.ts`) : 15 dégâts max par cible et par tour, 20 PV de soin, 200 pièces d'or, 150 XP, 5 objets, 15 changements par tour. Un objet absent ne peut pas être retiré, un PNJ mort ne revient pas, on ne quitte pas un combat en se déplaçant, etc. Les refus sont renvoyés au MJ au tour suivant.

## Démarrer en local

Prérequis : Node.js 20 ou plus.

```bash
npm install
npm test          # tests du moteur, du parsing, de la boucle de tour et du relais
npm run dev       # front sur http://localhost:5173
```

Sans clé d'API, ouvrez **Réglages → MJ de démonstration** pour jouer tout de suite.

Pour utiliser une vraie IA en local :

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars   # puis collez votre GEMINI_API_KEY
npm run build                                            # le Worker sert aussi le front construit
npm run dev:worker                                       # relais sur http://localhost:8787
npm run dev                                              # dans un autre terminal ; /api est relayé vers le Worker
```

Variables du front (`apps/web/.env.example`) :

| Variable | Rôle |
|---|---|
| `VITE_WORKER_URL` | Adresse du relais si le front est hébergé ailleurs que sur le Worker. Vide = même origine. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Activent le multijoueur. La clé « anon » est publique par conception. |

## Créer les comptes gratuits

| Service | Où | Ce qu'il faut récupérer |
|---|---|---|
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `GEMINI_API_KEY` |
| Groq (secours) | [console.groq.com/keys](https://console.groq.com/keys) | `GROQ_API_KEY` |
| OpenRouter (secours n°2) | [openrouter.ai/keys](https://openrouter.ai/keys) | `OPENROUTER_API_KEY` |
| Cloudflare | [dash.cloudflare.com](https://dash.cloudflare.com) | identifiant de compte + jeton d'API « Edit Cloudflare Workers » |
| Supabase (multijoueur) | [supabase.com/dashboard](https://supabase.com/dashboard) | URL du projet + clé `anon` |

Une seule clé IA suffit pour jouer ; les autres servent de secours quand un quota est atteint.

## Déployer

Tout est déployé sur le Worker Cloudflare **`role`** (nom fixé dans `apps/worker/wrangler.toml`). Le déploiement ne touche aucun autre Worker ni projet Pages du compte.

### Depuis votre ordinateur

```bash
npx wrangler login                       # une fois
cd apps/worker
npx wrangler secret put GEMINI_API_KEY   # puis GROQ_API_KEY, OPENROUTER_API_KEY si vous en avez
cd ../..
npm run deploy                           # construit le front puis déploie le Worker « role »
```

L'application est ensuite disponible sur `https://role.<votre-sous-domaine>.workers.dev`.

Pour le multijoueur, construisez avec les variables Supabase : `VITE_SUPABASE_URL=… VITE_SUPABASE_ANON_KEY=… npm run deploy`.

### Depuis GitHub Actions

Le workflow [`deploy.yml`](.github/workflows/deploy.yml) se lance à la main (onglet *Actions → Déploiement Cloudflare → Run workflow*). Il faut ajouter dans *Settings → Secrets and variables → Actions* :

- secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` ;
- variables facultatives `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, et `AUTO_DEPLOY=true` pour déployer à chaque push sur `main`.

Les clés d'IA restent des secrets du Worker (`wrangler secret put …` ou tableau de bord Cloudflare → Workers → role → Settings → Variables and Secrets), jamais dans le dépôt.

### Réglages du relais

Dans `apps/worker/wrangler.toml` (`[vars]`) :

| Variable | Défaut | Rôle |
|---|---|---|
| `PROVIDER_ORDER` | `gemini,groq,openrouter` | Ordre de bascule |
| `GEMINI_MODEL` / `GROQ_MODEL` / `OPENROUTER_MODEL` | voir le fichier | Modèles utilisés |
| `GEMINI_THINKING_BUDGET` | vide | Budget de « réflexion » Gemini ; à renseigner seulement pour un modèle qui l'accepte |
| `ALLOWED_ORIGINS` | `*` | Origines autorisées à appeler le relais |
| `RATE_LIMIT_PER_IP_PER_MIN` / `_PER_GAME_PER_MIN` / `_PER_IP_PER_DAY` | 20 / 12 / 600 | Limitation de débit |
| `MAX_OUTPUT_TOKENS` | 1500 | Longueur maximale d'une réponse |

La limitation de débit est en mémoire de l'isolat Cloudflare : c'est une protection « au mieux », suffisante pour éviter qu'une boucle ou un abus ne vide le quota commun.

## Multijoueur (Supabase)

1. Créez un projet Supabase (offre gratuite).
2. Dans *SQL Editor*, exécutez [`supabase/migrations/0001_parties.sql`](supabase/migrations/0001_parties.sql) : tables `games`, `game_members`, `actions`, règles RLS, fonction `join_game` et publication temps réel.
3. Dans *Authentication → URL Configuration*, ajoutez l'adresse du jeu (par exemple `https://role.<sous-domaine>.workers.dev`) aux *Redirect URLs* pour le lien magique.
4. Construisez le front avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (voir [Déployer](#déployer)).

Déroulement : l'hôte se connecte (lien magique), crée une partie en ligne, copie le lien **Inviter** et le partage. Chaque joueur ouvre le lien, se connecte, crée son personnage. Deux modes :
- **libre** : chaque action est résolue dès qu'elle arrive ;
- **par tour** : chacun déclare son action, le MJ résout le tour quand tous ont joué (ou quand l'hôte clique « Résoudre le tour »).

La narration en cours d'écriture et les dés sont diffusés en direct à tous (Supabase Realtime). L'hôte dispose des **outils de l'hôte** : annuler le dernier tour, relancer la réponse du MJ, éditer le lorebook, le résumé et l'état du jeu.

## Fonctionnement d'un tour

1. Le joueur envoie son action (texte libre, attaque en combat, ou carte X).
2. En combat, le code résout d'abord les attaques et ripostes dans l'ordre d'initiative.
3. Le contexte est construit (`packages/prompts/src/context.ts`) : prompt du MJ + fiche de campagne, extrait de l'état, résumé glissant, lore dont les mots-clés apparaissent, derniers tours, refus du tour précédent, action. Il est tronqué intelligemment (jamais les fiches des PJ ni les faits établis).
4. L'IA répond en JSON, validé par Zod changement par changement. JSON invalide : une nouvelle tentative avec l'erreur, puis repli sur une narration seule sans changement d'état.
5. Si l'IA demande un jet, le code lance le d20, l'anime pour tous, puis rappelle l'IA avec le résultat (2 jets maximum par tour).
6. `applyChanges` applique les changements valides, borne les excès et refuse les incohérences.
7. Tous les ~10 tours au-delà des 12 plus récents, un appel séparé met à jour le résumé glissant sans perdre les faits établis.

## Quotas des offres gratuites

Les quotas changent souvent ; l'application n'en dépend pas (elle bascule simplement sur le fournisseur suivant). Pour les vérifier :

- Gemini : [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- Groq : [console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits)
- OpenRouter : [openrouter.ai/docs/api-reference/limits](https://openrouter.ai/docs/api-reference/limits)
- Cloudflare Workers : [developers.cloudflare.com/workers/platform/limits](https://developers.cloudflare.com/workers/platform/limits/)
- Supabase : [supabase.com/pricing](https://supabase.com/pricing)

## État d'avancement

| Phase | Contenu | État |
|---|---|---|
| 1 — MVP solo | Création guidée de campagne et de personnage, narration en streaming, fiche, journal de quête, actions suggérées, dés animés, sauvegarde locale, export/import | ✅ |
| 2 — Multijoueur | Lien magique, invitations, temps réel, modes libre / par tour, rôle d'hôte (annuler, relancer, corriger l'état) | ✅ (nécessite un projet Supabase) |
| 3 — Robustesse | Bascule multi-fournisseurs, BYOK, résumé glissant, lorebook éditable, combat structuré, lignes / voiles / carte X | ✅ |
| 4 — Optionnel | WebLLM local | ✅ expérimental |
| 4 — Optionnel | Bot Discord, images d'ambiance | non commencé |

Le projet s'inspire du principe des tables de jeu de rôle avec MJ IA, mais son nom, ses textes, ses règles, ses prompts et son univers de démonstration sont originaux.
