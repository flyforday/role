import type { ChatMessage, LlmCall, LlmCallOptions } from '@veillee/prompts';

/**
 * MJ de démonstration, hors ligne et sans IA : il suit des règles simples pour tester l'interface
 * (jets de dés, combat, objets, quêtes) sans clé ni quota.
 */
export const demoLlm: LlmCall = async (messages, options) => {
  const text = respond(messages, options);
  await streamOut(text, options);
  return text;
};

async function streamOut(text: string, options: LlmCallOptions) {
  for (let i = 0; i < text.length; i += 6) {
    if (options.signal?.aborted) throw new DOMException('Annulé', 'AbortError');
    options.onToken?.(text.slice(i, i + 6));
    await new Promise((r) => setTimeout(r, 8));
  }
}

const WORLD = {
  title: 'Les Lanternes de Brumeval',
  setting:
    "Brumeval est une cité portuaire bâtie sur des pilotis de pierre noire, où la brume ne se lève jamais tout à fait. Les guildes de lanterniers y entretiennent des feux qui, dit-on, tiennent à distance ce qui rôde dans le brouillard. Depuis un mois, des lanternes s'éteignent seules, et ceux qui vivaient près d'elles disparaissent.",
  pitch: "Une lanternière vous a donné rendez-vous au Quai des Cendres : elle prétend savoir qui éteint les feux. Elle n'est jamais venue.",
  starting_location: { name: 'Quai des Cendres', description: 'Pontons vermoulus, odeur de sel et de suif, lanternes à moitié éteintes.' },
  npcs: [
    { id: 'odile', name: 'Odile Varenne', description: 'Lanternière au manteau brûlé', attitude: 'pressée et inquiète', secret: 'Elle a elle-même éteint la première lanterne, sous la contrainte.' },
    { id: 'gaspard', name: 'Gaspard Lemaure', description: 'Capitaine de la garde des quais', attitude: 'méfiant', secret: "Il est payé pour fermer les yeux sur les barges de nuit." },
  ],
  quest: { id: 'lanternes', title: 'Les lanternes éteintes', objective: 'Découvrir qui éteint les lanternes de Brumeval et pourquoi.' },
  lore: [
    { keywords: ['lanterne', 'lanternes', 'feu'], text: "Les lanternes de Brumeval brûlent une huile de baleine blanche bénie par la guilde ; éteintes, elles laissent passer « les Pâles »." },
    { keywords: ['pâles', 'brume', 'brouillard'], text: 'Les Pâles sont des silhouettes de brume qui imitent la voix des proches disparus.' },
    { keywords: ['guilde', 'lanterniers'], text: 'La guilde des lanterniers est dirigée par la Mère-Mèche, que personne n\'a vue depuis dix ans.' },
  ],
  opening:
    "La brume colle aux pavés du Quai des Cendres comme une seconde peau. Sur les pontons, trois lanternes sur quatre sont mortes ; la dernière crachote une flamme verdâtre qui ne réchauffe rien. Une cloche de barge sonne quelque part, étouffée. Vous attendez Odile depuis une heure lorsque vous remarquez, coincé entre deux planches, un morceau de manteau roussi… et des traces de pas qui s'arrêtent net au bord de l'eau. Derrière vous, une voix rauque lance : « Le quai est fermé la nuit. Qu'est-ce que vous fichez là ? »",
};

