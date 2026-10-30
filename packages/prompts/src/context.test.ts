import { describe, expect, it } from 'vitest';
import { addLog } from '@veillee/engine';
import { buildGmMessages, estimateMessagesTokens, matchLore } from './context';
import { sampleState } from './fixtures.test-utils';

describe('contexte du MJ', () => {
  it('contient prompt, fiche de campagne, état, lore pertinent, refus et action dans l\'ordre', () => {
    const s = sampleState();
    s.lore.push({ id: 'l1', keywords: ['lanterne verte'], text: 'Les lanternes vertes signalent les passeurs.' });
    s.lore.push({ id: 'l2', keywords: ['dragon'], text: 'Aucun dragon ici.' });
    s.summary = 'Lyra est arrivée au port.';
    s.pendingRejections = ['Le changement X a été refusé car test.'];
    s.flags.pont_detruit = true;
    const msgs = buildGmMessages(s, [{ characterId: 'pj_lyra', kind: 'action', text: 'Je suis la lanterne verte' }]);
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toContain('Maître du Jeu');
    expect(msgs[0].content).toContain('Les Brumes de Varenne');
    expect(msgs[0].content).toContain('violence envers les enfants');
    const u = msgs[1].content;
    const order = ['ÉTAT DU JEU', 'RÉSUMÉ', 'LORE PERTINENT', 'CHANGEMENTS REFUSÉS', 'ACTION'].map((k) => u.indexOf(k));
    expect(order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1]))).toBe(true);
    expect(u).toContain('passeurs');
    expect(u).not.toContain('Aucun dragon');
    expect(u).toContain('pont_detruit=true');
    expect(u).toContain('[pj_lyra] Lyra');
    expect(u).toContain('Secrets');
  });

  it('tronque les vieux tours mais jamais la fiche des PJ ni les faits', () => {
    const s = sampleState();
    s.flags.secret_important = 'oui';
    for (let t = 1; t <= 16; t++) {
      s.turn = t;
      addLog(s, { kind: 'player', actorName: 'Lyra', text: 'action '.repeat(200) + t });
      addLog(s, { kind: 'gm', text: 'narration '.repeat(300) + t });
    }
    const msgs = buildGmMessages(s, [{ characterId: 'pj_lyra', kind: 'action', text: 'je continue' }], { maxTokens: 6000 });
    expect(estimateMessagesTokens(msgs)).toBeLessThan(7000);
    expect(msgs[1].content).toContain('secret_important');
    expect(msgs[1].content).toContain('PV ');
    expect(msgs[1].content).toContain('— Tour 16 —');
    expect(msgs[1].content).not.toContain('— Tour 1 —');
  });

  it('trouve le lore par mot-clé sans tenir compte des accents', () => {
    const lore = [{ id: 'a', keywords: ['Église'], text: 'x' }, { id: 'b', keywords: ['or'], text: 'y' }];
    expect(matchLore(lore, 'Je vais à l\'eglise').map((l) => l.id)).toEqual(['a']);
    expect(matchLore(lore, 'Il fait encore nuit')).toEqual([]);
  });
});
