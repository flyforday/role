import type { Scenario } from '@veillee/engine';

/**
 * Adaptation de la campagne « Les vents hurlants des cimes perdues » d'Antoine « Kirdinn » Nobilet,
 * publiée sur Rolis sous licence CC BY-SA 4.0. Cette adaptation reste sous CC BY-SA 4.0.
 * Le troisième scénario (joué à l'origine avec des personnages prétirés) devient une vision.
 */
export const ventsHurlants: Scenario = {
  id: 'vents-hurlants',
  title: 'Les vents hurlants des cimes perdues',
  credits: {
    author: 'Antoine « Kirdinn » Nobilet (campagne Rolis, adaptée pour Veillée)',
    license: 'CC BY-SA 4.0',
    source: 'https://www.rolis.net/scenarios/campagne/13/les-vents-hurlants-des-cimes-perdues',
  },
  genre: 'Fantasy',
  tone: 'Horreur glacée',
  blurb:
    "Dans les montagnes des Tressardières, les héros traquent des pillards jusqu'à une forteresse hantée par des morts qui ne meurent pas, puis enquêtent sur une course rituelle dont plus aucun jeune ne revient. Une campagne d'horreur sur un pacte entre une famille et un petit dieu capricieux. Déconseillée aux moins de 12 ans.",
  players: '2 à 5 joueurs, niveau 1 à 3, public de 12 ans et plus',
  duration: 'Campagne de 2 épisodes et une vision, environ 6 heures',
  setting:
    "Les Tressardières, des montagnes battues par des vents qui hurlent comme des âmes torturées. Sur un éperon rocheux se dresse Castelmorant, forteresse de pierre noire en ruine. Dans la vallée, le village de Tressard vit de son miel et de son hydromel, au pied de la Sainte-Blanche, montagne sacrée et taboue où les dimensions s'entremêlent et où poussent les satinelles, de petites fleurs rouges qui changent les perceptions.",
  pitch:
    "Une bande d'aventuriers s'est vantée d'aller piller les ruines de Castelmorant, au mépris des supplications des villageois. Le Seigneur Tress, riche marchand dont les aïeux régnaient sur ces terres, engage les héros pour les rattraper avant qu'ils ne souillent les lieux. Chacun dans la vallée sait ce qui arrive quand on vole Castelmorant : les morts descendent le reprendre.",
  secretPlot:
    "Ces montagnes sont le tumulus d'un dieu mineur, l'Enfant, né de deux divinités et abandonné par sa Mère. Il vit du sang des gens de la région et propose des pactes. La Maison Tressard porte dans son sang une place pour l'accueillir : chaque seigneur devient l'hôte de l'Enfant par le rituel d'ascension. Il y a des siècles, à la mort du seigneur Armand, son frère Arthon livra le château à une jacquerie pour éliminer ses neveux et devenir l'hôte. Le rituel tourna au cauchemar : Arthon, trop abîmé, devint un géant monstrueux, enchaîné dans Castelmorant, et les habitants maudits devinrent les nonmourants, qui fouillent sans fin les ruines à la recherche des héritiers. Un survivant fonda le village de Tressard et passa un pacte avec l'Enfant : chaque année, les jeunes, drogués à la satinelle, courent jusqu'au sommet de la Sainte-Blanche, et l'Enfant prend une victime. Il y a trois ans, Bossn, un jeune qui avait couru sans satinelle, a vaincu l'Enfant affamé et a été corrompu : il est le nouveau petit dieu, insatiable. Depuis deux ans, aucun jeune n'est revenu. Les tricheurs de l'an dernier sont devenus ses démons de glace. L'Enfant, mourant, survit en lambeaux sur la montagne. Cette année, Kharola, la sœur de Bossn, court sans satinelle.",
  gmAdvice:
    "Campagne d'horreur : ambiance glacée, descriptions lentes et inquiétantes, choix moraux sans bonne réponse. Retournez contre les héros leurs propres habitudes d'aventuriers (camps laissés en désordre, corps sans sépulture, pièges oubliés) : c'est ce que font les pillards qu'ils traquent. Les villageois de Tressard tiennent au tabou de la Sainte-Blanche comme à un dogme : le remettre en cause provoque mépris ou violence. Pendant l'ascension, les hallucinations sont l'occasion de révéler l'histoire de la Maison Tressard par la vision « Le glas de Castelmorant ». La fin dépend du sort de Bossn, de l'Enfant et des deux reliques du pacte (la statuette et la fiole de sang) : aucune n'est parfaite. Évitez la complaisance gore, suggérez plutôt que montrer.",
  locations: [
    { id: 'piste', name: 'Les pentes de Castelmorant', description: 'Pentes enneigées, crevasses, ponts de corde secoués par le vent, et les restes des campements des pillards.' },
    { id: 'castelmorant', name: 'Castelmorant', description: "Forteresse de pierre noire en ruine qui écrase de sa masse l'éperon rocheux. Un vieux gibet où pendent des cadavres gelés, et des morts qui grattent et fouillent sans fin." },
    { id: 'foret_basse', name: 'La forêt du piémont', description: 'Forêt de pins sous la neige, au pied des montagnes, refuge contre ce qui descend des hauteurs.' },
    { id: 'tressard', name: 'Le village de Tressard', description: "Village de ruches et d'hydromel au bord de la Blanchette. L'auberge de Maritha sert aussi de relais de poste et de bibliothèque." },
    { id: 'sainte_blanche', name: 'Les flancs de la Sainte-Blanche', description: "Vents assourdissants, neige abrasive, corps gelés dans des postures étranges, ruines venues d'autres mondes, ruisseaux aux algues empoisonnées aux couleurs vives." },
    { id: 'castelmorant_jadis', name: 'Castelmorant, jadis', description: "La forteresse des siècles passés, intacte, sous une pluie battante : salle d'armes, bibliothèque aux vitraux dorés, couloirs qui changent de forme." },
    { id: 'sommet', name: 'Le sommet de la Sainte-Blanche', description: 'Une structure de cristal aux angles impossibles, au-dessus des nuages.' },
  ],
  npcs: [
    { id: 'seigneur_tress', name: 'Le Seigneur Tress', description: 'Riche marchand d\'une cité côtière, vêtements sombres et chevalière ancienne.', attitude: 'grave', motivation: "Protéger les terres de ses aïeux des pillards. Il paie bien et ne pose pas de questions.", secret: "C'est le dernier descendant direct de la Maison Tressard : les nonmourants le cherchent, lui." },
    { id: 'garance', name: 'Garance la Balafrée', description: "Cheffe d'une bande de pillards aguerris, aussi nombreuse que le groupe des héros, cicatrice en travers de la bouche.", attitude: 'méprisante', motivation: "Piller Castelmorant et ses légendaires trésors d'Iris. Traite les villageois de superstitieux arriérés. Peut être raisonnée, achetée ou vaincue.", locationId: 'castelmorant', hp: 10 },
    { id: 'arthon_geant', name: 'Arthon le Géant', description: "Colosse difforme enchaîné au cœur de Castelmorant, dans une presque-mort éternelle. Ses cris grondent comme une avalanche.", attitude: 'endormi', motivation: "Se réveille si on brise ses chaînes ou si on vole un objet de la forteresse ; appelle alors tous les nonmourants et attaque tout le monde.", secret: "C'est Arthon de Tressard, l'oncle qui voulut devenir l'hôte de l'Enfant, monstrueusement transformé.", locationId: 'castelmorant' },
    { id: 'maritha', name: 'Maritha Ssaoan', description: 'Aubergiste chaleureuse, gardienne des archives du village.', attitude: 'accueillante et angoissée', motivation: "Protéger sa fille Kharola, à qui elle a interdit la course. Son fils Bossn n'est jamais revenu il y a trois ans.", locationId: 'tressard' },
    { id: 'kharola', name: 'Kharola Ssaoan', description: 'Jeune fille farouche et déterminée, sœur de Bossn.', attitude: 'rebelle', motivation: "Courir malgré sa mère, sans prendre de satinelle, pour découvrir ce qui est arrivé à son frère.", locationId: 'tressard', hp: 8 },
    { id: 'bruss', name: 'Bruss le Brun', description: 'Guide et trappeur imbibé d\'alcool, hanté par des cauchemars.', attitude: 'bourru', motivation: "Le seul qui accepte de guider des étrangers sur le piémont de la Sainte-Blanche. Connaît beaucoup d'histoires sur ce qui en descend.", locationId: 'tressard' },
    { id: 'rhissa', name: 'Rhissa Khanth', description: 'Bourgmestre à l\'autorité tranquille, fervente croyante.', attitude: 'inquiète', motivation: "Organiser la course malgré la peur et protéger la communauté. Devient une ennemie des étrangers irrespectueux du tabou.", locationId: 'tressard' },
    { id: 'liano', name: 'Liano Barkth', description: 'Prêtre du culte de la Sainte-Blanche, la peau tatouée d\'une scène où un chevalier pactise avec un enfant ailé.', attitude: 'hostile', motivation: "Ne veut pas que les héros rétablissent l'ordre ancien : depuis que l'Enfant est tombé, ses murmures ont cessé et il est enfin en paix.", secret: "Descendant du chevalier Tressard. Il garde la statuette et la fiole de sang du chevalier qui renouvellent le pacte chaque année.", locationId: 'tressard' },
    { id: 'enfant', name: "L'Enfant", description: "Enfant de glace difforme, petites cornes blanches et deux paires d'ailes de cristal, dont des morceaux s'envolent avec la bise.", attitude: 'suppliant', motivation: "Survivre et reprendre sa place. Propose un pacte : un peu de sang d'un héros et un jeune du village contre son aide, la clémence des éléments et de la satinelle.", secret: "Un dieu affamé et capricieux, pas un allié fiable. Il cherchera à garder Bossn et Kharola.", locationId: 'sainte_blanche', hp: 12 },
    { id: 'bossn', name: 'Bossn Ssaoan', description: "Ancien jeune de Tressard devenu un dieu de glace, entouré de vent et de foudre.", attitude: 'vorace', motivation: "Ne jamais mourir ni s'affaiblir : dévorer tous les coureurs, y compris sa propre sœur.", secret: "Sur le point de mourir, il reprend sa forme humaine.", locationId: 'sommet', hp: 24 },
  ],
  quest: {
    id: 'tressardieres',
    title: 'Les vents hurlants',
    objective: 'Empêcher le pillage de Castelmorant, puis découvrir pourquoi les jeunes de Tressard ne reviennent plus de la Sainte-Blanche.',
  },
  lore: [
    { keywords: ['nonmourant', 'nonmourants', 'castelmorant'], text: "Les nonmourants sont les anciens habitants de Castelmorant, habités par un feu glacé qui les empêche de mourir. Ils fouillent sans fin les ruines à la recherche des héritiers Tressard. Si on vole la forteresse, ils descendent dans la vallée reprendre chaque fragment." },
    { keywords: ['satinelle'], text: "La satinelle est une petite fleur rouge qui pousse même sous la neige sur les ruines d'Iris. Sa décoction adoucit les visions de la Sainte-Blanche : les cadavres deviennent des statues, le vent chante, les monstres paraissent glorieux." },
    { keywords: ['iris', 'sainte-blanche', 'sainte blanche'], text: "Iris la Blanche était la cité des Tressard, une ville de lumière bâtie par la magie de l'Enfant. Le roi Ossin se rebella contre l'Enfant avec l'aide de la Mère ; un cataclysme effaça la ville et déchira les dimensions. La montagne s'appelle désormais la Sainte-Blanche." },
    { keywords: ['course', 'tabou'], text: "Chaque année, aux premières fontes des neiges, les jeunes de Tressard courent jusqu'au sommet de la Sainte-Blanche après des semaines de préparation et de satinelle. C'est la seule fois de leur vie où ils foulent la montagne sacrée." },
    { keywords: ['pacte', 'tressard', 'chevalier'], text: "Selon la geste, le chevalier Tressard, acculé par des loups, passa un pacte avec une créature de neige et de pierre : une vie contre mille. Chaque année, de jeunes âmes lui rendraient hommage au sommet, et elle choisirait une victime." },
    { keywords: ['statuette', 'fiole', 'reliques'], text: "Lors du départ de la course, le prêtre verse une goutte du sang du chevalier Tressard sur le front des coureurs et montre une statuette d'enfant ailé : c'est le renouvellement du pacte. Briser l'une ou l'autre pourrait empêcher le pacte d'être renouvelé." },
    { keywords: ['enfant', 'mere', 'pere'], text: "Les lettrés disent que les Tressardières sont le tumulus d'un dieu-enfant abandonné par sa Mère et que son Père a modelé les montagnes autour de lui. Le culte de la Mère est tabou ; ses fidèles étaient pendus par la Maison Tressard." },
    { keywords: ['rituel', 'ascension', 'chroniques'], text: "Le rituel d'ascension scelle l'Enfant dans le corps d'un membre de la Maison Tressard. Sans lui, l'Enfant pénètre de force l'esprit de son hôte et provoque des mutations impies. Les Chroniques de Tressard permettaient de l'accomplir." },
  ],
  startSceneId: 'piste',
  scenes: [
    {
      id: 'piste',
      title: 'Sur la piste des pillards',
      locationId: 'piste',
      readAloud:
        "La montagne est étonnamment paisible. Le soleil de fin d'hiver fait scintiller la neige, et la piste des pillards serpente devant vous entre des pins épars. Puis le vent se lève, et les traces commencent à disparaître sous de nouveaux flocons. Un peu plus haut, vous découvrez leur campement de la veille : feu mal éteint, restes de gibier, épluchures, et une fosse puante creusée à la hâte. Deux silhouettes massives y fouillent en grognant. Deux hibours, réveillés trop tôt et affamés.",
      gmNotes:
        "Retourner contre les héros les mauvaises habitudes des aventuriers : les pillards ont laissé derrière eux des déchets qui attirent les bêtes, des pièges à gibier oubliés, des animaux blessés. Les deux hibours mâles attaquent qui les dérange. Ensuite, quelques périls au choix : un pont de corde au-dessus d'une crevasse, secoué par le vent et attaqué par un grand rapace (Agilité ou Force) ; un piège à gibier oublié qui peut briser un os (Perception) ; une tempête de neige à la tombée de la nuit qui empêche tout feu de camp ; et, par malchance, une femelle hibourse réveillée.",
      checks: [
        { situation: 'Suivre la piste des pillards sous la neige qui tombe', ability: 'perception', difficulty: 12, success: 'Vous retrouvez leurs traces, encore fraîches.', failure: 'Vous perdez une heure à retrouver la piste.' },
        { situation: 'Traverser le pont de corde secoué par le vent et le rapace', ability: 'agilite', difficulty: 12, success: 'Vous atteignez l\'autre bord.', failure: 'Vous glissez et restez suspendu : 1d4 dégâts, il faut vous hisser (Force 12).' },
        { situation: 'Repérer un piège à gibier oublié dans la neige', ability: 'perception', difficulty: 12, success: 'Des mâchoires d\'acier, à un pas de votre botte.', failure: 'Le piège se referme : 1d6 dégâts et une marche douloureuse.' },
        { situation: 'Endurer la nuit de tempête sans feu', ability: 'endurance', difficulty: 12, success: 'Vous serrez les dents jusqu\'à l\'aube.', failure: 'Le froid vous mord : 1d4 dégâts.' },
      ],
      encounter: {
        trigger: 'Les hibours défendent le campement abandonné',
        enemies: [
          { name: 'Hibours', hp: 10, attack: 3, defense: 11, damage: '1d8', initiative: 0, xp: 35 },
          { name: 'Hibours', hp: 10, attack: 3, defense: 11, damage: '1d8', initiative: 0, xp: 35 },
        ],
        alternatives: "Les hibours veulent manger, pas se battre : leur abandonner de la viande ou les contourner (Agilité 12) évite le combat.",
      },
      exits: [{ to: 'murs', when: 'Les héros atteignent Castelmorant.' }],
    },
    {
      id: 'murs',
      title: 'Sur les murs de Castelmorant',
      locationId: 'castelmorant',
      readAloud:
        "La forteresse surgit d'un coup au détour de l'éperon, et vous écrase de sa masse. La pierre noire tranche sur la neige immaculée. Les vents hurlent entre les créneaux éventrés. À un vieux gibet pendent des cadavres gelés aux contorsions grotesques ; la glace a figé pour toujours leurs visages de douleur. Plus loin, sous la muraille, des silhouettes raides grattent la neige, retournent les pierres, fouillent. Elles grelottent, même celles dont la chair est noircie par les flammes. L'une d'elles, des larmes de grenat gelé sur les joues, lève la tête vers vous.",
      gmNotes:
        "Les nonmourants ne patrouillent pas : ils cherchent les héritiers Tressard. Ils ne voient pas les héros comme une menace mais comme une cachette à fouiller, et attaquent pour cela. Combat âpre : ils ne cessent de bouger qu'une fois démembrés ou réduits en cendres. Le feu les arrête. Les traces d'une escarmouche récente montrent que les pillards ont réussi à entrer dans le château.",
      checks: [
        { situation: 'Garder son sang-froid devant le gibet et les morts qui fouillent', ability: 'charisme', difficulty: 12, success: 'Vous détournez les yeux et gardez la tête froide.', failure: 'La peur vous paralyse : désavantage au premier round de combat.' },
        { situation: 'Lire les traces de la bataille récente', ability: 'perception', difficulty: 8, success: 'Les pillards ont forcé une poterne au nord et sont entrés, avec un blessé.', failure: 'Du sang et des débris partout.' },
      ],
      encounter: {
        trigger: 'Les nonmourants repèrent les héros',
        enemies: [
          { name: 'Nonmourant', hp: 9, attack: 2, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 },
          { name: 'Nonmourant', hp: 9, attack: 2, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 },
        ],
        alternatives: 'Le feu les met en déroute. Se faufiler entre eux pendant qu\'ils fouillent est possible (Agilité 16).',
      },
      exits: [{ to: 'pillards', when: 'Les héros pénètrent dans le château.' }],
    },
    {
      id: 'pillards',
      title: 'Le cœur de Castelmorant',
      locationId: 'castelmorant',
      readAloud:
        "Dans la grande salle en ruine, sous une voûte à moitié effondrée, les pillards sont là. Leur cheffe, une femme à la bouche barrée d'une cicatrice, s'escrime avec ses compagnons sur d'énormes chaînes rouillées scellées dans le sol. Les chaînes s'enfoncent dans une fosse obscure d'où monte un souffle lent et profond, comme celui d'une bête immense endormie. Des sacs remplis de vaisselle d'argent et de bijoux gelés traînent à leurs pieds. « Tiens, de la concurrence. Le butin d'Iris, c'est pour nous. »",
      gmNotes:
        "Garance et sa bande (autant que les héros) veulent briser les chaînes pour atteindre ce qu'elles retiennent, persuadés qu'un trésor s'y trouve. Les héros peuvent les raisonner (Charisme), les acheter, les intimider ou les vaincre. Si les pillards sont arrêtés sans rien emporter, Arthon reste dans sa presque-mort. Si les chaînes sont brisées ou si un objet quitte la forteresse, aller à « Le réveil du géant ». Un héros qui a grandi dans la région sait ce qui arrive si on vole Castelmorant.",
      npcIds: ['garance', 'arthon_geant'],
      checks: [
        { situation: 'Convaincre Garance de renoncer au pillage', ability: 'charisme', difficulty: 16, success: 'Elle crache par terre, mais fait signe aux siens de reposer le butin.', failure: '« Des contes de bonne femme. » Elle tire son épée.' },
        { situation: 'Comprendre ce que retiennent les chaînes', ability: 'intelligence', difficulty: 12, success: "Ce ne sont pas des chaînes de coffre : on les a forgées pour retenir quelque chose de vivant. Et énorme.", failure: 'Des chaînes anciennes. Un trésor, peut-être.' },
      ],
      encounter: {
        trigger: 'Les pillards refusent de renoncer',
        enemies: [
          { name: 'Garance la Balafrée', hp: 10, attack: 3, defense: 13, damage: '1d8', initiative: 2, xp: 40 },
          { name: 'Pillard', hp: 7, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 20 },
          { name: 'Pillard', hp: 7, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 20 },
        ],
        alternatives: "Les pillards se rendent si Garance tombe. Les acheter coûte au moins 50 pièces d'or.",
      },
      rewards: "Le Seigneur Tress paie 100 pièces d'or si la forteresse reste intacte. 60 XP.",
      exits: [
        { to: 'tressard', when: 'Les pillards sont arrêtés sans que rien ne soit volé ni brisé ; les héros redescendent.' },
        { to: 'geant', when: 'Les chaînes sont brisées ou un objet est emporté.' },
      ],
    },
    {
      id: 'geant',
      title: 'Le réveil du géant',
      locationId: 'foret_basse',
      readAloud:
        "Un grondement monte de la fosse, sourd et immense, comme une avalanche qui naîtrait sous vos pieds. Les chaînes claquent. Une main difforme, grande comme une charrette, agrippe le rebord. Ce qui se hisse hors du noir a peut-être été un homme, il y a des siècles. Il hurle, et dans toute la montagne, les morts qui fouillaient se retournent vers vous. Il faut fuir. Maintenant.",
      gmNotes:
        "Arthon le Géant attaque pillards et héros sans distinction, et ses cris appellent tous les nonmourants. Le combattre est suicidaire : la seule issue est la fuite jusqu'à la forêt du piémont. Course-poursuite dans la neige (Agilité, Endurance). Si un objet a été volé, les nonmourants descendront dans toute la vallée pour récupérer chaque fragment : cela pèsera sur le village de Tressard. Le Seigneur Tress, informé, paie la moitié de la somme et pâlit en apprenant que le géant est réveillé.",
      npcIds: ['arthon_geant'],
      checks: [
        { situation: 'Dévaler la pente enneigée devant la horde', ability: 'agilite', difficulty: 12, success: 'Vous atteignez les premiers arbres.', failure: 'Vous chutez : 1d6 dégâts, et une main glacée vous agrippe la cheville.' },
        { situation: 'Tenir la cadence de la fuite jusqu\'à la forêt', ability: 'endurance', difficulty: 12, success: 'Vous courez jusqu\'à ce que les hurlements s\'éteignent.', failure: 'À bout de souffle, il faut se battre pour se dégager.' },
      ],
      encounter: {
        trigger: 'Des nonmourants rattrapent les héros pendant la fuite',
        enemies: [
          { name: 'Nonmourant', hp: 9, attack: 2, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 },
          { name: 'Nonmourant', hp: 9, attack: 2, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 },
          { name: 'Nonmourant', hp: 9, attack: 2, defense: 11, damage: '1d6+1', initiative: 0, xp: 30 },
        ],
        alternatives: 'Les nonmourants ne quittent pas les hauteurs tant que rien n\'a été volé : atteindre la forêt suffit.',
      },
      exits: [{ to: 'tressard', when: 'Les héros, réchappés, rejoignent le village de Tressard.' }],
    },
    {
      id: 'tressard',
      title: 'Le joli village de Tressard',
      locationId: 'tressard',
      readAloud:
        "Quelques semaines plus tard, à la fonte des premières neiges, le Seigneur Tress vous envoie à Tressard, au pied de la Sainte-Blanche : depuis deux ans, aucun jeune n'est revenu de la course rituelle, et elle a lieu demain. Le village est joli, avec ses ruches alignées et l'odeur de l'hydromel. Mais personne ne chante, personne ne danse. Dans son auberge qui fait aussi relais de poste et bibliothèque, Maritha Ssaoan vous accueille avec un sourire qui ne monte pas jusqu'à ses yeux.",
      gmNotes:
        "Enquête sur une soirée, indices à disperser entre archives, comptines, souvenirs et PNJ : des créatures descendent de la Sainte-Blanche, certaines ont des visages humains ; Liano, le prêtre, consommait beaucoup de satinelle mais a arrêté il y a deux ans ; il descend du chevalier Tressard et porte la scène du pacte en tatouage ; des jeunes refusent la satinelle, comme Bossn, le fils disparu de Maritha ; deux enfants ont fugué pour ne pas courir ; la véritable histoire du chevalier est dans un grimoire enterré avec lui au sommet. Fausses pistes à semer : l'Enfant serait un dragon ; Bossn aurait fui en ville ; Liano bénirait des armes ; Bruss le braconnier aurait fâché le petit dieu. Kharola, interdite de course par sa mère, a décidé de courir quand même et ne prend pas de satinelle. Bruss accepte, contre de l'alcool, de guider les héros sur le piémont. Rhissa la bourgmestre ne tolère aucun manque de respect envers le tabou.",
      npcIds: ['maritha', 'kharola', 'bruss', 'rhissa', 'liano'],
      checks: [
        { situation: 'Fouiller les archives de Maritha', ability: 'intelligence', difficulty: 12, success: 'La geste du chevalier Tressard, et un dessin du pacte identique aux tatouages de Liano.', failure: 'Des registres de miel et de naissances.' },
        { situation: 'Faire parler les villageois sans heurter le tabou', ability: 'charisme', difficulty: 16, success: 'On vous parle des fugueurs, des jeunes sans satinelle et de Bossn.', failure: 'Les visages se ferment. Rhissa vous observe de loin.' },
        { situation: 'Interroger Liano sur la fiole et la statuette', ability: 'charisme', difficulty: 16, success: "C'est le sang du chevalier Tressard lui-même. Et il n'a aucune envie que l'ancien ordre revienne.", failure: 'Le prêtre vous congédie froidement.' },
      ],
      exits: [{ to: 'depart', when: "À l'aube, la course va commencer." }],
    },
    {
      id: 'depart',
      title: 'Le départ de la course',
      locationId: 'tressard',
      readAloud:
        "À l'aube, tout le village se presse au pied de la montagne. Les jeunes coureurs, les yeux brillants de satinelle, attendent en silence. Liano bénit chacun d'eux puis fait sonner une cloche : tous les villageois baissent la tête. Le prêtre sort d'un coffre une statuette d'enfant à deux paires d'ailes, et une fiole d'un liquide rouge sombre. Une goutte tombe sur chaque front. La cloche tinte une deuxième fois.",
      gmNotes:
        "Les étrangers ne peuvent pas prendre le départ avec les jeunes : il faut partir avant (de nuit, sans voir la cérémonie), en même temps en restant à couvert (Agilité), ou après. Une fois sur les flancs, les villageois ne les arrêteront pas : le petit dieu s'en chargera. La statuette et la fiole sont capitales pour le pacte : les voler ou les briser pourrait empêcher son renouvellement, au prix de la colère du village. Au troisième tintement, les jeunes s'élancent. Kharola part parmi eux, sans satinelle.",
      npcIds: ['liano', 'rhissa', 'kharola'],
      checks: [
        { situation: 'Partir discrètement à couvert des arbres', ability: 'agilite', difficulty: 8, success: 'Personne ne vous voit vous glisser sur les flancs.', failure: 'Des villageois vous montrent du doigt, mais personne n\'ose vous suivre.' },
        { situation: 'Subtiliser la statuette ou la fiole pendant que les têtes sont baissées', ability: 'agilite', difficulty: 16, success: "La relique est dans votre manche. Personne n'a rien vu.", failure: 'Liano vous voit. Le village entier se dresse contre vous.' },
      ],
      exits: [{ to: 'flancs', when: 'Les héros s\'engagent sur la Sainte-Blanche.' }],
    },
    {
      id: 'flancs',
      title: 'Sur les flancs de la Sainte-Blanche',
      locationId: 'sainte_blanche',
      readAloud:
        "Dès que vous quittez le couvert des arbres, le vent vous gifle de flocons coupants comme du verre. Il hurle si fort qu'il faut crier pour s'entendre. Le long du sentier, des corps gelés se tiennent dans des postures impossibles, statues ou cadavres, vous ne savez plus. Des ruines qui n'appartiennent à aucun monde connu crèvent la neige. Une cascade tombe vers le haut. Et dans le vent, vous croyez entendre un enfant pleurer.",
      gmNotes:
        "Ascension hallucinée, désorientante et mortelle. Le sang de Tressard protège un peu les jeunes, pas les héros : le froid inflige des dégâts mineurs mais continus à la peau découverte, le vent impose des malus quand c'est pertinent, il faut des grottes ou des ruines pour s'abriter et communiquer. Créatures du froid tapies dans les ruines (hibours blanc, troll des glaces, loups astraux, fantômes d'enfants gelés). Hallucinations : scènes d'aventures passées, souvenirs des victimes de l'Enfant et de Bossn. Si un combat survient pendant une hallucination, révéler à sa fin que les héros se battaient entre eux ou contre des jeunes du village. Obstacles : ravins, cascades, baies empoisonnées, ponts fragiles. Une hallucination plus forte peut entraîner tout le groupe dans la vision « Le glas de Castelmorant ». Bruss peut les guider jusqu'à mi-pente.",
      npcIds: ['bruss'],
      checks: [
        { situation: 'Garder l\'esprit clair au milieu des visions et du vent', ability: 'charisme', difficulty: 16, success: 'Vous distinguez le réel du cauchemar.', failure: "Vous ne savez plus ce qui est vrai : l'hallucination vous engloutit." },
        { situation: 'Résister au froid mordant hors des abris', ability: 'endurance', difficulty: 16, success: 'Vous tenez bon.', failure: 'Engelures : 1d4 dégâts.' },
        { situation: "Distinguer une statue de glace d'une bête immobile", ability: 'perception', difficulty: 12, success: 'Celle-ci respire. Vous passez au large.', failure: 'La statue ouvre les yeux.' },
      ],
      encounter: {
        trigger: "Une bête de la Sainte-Blanche jaillit d'une ruine",
        enemies: [{ name: 'Troll des glaces', hp: 14, attack: 3, defense: 12, damage: '1d8+1', initiative: 0, xp: 60 }],
        alternatives: 'Ruser ou fuir à travers les ruines. Le feu le fait reculer.',
      },
      exits: [
        { to: 'vision', when: 'Une hallucination engloutit le groupe tout entier.' },
        { to: 'enfant', when: 'Les héros atteignent les hauteurs.' },
      ],
    },
    {
      id: 'vision',
      title: 'Vision : le glas de Castelmorant',
      locationId: 'castelmorant_jadis',
      readAloud:
        "La neige se change en pluie. Vous êtes ailleurs, et quelqu'un d'autre. Castelmorant est intact, ses tours dressées sous un ciel d'orage, et vous êtes les enfants du seigneur Armand de Tressard, qui se meurt dans sa chambre. Dans la salle d'armes, dans la bibliothèque aux vitraux dorés, sur un sentier de la forêt, chacun de vous vaque à ses occupations. Puis le glas sonne. Votre père est mort. Et quelque part dans le château, votre oncle Arthon vient d'ouvrir les portes à la foule.",
      gmNotes:
        "Vision tirée de « La chute de la Maison Tressard ». Chaque héros incarne un temps un héritier : Akila, 16 ans, l'aînée combattante ; Bleuzenn, 13 ans, braconnière ; Elouann, 8 ans, qui connaît tous les passages secrets ; Krolus, le demi-frère bègue qui parle aux chiens ; Marissla, la gouvernante versée dans l'occulte ; Foulques, le soldat que l'Enfant ne peut pas toucher. Arthon livre le château à la jacquerie et cherche les héritiers ou les Chroniques de Tressard pour accomplir le rituel d'ascension et devenir l'hôte de l'Enfant. Les couloirs changent de forme, un escalier abrite un blizzard, les cieux prennent le visage d'un bébé boudeur. Un fantôme raconte la chute d'Iris ; le texte du rituel révèle ce qu'il fait vraiment à l'hôte. Les héritiers doivent comprendre que le rituel ne doit pas avoir lieu et brûler le corps d'Armand avant qu'Arthon ne s'en serve. Dans la chambre, le corps d'Arthon, trop abîmé, se déforme en géant. Fin de la vision : un survivant fuit dans la neige, poursuivi par des loups. C'est ainsi que le chevalier Tressard est arrivé au bord de la Blanchette. Les héros se réveillent sur la Sainte-Blanche, en sachant tout de l'Enfant.",
      checks: [
        { situation: 'Traverser le couloir en spirale qui passe sur les murs puis au plafond', ability: 'agilite', difficulty: 12, success: 'Vous courez sur le plafond comme si c\'était naturel.', failure: 'Vous tombez vers le haut : 1d4 dégâts.' },
        { situation: 'Comprendre le vrai sens du rituel d\'ascension', ability: 'intelligence', difficulty: 12, success: "L'hôte n'hérite pas du pouvoir : il est dévoré, et l'Enfant vit à sa place.", failure: 'Les mots se tordent sur la page.' },
      ],
      encounter: {
        trigger: "Les soldats d'Arthon ou des villageois possédés coincent les héritiers",
        enemies: [
          { name: "Soldat d'Arthon", hp: 7, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 20 },
          { name: "Soldat d'Arthon", hp: 7, attack: 2, defense: 12, damage: '1d6', initiative: 1, xp: 20 },
          { name: 'Villageois possédé', hp: 5, attack: 1, defense: 10, damage: '1d4', initiative: 0, xp: 10 },
        ],
        alternatives: 'Passages secrets, toits glissants, chiens et loups qui obéissent à Krolus : fuir est presque toujours possible.',
      },
      rewards: "Connaissance de l'histoire de la Maison Tressard. 50 XP.",
      exits: [{ to: 'enfant', when: 'La vision se dissipe et les héros se réveillent sur les hauteurs.' }],
    },
    {
      id: 'enfant',
      title: "Le meurtre d'un gamin",
      locationId: 'sainte_blanche',
      readAloud:
        "Le vent tombe d'un coup. Dans un silence irréel, une petite silhouette se tient devant vous : un enfant de glace difforme, aux cornes blanches, avec deux paires d'ailes de cristal. Des morceaux de son corps s'envolent avec la bise, comme du givre. Il tend vers vous des mains tremblantes. « Aidez-moi… Ils me chassent. » Sur un éperon rocheux tout proche, des silhouettes de glace se découpent contre le ciel.",
      gmNotes:
        "L'Enfant est mourant, et pitoyable. Il propose une alliance pour sauver les jeunes et tuer Bossn : la clémence des éléments, de la satinelle à volonté, et sa présence au combat. En échange : un peu du sang d'un héros, et un jeune du village, n'importe lequel. S'ils refusent, il les attaque : puissant, mais au bord de la mort, quelques coups suffisent à le disperser. S'ils acceptent, un héros lui donne son sang (Endurance) : il tète goulûment, laissant une brûlure de froid. Les éléments se calment, un immense ciel bleu apparaît, et les tricheurs fondent sur le groupe ; l'Enfant rassasié frappe fort à leurs côtés. Noter qui a donné son sang.",
      npcIds: ['enfant'],
      checks: [
        { situation: "Ne pas se laisser attendrir par l'Enfant et deviner ce qu'il est", ability: 'perception', difficulty: 12, success: 'Sous les larmes, un regard ancien et affamé : ce n\'est pas un enfant.', failure: 'Un gamin perdu et blessé, qui a besoin de vous.' },
        { situation: "Donner son sang à l'Enfant sans défaillir", ability: 'endurance', difficulty: 12, success: 'Vous serrez les dents jusqu\'à ce qu\'il lâche prise.', failure: 'Il boit trop : 1d6 dégâts.' },
      ],
      encounter: {
        trigger: 'Les tricheurs de Bossn attaquent (ou l\'Enfant, si on refuse son pacte)',
        enemies: [
          { name: 'Tricheur de glace', hp: 8, attack: 2, defense: 12, damage: '1d6+1', initiative: 2, xp: 35 },
          { name: 'Tricheur de glace', hp: 8, attack: 2, defense: 12, damage: '1d6+1', initiative: 2, xp: 35 },
        ],
        alternatives: "Si les héros refusent le pacte, l'Enfant attaque seul à la place des tricheurs : PV 12, attaque 4, défense 11, dégâts 1d8, et il se disperse au vent à 0 PV.",
      },
      exits: [{ to: 'sommet', when: 'Les héros atteignent le sommet.' }],
    },
    {
      id: 'sommet',
      title: "Le retour de l'Enfant",
      locationId: 'sommet',
      readAloud:
        "Au sommet, au-dessus des nuages, se dresse une structure de cristal dont les angles ne respectent aucune loi. À l'intérieur, la lumière se brise en mille éclats froids. Des corps de jeunes coureurs gisent, déformés. Dans un coin, Kharola gémit, blessée. Et au centre, sur un trône de glace, un jeune homme à la peau bleuie lève les yeux vers vous. Autour de lui, le vent se met à tourner. « Vous venez la reprendre ? Elle est à moi. Vous êtes tous à moi. »",
      gmNotes:
        "Bossn combat de toute sa puissance. Si l'Enfant est mort, il contrôle tous les éléments : vent, pluie, foudre, et loups et hibours accourent à son appel (combat très dur). Si l'Enfant est vivant et allié, le combat est plus juste, mais l'Enfant n'est pas fiable. Sur le point de mourir, Bossn reprend forme humaine. L'Enfant veut le dévorer ; Kharola s'y oppose. L'Enfant cherche alors à garder les deux et laisse aux héros quelques heures pour quitter son domaine : le pacte est renouvelé. Sauf si la statuette ou la fiole sont brisées, ou si les héros se retournent contre l'Enfant : alors le pacte est rompu.",
      npcIds: ['bossn', 'kharola', 'enfant'],
      encounter: {
        trigger: 'Bossn se dresse de son trône',
        enemies: [{ name: 'Bossn, le petit dieu de glace', hp: 24, attack: 4, defense: 14, damage: '1d10', initiative: 3, xp: 200 }],
        alternatives: "Si l'Enfant est mort, ajouter deux loups (PV 6, attaque 2, défense 12, dégâts 1d6). Si l'Enfant combat avec eux, Bossn commence à 16 PV.",
      },
      exits: [
        { to: 'pacte_rompu', when: "Bossn est vaincu et le pacte est rompu (reliques brisées, Enfant mort ou combattu)." },
        { to: 'pacte_renouvele', when: "Bossn est vaincu et l'Enfant reprend sa place." },
        { to: 'regne_bossn', when: 'Les héros sont vaincus.' },
      ],
    },
    {
      id: 'pacte_rompu',
      title: 'Le pacte rompu',
      locationId: 'tressard',
      ending: 'mitigée',
      readAloud:
        "Quand vous redescendez, le vent ne hurle plus. Pour la première fois depuis des siècles, la Sainte-Blanche se tait. À Tressard, Liano pleure de soulagement. Mais les ruches sont silencieuses, et l'hydromel a un goût de cendre.",
      gmNotes:
        "Le pacte est rompu. Liano reste libre et heureux, mais Tressard périclite : beaucoup partent, et l'hiver suivant isole et tue le village. Si Bossn a survécu, Maritha, Bossn et Kharola quittent la région. Si une relique a été brisée, l'Enfant s'incarne lentement dans le héros qui lui a donné son sang et tentera de prendre le contrôle de son corps d'ici l'hiver suivant : une suite possible. Mettre la quête en réussie.",
      rewards: "Le Seigneur Tress paie 150 pièces d'or. Fin de la campagne : 200 XP.",
      exits: [],
    },
    {
      id: 'pacte_renouvele',
      title: "Le règne de l'Enfant",
      locationId: 'tressard',
      ending: 'mitigée',
      readAloud:
        "Dans les jours qui suivent, les coureurs redescendent un à un, hagards, vivants. Le village chante enfin. Sur la Sainte-Blanche, le vent hurle de nouveau, comme avant, et quelque part là-haut, un enfant de glace se repaît en souriant.",
      gmNotes:
        "L'Enfant règne à nouveau : peu de jeunes sont morts cette année, la plupart sont revenus, et l'ordre ancien reprend. Bossn et Kharola sont restés au sommet. Liano entendra de nouveau les murmures chaque nuit. Mettre la quête en réussie, avec un goût amer.",
      rewards: "Le Seigneur Tress paie 150 pièces d'or. Fin de la campagne : 180 XP.",
      exits: [],
    },
    {
      id: 'regne_bossn',
      title: 'Le règne de Bossn',
      locationId: 'sommet',
      ending: 'défaite',
      readAloud:
        "Le froid vous prend, doucement, et la dernière chose que vous entendez est le rire d'un jeune homme qui se mêle au hurlement du vent.",
      gmNotes:
        "Bossn règne sans partage. L'hiver suivant, il détruit Tressard pour dévorer ses habitants, puis étend son influence aux villages voisins, et migre peu à peu vers les grandes villes.",
      exits: [],
    },
  ],
};
