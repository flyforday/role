# Veillée — consignes pour les agents

Le cahier des charges fait foi : `docs/PROMPT_PROJET.md` (règles non négociables : le code est l'arbitre, aucune clé d'API côté client, offres gratuites uniquement, interface en français).

- Monorepo npm workspaces : `packages/engine` (moteur pur, sans dépendance au front), `packages/prompts` (prompt MJ, schémas Zod, contexte, boucle de tour), `apps/worker` (relais IA + hébergement), `apps/web` (React).
- Avant de pousser : `npm run typecheck && npm test && npm run build`.
- Toute nouvelle opération d'état proposée par l'IA doit être ajoutée à la fois dans `StateChange` (engine), `StateChangeSchema` (prompts), `GM_OUTPUT_SCHEMA` et `applyChanges`, avec des tests de rejet.
- Déploiement : uniquement le Worker Cloudflare nommé `role`. Ne jamais toucher aux autres Workers/Pages du compte (notamment le jeu Vellune).
