import {
  ABILITIES,
  ABILITY_LABELS,
  currentLocation,
  normalize,
  npcsHere,
  type GameState,
  type LogEntry,
  type LoreEntry,
  type ScenarioScene,
} from '@veillee/engine';
import { GM_OUTPUT_SCHEMA, GM_SYSTEM_PROMPT, SCENARIO_INSTRUCTIONS, XCARD_INSTRUCTION } from './gm-prompt';

export type ChatRole = 'system' | 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type PlayerActionKind = 'action' | 'attack' | 'xcard';

export interface PlayerAction {
  characterId: string;
  kind: PlayerActionKind;
  text: string;
  /** Cible d'une attaque en combat. */
  targetId?: string;
}

export interface ContextOptions {
  /** Budget approximatif de tokens pour l'ensemble du contexte. */
  maxTokens?: number;
  /** Nombre maximal de tours récents envoyés en entier. */
  recentTurns?: number;
  /** Événements produits par le code ce tour-ci (combat, montée de niveau…). */
  codeEvents?: string[];
}

/** Estimation grossière : ~3,5 caractères par token pour du français. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

export function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((s, m) => s + estimateTokens(m.content) + 4, 0);
}

export function campaignSheet(state: GameState): string {
  const c = state.campaign;
  const lines = [
    `FICHE DE CAMPAGNE`,
    `Titre : ${c.title}`,
    `Genre : ${c.genre} — Ton : ${c.tone}`,
    `Univers : ${c.setting}`,
    `Accroche : ${c.pitch}`,
    `Lignes (thèmes interdits, ne jamais les aborder) : ${c.lines.length ? c.lines.join(', ') : 'aucune'}`,
    `Voiles (thèmes traités hors champ) : ${c.veils.length ? c.veils.join(', ') : 'aucun'}`,
  ];
  if (c.specialRules?.trim()) lines.push(`Règles spéciales : ${c.specialRules.trim()}`);
  const players = state.characters.filter((c) => !c.companion).length;
  lines.push(`Joueurs : ${players > 1 ? 'groupe (vouvoiement collectif)' : 'un joueur seul (tutoiement)'}`);
  const companions = state.characters.filter((c) => c.companion);
  if (companions.length)
    lines.push(`Compagnons PNJ (${companions.map((c) => c.name).join(', ')}) : tu les incarnes ; ils agissent, parlent et se battent d'eux-mêmes (le code résout leurs attaques), sans jamais voler la vedette aux joueurs ni décider à leur place.`);
  return lines.join('\n');
}

export function stateExtract(state: GameState): string {
  const out: string[] = ['ÉTAT DU JEU (fait foi)'];
  out.push('Personnages joueurs :');
  for (const pc of state.characters) {
    const abil = ABILITIES.map((a) => `${ABILITY_LABELS[a]} ${fmtMod(pc.abilities[a])}`).join(', ');
    const inv = pc.inventory
      .map((i) => `${i.name}${i.quantity && i.quantity > 1 ? ` ×${i.quantity}` : ''}${i.damage ? ` (${i.damage})` : ''}`)
      .join(', ');
    out.push(
      `- [${pc.id}] ${pc.name}${pc.companion ? ' (compagnon PNJ joué par toi, le MJ)' : pc.playerName ? ` (joué par ${pc.playerName})` : ''}, ${pc.concept}, niveau ${pc.level} — PV ${pc.hp}/${pc.maxHp}, Défense ${pc.defense}, Or ${pc.gold}` +
        `\n  Caractéristiques : ${abil}` +
        `\n  Arme : ${pc.weapon ?? 'aucune'} — Inventaire : ${inv || 'vide'}` +
        `\n  Conditions : ${pc.conditions.length ? pc.conditions.join(', ') : 'aucune'}` +
        (pc.background ? `\n  Historique : ${pc.background}` : ''),
    );
  }
  const loc = currentLocation(state);
  out.push(`Lieu actuel : ${loc ? `[${loc.id}] ${loc.name}${loc.description ? ` — ${loc.description}` : ''}` : 'inconnu'}`);
  const others = state.locations.filter((l) => l.id !== state.currentLocationId);
  if (others.length) out.push(`Lieux connus : ${others.map((l) => `[${l.id}] ${l.name}`).join(', ')}`);

  const here = npcsHere(state);
  if (here.length) {
    out.push('PNJ présents :');
    for (const n of here) {
      out.push(
        `- [${n.id}] ${n.name} — attitude : ${n.attitude ?? 'neutre'}${n.description ? ` — ${n.description}` : ''}` +
          (n.hp !== undefined ? ` — PV ${n.hp}/${n.maxHp}` : '') +
          (n.conditions?.length ? ` — ${n.conditions.join(', ')}` : '') +
          (n.secrets?.length ? `\n  Secrets (MJ seulement) : ${n.secrets.join(' ; ')}` : ''),
      );
    }
  }
  const away = state.npcs.filter((n) => !here.includes(n)).slice(-30);
  if (away.length) out.push(`Autres PNJ connus : ${away.map((n) => `[${n.id}] ${n.name} (${n.status})`).join(', ')}`);

  const active = state.quests.filter((q) => q.status === 'active');
  if (active.length) {
    out.push('Quêtes actives :');
    for (const q of active) out.push(`- [${q.id}] ${q.title}${q.objective ? ` — ${q.objective}` : ''}${q.clues.length ? `\n  Indices : ${q.clues.join(' ; ')}` : ''}`);
  }
  const closed = state.quests.filter((q) => q.status !== 'active');
  if (closed.length) out.push(`Quêtes terminées : ${closed.map((q) => `${q.title} (${q.status})`).join(', ')}`);

  const flags = Object.entries(state.flags);
  if (flags.length) out.push(`Faits établis : ${flags.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')}`);
  if (state.memoryNotes.length) out.push(`Notes du MJ :\n${state.memoryNotes.slice(-20).map((n) => `- ${n}`).join('\n')}`);

  if (state.combat) {
    out.push(`COMBAT EN COURS — round ${state.combat.round}`);
    out.push(`Ordre d'initiative : ${state.combat.order.map((o) => nameFor(state, o.id)).join(' → ')}`);
    out.push(`Ennemis : ${state.combat.enemies.map((e) => `[${e.id}] ${e.name} ${e.hp}/${e.maxHp} PV${e.hp <= 0 ? ' (vaincu)' : ''}`).join(', ')}`);
  }
  return out.join('\n');
}

/** Partie du scénario utile ce tour-ci : trame, scène en cours en entier, scènes accessibles, PNJ. */
export function scenarioExtract(state: GameState): string | null {
  const sc = state.scenario;
  if (!sc) return null;
  const { scenario } = sc;
  const scene = scenario.scenes.find((s) => s.id === sc.currentSceneId);
  const out: string[] = [`SCÉNARIO PRÊT À JOUER : « ${scenario.title} »`, SCENARIO_INSTRUCTIONS];
  out.push(`Vérité cachée (MJ seulement) : ${scenario.secretPlot}`);
  out.push(`Conseils pour adapter : ${scenario.gmAdvice}`);
  out.push(`Déroulé : ${scenario.scenes.map((s) => `[${s.id}] ${s.title}${s.id === sc.currentSceneId ? ' (EN COURS)' : sc.visitedSceneIds.includes(s.id) ? ' (jouée)' : ''}`).join(' → ')}`);
  if (scene) {
    out.push(`SCÈNE EN COURS [${scene.id}] ${scene.title}${scene.ending ? ` (scène finale : ${scene.ending})` : ''}`);
    out.push(`Ouverture : ${scene.readAloud}`);
    out.push(`Notes du MJ : ${scene.gmNotes}`);
    if (scene.checks?.length) {
      out.push('Jets prévus :');
      for (const c of scene.checks) out.push(`- ${c.situation} → ${c.ability} ${c.difficulty}. Réussite : ${c.success} Échec : ${c.failure}`);
    }
    if (scene.encounter) {
      const e = scene.encounter;
      out.push(`Combat prévu (${e.trigger}) : ${JSON.stringify(e.enemies)}${e.alternatives ? `\nAlternatives : ${e.alternatives}` : ''}`);
    }
    if (scene.rewards) out.push(`Récompenses prévues : ${scene.rewards}`);
    const next = scene.exits
      .map((x) => ({ exit: x, target: scenario.scenes.find((s) => s.id === x.to) }))
      .filter((x): x is { exit: typeof x.exit; target: ScenarioScene } => !!x.target);
    if (next.length) {
      out.push('Sorties possibles :');
      for (const { exit, target } of next) out.push(`- vers [${target.id}] ${target.title} quand : ${exit.when}\n  Ouverture de cette scène : ${target.readAloud}`);
    }
  }
  const known = new Set(state.npcs.map((n) => n.id));
  const pending = scenario.npcs.filter((n) => !known.has(n.id));
  out.push('PNJ du scénario (id, motivation) :');
  for (const n of scenario.npcs) {
    out.push(`- [${n.id}] ${n.name} : ${n.motivation}${!known.has(n.id) && n.secret ? ` Secret : ${n.secret}` : ''}${pending.includes(n) ? ' (pas encore rencontré)' : ''}`);
  }
  return out.join('\n');
}

