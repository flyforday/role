import { describe, expect, it } from 'vitest';
import { applyChanges, newBudget } from './changes';
import { seededRng } from './dice';
import { sampleState } from './fixtures.test-utils';

describe('applyChanges', () => {
  it('ne modifie pas l\'état d\'entrée', () => {
    const s = sampleState();
    const copy = structuredClone(s);
    applyChanges(s, [{ op: 'gold', target: 'pj_lyra', delta: 5 }]);
    expect(s).toEqual(copy);
  });

  it('applique des changements valides', () => {
    const s = sampleState();
    const r = applyChanges(s, [
      { op: 'hp', target: 'pj_lyra', delta: -3 },
      { op: 'gold', target: 'pj_lyra', delta: 15 },
      { op: 'add_item', target: 'pj_lyra', item: { name: 'Clé rouillée', description: 'Ouvre une porte du port' } },
      { op: 'flag', key: 'pont_detruit', value: true },
      { op: 'npc', npc: { id: 'vesna', name: 'Vesna', attitude: 'amicale' } },
      { op: 'quest', quest: { id: 'navires', clue: 'Une lanterne verte avant chaque disparition' } },
      { op: 'move', location_id: 'phare', new_location: { name: 'Le vieux phare' } },
    ]);
    expect(r.rejected).toEqual([]);
    const pc = r.state.characters[0];
    expect(pc.hp).toBe(pc.maxHp - 3);
    expect(pc.gold).toBe(25);
    expect(pc.inventory.some((i) => i.name === 'Clé rouillée')).toBe(true);
    expect(r.state.flags.pont_detruit).toBe(true);
    expect(r.state.npcs.find((n) => n.id === 'vesna')?.status).toBe('vivant');
    expect(r.state.quests[0].clues).toContain('Une lanterne verte avant chaque disparition');
    expect(r.state.currentLocationId).toBe('phare');
  });

  it('refuse de retirer un objet absent', () => {
    const r = applyChanges(sampleState(), [{ op: 'remove_item', target: 'pj_lyra', item_name: 'Épée légendaire' }]);
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].reason).toMatch(/ne possède pas/);
  });

  it('retire un objet en ignorant casse et accents', () => {
    const r = applyChanges(sampleState(), [{ op: 'remove_item', target: 'pj_lyra', item_name: 'potion DE SOIN' }]);
    expect(r.rejected).toEqual([]);
    expect(r.state.characters[0].inventory.some((i) => i.name === 'Potion de soin')).toBe(false);
  });

  it('refuse les soins au-delà du maximum et borne le soin', () => {
    const full = applyChanges(sampleState(), [{ op: 'hp', target: 'pj_lyra', delta: 5 }]);
    expect(full.rejected[0].reason).toMatch(/tous ses PV/);

    const hurt = applyChanges(sampleState(), [{ op: 'hp', target: 'pj_lyra', delta: -5 }]).state;
    const healed = applyChanges(hurt, [{ op: 'hp', target: 'pj_lyra', delta: 50 }]);
    expect(healed.rejected).toEqual([]);
    expect(healed.adjusted).toHaveLength(1);
    expect(healed.state.characters[0].hp).toBe(healed.state.characters[0].maxHp);
  });

  it('borne les dégâts par tour, y compris sur plusieurs réponses', () => {
    const budget = newBudget();
    const s = sampleState();
    s.characters[0].hp = s.characters[0].maxHp = 40;
    const a = applyChanges(s, [{ op: 'hp', target: 'pj_lyra', delta: -12 }], { budget });
    const b = applyChanges(a.state, [{ op: 'hp', target: 'pj_lyra', delta: -12 }], { budget });
    expect(b.adjusted[0].note).toMatch(/bornés à 3/);
    expect(b.state.characters[0].hp).toBe(25);
    const c = applyChanges(b.state, [{ op: 'hp', target: 'pj_lyra', delta: -1 }], { budget });
    expect(c.rejected).toHaveLength(1);
  });

  it('refuse de cibler un personnage inexistant', () => {
    const r = applyChanges(sampleState(), [
      { op: 'hp', target: 'pj_fantome', delta: -2 },
      { op: 'gold', target: 'inconnu', delta: 3 },
      { op: 'xp', target: 'nobody', delta: 10 },
    ]);
    expect(r.rejected).toHaveLength(3);
  });

  it('refuse de dépenser de l\'or que le personnage n\'a pas', () => {
    const r = applyChanges(sampleState(), [{ op: 'gold', target: 'pj_lyra', delta: -500 }]);
    expect(r.rejected[0].reason).toMatch(/n'a que 10/);
  });

  it('borne l\'or gagné', () => {
    const r = applyChanges(sampleState(), [{ op: 'gold', target: 'pj_lyra', delta: 10_000 }]);
    expect(r.state.characters[0].gold).toBe(210);
    expect(r.adjusted).toHaveLength(1);
  });

  it('refuse un déplacement vers un lieu inconnu sans description', () => {
    const r = applyChanges(sampleState(), [{ op: 'move', location_id: 'atlantide' }]);
    expect(r.rejected[0].reason).toMatch(/lieu inconnu/);
  });

  it('refuse de ressusciter un PNJ', () => {
    const dead = applyChanges(sampleState(), [{ op: 'npc', npc: { id: 'marek', status: 'mort' } }]).state;
    const r = applyChanges(dead, [{ op: 'npc', npc: { id: 'marek', status: 'vivant' } }]);
    expect(r.rejected[0].reason).toMatch(/mort/);
  });

  it('tue un PNJ tombé à 0 PV', () => {
    const r = applyChanges(sampleState(), [{ op: 'hp', target: 'marek', delta: -10 }]);
    expect(r.state.npcs[0].hp).toBe(0);
    expect(r.state.npcs[0].status).toBe('mort');
  });

  it('rend inconscient un PJ à 0 PV', () => {
    const s = sampleState();
    s.characters[0].hp = 4;
    const r = applyChanges(s, [{ op: 'hp', target: 'pj_lyra', delta: -10 }]);
    expect(r.state.characters[0].hp).toBe(0);
    expect(r.state.characters[0].conditions).toContain('inconscient');
  });

  it('gère les conditions', () => {
    const a = applyChanges(sampleState(), [{ op: 'condition', target: 'pj_lyra', add: 'Empoisonné' }]);
    expect(a.state.characters[0].conditions).toEqual(['empoisonné']);
    const b = applyChanges(a.state, [{ op: 'condition', target: 'pj_lyra', remove: 'empoisonne' }]);
    expect(b.state.characters[0].conditions).toEqual([]);
    const c = applyChanges(b.state, [{ op: 'condition', target: 'pj_lyra', remove: 'blessé' }]);
    expect(c.rejected).toHaveLength(1);
  });

  it('gère l\'XP et la montée de niveau, et refuse l\'XP négative', () => {
    const r = applyChanges(sampleState(), [{ op: 'xp', target: 'pj_lyra', delta: 120 }]);
    expect(r.state.characters[0].level).toBe(2);
    expect(r.events.join(' ')).toMatch(/niveau 2/);
    expect(applyChanges(sampleState(), [{ op: 'xp', target: 'pj_lyra', delta: -10 }]).rejected).toHaveLength(1);
  });

  it('refuse les quêtes terminées qui redeviennent actives', () => {
    const done = applyChanges(sampleState(), [{ op: 'quest', quest: { id: 'navires', status: 'réussie' } }]).state;
    const r = applyChanges(done, [{ op: 'quest', quest: { id: 'navires', status: 'active' } }]);
    expect(r.rejected).toHaveLength(1);
  });

  it('refuse les clés de faits invalides et les opérations inconnues', () => {
    const r = applyChanges(sampleState(), [
      { op: 'flag', key: 'Clé Invalide!', value: 1 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { op: 'teleport' } as any,
    ]);
    expect(r.rejected).toHaveLength(2);
  });

  it('limite le nombre de changements par tour', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ op: 'flag' as const, key: `f${i}`, value: i }));
    const r = applyChanges(sampleState(), many);
    expect(r.applied).toHaveLength(15);
    expect(r.rejected).toHaveLength(5);
  });

  it('démarre un combat avec initiative lancée par le code et refuse de fuir sans y mettre fin', () => {
    const r = applyChanges(sampleState(), [{ op: 'start_combat', enemies: [{ name: 'Noyé', hp: 9, attack: 3 }] }], { rng: seededRng(3) });
    expect(r.state.combat?.enemies[0].name).toBe('Noyé');
    expect(r.state.combat?.order).toHaveLength(2);
    const m = applyChanges(r.state, [{ op: 'move', location_id: 'phare', new_location: { name: 'Phare' } }]);
    expect(m.rejected[0].reason).toMatch(/combat/);
  });
});
