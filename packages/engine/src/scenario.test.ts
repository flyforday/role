import { describe, expect, it } from 'vitest';
import { applyChanges } from './changes';
import { createCharacter } from './rules';
import { currentScene, gameFromScenario, type Scenario } from './scenario';
import { sampleState } from './fixtures.test-utils';

const scenario: Scenario = {
  id: 'test',
  title: 'Le puits',
  credits: { author: 'Test', license: 'CC0' },
  genre: 'Fantasy',
  tone: 'Mystère',
  blurb: 'Un puits étrange.',
  players: '1',
  duration: '1 h',
  setting: 'Un hameau.',
  pitch: 'Le puits chante.',
  secretPlot: 'Une sirène vit au fond.',
  gmAdvice: 'Soyez gentil.',
  locations: [
    { id: 'hameau', name: 'Le hameau' },
    { id: 'puits', name: 'Le fond du puits' },
  ],
  npcs: [
    { id: 'jeanne', name: 'Jeanne', description: 'Fermière', attitude: 'inquiète', motivation: 'Retrouver son seau.', locationId: 'hameau' },
    { id: 'sirene', name: 'La sirène', description: 'Écailles', attitude: 'triste', motivation: 'Sortir.', secret: 'Elle est la fille de Jeanne.', hp: 10 },
  ],
  quest: { id: 'puits', title: 'Le puits qui chante', objective: 'Comprendre le chant.' },
  lore: [{ keywords: ['puits'], text: 'Le puits a trois cents ans.' }],
  startSceneId: 'debut',
  scenes: [
    { id: 'debut', title: 'Le hameau', locationId: 'hameau', readAloud: 'Le puits chante.', gmNotes: '…', npcIds: ['jeanne'], exits: [{ to: 'fond', when: 'descente' }] },
    { id: 'fond', title: 'Le fond', locationId: 'puits', readAloud: 'Il fait noir.', gmNotes: '…', npcIds: ['sirene'], exits: [], ending: 'victoire' },
  ],
};

function scenarioGame() {
  const s = gameFromScenario(scenario, { lines: [], veils: [] });
  s.characters.push(
    createCharacter({ id: 'pj_lyra', name: 'Lyra', concept: 'Éclaireuse', background: '', abilities: { force: 0, agilite: 3, endurance: 1, intelligence: 0, perception: 2, charisme: 0 }, weaponId: 'arme-dague' }),
  );
  return s;
}

describe('scénarios prêts à jouer', () => {
  it('crée la partie sur la première scène, avec son ouverture et ses seuls PNJ', () => {
    const s = scenarioGame();
    expect(currentScene(s)?.id).toBe('debut');
    expect(s.currentLocationId).toBe('hameau');
    expect(s.log[0].text).toBe('Le puits chante.');
    expect(s.npcs.map((n) => n.id)).toEqual(['jeanne']);
    expect(s.locations.map((l) => l.id)).toEqual(['hameau']);
    expect(s.quests[0].id).toBe('puits');
  });

  it('passe à la scène suivante : lieu, PNJ de la scène, progression', () => {
    const r = applyChanges(scenarioGame(), [{ op: 'scene', scene_id: 'fond' }]);
    expect(r.rejected).toEqual([]);
    expect(currentScene(r.state)?.id).toBe('fond');
    expect(r.state.currentLocationId).toBe('puits');
    expect(r.state.npcs.find((n) => n.id === 'sirene')).toMatchObject({ hp: 10, maxHp: 10, secrets: ['Elle est la fille de Jeanne.'] });
    expect(r.state.scenario?.visitedSceneIds).toEqual(['debut', 'fond']);
    expect(r.events.some((e) => e.includes('touche à sa fin'))).toBe(true);
  });

  it('refuse une scène inconnue, la scène en cours, ou une partie sans scénario', () => {
    const s = scenarioGame();
    const r = applyChanges(s, [
      { op: 'scene', scene_id: 'nulle_part' },
      { op: 'scene', scene_id: 'debut' },
    ]);
    expect(r.rejected.map((x) => x.reason)).toEqual([expect.stringMatching(/scène inconnue/), expect.stringMatching(/déjà dans la scène/)]);
    const free = applyChanges(sampleState(), [{ op: 'scene', scene_id: 'debut' }]);
    expect(free.rejected[0].reason).toMatch(/ne suit pas de scénario/);
  });

  it('refuse de changer de scène en plein combat', () => {
    const s = applyChanges(scenarioGame(), [{ op: 'start_combat', enemies: [{ name: 'Rat', hp: 3 }] }]).state;
    const r = applyChanges(s, [{ op: 'scene', scene_id: 'fond' }]);
    expect(r.rejected[0].reason).toMatch(/combat/);
  });

  it("fait entrer un PNJ du scénario avec sa fiche complète quand l'IA le cite par son id", () => {
    const r = applyChanges(scenarioGame(), [{ op: 'npc', npc: { id: 'sirene', attitude: 'curieuse' } }]);
    expect(r.rejected).toEqual([]);
    expect(r.state.npcs.find((n) => n.id === 'sirene')).toMatchObject({ name: 'La sirène', attitude: 'curieuse', hp: 10 });
  });
});
