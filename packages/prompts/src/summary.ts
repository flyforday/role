import type { GameState } from '@veillee/engine';
import { formatLogEntry, groupTurns, type ChatMessage } from './context';
import { SUMMARY_SYSTEM_PROMPT } from './gm-prompt';
import { SummarySchema } from './schema';
import { parseWith } from './parse';
import type { LlmCall } from './orchestrator';

export interface SummaryPolicy {
  /** Résumer quand il y a plus de tours non résumés que ce seuil. */
  triggerAfter: number;
  /** Nombre de tours récents à garder hors résumé. */
  keepRecent: number;
}

export const DEFAULT_SUMMARY_POLICY: SummaryPolicy = { triggerAfter: 24, keepRecent: 12 };

/** Renvoie le numéro du dernier tour à résumer, ou null s'il n'est pas encore temps. */
export function summaryCutoff(state: GameState, policy: SummaryPolicy = DEFAULT_SUMMARY_POLICY): number | null {
  const pending = groupTurns(state.log.filter((e) => e.turn > state.summarizedThroughTurn));
  if (pending.length <= policy.triggerAfter) return null;
  return pending[pending.length - policy.keepRecent - 1].turn;
}

export function buildSummaryMessages(state: GameState, throughTurn: number): ChatMessage[] {
  const entries = state.log.filter((e) => e.turn > state.summarizedThroughTurn && e.turn <= throughTurn);
  const text = groupTurns(entries)
    .map((t) => `— Tour ${t.turn} —\n${t.entries.map(formatLogEntry).join('\n')}`)
    .join('\n');
  return [
    { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `PERSONNAGES : ${state.characters.map((c) => `${c.name} (${c.concept})`).join(', ')}\n\nRÉSUMÉ EXISTANT\n${state.summary || '(aucun)'}\n\nNOUVEAUX TOURS À INTÉGRER\n${text}`,
    },
  ];
}

/**
 * Met à jour le résumé glissant si nécessaire. En cas d'échec, l'état est renvoyé inchangé
 * (les tours restent dans le journal et seront résumés plus tard).
 */
export async function maybeSummarize(state: GameState, llm: LlmCall, policy: SummaryPolicy = DEFAULT_SUMMARY_POLICY): Promise<GameState> {
  const cutoff = summaryCutoff(state, policy);
  if (cutoff === null) return state;
  try {
    const raw = await llm(buildSummaryMessages(state, cutoff), { json: true, purpose: 'summary' });
    const parsed = parseWith(SummarySchema, raw);
    if (!parsed.ok) return state;
    return { ...state, summary: parsed.value.summary, summarizedThroughTurn: cutoff };
  } catch {
    return state;
  }
}
