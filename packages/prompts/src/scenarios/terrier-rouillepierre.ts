import type { Scenario } from '@veillee/engine';

export const terrierRouillepierre: Scenario = {
  id: 'terrier-rouillepierre',
  title: 'Le Terrier de Rouillepierre',
  credits: { author: 'Veillée (scénario original)', license: 'Création originale, libre de droits pour Veillée' },
  genre: 'Fantasy',
  tone: 'Épique',
  blurb: "Des gobelins ont pillé une caravane et emporté la marchande Ysolde dans les vieilles mines de Rouillepierre. Exploration de souterrains, pièges, combats… et une surprise au fond du terrier.",
  players: '1 à 4 joueurs, niveau 1',
  duration: '2 à 3 heures',
  setting:
    "La route des Cols serpente entre des collines rousses criblées d'anciennes mines de fer. Les nains qui les creusaient sont partis depuis deux générations, laissant des galeries rouillées que l'on dit hantées. Les caravanes y passent vite, escortées si elles le peuvent.",
  pitch:
    "Une caravane a été attaquée sur la route des Cols. Les gobelins ont emporté les mules, les marchandises et Ysolde, la marchande qui la menait. Son associé, désespéré, offre une belle récompense à qui la ramènera vivante.",
  secretPlot:
    "Les gobelins de la tribu Croc-Gris ne pillent pas par plaisir : un ogre, Bruk, s'est installé au fond de la mine et les terrorise. Il exige de la nourriture et des « jolies choses » chaque semaine, faute de quoi il en dévore un. Leur cheffe, Nix, a enlevé Ysolde pour la donner à l'ogre. Nix est rusée et préférerait voir l'ogre mort : un groupe malin peut négocier avec elle, récupérer Ysolde et affronter l'ogre avec l'aide des gobelins.",
  gmAdvice:
    "Le scénario peut se jouer en force (combats successifs) ou par la ruse (négociation avec Nix). Valorisez les deux. Si un joueur seul s'en sort mal, faites intervenir Pip, le jeune gobelin peureux, qui peut guider ou trahir selon la façon dont on le traite. L'ogre est très dangereux en combat direct : l'éboulement de la grande salle ou l'aide des gobelins rendent le combat jouable.",
  locations: [
    { id: 'route_cols', name: 'La route des Cols', description: 'Chemin caillouteux entre des collines rousses, carcasses de chariots renversés.' },
    { id: 'entree_mine', name: "L'entrée de la mine", description: 'Bouche de galerie étayée de poutres pourries, rails rouillés.' },
    { id: 'galeries', name: 'Les galeries rouillées', description: 'Boyaux étroits, flaques orangées, échos qui portent loin.' },
    { id: 'repaire_gobelins', name: 'Le repaire des Croc-Gris', description: 'Ancienne salle des forges, feux de camp, butin entassé.' },
    { id: 'grande_salle', name: 'La grande salle', description: 'Caverne immense au plafond fissuré, ossements, odeur de fauve.' },
  ],
  npcs: [
    { id: 'tobias', name: 'Tobias Brancard', description: "Associé d'Ysolde, bras en écharpe, voix brisée.", attitude: 'désespéré', motivation: "Veut retrouver Ysolde. Promet 50 pièces d'or et une part des marchandises récupérées.", locationId: 'route_cols' },
    { id: 'pip', name: 'Pip', description: 'Jeune gobelin maigre aux grandes oreilles, plus peureux que méchant.', attitude: 'terrifié', motivation: "Veut survivre. Parle un français approximatif. Si on l'épargne et le nourrit, il révèle l'existence de l'ogre et le passage secret.", secret: "Connaît un boyau étroit qui mène directement au repaire en évitant le piège.", locationId: 'entree_mine', hp: 4 },
    { id: 'nix', name: 'Nix Croc-Gris', description: 'Cheffe gobeline, borgne, couverte de bijoux volés, sourire pointu.', attitude: 'calculatrice', motivation: "Veut se débarrasser de l'ogre sans perdre sa tribu. Rendra Ysolde contre l'aide du groupe pour tuer Bruk, ou contre une forte rançon.", secret: "Elle a déjà empoisonné une fois la viande de l'ogre, sans succès : elle a encore la fiole de poison.", locationId: 'repaire_gobelins', hp: 9 },
    { id: 'ysolde', name: 'Ysolde Varenne', description: 'Marchande quinquagénaire, robuste, ligotée mais pas abattue.', attitude: 'combative', motivation: "Veut sortir d'ici et récupérer au moins son coffret de comptes. Donne de bons conseils et n'a pas peur de se battre.", locationId: 'repaire_gobelins', hp: 8 },
    { id: 'bruk', name: 'Bruk', description: 'Ogre colossal, peau grise, massue faite d\'un tronc cerclé de fer.', attitude: 'affamé', motivation: "Veut manger et posséder des choses brillantes. Pas très malin : on peut le distraire avec de l'or ou de la nourriture.", locationId: 'grande_salle' },
  ],
  quest: { id: 'ysolde', title: 'La marchande disparue', objective: "Retrouver Ysolde dans les mines de Rouillepierre et la ramener vivante." },
  lore: [
    { keywords: ['rouillepierre', 'mine', 'nains'], text: "Les nains de Rouillepierre ont abandonné la mine après un effondrement. Ils marquaient les galeries sûres d'une rune en forme de marteau." },
    { keywords: ['croc gris', 'gobelins', 'tribu'], text: 'Les Croc-Gris sont une petite tribu gobeline qui vit de rapines. Ils respectent la ruse plus que la force.' },
    { keywords: ['ogre', 'bruk'], text: "Les ogres des collines sont lents d'esprit mais d'une force terrible. Ils craignent le feu vif et adorent ce qui brille." },
  ],
  startSceneId: 'caravane',
  scenes: [
    {
      id: 'caravane',
      title: 'La caravane pillée',
      locationId: 'route_cols',
      readAloud:
        "Le vent siffle entre les collines rousses. Au détour du chemin, vous découvrez deux chariots renversés, des tonneaux éventrés et des ballots de laine éparpillés dans les cailloux. Assis contre une roue brisée, un homme au bras en écharpe lève vers vous un visage couvert de poussière. « Des gobelins… une vingtaine. Ils ont pris les mules, la marchandise… et Ysolde. Mon associée. Je vous en prie. » Des traces de petits pieds griffus et de sabots s'éloignent vers les collines.",
      gmNotes:
        "Tobias promet 50 pièces d'or. Il raconte l'attaque : les gobelins semblaient pressés et nerveux, l'un criait « pour le Gros ! ». Les traces mènent à l'ancienne mine (une heure de marche). On peut soigner Tobias, fouiller les chariots (une lanterne, une corde de 15 m, des rations).",
      npcIds: ['tobias'],
      checks: [
        { situation: 'Suivre les traces dans les cailloux', ability: 'perception', difficulty: 8, success: "Les traces mènent droit à l'ancienne mine ; vous remarquez qu'une mule boite et ralentit le groupe.", failure: "Vous perdez la piste un moment ; vous arrivez à la mine au crépuscule, quand les gobelins sont plus vigilants." },
        { situation: 'Soigner le bras de Tobias', ability: 'intelligence', difficulty: 8, success: 'Il se sent mieux et vous donne en plus sa propre dague et une lanterne.', failure: 'Il grimace mais vous remercie quand même.' },
      ],
      rewards: 'Lanterne, corde de 15 m, rations (objets à donner via add_item si les joueurs fouillent).',
      exits: [{ to: 'entree', when: 'Les joueurs suivent les traces jusqu\'à la mine.' }],
    },
    {
      id: 'entree',
      title: "L'entrée de la mine",
      locationId: 'entree_mine',
      readAloud:
        "La bouche de la mine s'ouvre dans le flanc de la colline, étayée de poutres noires et pourries. Des rails rouillés s'enfoncent dans l'obscurité. Devant l'entrée, deux gobelins armés de lances jouent aux osselets en se chamaillant à voix aiguë, tandis qu'un troisième, tout maigre, monte la garde perché sur un wagonnet renversé en tremblant de tout son corps.",
      gmNotes:
        "Trois gobelins : deux gardes et Pip. On peut les attaquer, les contourner discrètement ou les tromper. Si le combat tourne mal pour eux, Pip lâche son arme et supplie. Interrogé gentiment, Pip parle du « Gros » (l'ogre) qui mange un gobelin par semaine et de la cheffe Nix. Il connaît un boyau étroit qui évite le piège des galeries.",
      npcIds: ['pip'],
      checks: [
        { situation: 'Approcher sans être vu', ability: 'agilite', difficulty: 12, success: 'Vous arrivez dans leur dos : vous avez l\'initiative ou pouvez passer sans combattre.', failure: 'Un caillou roule : les gardes se lèvent en criant.' },
        { situation: 'Bluffer les gardes (se faire passer pour des envoyés du « Gros », marchands…)', ability: 'charisme', difficulty: 12, success: 'Ils vous laissent passer en se moquant de vous.', failure: 'Ils pointent leurs lances, méfiants.' },
      ],
      encounter: {
        trigger: 'Les gardes repèrent le groupe ou les joueurs attaquent',
        enemies: [
          { name: 'Garde gobelin', hp: 5, attack: 2, defense: 12, damage: '1d6', initiative: 2, xp: 15 },
          { name: 'Garde gobelin', hp: 5, attack: 2, defense: 12, damage: '1d6', initiative: 2, xp: 15 },
        ],
        alternatives: 'Pip ne combat pas : il fuit ou se rend. Les gardes fuient dès que l\'un d\'eux tombe.',
      },
      exits: [
        { to: 'galeries', when: 'Les joueurs entrent dans la mine par le chemin principal.' },
        { to: 'repaire', when: 'Pip les guide par le boyau secret.' },
      ],
    },
    {
      id: 'galeries',
      title: 'Les galeries rouillées',
      locationId: 'galeries',
      readAloud:
        "L'obscurité vous avale. L'air sent le fer et la terre mouillée. Les rails s'enfoncent dans un long boyau où l'eau goutte dans des flaques couleur de sang séché. Sur une poutre, une rune en forme de marteau est gravée à demi effacée. Plus loin, les rails se divisent : à gauche, une galerie descend en pente raide ; à droite, une autre, plus large, porte des traces fraîches de sabots.",
      gmNotes:
        "La galerie de droite (celle des traces) est piégée : un fil tendu fait tomber une volée de pierres. La galerie de gauche, marquée par la rune des nains, est sûre mais plus longue et passe par une ancienne réserve où l'on trouve une pioche naine et un flacon d'huile (utile contre l'ogre : le feu l'effraie). Les deux mènent au repaire.",
      checks: [
        { situation: 'Repérer le fil tendu dans la galerie de droite', ability: 'perception', difficulty: 12, success: 'Vous voyez le fil et pouvez l\'enjamber ou le désamorcer.', failure: 'Une volée de pierres vous tombe dessus : 1d6 dégâts (Agilité 12 pour n\'en prendre que la moitié).' },
        { situation: 'Comprendre la rune des nains', ability: 'intelligence', difficulty: 8, success: 'La rune marque les galeries sûres : la gauche est sûre.', failure: 'La rune reste un mystère.' },
      ],
      rewards: "Réserve naine (galerie de gauche) : pioche naine (arme, 1d8, force) et flacon d'huile. 20 XP pour avoir déjoué le piège.",
      exits: [{ to: 'repaire', when: 'Les joueurs atteignent le repaire des gobelins.' }],
    },
    {
      id: 'repaire',
      title: 'Le repaire des Croc-Gris',
      locationId: 'repaire_gobelins',
      readAloud:
        "La galerie débouche sur une ancienne salle des forges. Des feux de camp crépitent sous de grandes hottes de pierre, éclairant un fouillis de butin : tonneaux, ballots de laine, casseroles, bottes dépareillées. Une dizaine de gobelins s'interrompent et se tournent vers vous. Sur un trône fait de selles empilées, une gobeline borgne couverte de bijoux vous fixe de son œil unique et sourit de toutes ses dents pointues. Derrière elle, ligotée à un pilier, une femme robuste vous lance un regard furieux et plein d'espoir.",
      gmNotes:
        "Nix ne veut pas se battre (trop de risques). Elle propose un marché : si le groupe tue « le Gros » dans la grande salle, elle rend Ysolde et la moitié du butin. Elle peut prêter deux gobelins et sa fiole de poison si on la flatte (Charisme 12). Si les joueurs refusent et attaquent, Nix et quatre gobelins se battent, les autres fuient. Si les joueurs libèrent Ysolde par la ruse, Nix envoie ses gobelins à leurs trousses et l'ogre est réveillé par le bruit. Ysolde, libérée, se bat avec une poêle (elle peut aider).",
      npcIds: ['nix', 'ysolde'],
      checks: [
        { situation: 'Négocier avec Nix un meilleur accord (plus de butin, aide de ses guerriers)', ability: 'charisme', difficulty: 12, success: 'Nix accepte, prête deux gobelins et sa fiole de poison.', failure: 'Nix maintient son marché de base, rien de plus.' },
        { situation: 'Libérer Ysolde discrètement pendant que Nix parle', ability: 'agilite', difficulty: 16, success: 'Les liens tombent sans que personne ne le remarque.', failure: 'Un gobelin hurle « Voleurs ! ».' },
      ],
      encounter: {
        trigger: 'Les joueurs attaquent les gobelins ou sont pris à libérer Ysolde',
        enemies: [
          { name: 'Nix Croc-Gris', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 3, xp: 40 },
          { name: 'Guerrier gobelin', hp: 5, attack: 2, defense: 12, damage: '1d6', initiative: 2, xp: 15 },
          { name: 'Guerrier gobelin', hp: 5, attack: 2, defense: 12, damage: '1d6', initiative: 2, xp: 15 },
        ],
        alternatives: 'Les gobelins se rendent si Nix tombe. Accepter le marché de Nix évite tout combat ici.',
      },
      rewards: '30 XP pour un accord avec Nix.',
      exits: [
        { to: 'ogre', when: 'Les joueurs vont affronter l\'ogre (marché conclu ou bruit qui le réveille).' },
        { to: 'fuite', when: 'Les joueurs repartent avec Ysolde sans affronter l\'ogre.' },
      ],
    },
    {
      id: 'ogre',
      title: 'Le Gros de la grande salle',
      locationId: 'grande_salle',
      readAloud:
        "La galerie s'élargit d'un coup sur une caverne immense dont le plafond se perd dans le noir, zébré de fissures. Le sol est jonché d'os rongés. Au centre, sur un tas de couvertures volées et d'objets brillants, quelque chose de gigantesque respire bruyamment. La masse grise se redresse lentement : un ogre, trois fois votre taille, qui tient une massue faite d'un tronc d'arbre cerclé de fer. Il renifle l'air et sourit. « Ah. Encore à manger. »",
      gmNotes:
        "Bruk est très dangereux. Moyens de l'affaiblir : le poison de Nix dans de la viande (il perd la moitié de ses PV), le feu (flacon d'huile : il recule et perd un tour), l'or qu'on lui jette (il se baisse pour ramasser), les fissures du plafond (Force 16 avec une pioche ou un levier pour provoquer un éboulement qui lui inflige 2d6 dégâts). Il est aussi possible de le tromper et de l'endormir avec des histoires flatteuses. Les gobelins prêtés par Nix l'attaquent par-derrière. Le trésor de Bruk contient un bouclier nain et 40 pièces d'or.",
      checks: [
        { situation: 'Provoquer l\'effondrement d\'une partie du plafond sur l\'ogre', ability: 'force', difficulty: 16, success: 'Des blocs s\'abattent sur Bruk : 2d6 dégâts et il est sonné un tour.', failure: 'Seuls quelques graviers tombent ; Bruk se retourne vers vous.' },
        { situation: 'Distraire Bruk avec de l\'or ou des objets brillants', ability: 'charisme', difficulty: 12, success: 'Il se jette sur l\'or : vous gagnez un tour d\'attaques gratuites ou la possibilité de fuir.', failure: 'Il prend l\'or ET charge.' },
      ],
      encounter: {
        trigger: 'Bruk se réveille et voit le groupe',
        enemies: [{ name: 'Bruk l\'ogre', hp: 22, attack: 4, defense: 11, damage: '1d8+2', initiative: -1, xp: 120 }],
        alternatives: "Poison de Nix (PV de départ divisés par deux), éboulement, feu, ruse. Fuir est possible : l'ogre est lent.",
      },
      rewards: 'Bouclier nain (+1 Défense en narration) et 40 pièces d\'or. 120 XP pour l\'ogre.',
      exits: [
        { to: 'retour', when: "L'ogre est vaincu, chassé ou neutralisé." },
        { to: 'fuite', when: "Les joueurs fuient l'ogre avec Ysolde." },
      ],
    },
    {
      id: 'retour',
      title: 'Le retour des héros',
      locationId: 'route_cols',
      ending: 'victoire',
      readAloud:
        "Quand vous sortez enfin de la mine, le soleil couchant embrase les collines rousses. Ysolde respire à pleins poumons, son coffret de comptes serré contre elle. Sur la route, Tobias boite à votre rencontre et la serre dans ses bras sans pouvoir dire un mot. Derrière vous, du haut de la colline, une silhouette borgne lève une main couverte de bagues en guise de salut.",
      gmNotes:
        "Tobias paie 50 pièces d'or. Si le marché avec Nix a été honoré, les Croc-Gris laissent désormais les caravanes passer contre un petit péage (paix durable). Ysolde offre de transporter gratuitement le groupe à la prochaine ville. Mettre la quête « ysolde » en réussie.",
      rewards: "50 pièces d'or de Tobias. Quête réussie : 100 XP.",
      exits: [],
    },
    {
      id: 'fuite',
      title: 'Fuir la mine',
      locationId: 'route_cols',
      ending: 'mitigée',
      readAloud:
        "Vous jaillissez de la mine en courant, Ysolde sur vos talons, tandis qu'un rugissement fait trembler la colline derrière vous. Les poutres de l'entrée craquent. Vous êtes vivants, Ysolde aussi… mais quelque chose de très gros et de très affamé sait maintenant à quoi vous ressemblez.",
      gmNotes:
        "Ysolde est sauvée : Tobias paie la récompense, mais l'ogre reste dans les collines et les Croc-Gris continuent de piller sous sa menace. Quête réussie mais avec une menace ouverte pour une suite.",
      rewards: "50 pièces d'or. Quête réussie : 60 XP.",
      exits: [{ to: 'ogre', when: 'Les joueurs décident de revenir affronter l\'ogre.' }],
    },
  ],
};
