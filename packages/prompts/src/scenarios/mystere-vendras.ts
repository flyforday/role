import type { Scenario } from '@veillee/engine';

/**
 * Adaptation de la campagne « Le mystère des Vendras » de Joe Hellrik,
 * publiée sur Rolis sous licence CC BY-SA 4.0. Cette adaptation reste sous CC BY-SA 4.0.
 */
export const mystereVendras: Scenario = {
  id: 'mystere-vendras',
  title: 'Le mystère des Vendras',
  credits: {
    author: 'Joe Hellrik (campagne Rolis, adaptée pour Veillée)',
    license: 'CC BY-SA 4.0',
    source: 'https://www.rolis.net/scenarios/campagne/22/le-mystere-des-vendras',
  },
  genre: 'Fantasy',
  tone: 'Sombre et mystérieux',
  blurb:
    "Une vieille comtesse veuve engage les héros pour rapporter un médaillon de famille des ruines de son manoir, au cœur d'une forêt ensorcelée. Puis sa jeune nièce les engage à son tour… Trois missions en apparence banales, et une sorcière qui tire les fils depuis le début.",
  players: '2 à 5 joueurs, niveau 1',
  duration: 'Campagne de 3 épisodes, environ 6 heures',
  setting:
    "Brevnandra, petite ville bourgeoise enrichie par ses scieries et les pierres précieuses des montagnes voisines, et sa grande voisine Valnandra, cité marchande au port fluvial bâtie sur d'anciennes cryptes. Plus au nord, l'ancien domaine des Vendras : une forêt de sapins noirs noyée de brume qui entoure les ruines d'un manoir incendié il y a vingt ans par des créatures démoniaques.",
  pitch:
    "À Brevnandra, la guilde des mercenaires transmet aux héros l'annonce d'une vieille aristocrate excentrique, la comtesse Lylyan de Vendras. Elle cherche des braves pour retourner sur son ancien domaine et en rapporter un médaillon, souvenir de son défunt mari. Personne n'y a mis les pieds depuis vingt ans.",
  secretPlot:
    "La comtesse n'existe plus depuis vingt ans. La vieille dame est Valcoria, la sorcière écarlate. Le comte de Vendras lui avait dérobé son médaillon magique et ses grimoires. Elle a lancé l'assaut démoniaque sur le manoir pour les reprendre, mais tout le monde est mort sans qu'elle ne trouve rien, et elle n'a pas pu dompter la chose-démon qu'elle avait invoquée. Affaiblie, elle a pris les traits de la comtesse et envoie depuis des mercenaires chercher le médaillon. Grâce à lui, elle rajeunit et se fait passer pour sa propre nièce, Dame Gyselda, afin d'obtenir l'héritage caché du comte : ses grimoires, enterrés avec lui dans les cryptes de Valnandra. Avec eux, elle redevient Valcoria, brûle sa maison, rebâtit le manoir en tour démoniaque et lâche ses hordes sur la région. Les héros lui ont fourni, sans le savoir, chaque pièce de sa résurrection.",
  gmAdvice:
    "Tout repose sur l'interprétation de la comtesse puis de Gyselda : aimables, reconnaissantes, mais avec des éclats inquiétants (une étincelle avide dans le regard, une colère soudaine quand on évoque le tombeau du comte). Semez les indices sans rien révéler : des joueurs attentifs peuvent comprendre avant la fin, et c'est très bien. Soignez l'ambiance : la brume de la forêt, les corbeaux, la crypte où l'on sent le danger sans le voir. Valcoria se met en scène pour son grand monologue final : c'est le point d'orgue de la campagne. Gardez un ton tous publics.",
  locations: [
    { id: 'brevnandra', name: 'Brevnandra', description: 'Petite ville bourgeoise de scieries et de bijoutiers. La comtesse habite une maison cossue du quartier des bijoutiers.' },
    { id: 'foret_vendras', name: 'La forêt de Vendras', description: "Sapins et épicéas immenses aux troncs trop noirs, nappe de brume au ras du sol, une petite fontaine au bord du chemin et l'impression constante d'être observé." },
    { id: 'manoir', name: 'Les ruines du manoir', description: "Clairière cernée de corbeaux. Murs couverts de lichen, sang séché sur les dalles, une salle à manger à la grande cheminée, une cuisine au fourneau énorme et un escalier qui s'enfonce sous terre." },
    { id: 'cave', name: 'La cave du manoir', description: 'Cave humide et sombre, sol de terre battue détrempé et glissant, odeur de sang.' },
    { id: 'route_valnandra', name: 'La route de Valnandra', description: 'Trois jours de route infestée de bandits de grand chemin, à travers champs et bois.' },
    { id: 'valnandra', name: 'Valnandra', description: "Grande cité marchande et son port fluvial. L'étude de maître Jouanis se trouve dans le quartier marchand." },
    { id: 'cryptes', name: 'Les cryptes de Valnandra', description: "Dédale de couloirs sombres et suintants, piles de crânes polis, sarcophages poussiéreux, et parfois l'écho d'une chaîne rouillée." },
    { id: 'domaine_corrompu', name: 'Le domaine de la sorcière', description: "La forêt des Vendras corrompue : arbres pourpres et noirs couverts de pustules, boue et tourbière sous un nuage noir permanent, carcasses d'animaux et cairns d'ossements." },
    { id: 'chantier', name: 'Le chantier de la tour', description: "La clairière du manoir devenue un chantier infernal : des démons ouvriers simiesques bâtissent une tour sous les fouets de contremaîtres violacés, sous un énorme nuage noir." },
  ],
  npcs: [
    { id: 'comtesse', name: 'La comtesse Lylyan de Vendras', description: 'Vieille aristocrate veuve et excentrique, dans un salon richement meublé.', attitude: 'aimable et nostalgique', motivation: "Récupérer le médaillon de Vendras « en souvenir du comte ». Elle ignore (prétend-elle) où il est caché. Promet une forte récompense.", secret: "C'est Valcoria la sorcière, affaiblie, sous les traits de la comtesse. Le médaillon est la clé de son rajeunissement.", locationId: 'brevnandra' },
    { id: 'fizzgarol', name: 'Fizzgarol', description: "Pixie à peine plus grand qu'un chat, ailes diaphanes, peau légèrement verte, qui grimace et rit très fort.", attitude: 'craintif et taquin', motivation: "Protéger la forêt et empêcher la chose-démon du manoir de se nourrir : il égare les visiteurs avec ses illusions. Laisse passer ceux qui prouvent qu'ils peuvent tuer la chose.", secret: "Il sait qu'il y a vingt ans une sorcière a invoqué les démons qui ont décimé la maisonnée, puis a disparu.", locationId: 'foret_vendras', hp: 4 },
    { id: 'chose_demon', name: 'La chose-démon des Vendras', description: 'Créature trapue aux longs bras griffus jusqu\'aux genoux, cuir noir hérissé d\'ergots osseux, yeux rouge rubis, crocs jaunes.', attitude: 'affamée', motivation: "Dévorer tout ce qui entre. Liée au lieu, elle poursuit ses proies jusque dans la forêt et combat jusqu'à la mort.", locationId: 'cave', hp: 10 },
    { id: 'gyselda', name: 'Dame Gyselda', description: 'Jeune femme charmante, nièce et héritière de la comtesse.', attitude: 'charmeuse', motivation: "Être escortée jusqu'à Valnandra pour réclamer l'héritage du comte. Joue de son charme pour s'assurer l'aide des héros. S'emporte violemment quand elle apprend l'existence du tombeau.", secret: "C'est la comtesse rajeunie par le médaillon, donc Valcoria. Elle veut les grimoires du comte pour retrouver tous ses pouvoirs.", locationId: 'brevnandra' },
    { id: 'jouanis', name: 'Maître Jouanis', description: 'Avoué bourru et pressé, dans un bureau cossu encombré de parchemins.', attitude: 'imbu et élitiste', motivation: "Expédier la visite. Il ne révèle qu'à contrecœur que certains biens du comte ont été placés dans son tombeau, dans les anciennes cryptes, et qu'il n'en a rien dit à la comtesse.", locationId: 'valnandra' },
    { id: 'azral', name: 'Azral le nécromant', description: 'Homme mince d\'une cinquantaine d\'années, noyé dans une robe indigo, couvert de colifichets en os.', attitude: 'exalté', motivation: "Mettre la main sur les grimoires perdus de la sorcière après des décennies de recherches, et conquérir le monde avec une armée des morts. Très bavard pendant le combat. Fuit quand il perd, mais accueille la mort sans crainte.", locationId: 'cryptes', hp: 8 },
    { id: 'capitaine', name: 'Le capitaine de la milice', description: 'Officier épuisé, armure cabossée, qui recrute à tour de bras.', attitude: 'harassé', motivation: "Repousser les démons qui ravagent les fermes et les convois. Engage les héros pour patrouiller près des bois de Vendras.", locationId: 'brevnandra' },
    { id: 'valcoria', name: 'Valcoria, la sorcière écarlate', description: "Grande sorcière à la chevelure rousse jusqu'aux hanches, bras cerclés d'anneaux rouges et noirs, pieds fourchus, queue pointue et petites cornes, yeux noir et or hypnotiques, armée d'un trident de métal noir.", attitude: 'triomphante', motivation: "Se venger et dominer la région. Aucune morale, aucun attachement aux héros. Immunisée au feu et aux contrôles mentaux.", locationId: 'chantier', hp: 22 },
  ],
  quest: {
    id: 'vendras',
    title: 'Le mystère des Vendras',
    objective: "Accomplir les missions de la comtesse de Vendras et de sa nièce… et découvrir qui elles sont vraiment.",
  },
  lore: [
    { keywords: ['vendras', 'manoir', 'comte'], text: "Il y a vingt ans, des créatures démoniaques ont attaqué le domaine des Vendras, incendié le manoir et massacré la maisonnée. Le comte y est mort. On raconte qu'une sorcière menait l'assaut." },
    { keywords: ['medaillon'], text: "Le médaillon des Vendras porte le symbole de la famille du comte. Le comte l'a caché dans une trappe du manteau de la cheminée, fermée par une clé qu'il gardait sur lui." },
    { keywords: ['fizzgarol', 'pixie', 'illusion'], text: "Les pixies veillent sur les forêts et égarent les intrus par des illusions : arbres dédoublés, faux chemins, monstres imaginaires." },
    { keywords: ['crypte', 'cryptes', 'valnandra'], text: "Les anciennes cryptes de Valnandra ne sont accessibles que par de vieux passages cachés dans la ville, comme une grille scellée sous un pont du port fluvial." },
    { keywords: ['valcoria', 'sorciere', 'ecarlate'], text: "Une vieille légende de Brevnandra parle d'une sorcière qui attendrait sa vengeance depuis fort longtemps, et qui aurait jadis lancé ses démons sur le domaine des Vendras." },
    { keywords: ['eau benite'], text: "L'eau bénite brûle les créatures démoniaques." },
  ],
  startSceneId: 'comtesse',
  scenes: [
    {
      id: 'comtesse',
      title: "L'annonce de la comtesse",
      locationId: 'brevnandra',
      readAloud:
        "La guilde des mercenaires vous a remis une adresse dans le quartier des bijoutiers. Une domestique muette vous fait entrer dans un salon étouffant de velours, de bibelots et de portraits. Dans un fauteuil à haut dossier, une vieille dame aux mains couvertes de bagues vous sourit. « Asseyez-vous, je vous en prie. Je suis Lylyan de Vendras. Il y a vingt ans, des démons ont brûlé ma demeure et tué mon cher époux. Je suis vieille, à présent, et je voudrais un souvenir de lui. »",
      gmNotes:
        "Elle raconte : le domaine de Vendras, au nord ; l'attaque d'il y a vingt ans ; le comte qui s'est sacrifié pour qu'elle fuie. Elle veut le médaillon de la famille, caché par le comte avant l'attaque, mais elle ignore où. Elle promet une forte récompense et prévient que personne n'y est retourné depuis, signe que le danger rôde encore. Jouer une vieille dame touchante, avec une lueur trop vive dans l'œil quand elle prononce le mot « médaillon ».",
      npcIds: ['comtesse'],
      checks: [
        { situation: 'Sonder la sincérité de la comtesse', ability: 'perception', difficulty: 16, success: "Son chagrin sonne faux : elle parle du médaillon avec plus d'émotion que de son mari.", failure: 'Une vieille dame nostalgique, rien de plus.' },
      ],
      exits: [{ to: 'foret', when: 'Les héros acceptent et partent vers le domaine.' }],
    },
    {
      id: 'foret',
      title: 'La forêt de Vendras',
      locationId: 'foret_vendras',
      readAloud:
        "La vieille route forestière s'enfonce sous des sapins immenses aux troncs plus noirs que nature. Une brume épaisse serpente au ras du sol : vous distinguez à peine vos bottes, et parfois la nappe ondule comme si quelque chose la traversait. Le chemin passe devant une petite fontaine moussue. Plus vous avancez, plus vous avez la sensation d'être observés.",
      gmNotes:
        "Une silhouette minuscule saute d'une branche (Perception). La suivre (Perception plus difficile) mène à une grotte au bord du ruisseau, entourée d'ossements disposés en avertissement, à l'entrée piégée d'une lance (Perception pour la voir). Dedans, rugissement et apparition d'un ours-squelette : c'est une illusion (Charisme pour garder son sang-froid et la percer ; sinon on fuit une minute). Le pixie Fizzgarol sort alors de sa cachette. Il faut le convaincre de les laisser passer (Charisme, un objet magique aide) ; sinon il exige qu'ils tuent le loup des ombres, gage qu'ils survivront au manoir, et les mène à sa tanière. Si les héros ignorent la silhouette et continuent, ils tournent en rond et reviennent à la fontaine au bout d'une heure (Intelligence pour comprendre l'illusion, Perception pour en sortir). En cas d'échec, ils retombent sur la fontaine où un grand loup noir attaque le pixie blessé : le sauver le rend reconnaissant. Interrogé, Fizzgarol raconte la sorcière d'il y a vingt ans. Il lève l'illusion et les guide aux ruines.",
      npcIds: ['fizzgarol'],
      checks: [
        { situation: 'Repérer la silhouette qui les observe', ability: 'perception', difficulty: 12, success: 'Une petite forme ailée saute d\'une branche et file vers le ruisseau.', failure: 'Rien que la brume… et ce malaise.' },
        { situation: "Remarquer la lance piégée à l'entrée de la grotte", ability: 'perception', difficulty: 12, success: 'Vous voyez le fil et le désamorcez.', failure: 'La lance jaillit : 1d6 dégâts.' },
        { situation: "Garder son sang-froid face à l'ours-squelette et percer l'illusion", ability: 'charisme', difficulty: 8, success: "L'ours se dissout en fumée : derrière un rocher, une petite créature tremble.", failure: 'La terreur vous jette dehors ; vous reprenez vos esprits une minute plus tard.' },
        { situation: 'Convaincre Fizzgarol de les laisser passer', ability: 'charisme', difficulty: 12, success: 'Le pixie accepte de lever son illusion.', failure: "« Prouvez-le : tuez le loup des ombres ! »" },
        { situation: "Comprendre qu'ils tournent en rond à cause d'une illusion, puis en sortir", ability: 'intelligence', difficulty: 12, success: 'Les arbres se dédoublent : un sortilège ! Vous suivez le vrai chemin.', failure: 'Encore cette fontaine…' },
      ],
      encounter: {
        trigger: 'Les héros affrontent le loup des ombres (épreuve de Fizzgarol ou pour sauver le pixie)',
        enemies: [{ name: 'Loup des ombres', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 40 }],
        alternatives: 'Le loup bondit puis se fond dans les ombres : Perception 12 pour le suivre des yeux. Il fuit à 2 PV.',
      },
      exits: [{ to: 'ruines', when: 'Les héros atteignent la clairière du manoir.' }],
    },
    {
      id: 'ruines',
      title: 'Les ruines du manoir',
      locationId: 'manoir',
      readAloud:
        "La forêt s'ouvre enfin sur une clairière immense. Des freux s'envolent en croassant à votre approche. Au centre, les ruines du manoir des Vendras disparaissent sous le lierre et le lichen. Des étages, il ne reste que des lambeaux de planchers accrochés aux murs. On devine une grande salle à manger et son imposante cheminée, une cuisine, et les premières marches d'un escalier qui s'enfonce sous terre. Par endroits, du sang séché macule encore les dalles. Une odeur de terre humide et de sang remonte du sol.",
      gmNotes:
        "Exploration libre, sous pression : corbeaux, pierres qui tombent, courant d'air soudain. Jets d'Agilité pour ne pas faire de bruit, sinon la chose-démon surgit de la cave. Cheminée : une trappe dans le manteau (Perception) fermée par une serrure complexe (Agilité 16 pour la crocheter). Si on l'ouvre sans la clé, la chose-démon surgit aussitôt de l'escalier. Cuisine : dans le grand fourneau, le squelette d'un domestique serre une fiole d'eau bénite (2d4 dégâts contre un démon). La clé de la cache est sur le corps du comte, à la cave.",
      checks: [
        { situation: 'Trouver la cache dans le manteau de la cheminée', ability: 'perception', difficulty: 12, success: 'Une trappe et une serrure ouvragée aux armes des Vendras.', failure: 'Rien que de la suie et des pierres.' },
        { situation: 'Crocheter la serrure complexe de la cache', ability: 'agilite', difficulty: 16, success: "Clic. Le médaillon est là… et un hurlement monte de l'escalier.", failure: 'La serrure résiste.' },
        { situation: 'Fouiller les ruines sans alerter ce qui dort en dessous', ability: 'agilite', difficulty: 12, success: 'Vous vous déplacez sans un bruit.', failure: 'Un pan de mur s\'écroule avec fracas. En bas, quelque chose gronde.' },
      ],
      rewards: "Fiole d'eau bénite (cuisine).",
      exits: [
        { to: 'cave', when: "Les héros descendent à la cave, ou la chose-démon surgit." },
      ],
    },
    {
      id: 'cave',
      title: 'La chose-démon',
      locationId: 'cave',
      readAloud:
        "L'escalier débouche dans une cave basse où la terre battue colle aux semelles. L'odeur de sang devient écœurante. Dans le noir, deux braises rouges s'allument. Avec un hurlement dans une langue que nul humain ne devrait connaître, une silhouette trapue aux bras trop longs se jette sur vous.",
      gmNotes:
        "La chose-démon est affamée et combat jusqu'à la mort ; si les héros fuient, elle les poursuit jusque dans la forêt. Le sol glissant impose des jets d'Agilité lors des actions périlleuses. L'eau bénite la brûle. Une fois la créature morte, la cave révèle un squelette vêtu d'une riche tunique : le comte. Une clé pend à son cou : elle ouvre la cache de la cheminée.",
      npcIds: ['chose_demon'],
      checks: [
        { situation: 'Garder l\'équilibre sur la terre détrempée pendant une action risquée', ability: 'agilite', difficulty: 12, success: 'Vous restez debout.', failure: 'Vous glissez et tombez : la chose a l\'avantage sur sa prochaine attaque.' },
      ],
      encounter: {
        trigger: 'La chose-démon attaque',
        enemies: [{ name: 'Chose-démon des Vendras', hp: 10, attack: 3, defense: 12, damage: '1d8', initiative: 2, xp: 60 }],
        alternatives: "L'eau bénite inflige 2d4 dégâts. Fuir ne sert à rien : elle suit ses proies.",
      },
      rewards: 'Clé de la cache, médaillon des Vendras. 60 XP pour la chose-démon.',
      exits: [{ to: 'remise', when: 'Les héros rentrent à Brevnandra avec le médaillon.' }],
    },
    {
      id: 'remise',
      title: 'Le médaillon de la comtesse',
      locationId: 'brevnandra',
      readAloud:
        "La comtesse vous reçoit dans son salon de velours. Quand vous posez le médaillon dans sa main parcheminée, ses doigts se referment dessus avec une force surprenante, et pendant un instant une flamme brille dans ses yeux pâles. « Merveilleux. Absolument merveilleux. » Elle vous tend une bourse rebondie.",
      gmNotes:
        "Elle récompense royalement les héros (100 pièces d'or), leur souhaite un bel avenir et les congédie très vite pour s'enfermer avec le bijou. Fin de l'épisode 1. Si les héros se méfient et refusent de rendre le médaillon, ou la démasquent, aller à la scène « La vieille démasquée ». Sinon, quelques jours passent avant la suite.",
      npcIds: ['comtesse'],
      checks: [
        { situation: "Percer à jour l'avidité de la comtesse", ability: 'perception', difficulty: 16, success: "Ce n'est pas de la nostalgie : c'est de la faim. Et sur le médaillon, des runes qui n'ont rien de familial.", failure: 'Une vieille dame émue. Une belle bourse.' },
      ],
      rewards: "100 pièces d'or. Fin de l'épisode 1 : 100 XP.",
      exits: [
        { to: 'gyselda', when: 'Les héros remettent le médaillon ; quelques jours plus tard, une missive arrive.' },
        { to: 'vieille_demasquee', when: 'Les héros refusent de remettre le médaillon ou démasquent la comtesse.' },
      ],
    },
    {
      id: 'vieille_demasquee',
      title: 'La vieille démasquée',
      locationId: 'brevnandra',
      ending: 'victoire',
      readAloud:
        "Le sourire de la vieille dame se fige, puis se tord en un rictus. Sa peau se fendille comme de la vieille cire, ses yeux virent au noir et or. « Vous auriez dû prendre l'or. » Les bibelots du salon se mettent à trembler et une chaleur de forge envahit la pièce.",
      gmNotes:
        "Valcoria, privée du médaillon, n'a qu'une fraction de ses pouvoirs. Elle attaque avec des jets de flammes, puis tente de fuir par une fenêtre si elle est blessée. Vaincue ou en fuite sans médaillon, elle ne pourra plus jamais renaître. Les héros ont déjoué toute la campagne dès le premier épisode : conclure en héros (récompense de la ville, le médaillon à détruire ou à confier à un temple). Mettre la quête « vendras » en réussie.",
      npcIds: ['comtesse'],
      encounter: {
        trigger: 'La comtesse se révèle et attaque',
        enemies: [{ name: 'Valcoria affaiblie', hp: 12, attack: 3, defense: 12, damage: '1d8', initiative: 2, xp: 150 }],
        alternatives: "Elle fuit à 4 PV : la retrouver plus tard affaiblie, ou la laisser disparaître sans le médaillon.",
      },
      rewards: 'Fin de la campagne : 200 XP.',
      exits: [],
    },
    {
      id: 'gyselda',
      title: "L'héritière",
      locationId: 'brevnandra',
      readAloud:
        "Vous dépensez gaiement votre salaire à l'auberge quand un coursier vous tend une lettre au sceau des Vendras. « Dame Gyselda, nièce de feue la comtesse, sollicite l'honneur de vous recevoir. » Feue ? Dans le salon de velours, rien n'a changé, sauf la maîtresse des lieux : une jeune femme d'une beauté saisissante, qui vous accueille avec un sourire chaleureux et une main tendue.",
      gmNotes:
        "Gyselda annonce la mort de sa tante, qui lui aurait raconté leurs exploits sur son lit de mort. Elle a hérité de ses biens et de ceux du comte, bloqués chez un notaire de Valnandra. La route est infestée de bandits : elle veut une escorte. Départ dans deux jours, avance substantielle pour s'équiper (30 pièces d'or). Elle use de son charme sur les héros. Détail troublant pour les curieux : elle porte le médaillon des Vendras au cou.",
      npcIds: ['gyselda'],
      checks: [
        { situation: "Remarquer ce qui cloche chez Gyselda", ability: 'perception', difficulty: 12, success: 'Elle porte le médaillon des Vendras. Et elle a exactement les mêmes tics de langage que la vieille comtesse.', failure: 'Une jeune femme charmante et endeuillée.' },
      ],
      rewards: "Avance de 30 pièces d'or.",
      exits: [{ to: 'route', when: 'Le convoi part pour Valnandra.' }],
    },
    {
      id: 'route',
      title: 'La route de Valnandra',
      locationId: 'route_valnandra',
      readAloud:
        "Le convoi quitte Brevnandra à l'aube : un carrosse pour Dame Gyselda, et vous pour escorte. Deux jours passent sans encombre, au fil des marchands croisés et d'une patrouille de gardes mal équipés. Au matin du troisième jour, la route s'enfonce dans un bois. Les oiseaux se taisent d'un coup.",
      gmNotes:
        "Cinq brigands en embuscade. Si les héros les repèrent (Perception), ils tentent de fuir en se couvrant, deux restant en retrait avec des arcs. S'ils surprennent l'escorte, deux brigands seulement se montrent et exigent une rançon en prétendant être une dizaine (Perception pour éventer le bluff). Si les héros refusent, combat : trois archers cachés tirent à distance. Les brigands fuient quand deux ou trois des leurs tombent. Combat facile, en mise en bouche. Le convoi arrive à Valnandra avant la nuit.",
      npcIds: ['gyselda'],
      checks: [
        { situation: "Repérer l'embuscade dans les fourrés", ability: 'perception', difficulty: 12, success: 'Des reflets de lames entre les feuilles : vous avez l\'initiative.', failure: 'Deux hommes mal rasés barrent la route, arcs bandés.' },
        { situation: 'Éventer le bluff des brigands (« nous sommes dix ! »)', ability: 'perception', difficulty: 12, success: "Ils ne sont que cinq, et affamés.", failure: 'Impossible de savoir combien se cachent dans les bois.' },
      ],
      encounter: {
        trigger: 'Les héros refusent la rançon ou attaquent',
        enemies: [
          { name: 'Brigand', hp: 4, attack: 1, defense: 10, damage: '1d6', initiative: 1, xp: 10 },
          { name: 'Brigand', hp: 4, attack: 1, defense: 10, damage: '1d6', initiative: 1, xp: 10 },
          { name: 'Brigand archer', hp: 4, attack: 1, defense: 10, damage: '1d6', initiative: 2, xp: 10 },
          { name: 'Brigand archer', hp: 4, attack: 1, defense: 10, damage: '1d6', initiative: 2, xp: 10 },
          { name: 'Brigand archer', hp: 4, attack: 1, defense: 10, damage: '1d6', initiative: 2, xp: 10 },
        ],
        alternatives: 'Payer la rançon évite le combat. Les brigands fuient dès que deux ou trois sont neutralisés.',
      },
      exits: [{ to: 'jouanis', when: 'Le convoi arrive à Valnandra.' }],
    },
    {
      id: 'jouanis',
      title: "L'étude de maître Jouanis",
      locationId: 'valnandra',
      readAloud:
        "L'étude de maître Jouanis occupe un bâtiment neuf du quartier marchand, bourdonnant de scribes et de coursiers. Après une longue attente, un serviteur vous mène dans un bureau croulant sous les parchemins. L'avoué, un homme bourru, toise votre groupe : « Une héritière a donc besoin d'une petite armée pour signer trois papiers ? »",
      gmNotes:
        "Jouanis est désagréable, pressé, imbu de son savoir. Il étudie longuement les papiers et affirme que les biens du comte ont été rendus à la comtesse il y a vingt ans. Gyselda n'ose pas insister : aux héros de le faire (Charisme). Il finit par avouer que des affaires du comte, arrivées quelques semaines avant l'attaque, devaient être placées dans son tombeau, en secret, à sa mort, et qu'il n'en a rien dit à la comtesse. Gyselda réagit avec une violence surprenante et exige de savoir où est la sépulture : dans les anciennes cryptes, accessibles par une grille scellée sous un pont du port fluvial. Gyselda demande alors aux héros d'y aller, d'ouvrir la tombe et de lui rapporter les possessions du comte.",
      npcIds: ['gyselda', 'jouanis'],
      checks: [
        { situation: "Pousser maître Jouanis à en dire plus sur l'héritage", ability: 'charisme', difficulty: 12, success: "Il soupire : « Certains biens ont été placés dans son tombeau. Discrètement. »", failure: "« J'ai d'autres clients. » Il faudra revenir à la charge, ou le menacer." },
        { situation: "Observer la réaction de Gyselda à l'évocation du tombeau", ability: 'perception', difficulty: 8, success: "Un éclair de rage dans ses yeux, une voix soudain plus vieille. Ce n'est pas une nièce éplorée.", failure: 'Elle semble bouleversée.' },
      ],
      exits: [{ to: 'cryptes', when: 'Les héros descendent dans les cryptes.' }],
    },
    {
      id: 'cryptes',
      title: 'Les cryptes de Valnandra',
      locationId: 'cryptes',
      readAloud:
        "À la nuit tombée, le port fluvial est désert. Sous le pont indiqué par Jouanis, une grille rouillée ferme un tunnel. Au-delà, un ruisseau d'eaux usées, des rats qui détalent, puis une salle circulaire au bassin croupi. Une arche gravée du mot « Cryptes » ouvre sur un couloir sec d'où monte une odeur de cimetière. Les murs portent des noms de morts. Des crânes polis s'empilent dans les alcôves. Quelque part, une chaîne tinte.",
      gmNotes:
        "Ouvrir la grille : crocheter (Agilité 16) ou arracher (Force 16). Faire monter la tension sans danger réel : une dalle qui s'enfonce sans effet, un bruit métallique qui n'est qu'un rat coincé dans un gantelet. Près du tombeau, une forte odeur d'encens. Azral le nécromant, renseigné par un ouvrier qui a enterré le comte, fouille le tombeau ; il a invoqué un zombie pour garder la salle et s'est caché. Quand le combat contre le zombie s'engage, Azral prend les héros à revers en pérorant sur ses décennies de recherches des grimoires de la sorcière et sur son armée des morts. Il fuit dès que ça tourne mal ; on peut le rattraper dans la salle du bassin. Il a des outils pour ouvrir la tombe. Dans le tombeau : le corps du comte et des manuscrits dans une langue inconnue, comme inventée.",
      npcIds: ['azral'],
      checks: [
        { situation: 'Ouvrir la grille scellée sous le pont', ability: 'agilite', difficulty: 16, success: 'Le cadenas cède sans bruit.', failure: 'Le cadenas résiste ; il faudra la force (Force 16) ou du temps.' },
        { situation: "Sentir l'encens et deviner une présence", ability: 'perception', difficulty: 12, success: "De l'encens frais : quelqu'un a pratiqué un rituel ici il y a peu.", failure: 'Juste l\'odeur des morts.' },
      ],
      encounter: {
        trigger: "Le zombie attaque dans la salle du tombeau, puis Azral intervient",
        enemies: [
          { name: 'Zombie', hp: 9, attack: 2, defense: 10, damage: '1d6+1', initiative: -1, xp: 25 },
          { name: 'Azral le nécromant', hp: 8, attack: 3, defense: 12, damage: '1d8', initiative: 2, xp: 50 },
        ],
        alternatives: 'Azral fuit à 3 PV vers la salle du bassin. Le zombie tombe si Azral est vaincu.',
      },
      rewards: "Les manuscrits du comte. Le bâton et les colifichets d'Azral. 75 XP.",
      exits: [{ to: 'remise_grimoires', when: 'Les héros ressortent avec les manuscrits.' }],
    },
    {
      id: 'remise_grimoires',
      title: "L'héritage du comte",
      locationId: 'valnandra',
      readAloud:
        "Malgré l'heure tardive, Dame Gyselda vous attend dans la salle de l'auberge, une chandelle à la main. Elle vous assaille de questions, les yeux brillants. Quand vous posez les manuscrits devant elle, elle les caresse du bout des doigts. « Une langue inconnue ? Ma tante a laissé un carnet. Je crois pouvoir les traduire. »",
      gmNotes:
        "Elle reprend la route le lendemain, paie la somme due (80 pièces d'or) et promet de se souvenir d'eux, puis s'enferme chez elle pour étudier. Fin de l'épisode 2. Si les héros refusent de lui remettre les manuscrits ou la démasquent, elle tente de les leur arracher (utiliser la scène finale avec Valcoria encore faible) : improviser à partir de la scène « La vieille démasquée ». Sinon, quelques semaines passent.",
      npcIds: ['gyselda'],
      rewards: "80 pièces d'or. Fin de l'épisode 2 : 120 XP.",
      exits: [
        { to: 'peril', when: "Les héros remettent les manuscrits ; quelques semaines plus tard, de terribles nouvelles arrivent de Brevnandra." },
        { to: 'vieille_demasquee', when: 'Les héros refusent de remettre les manuscrits et démasquent Gyselda.' },
      ],
    },
    {
      id: 'peril',
      title: 'Brevnandra en péril',
      locationId: 'brevnandra',
      readAloud:
        "Dans une auberge près de Valnandra, les voyageurs ne parlent que de ça : depuis trois semaines, des monstres attaquent Brevnandra et ses fermes. Quand vous y arrivez, la ville a changé. Les patrouilles de la milice sont partout, les portes portent des traces de combats, les échoppes sont fermées et les volets clos. Dans la rue des bijoutiers, la maison de Dame Gyselda n'est plus qu'une carcasse calcinée.",
      gmNotes:
        "Les gardes parlent volontiers : des démons attaquent fermes, convois et remparts, et se retirent toujours dans les bois des Vendras. Rumeurs d'un sorcier ou d'un démon puissant. Dans les ruines de la maison (Intelligence), on voit que le feu a pris à l'intérieur, au centre du salon, où l'on a empilé des meubles. Tous les objets de valeur et l'héritage du comte ont disparu. Aucun corps n'a été trouvé. À la caserne, le capitaine engage les héros pour patrouiller près des bois de Vendras et évoque la légende d'une sorcière qui attendait sa vengeance. Les héros devraient faire le lien : la comtesse, Gyselda, le médaillon, les manuscrits.",
      npcIds: ['capitaine'],
      checks: [
        { situation: "Examiner la maison incendiée de Gyselda", ability: 'intelligence', difficulty: 12, success: "Le feu est parti d'un bûcher de meubles au centre du salon : allumé de l'intérieur, volontairement. Et pas de corps.", failure: 'Des cendres, rien que des cendres.' },
      ],
      exits: [{ to: 'hordes', when: 'Les héros partent vers le domaine de Vendras.' }],
    },
    {
      id: 'hordes',
      title: 'Les hordes de la sorcière',
      locationId: 'domaine_corrompu',
      readAloud:
        "La forêt des Vendras n'est plus la même. De lourds nuages noirs pèsent sur la canopée. Les troncs se sont tordus, leur écorce a noirci, et le sol n'est plus que boue. Des carcasses d'animaux exsangues jonchent les chemins, entre des cairns de pierres et d'os humains. Pas de brume, pas de pixie : l'illusion de Fizzgarol a disparu. Les traces des hordes mènent tout droit vers le manoir.",
      gmNotes:
        "Des patrouilles de démons repoussent les intrus. Après une heure de marche, une fosse à pieux bien dissimulée (Perception, sinon 1d6 dégâts), puis une première patrouille. Plus loin, des arbalètes cachées dans les arbres visent chaque héros (Perception, sinon 1d4 dégâts chacun). Près du manoir, les arbres sont couverts de ganglions verdâtres qui éclatent en acide si on les frôle (1d4). À quelques centaines de mètres des ruines, une seconde patrouille. On peut retrouver Fizzgarol caché et blessé : il raconte qu'une femme rousse aux pieds fourchus est arrivée avec le médaillon des Vendras.",
      checks: [
        { situation: 'Repérer la fosse à pieux sur le chemin', ability: 'perception', difficulty: 12, success: 'Des branchages trop bien disposés : vous contournez la fosse.', failure: 'Le sol cède : 1d6 dégâts.' },
        { situation: 'Repérer les arbalètes cachées dans les arbres', ability: 'perception', difficulty: 12, success: 'Vous plongez à couvert avant la volée.', failure: 'Un carreau vous atteint : 1d4 dégâts.' },
      ],
      encounter: {
        trigger: 'Une patrouille de démons tombe sur les héros',
        enemies: [
          { name: 'Démon de la horde', hp: 8, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 30 },
          { name: 'Démon de la horde', hp: 8, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 30 },
        ],
        alternatives: "Les démons sont immunisés au feu mais pas à l'eau bénite. Contourner les patrouilles est possible (Agilité 12).",
      },
      exits: [{ to: 'confrontation', when: 'Les héros atteignent la clairière du manoir.' }],
    },
    {
      id: 'confrontation',
      title: 'La sorcière écarlate',
      locationId: 'chantier',
      readAloud:
        "Là où se dressaient les ruines du manoir grouille un chantier infernal. Des centaines de petites créatures simiesques charrient des pierres sous les coups de fouet de contremaîtres violacés et bedonnants. Au centre monte une tour noire, couronnée d'un énorme nuage d'orage. Une patrouille vous repère et sonne l'alerte. Puis une lumière rouge sang jaillit au pied de la tour, et une voix que vous connaissez trop bien éclate de rire.",
      gmNotes:
        "Une patrouille attaque d'abord et sonne l'alarme ; les ouvriers fuient, les contremaîtres ne se défendent que s'ils sont acculés. Valcoria apparaît dans une aura rouge, dresse des murs de pierre et d'os qui cloisonnent les héros, s'élève dans les airs en foudroyant ses propres constructions, et déclame son grand monologue : la comtesse, Gyselda, le médaillon, les grimoires, et comment les héros l'ont aidée à chaque étape. Tant qu'elle lévite, rien ne peut la blesser. Puis elle redescend pour un combat à mort, avec son trident noir, ses jets de flammes et ses drains de vie. Immunisée au feu et aux charmes. L'eau bénite la blesse (2d4).",
      npcIds: ['valcoria'],
      encounter: {
        trigger: 'Valcoria redescend combattre après son monologue',
        enemies: [
          { name: 'Valcoria, la sorcière écarlate', hp: 22, attack: 4, defense: 14, damage: '1d10', initiative: 3, xp: 200 },
          { name: 'Démon de la horde', hp: 8, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 30 },
        ],
        alternatives: 'Ajouter des patrouilles pour ralentir un groupe puissant. Ses démons disparaissent si elle tombe.',
      },
      exits: [
        { to: 'victoire', when: 'Valcoria est vaincue.' },
        { to: 'defaite', when: 'Les héros sont vaincus ou fuient.' },
      ],
    },
    {
      id: 'victoire',
      title: 'La fin de la sorcière',
      locationId: 'chantier',
      ending: 'victoire',
      readAloud:
        "Valcoria s'effondre dans un cri qui fait trembler la tour. Le nuage noir se déchire et le soleil tombe sur la clairière. Partout, les démons se dissolvent en volutes de fumée à l'odeur de soufre. Les pustules des arbres se dessèchent et tombent. Lentement, la forêt des Vendras recommence à respirer.",
      gmNotes:
        "Le bourgmestre de Brevnandra remet une large récompense au nom de tous (200 pièces d'or), les auberges les logent gratuitement et les marchands font des ristournes. Le trésor du comte n'appartient plus à personne. Fizzgarol revient et danse de joie. Les héros réfléchiront peut-être à deux fois avant d'aider une vieille comtesse à récupérer un bijou de famille. Mettre la quête « vendras » en réussie.",
      rewards: "200 pièces d'or et le trésor du comte. Fin de la campagne : 200 XP.",
      exits: [],
    },
    {
      id: 'defaite',
      title: 'Le règne de Valcoria',
      locationId: 'domaine_corrompu',
      ending: 'défaite',
      readAloud:
        "Vous fuyez à travers la forêt pourrissante, poursuivis par le rire de la sorcière qui roule sous le nuage noir. Derrière vous, la tour achève de monter vers le ciel.",
      gmNotes:
        "Valcoria domine la région, appelle toujours plus de démons et ouvre des portails vers les enfers. À moins que les nations voisines ne s'unissent contre elle… mais c'est une autre histoire, et peut-être une revanche pour les héros survivants.",
      exits: [],
    },
  ],
};
