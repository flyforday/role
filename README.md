# Veillée — jeu de rôle avec Maître du Jeu IA

Veillée est une application web de jeu de rôle sur table. Les joueurs décrivent librement ce que tentent leurs personnages, un Maître du Jeu (MJ) IA raconte la suite, et **le code arbitre** : dés, points de vie, inventaire, or, combat et état du monde sont gérés et validés par le moteur, jamais décidés par l'IA.

- Solo (sauvegarde dans le navigateur, export/import JSON) ou multijoueur (code de partie à partager, temps réel, sans compte).
- Gratuit pour un petit groupe : uniquement des offres gratuites (Cloudflare Workers, Durable Objects et Workers AI, Gemini, Groq, Mistral, Cerebras, OpenRouter, NVIDIA).
- Aucune clé d'API dans le navigateur : tout passe par un relais (Cloudflare Worker).
- Interface en français.
- Création de personnage : 16 classes ou une classe personnalisée, 12 races et deux portraits cartoon par race. Race et portrait sont indépendants de la classe et n’ajoutent aucun bonus de règles. Les caractéristiques conseillées restent facultatives et modifiables.

Le cahier des charges complet est dans [`docs/PROMPT_PROJET.md`](docs/PROMPT_PROJET.md).

Les portraits sont inclus dans l’application, sans appel à un service d’images pendant les parties. Ils sont conservés avec le personnage en solo, en multijoueur et dans les exports ; les anciennes sauvegardes restent compatibles. Leur provenance et leurs consignes de création sont décrites dans [`docs/PORTRAITS.md`](docs/PORTRAITS.md).

## Sommaire