function nameFor(state: GameState, id: string): string {
  return state.characters.find((c) => c.id === id)?.name ?? state.combat?.enemies.find((e) => e.id === id)?.name ?? id;
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/** Entrées de lore dont un mot-clé apparaît dans le texte donné. */
export function matchLore(lore: LoreEntry[], text: string): LoreEntry[] {
  const hay = ` ${normalize(text).replace(/[^a-z0-9]+/g, ' ')} `;
  return lore.filter((entry) =>
    entry.keywords.some((k) => {
      const key = normalize(k).replace(/[^a-z0-9]+/g, ' ').trim();
      return key.length > 1 && hay.includes(` ${key}`);
    }),
  );
}

export function formatLogEntry(e: LogEntry): string {
  switch (e.kind) {
    case 'player':
      return `${e.actorName ?? 'Joueur'} : ${e.text}`;
    case 'gm':
      return `MJ : ${e.text}`;
    case 'roll':
      return `JET : ${e.text}`;
    case 'combat':
      return `COMBAT : ${e.text}`;
    default:
      return `(${e.text})`;
  }
}

/** Groupe le journal par numéro de tour. */
export function groupTurns(log: LogEntry[]): Array<{ turn: number; entries: LogEntry[] }> {
  const map = new Map<number, LogEntry[]>();
  for (const e of log) {
    if (!map.has(e.turn)) map.set(e.turn, []);
    map.get(e.turn)!.push(e);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([turn, entries]) => ({ turn, entries }));
}

export function describeActions(state: GameState, actions: PlayerAction[]): string {
  return actions
    .map((a) => {
      const pc = state.characters.find((c) => c.id === a.characterId);
      const who = pc ? `${pc.name} [${pc.id}]` : 'Un joueur';
      if (a.kind === 'xcard') return XCARD_INSTRUCTION;
      if (a.kind === 'attack') {
        const target = state.combat?.enemies.find((e) => e.id === a.targetId);
        return `${who} attaque ${target?.name ?? 'un ennemi'}${a.text ? ` : ${a.text}` : ''}`;
      }
      return `${who} : ${a.text}`;
    })
    .join('\n');
}

/** Construit les messages envoyés au MJ pour un tour, dans l'ordre défini par le cahier des charges. */
export function buildGmMessages(state: GameState, actions: PlayerAction[], options: ContextOptions = {}): ChatMessage[] {
  const maxTokens = options.maxTokens ?? 14_000;
  const recentTurns = options.recentTurns ?? 16;

  const system = `${GM_SYSTEM_PROMPT}\n\n${GM_OUTPUT_SCHEMA}\n\n${campaignSheet(state)}`;
  const extract = stateExtract(state);
  const scenario = scenarioExtract(state);
  const actionText = describeActions(state, actions);

  const turns = groupTurns(state.log.filter((e) => e.turn > state.summarizedThroughTurn)).slice(-recentTurns);
  const recentText = (ts: typeof turns) =>
    ts.map((t) => `— Tour ${t.turn} —\n${t.entries.map(formatLogEntry).join('\n')}`).join('\n');

  const lastTexts = turns.slice(-3).flatMap((t) => t.entries.map((e) => e.text)).join(' ') + ' ' + actionText;
  let lore = matchLore(state.lore, lastTexts);
  let summary = state.summary;
  let kept = turns;

  const assemble = () => {
    const parts: string[] = [extract];
    if (scenario) parts.push(scenario);
    if (summary) parts.push(`RÉSUMÉ DE L'HISTOIRE JUSQU'ICI\n${summary}`);
    if (lore.length) parts.push(`LORE PERTINENT\n${lore.map((l) => `- ${l.text}`).join('\n')}`);
    if (kept.length) parts.push(`DERNIERS TOURS\n${recentText(kept)}`);
    if (state.pendingRejections.length) {
      parts.push(`CHANGEMENTS REFUSÉS AU TOUR PRÉCÉDENT (intègre-les sans les contredire)\n${state.pendingRejections.map((r) => `- ${r}`).join('\n')}`);
    }
    if (options.codeEvents?.length) parts.push(`ÉVÉNEMENTS DE COMBAT ET DE RÈGLES (résolus par le code, à raconter tels quels)\n${options.codeEvents.map((e) => `- ${e}`).join('\n')}`);
    parts.push(`ACTION${actions.length > 1 ? 'S' : ''} DES JOUEURS (tour ${state.turn})\n${actionText}`);
    return [
      { role: 'system' as const, content: system },
      { role: 'user' as const, content: parts.join('\n\n') },
    ];
  };

  let messages = assemble();
  // Troncature intelligente : jamais la fiche des PJ ni les faits établis.
  while (estimateMessagesTokens(messages) > maxTokens && kept.length > 3) {
    kept = kept.slice(1);
    messages = assemble();
  }
  while (estimateMessagesTokens(messages) > maxTokens && lore.length > 2) {
    lore = lore.slice(0, lore.length - 1);
    messages = assemble();
  }
  if (estimateMessagesTokens(messages) > maxTokens && summary.length > 1500) {
    summary = '…' + summary.slice(-1500);
    messages = assemble();
  }
  return messages;
}
