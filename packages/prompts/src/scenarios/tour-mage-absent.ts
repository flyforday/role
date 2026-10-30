import type { Scenario } from '@veillee/engine';

export const tourMageAbsent: Scenario = {
  id: 'tour-mage-absent',
  title: 'La Tour du mage absent',
  credits: { author: 'Veillée (scénario original)', license: 'Création originale, libre de droits pour Veillée' },
  genre: 'Fantasy',
  tone: 'Merveilleux',
  blurb: "Le mage Céleste Ombrefeuille n'est pas sorti de sa tour depuis un mois, et la tour a commencé à… grandir. Énigmes, objets enchantés, gardiens animés et une apprentie à sauver.",
  players: '1 à 4 joueurs, niveau 1',
  duration: '2 à 3 heures',
  setting:
    "Le bourg de Sauvebois vit à l'ombre de la tour du mage Céleste Ombrefeuille, un vieil enchanteur excentrique mais bienveillant qui répare les toitures d'un geste et fait pousser les citrouilles en une nuit. Depuis un mois, la tour est silencieuse. Et chaque matin, elle compte un étage de plus.",
  pitch:
    "La tour du mage grandit d'un étage par nuit et ses ombres commencent à s'étendre sur le bourg. Son apprentie, Lune, est entrée il y a trois jours pour voir ce qui se passait et n'est jamais ressortie. Le conseil du bourg cherche des volontaires pour entrer à son tour.",
  secretPlot:
    "Céleste a tenté un sortilège pour arrêter le temps dans sa bibliothèque afin de finir de lire tous ses livres. Le sort a mal tourné : il s'est figé lui-même en statue de sablier au sommet de la tour, et la magie libre fait pousser la tour et animer ses objets. Lune est piégée dans la bibliothèque, où le temps s'écoule dix fois plus lentement : pour elle, il ne s'est passé que quelques heures. Pour tout réparer, il faut retourner le grand sablier du sommet en prononçant le mot que Céleste a laissé dans son journal : « Assez ».",
  gmAdvice:
    "C'est un scénario d'énigmes et d'émerveillement plus que de combat. Récompensez la curiosité et les idées farfelues. Les objets animés ne sont pas méchants : ils obéissent à des ordres anciens (« protéger les livres », « garder la porte »). Si les joueurs bloquent sur une énigme, Lune ou le chat parlant peuvent donner un indice.",
  locations: [
    { id: 'place_sauvebois', name: 'La place de Sauvebois', description: 'Place pavée, fontaine, et au-dessus des toits la tour qui monte trop haut.' },
    { id: 'hall_tour', name: 'Le hall de la tour', description: 'Hall circulaire, escalier qui tourne dans le mauvais sens, tableaux qui chuchotent.' },
    { id: 'atelier', name: "L'atelier d'enchantement", description: 'Établis couverts de fioles, balais qui balaient tout seuls, odeur de soufre et de lavande.' },
    { id: 'bibliotheque', name: 'La bibliothèque figée', description: 'Rayonnages infinis, poussière suspendue dans l\'air, pages arrêtées en plein vol.' },
    { id: 'sommet', name: 'Le sommet de la tour', description: 'Observatoire ouvert au ciel, grand sablier de cristal, vent d\'étoiles.' },
  ],
  npcs: [
    { id: 'conseillere_berthe', name: 'Berthe Pommeraie', description: 'Conseillère du bourg, tablier de boulangère, ton sans réplique.', attitude: 'pressée', motivation: "Veut que la tour arrête de grandir avant qu'elle ne s'effondre sur le bourg. Offre 40 pièces d'or et le pain à vie.", locationId: 'place_sauvebois' },
    { id: 'grimoire', name: 'Grisaille', description: 'Chat gris du mage, qui parle avec une voix de vieux professeur.', attitude: 'hautain', motivation: "Veut retrouver son maître (et ses repas). Aide le groupe s'il est flatté ou nourri, mais ne se mouille jamais lui-même.", secret: "Il a vu le mage monter au sommet avec son journal et sait que le mot de fin est écrit dedans.", locationId: 'hall_tour' },
    { id: 'gardien_armure', name: "L'Armure de la porte", description: 'Armure vide animée, voix caverneuse, hallebarde rouillée.', attitude: 'inflexible', motivation: "Obéit à un vieil ordre : « Ne laisser monter que ceux qui connaissent la réponse ». Pose une énigme. Combat seulement si on la force.", locationId: 'hall_tour' },
    { id: 'lune', name: 'Lune', description: "Apprentie de seize ans, cheveux pleins d'encre, très bavarde.", attitude: 'enthousiaste', motivation: "Croit n'être entrée que depuis une heure. Veut sauver son maître et connaît bien la tour. Peut lancer un petit sort de lumière ou de bouclier.", secret: "Elle sait que le journal du mage est dans la bibliothèque, mais il est figé dans le temps : il faut un objet de l'atelier (le Gant du temps lent) pour le saisir.", locationId: 'bibliotheque', hp: 8 },
    { id: 'celeste', name: 'Céleste Ombrefeuille', description: 'Vieux mage à la barbe étoilée, figé en statue de sable et de cristal.', attitude: 'figé', motivation: "Une fois libéré, il est confus, honteux et très reconnaissant. Il offre un objet magique de sa collection.", locationId: 'sommet' },
  ],
  quest: { id: 'tour', title: 'La tour qui grandit', objective: 'Entrer dans la tour du mage, retrouver Lune et arrêter la croissance de la tour.' },
  lore: [
    { keywords: ['celeste', 'ombrefeuille', 'mage'], text: "Céleste Ombrefeuille est un enchanteur de plus de cent ans, connu pour sa distraction légendaire et sa passion des livres." },
    { keywords: ['sablier', 'temps'], text: "La magie du temps est la plus capricieuse : un sort de temps doit toujours prévoir un mot pour l'arrêter." },
    { keywords: ['armure', 'enigme', 'gardien'], text: "Les gardiens animés obéissent à la lettre à leur dernier ordre, et seulement à lui." },
    { keywords: ['gant', 'atelier'], text: "Le Gant du temps lent permet de saisir un objet figé hors du temps sans être figé soi-même." },
  ],
  startSceneId: 'place',
  scenes: [
    {
      id: 'place',
      title: 'La tour qui grandit',
      locationId: 'place_sauvebois',
      readAloud:
        "Sur la place de Sauvebois, tout le monde a le nez en l'air. Au-dessus des toits, la tour du mage monte, monte, bien plus haut qu'elle ne devrait, ses fenêtres clignotant de lueurs violettes. Pendant que vous regardez, un craquement sourd résonne et un nouvel étage de pierre pousse au sommet, comme un champignon après la pluie. Une femme en tablier de boulangère se plante devant vous, les poings sur les hanches. « Vous avez l'air d'aventuriers. Parfait. Il y a une gamine là-dedans, et un vieux fou, et cette chose va finir par nous tomber dessus. »",
      gmNotes:
        "Berthe explique : le mage n'est pas sorti depuis un mois, Lune est entrée il y a trois jours, la tour grandit chaque nuit et son ombre fait faner les jardins. Elle offre 40 pièces d'or. Des villageois racontent des détails : des balais volent aux fenêtres la nuit, on entend une armure chanter. La porte de la tour s'ouvre d'elle-même quand on frappe trois fois.",
      npcIds: ['conseillere_berthe'],
      checks: [
        { situation: 'Observer la tour pour comprendre la magie à l\'œuvre', ability: 'intelligence', difficulty: 12, success: "La lueur pulse au rythme d'un sablier : c'est une magie du temps qui déborde, et sa source est au sommet.", failure: 'Une magie puissante et désordonnée, impossible d\'en dire plus d\'ici.' },
      ],
      exits: [{ to: 'hall', when: 'Les joueurs entrent dans la tour.' }],
    },
    {
      id: 'hall',
      title: 'Le hall et la question',
      locationId: 'hall_tour',
      readAloud:
        "La porte s'ouvre sur un hall circulaire où l'escalier monte en tournant dans le mauvais sens, ce qui vous donne un léger vertige. Les portraits accrochés aux murs chuchotent entre eux et se taisent quand vous les regardez. Au pied de l'escalier, une armure vide se redresse dans un grincement, sa hallebarde en travers du passage. Une voix caverneuse sort du heaume : « Nul ne monte sans répondre. » Sur la rampe, un gros chat gris vous observe en bâillant.",
      gmNotes:
        "L'énigme de l'Armure : « Je m'écoule sans être de l'eau, je me retourne sans avoir de dos, plus je donne et moins j'en ai. Qui suis-je ? » Réponse : un sablier (ou le temps, accepté aussi). Grisaille le chat donne un indice si on le flatte ou le nourrit (« Mon maître ne parle que de ça depuis un mois… »). Une mauvaise réponse : l'Armure frappe le sol, les portraits ricanent, on peut réessayer. La forcer déclenche le combat. Une porte latérale mène à l'atelier (sans énigme), l'escalier à la bibliothèque.",
      npcIds: ['grimoire', 'gardien_armure'],
      checks: [
        { situation: 'Écouter les portraits chuchotants', ability: 'perception', difficulty: 12, success: 'Un portrait souffle : « Le grand sablier… il l\'a retourné à l\'envers. »', failure: 'Les portraits se taisent dès que vous approchez.' },
        { situation: 'Amadouer le chat Grisaille', ability: 'charisme', difficulty: 8, success: 'Il donne un indice pour l\'énigme et accepte de vous accompagner.', failure: 'Il vous tourne le dos, vexé.' },
      ],
      encounter: {
        trigger: 'Les joueurs essaient de passer de force',
        enemies: [{ name: "L'Armure de la porte", hp: 14, attack: 3, defense: 14, damage: '1d8', initiative: 0, xp: 60 }],
        alternatives: "Répondre à l'énigme. On peut aussi la distraire avec un ordre plausible prononcé avec autorité (Charisme 16).",
      },
      rewards: '30 XP pour l\'énigme résolue.',
      exits: [
        { to: 'atelier', when: "Les joueurs explorent la porte latérale vers l'atelier." },
        { to: 'bibliotheque', when: "Les joueurs montent l'escalier vers la bibliothèque." },
      ],
    },
    {
      id: 'atelier',
      title: "L'atelier d'enchantement",
      locationId: 'atelier',
      readAloud:
        "L'atelier sent le soufre et la lavande. Des fioles bouillonnent toutes seules sur les établis, des plumes écrivent des listes dans le vide, et trois balais balaient le même coin de parquet avec une obstination furieuse. Sur une étagère haute, sous une cloche de verre, repose un gant de cuir argenté qui brille faiblement. Quand vous faites un pas, les balais s'arrêtent net et se tournent vers vous.",
      gmNotes:
        "Les balais obéissent à l'ordre « nettoyer » : ils chassent tout ce qui « salit » (les gens boueux, par exemple). Essuyer ses pieds, ou leur ordonner de nettoyer ailleurs, les calme. Sinon, ils attaquent. Sous la cloche : le Gant du temps lent (indispensable pour saisir le journal dans la bibliothèque). Sur l'établi : deux potions de soin et une fiole de fumée colorée.",
      checks: [
        { situation: 'Attraper le gant sous la cloche de verre sur l\'étagère haute', ability: 'agilite', difficulty: 12, success: 'Vous récupérez le Gant du temps lent sans rien casser.', failure: 'La cloche tombe et se brise avec fracas : les balais s\'affolent.' },
        { situation: 'Identifier les fioles de l\'établi', ability: 'intelligence', difficulty: 8, success: 'Deux potions de soin (rouge) et une fiole de fumée (violette).', failure: 'Impossible de savoir ce que font ces fioles sans les goûter…' },
      ],
      encounter: {
        trigger: 'Les balais jugent le groupe « sale » ou la cloche se brise',
        enemies: [
          { name: 'Balai enchanté', hp: 4, attack: 2, defense: 12, damage: '1d4', initiative: 3, xp: 10 },
          { name: 'Balai enchanté', hp: 4, attack: 2, defense: 12, damage: '1d4', initiative: 3, xp: 10 },
          { name: 'Balai enchanté', hp: 4, attack: 2, defense: 12, damage: '1d4', initiative: 3, xp: 10 },
        ],
        alternatives: "S'essuyer les pieds, donner un ordre de ménage plausible ou les enfermer dans un placard.",
      },
      rewards: 'Gant du temps lent, 2 potions de soin (soigne 1d6+1 PV), fiole de fumée. 20 XP.',
      exits: [{ to: 'bibliotheque', when: "Les joueurs montent vers la bibliothèque." }],
    },
    {
      id: 'bibliotheque',
      title: 'La bibliothèque figée',
      locationId: 'bibliotheque',
      readAloud:
        "Vous franchissez le seuil et le monde ralentit. La poussière flotte, immobile, comme des étoiles minuscules. Une page de livre est suspendue en plein vol au-dessus d'un pupitre. Vos propres gestes vous paraissent lourds, comme dans un rêve. Au milieu des rayonnages, une jeune fille aux cheveux tachés d'encre se retourne lentement vers vous et ouvre de grands yeux. « Déjà ? Mais… je viens à peine d'arriver ! Qui êtes-vous ? »",
      gmNotes:
        "Lune croit être là depuis une heure ; elle est stupéfaite d'apprendre qu'il s'est passé trois jours. Elle indique le journal du mage sur le pupitre, figé hors du temps : sans le Gant, la main qui le touche se fige quelques secondes (1d4 dégâts de froid temporel et impossible de le saisir). Avec le Gant, on peut l'ouvrir : dernière page, « Si le sort tourne mal : retourner le grand sablier et dire Assez. » Rester trop longtemps ici fait perdre des heures dehors (une nuit passe : la tour grandit encore). Si les joueurs n'ont pas le Gant, Lune leur parle de l'atelier.",
      npcIds: ['lune'],
      checks: [
        { situation: 'Se déplacer vite dans le temps ralenti', ability: 'endurance', difficulty: 12, success: 'Vous vous habituez à l\'air épais et agissez normalement.', failure: 'Chaque geste vous coûte : une heure passe dehors à chaque minute ici.' },
        { situation: 'Retrouver dans les rayonnages un livre sur les sorts de temps', ability: 'intelligence', difficulty: 12, success: 'Un chapitre confirme : tout sort de temps a un mot d\'arrêt, et c\'est toujours le lanceur qui le choisit.', failure: 'Des milliers de livres, et aucun au bon endroit.' },
      ],
      rewards: 'Le journal de Céleste (indice décisif). 30 XP pour avoir retrouvé Lune.',
      exits: [
        { to: 'atelier', when: "Les joueurs redescendent chercher le Gant à l'atelier." },
        { to: 'sommet', when: 'Les joueurs montent au sommet de la tour.' },
      ],
    },
    {
      id: 'sommet',
      title: 'Le grand sablier',
      locationId: 'sommet',
      readAloud:
        "L'escalier débouche à l'air libre, si haut que les nuages passent sous vos pieds. Un vent tiède chargé d'étincelles souffle sur l'observatoire. Au centre, un sablier de cristal grand comme un homme coule à l'envers : le sable remonte, lumineux, et chaque grain qui atteint le haut fait trembler la tour. Juste à côté, une statue de sable et de verre représente un vieil homme à longue barbe, le doigt levé, la bouche ouverte sur un mot qu'il n'a jamais fini de prononcer. Autour du sablier, des éclats de temps tourbillonnent comme des guêpes de lumière.",
      gmNotes:
        "Pour retourner le sablier : jet de Force 16 (ou 12 si plusieurs aident ou si Lune lance son sort). Les éclats de temps attaquent ceux qui approchent du sablier. Il faut ensuite dire « Assez » (le mot du journal). Sans le journal, les joueurs peuvent deviner : le mage avait la bouche ouverte sur un « A… » ; le chat peut aider. Quand le sablier est retourné et le mot dit, le sable retombe, la statue redevient Céleste, et la tour rapetisse dans un long soupir de pierre.",
      npcIds: ['celeste'],
      checks: [
        { situation: 'Retourner le grand sablier', ability: 'force', difficulty: 16, success: 'Le sablier bascule dans un grondement de cristal.', failure: 'Il bascule à peine et revient : un éclat de temps vous frappe (1d4 dégâts).' },
        { situation: 'Deviner le mot d\'arrêt sans le journal', ability: 'intelligence', difficulty: 16, success: 'Vous comprenez à la posture du mage, au doigt levé : « Assez ! »', failure: 'Le mot ne vient pas ; la tour gagne un étage dans un fracas.' },
      ],
      encounter: {
        trigger: 'Les joueurs s\'approchent du sablier',
        enemies: [
          { name: 'Éclat de temps', hp: 5, attack: 3, defense: 13, damage: '1d4+1', initiative: 4, xp: 20 },
          { name: 'Éclat de temps', hp: 5, attack: 3, defense: 13, damage: '1d4+1', initiative: 4, xp: 20 },
        ],
        alternatives: 'La fiole de fumée les disperse un tour. Retourner le sablier les fait disparaître.',
      },
      exits: [{ to: 'epilogue_tour', when: 'Le sablier est retourné et le mot d\'arrêt prononcé.' }],
    },
    {
      id: 'epilogue_tour',
      title: 'Le mage revenu',
      locationId: 'place_sauvebois',
      ending: 'victoire',
      readAloud:
        "Dans un grand soupir de pierre, la tour se tasse étage après étage jusqu'à retrouver sa taille d'autrefois. Sur la place, les villageois applaudissent à tout rompre. Céleste Ombrefeuille, encore saupoudré de sable, cligne des yeux devant la foule, rouge jusqu'aux oreilles. « Un mois ? Vraiment ? Oh là là. Je voulais simplement finir un livre… » Lune vous serre dans ses bras, le chat Grisaille réclame son dîner, et Berthe arrive avec une miche encore chaude et une bourse bien remplie.",
      gmNotes:
        "Berthe paie 40 pièces d'or. Céleste offre à chaque héros un objet de sa collection : une Plume qui écrit seule, une Bague de lumière ou une Cape qui ne se mouille jamais (au choix des joueurs). Lune peut devenir une alliée récurrente. Mettre la quête « tour » en réussie.",
      rewards: "40 pièces d'or, un objet magique au choix par héros. Quête réussie : 100 XP.",
      exits: [],
    },
  ],
};