1. [Architecture](#architecture)
2. [Règles du jeu](#règles-du-jeu)
3. [Démarrer en local](#démarrer-en-local)
4. [Créer les comptes gratuits](#créer-les-comptes-gratuits)
5. [Déployer](#déployer)
6. [Multijoueur (code de partie)](#multijoueur-code-de-partie)
7. [Fonctionnement d'un tour](#fonctionnement-dun-tour)
8. [Quotas des offres gratuites](#quotas-des-offres-gratuites)
9. [État d'avancement](#état-davancement)

## Architecture

```
apps/web         → front Vite + React + TypeScript + Tailwind
apps/worker      → Cloudflare Worker : relais IA (bascule, BYOK, limitation de débit) + hébergement du front
packages/engine  → moteur de jeu pur TypeScript : règles, dés à graine injectable, applyChanges, combat
packages/prompts → prompt du MJ, schémas Zod, construction du contexte, parsing, boucle d'un tour, résumé glissant
```

Le **même Worker** (`role`) sert l'application web (fichiers statiques de `apps/web/dist`) et l'API `/api/*` : une seule adresse, pas de CORS à configurer.

### Fournisseurs d'IA

Le Worker expose une interface unique `LLMProvider.complete(messages, options) → flux de texte` avec plusieurs adaptateurs : **Gemini** (par défaut), **Groq**, **Mistral**, **Cerebras**, **OpenRouter** (modèles `:free`), **NVIDIA** et **Cloudflare Workers AI** (liaison `AI`, sans clé, dernier secours). En cas d'erreur 429, 5xx ou réseau, il bascule automatiquement sur le suivant (ordre réglé par `PROVIDER_ORDER`) ; un fournisseur qui n'a pas répondu au bout de 40 s est aussi abandonné, et un modèle au quota épuisé (429) passe en fin de liste pendant `QUOTA_COOLDOWN_S` secondes. Un fournisseur sans clé est ignoré. Les modèles se configurent dans `apps/worker/wrangler.toml` (`GEMINI_MODEL`, `GROQ_MODEL`, `MISTRAL_MODEL`, `CEREBRAS_MODEL`, `OPENROUTER_MODEL`, `NVIDIA_MODEL`, `CLOUDFLARE_AI_MODEL`), jamais dans le front.

Dans les réglages du jeu, chaque joueur peut aussi choisir :
- **Ma propre clé (BYOK)** : la clé reste dans son navigateur et n'est envoyée au relais qu'avec chaque requête, sans jamais être enregistrée côté serveur.
- **Modèle local (expérimental)** : WebLLM dans le navigateur via WebGPU, sans quota (chargé à la demande, ~2 Go).
- **MJ de démonstration** : un MJ scripté hors ligne pour essayer l'interface sans IA.

### Qui est l'arbitre ?

- En solo, le moteur tourne dans le navigateur du joueur.
- En multijoueur, le navigateur de **l'hôte** est l'arbitre : il reçoit les actions des joueurs, appelle l'IA via le relais, lance les dés, applique les changements validés et envoie l'état à la salle de la partie (Durable Object), qui refuse toute modification venant d'un autre joueur. L'hôte doit donc garder son onglet ouvert pendant la partie.

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

## Créer les comptes gratuits

| Service | Où | Ce qu'il faut récupérer |
|---|---|---|
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `GEMINI_API_KEY` |
| Groq (secours) | [console.groq.com/keys](https://console.groq.com/keys) | `GROQ_API_KEY` |
| Mistral (secours) | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) (offre « Experiment » gratuite) | `MISTRAL_API_KEY` |
| Cerebras (secours) | [cloud.cerebras.ai](https://cloud.cerebras.ai) → API Keys | `CEREBRAS_API_KEY` |
| OpenRouter (secours) | [openrouter.ai/keys](https://openrouter.ai/keys) | `OPENROUTER_API_KEY` |
| NVIDIA (secours) | [build.nvidia.com](https://build.nvidia.com) → Get API Key | `NVIDIA_API_KEY` |
| Cloudflare Workers AI | rien à créer (liaison `AI` du Worker) | — |
| Cloudflare | [dash.cloudflare.com](https://dash.cloudflare.com) | identifiant de compte + jeton d'API « Edit Cloudflare Workers » |

Une seule clé IA suffit pour jouer ; les autres servent de secours quand un quota est atteint.

## Déployer

Tout est déployé sur le Worker Cloudflare **`role`** (nom fixé dans `apps/worker/wrangler.toml`). Le déploiement ne touche aucun autre Worker ni projet Pages du compte.

### Depuis votre ordinateur

```bash
npx wrangler login                       # une fois
cd apps/worker
npx wrangler secret put GEMINI_API_KEY   # puis GROQ_API_KEY, MISTRAL_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, NVIDIA_API_KEY si vous en avez
cd ../..
npm run deploy                           # construit le front puis déploie le Worker « role »
```

L'application est ensuite disponible sur `https://role.<votre-sous-domaine>.workers.dev`.


### Depuis GitHub Actions

Le workflow [`deploy.yml`](.github/workflows/deploy.yml) se lance à la main (onglet *Actions → Déploiement Cloudflare → Run workflow*). Il faut ajouter dans *Settings → Secrets and variables → Actions* :

- secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` ;
- variable facultative `AUTO_DEPLOY=true` pour déployer à chaque push sur `main`.

Les clés d'IA restent des secrets du Worker (`wrangler secret put …` ou tableau de bord Cloudflare → Workers → role → Settings → Variables and Secrets), jamais dans le dépôt.

### Réglages du relais

Dans `apps/worker/wrangler.toml` (`[vars]`) :

| Variable | Défaut | Rôle |
|---|---|---|
| `PROVIDER_ORDER` | `gemini,groq,mistral,cerebras,openrouter,nvidia,cloudflare` | Ordre de bascule (les fournisseurs sans clé sont ignorés) |
| `QUOTA_COOLDOWN_S` | `120` | Durée pendant laquelle un modèle au quota épuisé est essayé en dernier |
| `GEMINI_MODEL` / `GROQ_MODEL` / `MISTRAL_MODEL` / `CEREBRAS_MODEL` / `OPENROUTER_MODEL` / `NVIDIA_MODEL` / `CLOUDFLARE_AI_MODEL` | voir le fichier | Modèles utilisés ; plusieurs modèles séparés par des virgules sont essayés dans l'ordre |
| `GEMINI_THINKING_LEVEL` | `low` | Niveau de réflexion des modèles Gemini 3 (`minimal`, `low`, `medium`, `high`) ; retiré automatiquement si le modèle le refuse |
| `GEMINI_THINKING_BUDGET` | vide | Ancien budget de réflexion (Gemini 2.5), ignoré si `GEMINI_THINKING_LEVEL` est rempli |
| `ALLOWED_ORIGINS` | `*` | Origines autorisées à appeler le relais |
| `RATE_LIMIT_PER_IP_PER_MIN` / `_PER_GAME_PER_MIN` / `_PER_IP_PER_DAY` | 20 / 12 / 600 | Limitation de débit |
| `MAX_OUTPUT_TOKENS` | 1500 | Longueur maximale d'une réponse |

La limitation de débit est en mémoire de l'isolat Cloudflare : c'est une protection « au mieux », suffisante pour éviter qu'une boucle ou un abus ne vide le quota commun.

## Multijoueur (code de partie)

Rien à configurer : le multijoueur fait partie du Worker `role`. Chaque partie est une **salle** (Durable Object Cloudflare SQLite, offre gratuite) identifiée par un code de 6 caractères, sans compte ni e-mail.

Déroulement : l'hôte clique **Créer une partie à plusieurs**, choisit un scénario ou un monde, crée son personnage, puis donne le **code** (affiché sous le récit, cliquable pour le copier) ou le lien **Inviter**. Les amis tapent le code dans *Rejoindre une partie* (accueil), choisissent un nom et créent leur personnage. Deux modes (outils de l'hôte) :
- **par tour** (par défaut) : chacun déclare son action, le MJ répond une fois que tous les joueurs connectés ont joué (ou quand l'hôte clique « Résoudre le tour »). Tant que le MJ n'a pas répondu, chacun peut retirer son action (✎) ou en envoyer une nouvelle, qui remplace l'ancienne ;
- **libre** : chaque action est résolue dès qu'elle arrive.

Le navigateur de l'hôte reste l'arbitre (moteur + appels au MJ) ; la salle garde l'état, relaie en direct la narration en cours d'écriture, les dés et les actions (WebSocket avec hibernation : une salle inactive ne coûte rien), et vérifie les droits : seul l'hôte écrit l'état, chacun ne joue que ses personnages, chaque place est protégée par un jeton secret gardé dans le navigateur. Si l'hôte ferme son onglet, un autre joueur peut **prendre la main** et faire tourner le MJ chez lui. Une salle inactive pendant 30 jours est effacée.

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
- Durable Objects : [developers.cloudflare.com/durable-objects/platform/pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

## État d'avancement

| Phase | Contenu | État |
|---|---|---|
| 1 — MVP solo | Création guidée de campagne et de personnage, narration en streaming, fiche, journal de quête, actions suggérées, dés animés, sauvegarde locale, export/import | ✅ |
| 2 — Multijoueur | Code de partie sans compte, temps réel, modes libre / par tour, actions modifiables avant la réponse du MJ, rôle d'hôte transférable (annuler, relancer, corriger l'état) | ✅ |
| 3 — Robustesse | Bascule multi-fournisseurs, BYOK, résumé glissant, lorebook éditable, combat structuré, lignes / voiles / carte X | ✅ |
| 4 — Optionnel | WebLLM local | ✅ expérimental |
| 4 — Optionnel | Bot Discord, images d'ambiance | non commencé |

Le projet s'inspire du principe des tables de jeu de rôle avec MJ IA, mais son nom, ses textes, ses règles, ses prompts et son univers de démonstration sont originaux.
