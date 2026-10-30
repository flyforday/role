import { describe, expect, it } from 'vitest';
import { ABILITIES, DIFFICULTIES, applyChanges, createCharacter, gameFromScenario } from '@veillee/engine';
import { SCENARIOS } from './scenarios';
import { buildGmMessages } from './context';
import { StateChangeSchema } from './schema';

describe('bibliothèque de scénarios', () => {
  it('a des identifiants uniques', () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
  });

  for (const sc of SCENARIOS) {
    describe(sc.title, () => {
      const sceneIds = new Set(sc.scenes.map((s) => s.id));
      const locIds = new Set(sc.locations.map((l) => l.id));
      const npcIds = new Set(sc.npcs.map((n) => n.id));

      it('cite son auteur et sa licence', () => {
        expect(sc.credits.author).not.toBe('');
        expect(sc.credits.license).not.toBe('');
        // une adaptation d'une œuvre CC BY-SA doit garder la même licence et citer sa source
        if (sc.credits.source?.includes('rolis.net')) expect(sc.credits.license).toContain('CC BY-SA');
      });

      it('a des références internes cohérentes', () => {
        expect(sceneIds.has(sc.startSceneId)).toBe(true);
        expect(sceneIds.size).toBe(sc.scenes.length);
        for (const scene of sc.scenes) {
          expect(locIds.has(scene.locationId), `${scene.id} → lieu ${scene.locationId}`).toBe(true);
          for (const id of scene.npcIds ?? []) expect(npcIds.has(id), `${scene.id} → PNJ ${id}`).toBe(true);
          for (const exit of scene.exits) expect(sceneIds.has(exit.to), `${scene.id} → ${exit.to}`).toBe(true);
          for (const c of scene.checks ?? []) {
            expect(ABILITIES).toContain(c.ability);
            expect(DIFFICULTIES).toContain(c.difficulty);
          }
          for (const e of scene.encounter?.enemies ?? []) expect(e.hp).toBeGreaterThan(0);
          if (!scene.ending) expect(scene.exits.length, `${scene.id} sans sortie`).toBeGreaterThan(0);
        }
        for (const n of sc.npcs) if (n.locationId) expect(locIds.has(n.locationId), `${n.id} → ${n.locationId}`).toBe(true);
      });

      it('permet d\'atteindre une fin depuis le début', () => {
        const seen = new Set<string>();
        const queue = [sc.startSceneId];
        while (queue.length) {
          const id = queue.shift()!;
          if (seen.has(id)) continue;
          seen.add(id);
          queue.push(...sc.scenes.find((s) => s.id === id)!.exits.map((x) => x.to));
        }
        expect(sc.scenes.some((s) => s.ending && seen.has(s.id))).toBe(true);
        expect([...sceneIds].filter((id) => !seen.has(id))).toEqual([]);
      });

      it('se joue de scène en scène et ses combats prévus sont acceptés par le moteur', () => {
        let state = gameFromScenario(sc, { lines: [], veils: [] });
        state.characters.push(
          createCharacter({ id: 'pj', name: 'Test', concept: 'Guerrier', background: '', abilities: { force: 2, agilite: 1, endurance: 2, intelligence: 0, perception: 1, charisme: 0 }, weaponId: 'arme-epee' }),
        );
        for (const scene of sc.scenes) {
          if (scene.id !== state.scenario!.currentSceneId) {
            const r = applyChanges(state, [StateChangeSchema.parse({ op: 'scene', scene_id: scene.id })]);
            expect(r.rejected).toEqual([]);
            state = r.state;
          }
          const msgs = buildGmMessages(state, [{ characterId: 'pj', kind: 'action', text: 'Je regarde autour de moi' }]);
          expect(msgs[1].content).toContain(`SCÈNE EN COURS [${scene.id}]`);
          if (scene.encounter) {
            const r = applyChanges(state, [{ op: 'start_combat', enemies: scene.encounter.enemies }]);
            expect(r.rejected).toEqual([]);
          }
        }
      });
    });
  }
});
