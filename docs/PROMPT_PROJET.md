# Prompt de projet : jeu de rôle avec Maître du Jeu IA

> À coller tel quel comme instructions de projet (Claude Code `CLAUDE.md`, Lovable « Project knowledge », Cursor rules…).
> Le prompt du Maître du Jeu lui-même est en **annexe A** : c'est lui que l'application enverra à l'IA à chaque tour.

---

## 1. Contexte et objectif

Tu développes une application web de **jeu de rôle sur table piloté par un Maître du Jeu (MJ) IA**, dans l'esprit de *Friends & Fables* : des joueurs décrivent librement ce que font leurs personnages, et le MJ IA raconte la suite, fait vivre le monde et les PNJ, demande des jets de dés et adapte l'histoire aux choix des joueurs.

Le projet s'**inspire** de Friends & Fables mais ne le copie pas : nom, identité visuelle, textes, règles et prompts sont originaux. Ne reprends aucun élément propriétaire (logo, textes, code, univers).

**Contraintes non négociables :**
- **Gratuit** pour un petit groupe (≈ 2 à 6 joueurs, quelques sessions par semaine) : uniquement des offres gratuites d'hébergement et d'IA.
- **Le code est l'arbitre, l'IA est le conteur** : dés, points de vie, inventaire, état du monde sont gérés et validés par le code. L'IA *propose* des changements, le code les *applique* (ou les refuse).
- **Aucune clé d'API dans le code client.** Toujours passer par un relais serveur.
- Interface en **français**.

---

## 2. Stack technique

| Couche | Choix | Pourquoi |
|---|---|---|
| Front | Vite + React + TypeScript + Tailwind | Simple, statique, déployable gratuitement |
| Hébergement front | Cloudflare Pages (ou GitHub Pages) | Gratuit |
| Relais IA | Cloudflare Worker | Gratuit (~100 000 req/jour), garde les clés secrètes |
| Persistance & multijoueur | Supabase (Postgres + Realtime + Auth) — offre gratuite | Parties partagées, temps réel, comptes |
| Validation | Zod | Valider chaque réponse JSON de l'IA |
| Tests | Vitest | Moteur de règles et parsing testés |

Garde un **monorepo** simple :

```
/apps/web        → front React
/apps/worker     → Cloudflare Worker (relais IA + rate limiting)
/packages/engine → moteur de jeu pur TypeScript (règles, dés, état, validation) — sans dépendance au front
/packages/prompts→ prompt MJ, gabarits, schémas Zod de sortie
```

---

## 3. Fournisseurs d'IA (abstraction obligatoire)

Crée une interface unique `LLMProvider` (`complete(messages, options) → stream`) et des adaptateurs interchangeables :

1. **Google Gemini** (offre gratuite) — fournisseur par défaut.
2. **Groq** (offre gratuite, très rapide) — secours.
3. **OpenRouter**, modèles `:free` — secours n°2.
4. **BYOK** : le joueur colle sa propre clé (stockée uniquement dans son navigateur, envoyée au Worker par requête, jamais persistée côté serveur).
5. *(Phase ultérieure, optionnel)* **WebLLM** : modèle local dans le navigateur via WebGPU, pour jouer hors quota.

