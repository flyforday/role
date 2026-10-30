import { describe, expect, it } from 'vitest';
import { addLog, applyChanges, seededRng } from '@veillee/engine';
import { runTurn, type LlmCall, type TurnEvent } from './orchestrator';
import { maybeSummarize, summaryCutoff } from './summary';
import { sampleState } from './fixtures.test-utils';
import type { ChatMessage } from './context';

/** Faux modèle : renvoie les réponses dans l'ordre, en simulant un flux par petits morceaux. */
function scripted(...responses: string[]): LlmCall & { calls: ChatMessage[][] } {
  const calls: ChatMessage[][] = [];
  const fn = (async (messages, options) => {
    calls.push(messages);
    const r = responses[calls.length - 1] ?? responses[responses.length - 1];
    for (let i = 0; i < r.length; i += 7) options.onToken?.(r.slice(i, i + 7));
    return r;
  }) as LlmCall & { calls: ChatMessage[][] };
  fn.calls = calls;
  return fn;
}

const action = (text: string) => [{ characterId: 'pj_lyra', kind: 'action' as const, text }];

describe('runTurn', () => {
  it('le code lance le dé demandé puis rappelle le MJ avec le résultat', async () => {
    const llm = scripted(
      JSON.stringify({
        narration: 'Tu t\'élances vers le mât glissant…',
        roll_request: { character_id: 'pj_lyra', ability: 'agilite', difficulty: 12, reason: 'grimper au mât' },
        state_changes: [],
      }),
      JSON.stringify({
        narration: 'Tu atteins la vigie et trouves une longue-vue.',
        state_changes: [
          { op: 'add_item', target: 'pj_lyra', item: { name: 'Longue-vue' } },
          { op: 'remove_item', target: 'pj_lyra', item_name: 'Épée de feu' },
        ],
        suggested_actions: ['Observer le large'],
      }),
    );
    const events: TurnEvent[] = [];
    const input = sampleState();
    const r = await runTurn({ state: input, actions: action('Je grimpe au mât'), llm, rng: () => 0.7, onEvent: (e) => events.push(e) });
    expect(input.turn).toBe(0);
    expect(r.state.turn).toBe(1);
    expect(llm.calls).toHaveLength(2);
    expect(llm.calls[1].at(-1)!.content).toContain('RÉSULTAT DU JET');
    expect(llm.calls[1].at(-1)!.content).toContain('d20 = 15 +3 = 18 contre 12');
    const roll = events.find((e) => e.type === 'roll');
    expect(roll && roll.type === 'roll' && roll.roll.success).toBe(true);
    expect(r.state.characters[0].inventory.some((i) => i.name === 'Longue-vue')).toBe(true);
    expect(r.rejected.some((x) => x.includes('Épée de feu'))).toBe(true);
    expect(r.state.pendingRejections).toEqual(r.rejected);
    expect(r.state.suggestedActions).toEqual(['Observer le large']);
    expect(r.state.log.map((l) => l.kind)).toEqual(['player', 'gm', 'roll', 'gm']);
    const streamed = events.filter((e) => e.type === 'narration_delta').map((e) => (e as { text: string }).text).join('');
    expect(streamed).toContain('Tu atteins la vigie');
  });

  it('les refus du tour précédent sont transmis au MJ', async () => {
    const llm = scripted('{"narration":"Suite."}');
    const s = sampleState();
    s.pendingRejections = ['Le changement Y a été refusé car Lyra ne possède pas « Épée ».'];
    const r = await runTurn({ state: s, actions: action('Je regarde'), llm });
    expect(llm.calls[0][1].content).toContain('ne possède pas « Épée »');
    expect(r.state.pendingRejections).toEqual([]);
  });

  it('retente une fois sur JSON invalide, puis se replie sur une narration seule', async () => {
    const ok = scripted('oups pas de json', '{"narration":"Corrigé.","state_changes":[{"op":"gold","target":"pj_lyra","delta":3}]}');
    const r1 = await runTurn({ state: sampleState(), actions: action('a'), llm: ok });
    expect(ok.calls).toHaveLength(2);
    expect(ok.calls[1].at(-1)!.content).toMatch(/pas un JSON valide/);
    expect(r1.usedFallback).toBe(false);
    expect(r1.state.characters[0].gold).toBe(13);

    const bad = scripted('{"narration": "Le vent tourne et', 'toujours rien');
    const r2 = await runTurn({ state: sampleState(), actions: action('a'), llm: bad });
    expect(r2.usedFallback).toBe(true);
    expect(r2.state.log.at(-1)!.text).toBe('toujours rien');
    expect(r2.state.characters[0].gold).toBe(10);
  });

  it('ne laisse jamais l\'IA fixer un résultat de dé : un jet fantôme est refusé', async () => {
    const llm = scripted('{"narration":"x","roll_request":{"character_id":"pj_inconnu","ability":"force","difficulty":8,"reason":"r"}}');
    const r = await runTurn({ state: sampleState(), actions: action('a'), llm });
    expect(llm.calls).toHaveLength(1);
    expect(r.rejected[0]).toMatch(/n'existe pas/);
  });

  it('limite le nombre de jets par tour', async () => {
    const req = '{"narration":"x","roll_request":{"character_id":"pj_lyra","ability":"force","difficulty":8,"reason":"encore"}}';
    const llm = scripted(req);
    const r = await runTurn({ state: sampleState(), actions: action('a'), llm, rng: seededRng(1) });
    expect(llm.calls).toHaveLength(3);
    expect(r.state.log.filter((l) => l.kind === 'roll')).toHaveLength(2);
    expect(r.rejected.at(-1)).toMatch(/maximum 2 jets/);
  });

  it('en combat, le code résout l\'attaque et le MJ reçoit les événements', async () => {
    const s = applyChanges(sampleState(), [{ op: 'start_combat', enemies: [{ name: 'Noyé', hp: 30, attack: 0, defense: 10 }] }], { rng: seededRng(5) }).state;
    const enemyId = s.combat!.enemies[0].id;
    const llm = scripted('{"narration":"Ta dague mord la chair froide du noyé."}');
    const r = await runTurn({ state: s, actions: [{ characterId: 'pj_lyra', kind: 'attack', text: '', targetId: enemyId }], llm, rng: seededRng(9) });
    expect(llm.calls[0][1].content).toContain('ÉVÉNEMENTS DE COMBAT');
    expect(r.state.log.some((l) => l.kind === 'combat')).toBe(true);
    expect(r.state.combat?.round ?? 99).not.toBe(1);
  });

  it('la carte X est transmise au MJ', async () => {
    const llm = scripted('{"narration":"La scène change."}');
    await runTurn({ state: sampleState(), actions: [{ characterId: 'pj_lyra', kind: 'xcard', text: '' }], llm });
    expect(llm.calls[0][1].content).toContain('CARTE X');
  });
});

describe('résumé glissant', () => {
  it('résume les vieux tours en gardant les récents', async () => {
    const s = sampleState();
    for (let t = 1; t <= 26; t++) {
      s.turn = t;
      addLog(s, { kind: 'player', actorName: 'Lyra', text: `action ${t}` });
      addLog(s, { kind: 'gm', text: `narration ${t}` });
    }
    expect(summaryCutoff(s)).toBe(14);
    const llm = scripted('{"summary":"Lyra a exploré le port et promis de l\'aide à Marek."}');
    const r = await maybeSummarize(s, llm);
    expect(r.summarizedThroughTurn).toBe(14);
    expect(r.summary).toContain('Marek');
    expect(llm.calls[0][1].content).toContain('action 14');
    expect(llm.calls[0][1].content).not.toContain('action 15');
  });

  it('ne fait rien si le résumé échoue', async () => {
    const s = sampleState();
    for (let t = 1; t <= 30; t++) addLog(s, { kind: 'gm', text: 'x', turn: t });
    const r = await maybeSummarize(s, scripted('n\'importe quoi'));
    expect(r).toBe(s);
  });
});