function respond(messages: ChatMessage[], options: LlmCallOptions): string {
  if (options.purpose === 'world') return JSON.stringify(WORLD);
  const last = messages[messages.length - 1]?.content ?? '';
  if (options.purpose === 'summary') {
    return JSON.stringify({ summary: 'Résumé (démo) : les personnages enquêtent sur les lanternes éteintes de Brumeval. ' + last.slice(-300).replace(/\s+/g, ' ') });
  }
  const pcId = /\[(pj_[^\]]+)\]/.exec(last)?.[1] ?? 'pj';
  const inCombat = last.includes('COMBAT EN COURS');

  if (last.includes('RÉSULTAT DU JET')) {
    const success = /→ (RÉUSSITE|réussite)/.test(last);
    return JSON.stringify(
      success
        ? {
            narration:
              "Ta tentative réussit. Sous tes doigts, quelque chose cède avec un déclic : dans une niche cachée, tu trouves une petite fiole d'huile blanche et quelques pièces poisseuses de sel. L'huile dégage une odeur de cire et de mer. Au loin, une lanterne s'éteint, comme si quelqu'un avait senti ta découverte.",
            state_changes: [
              { op: 'add_item', target: pcId, item: { name: "Fiole d'huile blanche", description: 'Huile bénie des lanterniers.' } },
              { op: 'gold', target: pcId, delta: 6 },
              { op: 'quest', quest: { id: 'lanternes', clue: "L'huile blanche est volée dans des niches cachées du quai." } },
              { op: 'xp', target: pcId, delta: 20 },
            ],
            suggested_actions: ["Examiner l'huile", 'Suivre la lanterne qui vient de s\'éteindre', 'Interroger le garde'],
          }
        : {
            narration:
              "Ça ne se passe pas comme prévu. Ta main glisse sur le bois mouillé, une écharde s'enfonce sous ta peau et tu te cognes contre une poutre. Le bruit résonne sur l'eau noire ; quelque chose, sous les pontons, cesse de bouger pour écouter.",
            state_changes: [{ op: 'hp', target: pcId, delta: -2, reason: 'chute' }],
            suggested_actions: ['Retenir ton souffle', 'Reculer lentement', 'Brandir une lanterne'],
          },
    );
  }
  if (last.includes("n'est pas un JSON valide")) {
    return JSON.stringify({ narration: 'Le MJ reprend le fil de son récit.', state_changes: [] });
  }
  if (last.includes('CARTE X')) {
    return JSON.stringify({
      narration:
        "La scène se dissout dans la brume. Quelques instants plus tard, vous vous retrouvez à la Taverne du Suif Doré, au chaud, face à une assiette de soupe aux moules. Un vieux marin vous fait signe : il prétend connaître le chemin du phare.",
      state_changes: [{ op: 'move', location_id: 'taverne', new_location: { name: 'Taverne du Suif Doré', description: 'Chaleur, rires, odeur de soupe.' } }],
      suggested_actions: ['Écouter le marin', 'Commander à boire', 'Observer la salle'],
    });
  }
  const events = /ÉVÉNEMENTS DE COMBAT[^\n]*\n([\s\S]*?)(?:\n\n|$)/.exec(last)?.[1];
  if (events) {
    const victory = events.includes('Victoire');
    return JSON.stringify({
      narration: victory
        ? `Le dernier Pâle se défait en lambeaux de brume avec un soupir qui ressemble à un nom. ${firstLine(events)} Le silence retombe sur le quai, seulement troublé par le clapotis de l'eau.`
        : `Les coups s'échangent dans la brume. ${events.split('\n').map((l) => l.replace(/^- /, '')).join(' ')} La créature recule d'un pas, cherchant une faille.`,
      state_changes: [],
      suggested_actions: victory ? ['Fouiller les restes', 'Reprendre ton souffle'] : ['Attaquer encore', 'Chercher une lanterne', 'Fuir vers la ruelle'],
    });
  }
  const action = (/ACTIONS? DES JOUEURS[^\n]*\n([\s\S]*)$/.exec(last)?.[1] ?? last).toLowerCase();
  if (!inCombat && /attaqu|combat|frapp|dégaine|degaine|tue/.test(action)) {
    return JSON.stringify({
      narration:
        "La brume se déchire et une silhouette pâle se dresse sur le ponton, ses doigts trop longs ruisselant d'eau froide. Elle ouvre une bouche sans lèvres et murmure ton prénom avec la voix d'un ami perdu. Elle se jette sur toi !",
      state_changes: [{ op: 'start_combat', enemies: [{ name: 'Pâle des brumes', hp: 9, attack: 2, defense: 11, damage: '1d6', initiative: 1, xp: 40 }] }],
      suggested_actions: ['Attaquer le Pâle', 'Brandir une lanterne', 'Fuir'],
    });
  }
  const checks: Array<[RegExp, string, number, string]> = [
    [/fouill|cherch|examin|inspect|observ/, 'perception', 12, 'fouiller les environs'],
    [/grimp|escalad|saut|cour/, 'agilite', 12, 'franchir l\'obstacle'],
    [/convain|persuad|ment|charm|négoci|negoci/, 'charisme', 16, 'convaincre son interlocuteur'],
    [/forc|pouss|soulev|enfonc/, 'force', 12, 'forcer le passage'],
    [/discr|caché|cache|faufil/, 'agilite', 16, 'rester discret'],
    [/souvien|connai|lire|déchiffr|dechiffr/, 'intelligence', 12, 'se souvenir'],
  ];
  for (const [re, ability, difficulty, reason] of checks) {
    if (re.test(action)) {
      return JSON.stringify({
        narration: "Tu retiens ton souffle et te concentres. La brume semble s'épaissir autour de toi, comme pour mettre ta volonté à l'épreuve…",
        roll_request: { character_id: pcId, ability, difficulty, reason },
        state_changes: [],
      });
    }
  }
  return JSON.stringify({
    narration:
      "Le garde s'avance dans la lumière verdâtre : un homme massif, le nez cassé, la main sur la garde de son sabre. « Gaspard Lemaure, capitaine des quais. » Il jette un regard au morceau de manteau roussi et sa mâchoire se crispe. « Vous connaissiez la lanternière ? Alors vous feriez mieux de me suivre… ou de disparaître avant que la brume ne s'en charge. »",
    state_changes: [{ op: 'npc', npc: { id: 'gaspard', attitude: 'menaçant' } }],
    memory_notes: ['Gaspard a reconnu le manteau d\'Odile'],
    suggested_actions: ['Suivre Gaspard', 'Lui mentir', 'Fouiller le ponton', 'Attaquer'],
  });
}

function firstLine(s: string): string {
  return s.split('\n').find((l) => l.includes('Victoire'))?.replace(/^- /, '') ?? '';
}
