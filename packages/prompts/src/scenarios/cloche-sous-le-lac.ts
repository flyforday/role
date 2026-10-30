import type { Scenario } from '@veillee/engine';

export const clocheSousLeLac: Scenario = {
  id: 'cloche-sous-le-lac',
  title: 'La Cloche sous le lac',
  credits: { author: 'Veillée (scénario original)', license: 'Création originale, libre de droits pour Veillée' },
  genre: 'Fantasy',
  tone: 'Mystère',
  blurb: "Chaque nuit, une cloche sonne sous les eaux du lac de Brumevive et les villageois marchent vers la rive dans leur sommeil. Enquête, village inquiet et chapelle engloutie.",
  players: '2 à 4 joueurs, niveau 1 (seul : avec un compagnon)',
  minPlayers: 2,
  duration: '2 à 3 heures',
  setting:
    "Brumevive est un village de pêcheurs et de meuniers niché au bord d'un lac sombre, au pied des collines. Il y a cent ans, une crue a englouti la chapelle de Saint-Aubrin et son sonneur. Depuis, les gens d'ici respectent le lac et n'y pêchent jamais la nuit. Les routes sont boueuses, l'auberge chaleureuse et tout le monde se connaît.",
  pitch:
    "Depuis sept nuits, une cloche résonne sous le lac et des villageois se lèvent endormis pour marcher vers l'eau. La nuit dernière, la jeune Maëlle n'a été rattrapée qu'au bord du ponton. Le bourgmestre cherche quelqu'un pour comprendre et faire cesser ce sortilège.",
  secretPlot:
    "Gaspard Morel, le meunier, a remonté du lac il y a huit jours un reliquaire d'argent prisonnier de ses filets : la relique de Saint-Aubrin. Il l'a caché dans son moulin pour le vendre à la foire. Le reliquaire liait l'âme du sonneur, frère Anselme, au repos ; depuis qu'il a quitté la chapelle, le fantôme sonne la cloche pour appeler quelqu'un à le rapporter, et son appel attire les dormeurs vers l'eau. Si la relique retourne sur l'autel de la chapelle engloutie, l'appel cesse. Si on la détruit ou la vend, l'appel devient plus fort et le lac finit par réclamer un dormeur.",
  gmAdvice:
    "L'enquête peut se faire dans n'importe quel ordre : chaque piste du village mène au moulin. Si les joueurs piétinent, faites sonner la cloche plus tôt ou faites lever un dormeur sous leurs yeux. Le fantôme n'est pas méchant : il est désespéré. Un groupe qui parle avec lui doit être récompensé. Gaspard n'est pas un monstre, juste un homme endetté qui a honte.",
  locations: [
    { id: 'auberge_brumevive', name: "L'Auberge du Héron", description: 'Salle basse enfumée, poutres noircies, odeur de soupe au poisson.' },
    { id: 'rive', name: 'La rive et le ponton', description: 'Roseaux, brume épaisse, planches glissantes au-dessus de l\'eau noire.' },
    { id: 'moulin', name: 'Le moulin Morel', description: 'Moulin à eau sur le ruisseau qui se jette dans le lac. La roue grince.' },
    { id: 'ilot', name: "L'îlot aux saules", description: 'Petit îlot au milieu du lac où pointe le clocher englouti.' },
    { id: 'chapelle', name: 'La chapelle engloutie', description: 'Nef inondée, poche d\'air sous la voûte, lueur verdâtre.' },
  ],
  npcs: [
    { id: 'bourgmestre_odon', name: 'Odon Fenouil', description: 'Bourgmestre rond et nerveux, toujours un mouchoir à la main.', attitude: 'reconnaissant', motivation: "Veut que le problème cesse avant la foire qui fait vivre le village. Offre 30 pièces d'or et le gîte.", locationId: 'auberge_brumevive' },
    { id: 'maelle', name: 'Maëlle', description: 'Fille de l\'aubergiste, quinze ans, regard fatigué.', attitude: 'effrayée', motivation: "Se souvient de son rêve : une voix douce disait « Rendez-le-moi ». Veut aider mais a peur de dormir.", locationId: 'auberge_brumevive' },
    { id: 'mere_gisele', name: 'Mère Gisèle', description: 'Vieille herboriste aveugle qui connaît toutes les histoires du lac.', attitude: 'bienveillante', motivation: "Raconte la légende de frère Anselme et du reliquaire perdu dans la crue. Sait que les morts du lac \"veulent ce qu'on leur a pris\".", locationId: 'auberge_brumevive' },
    { id: 'gaspard', name: 'Gaspard Morel', description: 'Meunier massif, mains farineuses, dettes jusqu\'au cou.', attitude: 'sur la défensive', motivation: "Veut vendre le reliquaire pour payer ses dettes. Nie d'abord, puis avoue si on le confronte avec une preuve ou si on lui offre une issue honorable.", secret: 'Le reliquaire est caché sous le plancher de la meule, enveloppé dans un sac de farine.', locationId: 'moulin', hp: 12 },
    { id: 'frere_anselme', name: 'Frère Anselme', description: 'Fantôme d\'un moine sonneur, translucide, ruisselant.', attitude: 'désespéré', motivation: "Veut retrouver le repos : que la relique revienne sur l'autel. Ne parle qu'en phrases courtes et anciennes.", secret: "Il peut apaiser les noyés de la chapelle si on lui rend la relique.", locationId: 'chapelle' },
  ],
  quest: { id: 'cloche', title: 'La cloche sous le lac', objective: 'Comprendre pourquoi la cloche sonne et faire cesser l\'appel avant qu\'un dormeur ne se noie.' },
  lore: [
    { keywords: ['anselme', 'sonneur', 'saint aubrin', 'chapelle'], text: "Frère Anselme sonnait les heures à la chapelle de Saint-Aubrin. Il a refusé de quitter son clocher pendant la grande crue pour sonner l'alerte, et a sauvé le village au prix de sa vie." },
    { keywords: ['reliquaire', 'relique'], text: "Le reliquaire d'argent de Saint-Aubrin, en forme de petite cloche, contenait un os du saint. On le disait capable de garder les morts en paix." },
    { keywords: ['lac', 'nuit', 'pecher'], text: "À Brumevive, on ne pêche jamais la nuit : « le lac rend ce qu'on lui prend, et prend ce qu'on lui doit »." },
    { keywords: ['foire', 'dettes', 'meunier'], text: 'La foire d\'automne a lieu dans trois jours. Le meunier Gaspard doit une forte somme à un prêteur de la ville.' },
  ],
  startSceneId: 'arrivee',
  scenes: [
    {
      id: 'arrivee',
      title: "L'Auberge du Héron",
      locationId: 'auberge_brumevive',
      readAloud:
        "La pluie fine colle à vos manteaux quand vous poussez la porte de l'Auberge du Héron. Dedans, la chaleur du feu se mêle à l'odeur de la soupe au poisson, mais personne ne rit. Les villageois parlent bas, les yeux cernés. Près de la cheminée, un homme rond tord un mouchoir entre ses doigts : c'est Odon Fenouil, le bourgmestre. Il se lève en vous voyant. « Des voyageurs… Le ciel vous envoie. Vous l'entendrez bientôt, cette cloche. Elle sonne sous le lac, toutes les nuits, et chaque nuit quelqu'un se lève pour marcher vers l'eau. » Au fond de la salle, une adolescente pâle vous observe sans rien dire.",
      gmNotes:
        "Odon propose 30 pièces d'or et le gîte. Il peut présenter Maëlle (qui a failli se noyer) et Mère Gisèle (qui connaît la légende). Indices à obtenir ici : la cloche a commencé il y a sept nuits ; Maëlle a entendu « Rendez-le-moi » ; Gisèle raconte frère Anselme et le reliquaire perdu ; un habitué ricane que « le meunier fait le fier depuis une semaine, il a payé sa tournée ». La nuit tombe vite : laissez les joueurs choisir de guetter la rive ou d'aller voir le moulin.",
      npcIds: ['bourgmestre_odon', 'maelle', 'mere_gisele'],
      checks: [
        { situation: 'Rassurer Maëlle pour obtenir les détails de son rêve', ability: 'charisme', difficulty: 8, success: 'Elle décrit une voix douce, une odeur de cire et de vase, et les mots « Rendez-le-moi ».', failure: 'Elle ne parle que de « la voix » et fond en larmes ; il faudra revenir plus tard.' },
        { situation: 'Écouter les conversations de la salle', ability: 'perception', difficulty: 12, success: 'On murmure que Gaspard le meunier a payé ses dettes en retard… avec un air coupable, et qu\'il a pêché de nuit il y a huit jours.', failure: 'Rien que des peurs et des rumeurs contradictoires.' },
      ],
      rewards: '20 XP pour avoir réuni les témoignages.',
      exits: [
        { to: 'nuit_rive', when: 'Les joueurs guettent la rive la nuit, ou la nuit tombe pendant qu\'ils sont au village.' },
        { to: 'moulin', when: 'Les joueurs vont interroger Gaspard ou fouiller le moulin.' },
      ],
    },
    {
      id: 'nuit_rive',
      title: 'Les dormeurs de la rive',
      locationId: 'rive',
      readAloud:
        "Minuit. La brume monte du lac comme une respiration. Puis, du fond des eaux, une cloche sonne : un son grave, étouffé, qui vibre dans vos os plus qu'il ne frappe vos oreilles. Derrière vous, des portes grincent. Trois villageois en chemise de nuit avancent pieds nus dans la boue, les yeux ouverts et vides, droit vers le ponton. Le premier a déjà de l'eau jusqu'aux chevilles.",
      gmNotes:
        "Trois dormeurs avancent vers l'eau (dont Maëlle si les joueurs ne l'ont pas surveillée). On peut les retenir, les réveiller (de l'eau froide ou un nom crié fort fonctionne), les attacher. Si un dormeur atteint l'eau profonde, il faut plonger pour le sauver. Dans l'eau, les joueurs aperçoivent une lueur verte vers l'îlot aux saules où pointe un clocher. Une silhouette translucide de moine se dessine un instant dans la brume et murmure « Rendez-le… ». Si un joueur se laisse aller à écouter la cloche, il ressent l'envie de marcher (jet d'Endurance 12 pour résister).",
      npcIds: ['maelle'],
      checks: [
        { situation: 'Retenir un dormeur sans le blesser', ability: 'force', difficulty: 12, success: 'Le dormeur se débat puis s\'effondre, réveillé et grelottant.', failure: 'Il échappe à la prise et entre dans l\'eau jusqu\'à la taille.' },
        { situation: 'Plonger pour repêcher un dormeur dans l\'eau glacée', ability: 'endurance', difficulty: 12, success: 'Vous le ramenez sur la rive, vivant.', failure: 'Le froid vous mord : 1d4 dégâts, mais vous le ramenez quand même.' },
        { situation: 'Repérer d\'où vient le son de la cloche', ability: 'perception', difficulty: 8, success: 'Le son vient de l\'îlot aux saules, où pointe le sommet d\'un clocher.', failure: 'Le son semble venir de partout à la fois.' },
      ],
      rewards: "30 XP si personne ne s'est noyé. Odon offre une barque pour l'îlot.",
      exits: [
        { to: 'moulin', when: 'Au matin, les joueurs suivent la piste du meunier ou de l\'objet volé.' },
        { to: 'ilot', when: 'Les joueurs prennent une barque vers l\'îlot sans avoir la relique.' },
      ],
    },
    {
      id: 'moulin',
      title: 'Le moulin Morel',
      locationId: 'moulin',
      readAloud:
        "La roue du moulin tourne dans un grincement régulier, éclaboussant les pierres moussues. Une odeur de farine humide flotte dans l'air. Sur le seuil, Gaspard Morel, massif et les bras couverts de blanc, vous barre le passage. « Vous êtes les étrangers qui posent des questions ? J'ai du travail. » Ses yeux filent une seconde vers l'intérieur du moulin, puis reviennent sur vous.",
      gmNotes:
        "Gaspard nie tout. Il cède si on lui montre qu'on sait qu'il a pêché de nuit, si on fouille et trouve le reliquaire (sous le plancher de la meule, dans un sac de farine), ou si on lui offre une issue (le bourgmestre pourrait l'aider pour ses dettes). S'il est acculé et humilié, il attaque avec son marteau de meunier mais se rend à la moitié de ses PV. Le reliquaire est une petite cloche d'argent ciselée, froide au toucher ; quand on la tient, on entend un murmure de reconnaissance.",
      npcIds: ['gaspard'],
      checks: [
        { situation: 'Convaincre Gaspard d\'avouer sans violence', ability: 'charisme', difficulty: 16, success: 'Il s\'effondre, avoue et sort lui-même le reliquaire. Il demande pardon au village.', failure: 'Il se ferme et vous ordonne de partir ; il faudra une preuve.' },
        { situation: 'Fouiller le moulin discrètement ou rapidement', ability: 'perception', difficulty: 12, success: 'Une planche neuve sous la meule cache un sac de farine lourd : le reliquaire.', failure: 'Gaspard vous surprend en pleine fouille.' },
      ],
      encounter: {
        trigger: 'Gaspard est humilié ou surpris en pleine fouille et perd son calme',
        enemies: [{ name: 'Gaspard Morel (furieux)', hp: 12, attack: 3, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 }],
        alternatives: 'Il se rend dès qu\'il tombe à 6 PV ou si on lui parle de sa famille. Le tuer serait mal vu du village.',
      },
      rewards: 'Le reliquaire de Saint-Aubrin (objet). 30 XP pour l\'avoir récupéré, 20 de plus sans violence.',
      exits: [
        { to: 'ilot', when: 'Les joueurs ont le reliquaire et partent vers l\'îlot (de jour ou de nuit).' },
        { to: 'nuit_rive', when: 'La nuit tombe avant que les joueurs n\'agissent et ils n\'ont pas encore vu les dormeurs.' },
      ],
    },
    {
      id: 'ilot',
      title: "L'îlot aux saules",
      locationId: 'ilot',
      readAloud:
        "La barque glisse sur l'eau noire, chaque coup de rame avalé par la brume. L'îlot surgit enfin : une bosse de terre couverte de saules pleureurs, et au milieu, la pointe d'un clocher de pierre qui sort du lac comme un doigt. Une ouverture dans le clocher donne sur un escalier en colimaçon qui plonge sous la surface. De l'eau, une lumière verte pulse, lente comme un cœur.",
      gmNotes:
        "L'escalier descend dans l'eau sur une dizaine de marches puis remonte dans une poche d'air sous la voûte de la chapelle. Il faut retenir son souffle et nager quelques mètres. Une corde attachée au clocher aide (avantage narratif). Si les joueurs viennent sans la relique, le fantôme apparaît, les supplie de « le rapporter » et les noyés de la chapelle les repoussent.",
      checks: [
        { situation: 'Nager dans le passage noyé jusqu\'à la poche d\'air', ability: 'endurance', difficulty: 12, success: 'Vous émergez sous la voûte, essoufflé mais entier.', failure: 'Vous buvez la tasse et vous cognez contre la pierre : 1d4 dégâts.' },
      ],
      exits: [{ to: 'chapelle', when: 'Les joueurs plongent et atteignent la chapelle.' }],
    },
    {
      id: 'chapelle',
      title: 'La chapelle engloutie',
      locationId: 'chapelle',
      readAloud:
        "Vous émergez dans une nef à moitié noyée. L'air sent la cire et la vase. Sous la voûte, des algues pendent comme des bannières et une lueur verte baigne l'autel de pierre, vide, au fond du chœur. Au-dessus de vous, la grande cloche est suspendue, couverte de coquillages. Elle se met à osciller doucement, sans un bruit. Puis, de l'eau autour de l'autel, des silhouettes se dressent : des noyés aux yeux pâles, couverts de limon, qui se tournent vers vous.",
      gmNotes:
        "Les noyés gardent l'autel. Si un joueur brandit le reliquaire et l'annonce, frère Anselme apparaît et les noyés s'immobilisent : il faut alors marcher jusqu'à l'autel (jet d'Agilité 8 sur les dalles glissantes) et y déposer la relique. Si les joueurs attaquent ou n'ont pas la relique, le combat a lieu. Anselme peut parler : il remercie, dit que Gaspard « n'est pas mauvais, seulement pauvre », et indique un coffre d'offrandes sous l'autel en récompense. Quand la relique est posée, la cloche sonne une dernière fois, claire, et les noyés retournent à la vase.",
      npcIds: ['frere_anselme'],
      checks: [
        { situation: 'Traverser la nef glissante jusqu\'à l\'autel', ability: 'agilite', difficulty: 8, success: 'Vous atteignez l\'autel sans tomber.', failure: 'Vous glissez dans l\'eau froide (1d4 dégâts) mais vous relevez près de l\'autel.' },
      ],
      encounter: {
        trigger: 'Les joueurs attaquent, ou arrivent sans le reliquaire',
        enemies: [
          { name: 'Noyé couvert de limon', hp: 7, attack: 2, defense: 10, damage: '1d6', initiative: 0, xp: 25 },
          { name: 'Noyé couvert de limon', hp: 7, attack: 2, defense: 10, damage: '1d6', initiative: 0, xp: 25 },
        ],
        alternatives: 'Brandir le reliquaire ou invoquer le nom d\'Anselme fige les noyés. Fuir par le passage noyé est possible.',
      },
      rewards: "Coffre d'offrandes : 25 pièces d'or et une Fiole d'eau bénite (soigne 1d6 PV). 100 XP pour la quête accomplie.",
      exits: [
        { to: 'epilogue', when: 'La relique est déposée sur l\'autel et le groupe remonte.' },
        { to: 'epilogue_sombre', when: 'Les joueurs vendent, détruisent ou gardent le reliquaire au lieu de le rendre.' },
      ],
    },
    {
      id: 'epilogue',
      title: 'La paix du lac',
      locationId: 'auberge_brumevive',
      ending: 'victoire',
      readAloud:
        "Cette nuit-là, pour la première fois depuis une semaine, Brumevive dort. Aucune cloche, aucun pas dans la boue. Au matin, le soleil perce la brume et le lac brille comme un miroir. À l'Auberge du Héron, Odon Fenouil vous attend avec une bourse et un sourire qui lui fait trembler les joues, et Maëlle, enfin reposée, vous apporte deux bols de soupe sans rien dire, les yeux pleins de gratitude.",
      gmNotes:
        "Odon paie 30 pièces d'or comme promis. Le sort de Gaspard dépend des joueurs : s'ils ont plaidé pour lui, le village l'aide pour ses dettes. Mère Gisèle offre un sachet d'herbes de soin. Conclure l'aventure : mettre la quête « cloche » en réussie et laisser les joueurs raconter un dernier moment. On peut ouvrir une suite : la foire, le prêteur de la ville qui réclamait Gaspard…",
      rewards: "30 pièces d'or par le bourgmestre, Herbes de soin (soigne 1d4 PV). Quête réussie : 100 XP.",
      exits: [],
    },
    {
      id: 'epilogue_sombre',
      title: 'Le lac réclame son dû',
      locationId: 'rive',
      ending: 'défaite',
      readAloud:
        "La nuit suivante, la cloche ne sonne pas : elle hurle. Toutes les portes du village s'ouvrent en même temps, et des dizaines de dormeurs descendent vers le lac sous une lune blanche. Sur la rive, la brume prend la forme d'un moine immense qui tend les mains vers vous.",
      gmNotes:
        "Dernière chance : si les joueurs rendent enfin le reliquaire (ou ce qu'il en reste) au lac, l'appel cesse mais un dormeur a disparu. Sinon, le village est évacué et la quête échoue. Ne punissez pas gratuitement : montrez les conséquences et laissez un choix final.",
      exits: [{ to: 'epilogue', when: 'Les joueurs rendent finalement la relique au lac à temps.' }],
    },
  ],
};