Règles :
- **Bascule automatique** vers le fournisseur suivant en cas d'erreur 429/5xx.
- Les modèles et fournisseurs sont **configurables** (variables d'environnement du Worker), jamais codés en dur dans le front.
- Les quotas et conditions des offres gratuites changent : documente dans le README où les vérifier, et n'en dépends pas pour la logique.
- **Streaming** de la narration vers l'UI (le texte s'affiche au fil de l'eau).
- **Rate limiting** dans le Worker (par partie et par IP) pour ne pas griller le quota commun.

---

## 4. Moteur de jeu (`/packages/engine`)

### 4.1 Règles maison légères (originales)
- 6 caractéristiques : Force, Agilité, Endurance, Intelligence, Perception, Charisme (modificateur de −2 à +3).
- Jet de test : **1d20 + modificateur ≥ difficulté** (Facile 8, Moyen 12, Difficile 16, Héroïque 20). 20 naturel = réussite critique, 1 naturel = échec critique.
- Points de vie, inventaire, or, conditions (empoisonné, blessé…), niveau et XP.
- Combat simple au tour par tour : initiative (1d20 + Agilité), attaque contre défense, dégâts par arme.

### 4.2 État du monde (source de vérité)
Un objet `GameState` sérialisable, persisté en base :
- `campaign` : titre, ton, univers, règles spéciales choisies à la création.
- `characters[]` : fiches des PJ.
- `npcs[]` : nom, description, attitude envers le groupe, statut (vivant/mort), secrets connus du MJ.
- `locations[]` et `currentLocationId`.
- `quests[]` : objectif, statut, indices découverts.
- `flags` : faits établis (clé → valeur).
- `summary` : résumé glissant de l'histoire.
- `lore[]` : entrées de lore (mots-clés + texte).
- `log[]` : historique complet des tours.

### 4.3 Validation des propositions de l'IA
Chaque `state_change` proposé par l'IA passe par une fonction pure `applyChanges(state, changes) → { state, rejected[] }` qui :
- refuse ce qui est incohérent (retirer un objet absent, soigner au-delà du max, téléporter sans justification, cibler un personnage inexistant) ;
- borne les valeurs (dégâts max par tour, or gagné max…) ;
- ne laisse **jamais** l'IA lancer les dés : elle *demande* un jet, le code le lance.

Les rejets sont renvoyés au MJ au tour suivant (« le changement X a été refusé car… »).

---

## 5. Boucle d'un tour

1. Un joueur envoie son action (texte libre).
2. Le front l'envoie au Worker avec l'identifiant de partie.
3. On construit le **contexte** (section 6) et on appelle l'IA avec le prompt MJ (annexe A).
4. L'IA répond en **JSON** (annexe B), validé par Zod. En cas de JSON invalide : 1 nouvelle tentative avec le message d'erreur, puis repli sur une narration seule sans changement d'état.
5. Si la réponse contient un `roll_request` : le code lance le dé, affiche le jet à tous les joueurs (animation), puis rappelle l'IA avec le résultat pour qu'elle raconte la conséquence.
6. Le code applique les `state_changes` validés, enregistre le tour, met à jour le résumé si nécessaire.
7. Diffusion en temps réel à tous les joueurs (Supabase Realtime).

---

## 6. Mémoire et cohérence

À chaque appel, le contexte envoyé contient, dans cet ordre :
1. Le prompt MJ (annexe A) + la fiche de campagne.
2. Un **extrait compact du `GameState`** (fiches PJ, lieu actuel, PNJ présents, quêtes actives, flags pertinents).
3. Le **résumé glissant** (`summary`).
4. Les **entrées de lore** dont les mots-clés apparaissent dans les derniers messages.
5. Les **N derniers tours** en entier (N ≈ 10–20 selon la taille de contexte du modèle).
6. Les éventuels changements refusés au tour précédent.
7. L'action du joueur.

**Résumé glissant** : tous les ~10 tours, un appel séparé et peu coûteux résume les tours les plus anciens et les fusionne dans `summary` (ce qui est établi ne doit jamais être perdu : noms, promesses, morts, objets clés).

Garde un compteur de tokens approximatif et tronque intelligemment (jamais la fiche des PJ ni les flags).

---

## 7. Fonctionnalités par phase

### Phase 1 — MVP solo jouable
- Création de campagne guidée (genre, ton, thèmes à éviter) — l'IA propose un monde, le joueur valide.
- Création de personnage (caractéristiques, classe libre, historique).
- Écran de jeu : fil narratif en streaming, zone de saisie, fiche de personnage, journal de quête, actions suggérées cliquables.
- Jets de dés visibles et animés.
- Sauvegarde locale (localStorage) + export/import JSON de la partie.
- Un seul fournisseur IA (Gemini) via le Worker.

**Critère de fin** : une partie solo de 30 minutes reste cohérente (noms, inventaire, PV) et les dés sont toujours lancés par le code.

### Phase 2 — Multijoueur
- Comptes (Supabase Auth, lien magique), parties partagées par lien d'invitation.
- Temps réel ; gestion des tours (chacun déclare son action, le MJ résout le tour d'un coup, ou mode « libre »).
- Rôle « hôte » pouvant corriger l'état, annuler un tour, relancer une réponse.

### Phase 3 — Robustesse et confort
- Bascule multi-fournisseurs + BYOK.
- Résumé glissant + lorebook éditable par l'hôte.
- Combat structuré (initiative, tours, ennemis avec PV gérés par le code).
- Outils de sécurité de table : lignes et voiles définis à la création, bouton « carte X » qui demande au MJ de changer de direction.

### Phase 4 — Optionnel
- Mode WebLLM local.
- Bot Discord.
- Images d'ambiance (uniquement si une offre gratuite le permet).

Travaille **phase par phase** : ne commence pas la suivante tant que la précédente n'est pas jouable et testée.

---

## 8. Qualité

- Le moteur (`/packages/engine`) est **pur et testé** : dés (avec graine injectable), `applyChanges`, rejets, combat.
- Tests de parsing avec des réponses IA réalistes, y compris malformées.
- Aucune clé dans le dépôt : `.dev.vars` / secrets Cloudflare, `.env.example` documenté.
- README : installation locale, création des comptes gratuits (Gemini, Groq, Cloudflare, Supabase), déploiement.

## 9. À ne pas faire
- Laisser l'IA décider seule d'un résultat de dé, de PV ou d'inventaire.
- Envoyer une clé API au navigateur.
- Copier textes, univers, design ou prompts de Friends & Fables.
- Ajouter une dépendance payante, même « à l'essai ».

---

## Annexe A — Prompt système du Maître du Jeu

```
Tu es le Maître du Jeu d'une partie de jeu de rôle sur table. Tu racontes en français, à la deuxième personne du pluriel pour le groupe (ou du singulier pour un joueur seul), au présent.

TON RÔLE
- Tu décris le monde, incarnes les PNJ et fais avancer l'histoire en réaction aux actions des joueurs.
- Tu es un MJ juste, pas un assistant complaisant : le monde a sa propre logique, ses dangers et ses conséquences. Les PNJ ont leurs propres objectifs et peuvent refuser, mentir, négocier ou attaquer.
- Les joueurs décrivent ce que leurs personnages TENTENT. Toi seul décides de ce qui se passe. Si un joueur affirme un résultat (« je trouve une épée légendaire », « je tue le dragon d'un coup »), traite-le comme une tentative et résous-la honnêtement.
- Ne contrôle jamais les pensées, paroles ou décisions des personnages joueurs. Arrête-toi au moment où un joueur doit choisir.

LES RÈGLES (appliquées par le code, pas par toi)
- Tu ne lances jamais de dés et n'inventes jamais un résultat de jet. Quand une action est incertaine ET que l'échec serait intéressant, demande un jet via "roll_request" (caractéristique + difficulté : 8 facile, 12 moyen, 16 difficile, 20 héroïque) et NE raconte PAS le résultat : tu le raconteras quand le code te donnera le jet.
- Ne demande pas de jet pour les actions triviales ou sans enjeu.
- Tout changement concret (PV, objets, or, lieu, PNJ, quêtes, faits établis) doit apparaître dans "state_changes". Si ce n'est pas dans "state_changes", ça n'est pas arrivé.
- Respecte strictement l'ÉTAT DU JEU fourni : inventaire, PV, PNJ morts, faits établis. En cas de doute, l'état fait foi sur ta mémoire.
- Si le code t'indique qu'un changement a été refusé, intègre-le naturellement dans la suite sans le contredire.

LA NARRATION
- 80 à 200 mots par réponse, sauf moment clé. Sensations concrètes (sons, odeurs, lumière), rythme varié.
- Termine chaque réponse sur une situation ouverte qui appelle une action.
- Donne à chaque joueur l'occasion de briller ; en multijoueur, adresse-toi aux personnages qui n'ont pas agi récemment.
- Garde la cohérence du ton et de l'univers définis dans la fiche de campagne.
- Sème des indices, des complications et des rebondissements liés aux choix passés des joueurs.

SÉCURITÉ DE TABLE
- Respecte les thèmes interdits (« lignes ») et traite hors champ les thèmes voilés (« voiles ») définis dans la fiche de campagne.
- Si un joueur utilise la « carte X », change immédiatement de direction sans commentaire.

FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide conforme au schéma fourni, sans texte autour, sans bloc de code.
```

## Annexe B — Schéma de réponse du MJ

```jsonc
{
  "narration": "string — le texte affiché aux joueurs",
  "roll_request": null | {
    "character_id": "string",
    "ability": "force|agilite|endurance|intelligence|perception|charisme",
    "difficulty": 8 | 12 | 16 | 20,
    "reason": "string — ce qui est tenté"
  },
  "state_changes": [
    { "op": "hp",          "target": "character_or_npc_id", "delta": -4, "reason": "..." },
    { "op": "add_item",    "target": "character_id", "item": { "name": "...", "description": "..." } },
    { "op": "remove_item", "target": "character_id", "item_name": "..." },
    { "op": "gold",        "target": "character_id", "delta": 10 },
    { "op": "condition",   "target": "id", "add": "empoisonné" },
    { "op": "move",        "location_id": "...", "new_location": { "name": "...", "description": "..." } },
    { "op": "npc",         "npc": { "id": "...", "name": "...", "attitude": "...", "status": "vivant" } },
    { "op": "quest",       "quest": { "id": "...", "title": "...", "status": "active|réussie|échouée", "clue": "..." } },
    { "op": "flag",        "key": "pont_detruit", "value": true },
    { "op": "xp",          "target": "character_id", "delta": 50 }
  ],
  "memory_notes": ["faits importants à retenir pour la suite"],
  "suggested_actions": ["2 à 4 actions courtes proposées aux joueurs"]
}
```

Le schéma Zod correspondant vit dans `/packages/prompts` et est la seule référence ; ce bloc n'est qu'indicatif.
