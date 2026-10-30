import { describe, expect, it } from 'vitest';
import { NarrationExtractor, cleanNarration, extractJson, fallbackNarration, parseGmResponse } from './parse';

const good = {
  narration: 'La brume se lève sur le quai.',
  roll_request: { character_id: 'pj_lyra', ability: 'Agilité', difficulty: 13, reason: 'escalader le mât' },
  state_changes: [
    { op: 'gold', target: 'pj_lyra', delta: '5' },
    { op: 'teleport', target: 'pj_lyra' },
    { op: 'hp', target: 'pj_lyra' },
    { op: 'move', location_id: 'phare', new_location: null },
  ],
  memory_notes: ['Marek ment sur la cargaison'],
  suggested_actions: ['Interroger Marek', 'Fouiller la cale', 'Suivre la lanterne', 'Attendre', 'Fuir'],
};

describe('parsing des réponses du MJ', () => {
  it('accepte une réponse correcte et normalise les champs', () => {
    const r = parseGmResponse(JSON.stringify(good));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.roll_request).toEqual({ character_id: 'pj_lyra', ability: 'agilite', difficulty: 12, reason: 'escalader le mât' });
    expect(r.value.state_changes).toEqual([
      { op: 'gold', target: 'pj_lyra', delta: 5 },
      { op: 'move', location_id: 'phare', new_location: undefined },
    ]);
    expect(r.invalidChanges).toHaveLength(2);
    expect(r.value.suggested_actions).toHaveLength(4);
  });

  it('extrait le JSON d\'un bloc de code ou de texte parasite', () => {
    const wrapped = 'Voici ma réponse :\n```json\n' + JSON.stringify({ narration: 'ok' }) + '\n```\nBonne partie !';
    expect(parseGmResponse(wrapped).ok).toBe(true);
    const prose = 'Bien sûr ! {"narration": "Le vent {souffle}", "state_changes": [],} merci';
    const r = parseGmResponse(prose);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.narration).toBe('Le vent {souffle}');
  });

  it('accepte roll_request absent et listes nulles', () => {
    const r = parseGmResponse('{"narration":"Rien ne bouge.","state_changes":null,"memory_notes":null}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.roll_request).toBeNull();
      expect(r.value.state_changes).toEqual([]);
    }
  });

  it('signale une demande de jet malformée sans rejeter la narration', () => {
    const r = parseGmResponse(JSON.stringify({ narration: 'Tu tends l\'oreille.', roll_request: { ability: 'chance', difficulty: 12 } }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.roll_request).toBeNull();
      expect(r.invalidRoll).toBeTruthy();
    }
  });

  it('rejette une réponse sans narration ou tronquée', () => {
    expect(parseGmResponse('{"state_changes": []}').ok).toBe(false);
    expect(parseGmResponse('{"narration": "La porte s\'ouvre sur').ok).toBe(false);
    expect(parseGmResponse('Je suis désolé, je ne peux pas.').ok).toBe(false);
    expect(parseGmResponse('').ok).toBe(false);
  });

  it('récupère une narration de secours', () => {
    expect(fallbackNarration('{"narration": "La porte s\'ouvre sur un couloir sombre')).toBe("La porte s'ouvre sur un couloir sombre");
    expect(fallbackNarration('Texte brut du modèle')).toBe('Texte brut du modèle');
    expect(fallbackNarration('{"foo": 1')).toBe('');
  });

  it('extractJson lève une erreur claire', () => {
    expect(() => extractJson('pas de json')).toThrow(/aucun objet JSON/);
  });
});

describe('NarrationExtractor', () => {
  it('décode la narration au fil du flux, échappements coupés compris', () => {
    const json = JSON.stringify({ narration: 'Il dit : "Fuyez !"\nLa lampe vacille — étrange.', state_changes: [] });
    const ex = new NarrationExtractor();
    let out = '';
    for (let i = 0; i < json.length; i += 3) out += ex.push(json.slice(i, i + 3));
    expect(out).toBe('Il dit : "Fuyez !"\nLa lampe vacille — étrange.');
  });

  it('gère les séquences \\u découpées', () => {
    const ex = new NarrationExtractor();
    let out = ex.push('{"narration":"caf\\u00');
    out += ex.push('e9 noir"}');
    expect(out).toBe('café noir');
  });

  it('ignore le texte avant la clé narration', () => {
    const ex = new NarrationExtractor();
    expect(ex.push('{"memory_notes":["x"],')).toBe('');
    expect(ex.push('"narration": "Bonjour"')).toBe('Bonjour');
  });
});

describe('cleanNarration', () => {
  it('retire les fragments d\'alphabets étrangers sans toucher au français', () => {
    expect(cleanNarration('une forme massive se dét صل... non, ce n\'est que la roche.')).toBe("une forme massive se dét... non, ce n'est que la roche.");
    expect(cleanNarration('« Bien joué ! » — dit-elle, 🎲 prête ?')).toBe('« Bien joué ! » — dit-elle, 🎲 prête ?');
  });

  it('s\'applique à la narration validée', () => {
    const r = parseGmResponse(JSON.stringify({ narration: 'Le cristal пульс brille.', state_changes: [] }));
    expect(r.ok && r.value.narration).toBe('Le cristal brille.');
  });
});
