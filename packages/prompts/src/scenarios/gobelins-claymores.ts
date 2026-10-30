import type { Scenario } from '@veillee/engine';

/**
 * Adaptation de la campagne « Un pour tous, tous sur les Gobelins ! » de Fumble Dice,
 * publiée sur Rolis sous licence CC BY-SA 4.0. Cette adaptation reste sous CC BY-SA 4.0.
 */
export const gobelinsClaymores: Scenario = {
  id: 'gobelins-claymores',
  title: 'Un pour tous, tous sur les Gobelins !',
  credits: {
    author: 'Fumble Dice (campagne Rolis, adaptée pour Veillée)',
    license: 'CC BY-SA 4.0',
    source: 'https://www.rolis.net/scenarios/campagne/23/un-pour-tous-tous-sur-les-gobelins',
  },
  genre: 'Fantasy',
  tone: 'Héroïque et parodique',
  blurb:
    "Fauchés et criblés de dettes, les héros partent chercher un tonneau de bière sans fond dans une mine naine… et finissent ligotés par un clan de gobelins qui veut les sacrifier pour réveiller un nécromant. Campagne humoristique en trois actes : fées, dragon végétarien, concours de lancer de héros et bataille finale.",
  players: '2 à 5 joueurs (seul : avec un ou deux compagnons), niveau 1, débutants bienvenus',
  minPlayers: 2,
  duration: 'Campagne de 3 épisodes, environ 10 heures',
  setting:
    "Un bourg médiéval fantastique sans prétention, son auberge mal famée, ses usuriers et ses routes de campagne. À six lieues de là, d'anciennes mines naines (kazads) abandonnées. Dans la région rôdent l'Ordre de la justice, des paladins fanatiques qui ne font pas de prisonniers, et le clan des Claymores, une bande de gobelins aussi ridicules que dangereux.",
  pitch:
    "Les héros doivent 250 sous à leur taverne et n'ont plus un sou. Un contact leur souffle un tuyau en or : au fond d'une mine naine abandonnée trône un tonneau de bière sans fond, un trésor des brasseurs nains qui ferait leur fortune. Il suffit d'aller le chercher.",
  secretPlot:
    "Canif Rutilant, sorcier gobelin hystérique du clan des Claymores, veut ressusciter Deboulémor, un antique nécromant, pour que les gobelins dominent le monde. Le rituel exige un sacrifice d'adorateurs de Deboulémor, mais aucun gobelin ne veut mourir : Canif déguise donc des prisonniers en gobelins et les « intègre » au clan avant de les sacrifier. Ce sera le sort des héros, sauvés in extremis par l'Ordre de la justice… qui les prend pour des traîtres. Le portail de fuite de Canif ne s'ouvre que pour les membres du clan, donc pour les héros eux-mêmes. Il mène à une jungle lointaine où un dragon de cuivre végétarien, attaqué par les gobelins qui voulaient sa pierre draconique, connaît la cachette de leur armée. Canif finit par enlever la fille du Bourgmestre pour un sacrifice « de rang pur ». Le rituel final rate à moitié : Deboulémor revient affaibli, avec l'apparence de la fille du Bourgmestre, et ne parvient à relever qu'un troupeau de vaches et de moutons zombies avant de s'enfuir en jurant de revenir. Le tonneau sans fond n'a jamais été dans la mine : le tuyau était foireux.",
  gmAdvice:
    "Campagne d'humour et d'aventure pour débutants : les combats sont simples et les situations absurdes. Canif Rutilant et Deboulémor sont bien trop puissants pour être affrontés de front : faites-le sentir et offrez toujours une issue. Trois alliés rencontrés en chemin (la Reine des fées, le petit géant, le dragon) reviennent pour la bataille finale : notez-les dans les quêtes et rappelez-les aux joueurs. L'usurier Maître Vindepot et Bodin des Rois sont des fils rouges comiques. Plusieurs scènes sont prévues pour que les héros perdent (la capture, l'ordalie contre le troll) : ne les tuez pas, enchaînez sur la suite. Gardez un ton tous publics.",
  locations: [
    { id: 'auberge', name: "L'auberge du bourg", description: 'Auberge mal famée où les héros ont leurs habitudes et une ardoise qui ne cesse de grossir.' },
    { id: 'route', name: 'La route des mines', description: 'Six lieues de chemins de campagne, de forêts et de souches entre le bourg et les mines naines.' },
    { id: 'clairiere_fee', name: 'La clairière de la souche', description: 'Clairière paisible où une minuscule créature ailée pleure sur une souche.' },
    { id: 'mine', name: 'La mine kazad', description: "Ancienne mine naine aux galeries labyrinthiques, et sa grande salle aux colonnes démesurées où se dresse la statue d'un maître brasseur portant un tonneau." },
    { id: 'bastion', name: 'Le bastion de la justice', description: "Forteresse de l'Ordre de la justice, semblable à une antique cathédrale gothique." },
    { id: 'jungle', name: 'La jungle au-delà du portail', description: 'Jungle humide et bruyante, sous un ciel nocturne, qui grimpe vers une montagne truffée de silex coupants.' },
    { id: 'antre_dragon', name: "L'antre du dragon", description: "Plateau rocailleux jonché de gobelins mâchouillés, et une caverne de quinze mètres de haut d'où luisent deux yeux rouges." },
    { id: 'gouffre', name: 'Le gouffre et la forteresse des colosses', description: "Gouffre vertigineux au fond duquel se dresse une forteresse troglodyte où ogres et géants organisent un concours de lancer de « Minus »." },
    { id: 'palais_bourgmestre', name: 'Le palais du Bourgmestre', description: 'Demeure du Bourgmestre du bourg, salle du Conseil et appartements de sa fille.' },
    { id: 'colline_luisante', name: 'La colline luisante', description: "Colline qui surplombe la plaine où se masse l'armée des gobelins." },
    { id: 'champ_bataille', name: 'La plaine de la bataille', description: "Vaste plaine au pied de la colline luisante, bâtie jadis sur un ancien abattoir à bestiaux." },
  ],
  npcs: [
    { id: 'vindepot', name: 'Maître Vindepot', description: "Usurier local au sourire narquois, flanqué de cinq gros bras.", attitude: 'arrangeant mais menaçant', motivation: "A racheté la dette des héros (250 sous) : 10 % d'intérêts par semaine de retard et une raclée hebdomadaire si on ne lui donne pas de nouvelles. Note tout ce qu'on lui raconte.", locationId: 'auberge' },
    { id: 'bodin', name: 'Bodin des Rois', description: 'Brigand charmeur, parodie de Robin des Bois, toujours suivi de son joueur de banjo.', attitude: 'théâtral', motivation: "Détrousser les voyageurs avec panache. Il fuit toujours quand ça tourne mal et jure de se venger.", secret: "Son charme est légendaire : un héros attiré par lui doit réussir un jet pour oser le frapper.", locationId: 'route', hp: 6 },
    { id: 'reine_fees', name: 'La Reine des fées', description: "Petite créature ailée en haillons qui pleure sur une souche ; une fois son collier retrouvé, une fée scintillante et majestueuse.", attitude: 'éplorée', motivation: "A perdu les perles de son collier en fuyant un troll. Récompense : un baiser (qui soigne tout) et une potion de courage. Devient une alliée précieuse.", secret: "Elle est vraiment la Reine des fées et commande des lanciers pixies et des fées enchanteresses.", locationId: 'clairiere_fee' },
    { id: 'canif', name: 'Canif Rutilant', description: "Sorcier gobelin hystérique, coiffé d'un casque romain à crête trop grand qui lui glisse sur les yeux, qui ponctue ses phrases d'une petite danse frénétique.", attitude: 'méprisant', motivation: "Ressusciter Deboulémor pour la gloire des gobelins. Parle aux héros comme à des animaux de compagnie, ne supporte pas qu'on le contredise ni qu'on remarque que ses « claymores » sont de petites épées.", secret: "Son portail ne s'ouvre que pour les membres du clan des Claymores, en criant trois fois le nom du clan avec sa voix chantante et en dansant sa danse.", locationId: 'mine', hp: 14 },
    { id: 'cure_dent', name: 'Cure-dent imposant', description: 'Troll des cavernes de trois mètres, aussi fort que bête.', attitude: 'obtus', motivation: 'Obéir à Canif et frapper. Un coup de lui met KO pour la scène.', locationId: 'mine', hp: 14 },
    { id: 'grand_maitre', name: "Le grand maître de l'Ordre", description: "Chef austère de l'Ordre de la justice, en armure blanche frappée d'un œil.", attitude: 'implacable', motivation: "Détruire les forces du mal. Prend d'abord les héros pour des traîtres adorateurs des dieux orcs ; les épargne s'ils peuvent mener l'Ordre jusqu'au sorcier.", locationId: 'bastion' },
    { id: 'vive_fleche', name: 'Vive Flèche', description: 'Rôdeuse émérite, spécialiste des peaux vertes, regard dur et carquois plein.', attitude: 'méfiante', motivation: "Surveiller les héros pour l'Ordre et les ramener morts ou vifs s'ils trahissent. Aide en dernier recours (lire l'écriture gobeline, tenir une corde) sans jamais faire le travail à leur place.", locationId: 'bastion', hp: 10 },
    { id: 'dragon', name: 'Le grand dragon de cuivre', description: "Dragon gigantesque à la voix qui fait vibrer les cailloux, souffrant d'une terrible rage de dents.", attitude: 'grognon puis amical', motivation: "Faire soigner sa molaire avec une pierre de fluor avant l'aube. En échange : la cachette de l'armée gobeline et son aide dans une future bataille. Répète à qui veut l'entendre qu'il est végétarien.", secret: "Les gobelins l'ont attaqué pour voler son cœur, une « pierre draconique » utile au rituel ; il les a mâchouillés mais pas mangés.", locationId: 'antre_dragon' },
    { id: 'petit_geant', name: 'Le petit géant', description: "Colosse chétif pour un géant, au dossard numéro zéro, qui pleure à grosses larmes. Son nom est imprononçable.", attitude: 'désespéré', motivation: "Gagner « la coupe très très brillante » pour ne pas être banni de son clan. Partage volontiers la pierre de fluor sertie dessus si les héros acceptent d'être ses projectiles.", locationId: 'gouffre' },
    { id: 'gobelin_menteur', name: 'Le gobelin coincé', description: 'Gobelin coincé entre deux prémolaires du dragon, dans les restes de son armure.', attitude: 'suppliant et perfide', motivation: "Convaincre les héros de le libérer au lieu de soigner le dragon, en prétendant que le dragon les dévorera.", secret: "Il porte sur l'avant-bras le tatouage d'une claymore : il est du clan de Canif.", locationId: 'antre_dragon' },
    { id: 'bourgmestre', name: 'Le Bourgmestre', description: 'Notable bedonnant et prudent, père attentionné.', attitude: 'sceptique', motivation: "Ne voit pas l'urgence : les gobelins n'ont jamais passé les frontières du bourg. Change d'avis quand sa fille est enlevée et lève alors gardes et villageois.", locationId: 'palais_bourgmestre' },
    { id: 'fille_bourgmestre', name: 'La fille du Bourgmestre', description: 'Jeune femme aux couettes blondes et aux boucles d\'oreilles de demoiselle.', attitude: 'terrifiée mais courageuse', motivation: 'Rentrer chez elle. Elle a été enlevée pour « la pureté de son rang » afin d\'être sacrifiée au lever du soleil.', locationId: 'colline_luisante', hp: 6 },
    { id: 'deboulemor', name: 'Deboulémor le Nécromant', description: 'Antique nécromant en toge noire mitée, entouré d\'un halo bleu nuit de crânes.', attitude: 'terrifiant', motivation: "Dominer le monde et rendre aux gobelins leur grandeur. Toute confrontation directe serait mortelle.", secret: "Mal invoqué, il revient avec l'apparence de la personne sacrifiée et des pouvoirs altérés.", locationId: 'champ_bataille' },
  ],
  quest: {
    id: 'claymores',
    title: 'Le clan des Claymores',
    objective: "Survivre au clan des Claymores, se laver de l'accusation de trahison et empêcher Canif Rutilant de ressusciter le nécromant Deboulémor.",
  },
  lore: [
    { keywords: ['tonneau', 'grim', 'bergen', 'biere'], text: "Selon la légende, l'enchanteur runique nain Grim Bergen forgea un tonneau sans fond dont la bière ne se tarit jamais. La statue de la grande salle de la mine en porte un, mais il n'est que de pierre." },
    { keywords: ['claymore', 'claymores', 'clan'], text: "Le clan des Claymores se vante d'être armé de claymores. Ce sont en réalité de petites épées, certes très aiguisées. Les membres du clan portent une claymore tatouée sur l'avant-bras." },
    { keywords: ['deboulemor', 'necromant', 'necromancien'], text: "Deboulémor est un antique nécromant vénéré des gobelins, capable de relever n'importe quel mort en zombie. Pour le ressusciter, il faut sacrifier un de ses adorateurs." },
    { keywords: ['ordre', 'paladin', 'justice'], text: "L'Ordre de la justice est un ordre de paladins qui a juré de détruire les forces du mal sans faire de prisonniers. Leurs procès sont expéditifs." },
    { keywords: ['portail', 'danse'], text: "Le portail de Canif s'ouvre si un membre du clan crie trois fois « clan des Claymores » avec la voix chantante de Canif, en exécutant sa petite danse. Chacun a droit à trois essais." },
    { keywords: ['fluor', 'coupe', 'concours', 'lancer'], text: "Le concours de lancer de « Minus » (humanoïdes de moins de 2 m 20) est réservé aux ogres et aux géants. Le vainqueur reçoit la coupe très très brillante, sertie d'une pierre de fluor." },
    { keywords: ['dragon', 'pierre draconique'], text: "Le cœur d'un dragon, la pierre draconique, est un ingrédient de rituel convoité. Les dragons de cuivre ont une haleine chargée de gaz inflammable : jamais de flamme dans leur gueule." },
  ],
  startSceneId: 'auberge',
  scenes: [
    {
      id: 'auberge',
      title: "L'heure de régler nos comptes",
      locationId: 'auberge',
      readAloud:
        "Les temps sont durs. Plus de petits boulots, plus un sou, et une ardoise de 250 sous à l'auberge qui grossit à vue d'œil. Ce soir encore, vous partagez une chope tiède dans votre coin habituel quand un vieux contact se penche vers vous et baisse la voix : « Une mine naine abandonnée, à six lieues d'ici. Au fond, il y a un tonneau sans fond, une bière qui ne se tarit jamais. Le genre de trésor qui règle toutes les dettes. » Au comptoir, le serveur vous lance un regard gêné.",
      gmNotes:
        "Laisser les héros préparer l'expédition : nécessaire de bivouac, torches, matériel d'escalade. S'ils hésitent, leur rappeler qu'ils ne peuvent même plus payer leurs consommations. Au moment de partir, le serveur leur annonce que le patron a revendu leur dette à un usurier, Maître Vindepot, qu'ils doivent aller voir sur-le-champ. Vindepot (avec ses gros bras) exige 250 sous, +10 % par semaine de retard et des nouvelles chaque semaine. Trois façons de réagir : lui parler de l'expédition (il note tout avec un sourire narquois, et il s'en souviendra) ; inventer une histoire (Charisme) ; refuser (bagarre à mains nues, que les gros bras gagnent facilement). S'ils ne vont pas le voir, les gros bras leur tombent dessus avant le départ. Ce n'est qu'une leçon : Vindepot siffle la fin de la bagarre après un ou deux rounds (op end_combat), et un héros mis KO se réveille sonné mais sans suite grave.",
      npcIds: ['vindepot'],
      checks: [
        { situation: "Embobiner Maître Vindepot avec une belle histoire pour gagner du temps", ability: 'charisme', difficulty: 16, success: "Vindepot fait mine de vous croire et vous accorde un sursis.", failure: "Les gros bras bandent leurs muscles : un échange de baffes commence, que Vindepot arrête après un round." },
      ],
      encounter: {
        trigger: "Les héros refusent de payer, ratent leur bluff ou évitent l'usurier",
        enemies: [
          { name: "Gros bras de l'usurier", hp: 5, attack: 1, defense: 10, damage: '1d4', initiative: 0, xp: 10 },
          { name: "Gros bras de l'usurier", hp: 5, attack: 1, defense: 10, damage: '1d4', initiative: 0, xp: 10 },
          { name: "Gros bras de l'usurier", hp: 5, attack: 1, defense: 10, damage: '1d4', initiative: 0, xp: 10 },
        ],
        alternatives: "C'est une bagarre à mains nues pour faire peur : Vindepot l'arrête vite. Personne ne doit y mourir.",
      },
      exits: [{ to: 'route', when: 'Les héros prennent la route des mines.' }],
    },
    {
      id: 'route',
      title: 'Sur la route',
      locationId: 'route',
      readAloud:
        "Six lieues, c'est presque une journée et demie de marche. La route serpente entre champs et bosquets sous un ciel clair. En fin d'après-midi, au détour d'un virage, vous apercevez une voyageuse étendue au bord du chemin, une jambe coincée sous une souche d'arbre. Elle vous appelle à l'aide d'une voix déchirante et promet monts et merveilles à qui la délivrera.",
      gmNotes:
        "C'est un piège de Bodin des Rois et ses détrousseurs (autant que de héros, plus Bodin). Si les héros aident la voyageuse, elle sort une dague et les brigands surgissent des buissons : les héros perdent l'initiative. S'ils passent leur chemin, les brigands attaquent quand même mais sans surprise. Bodin déclame : « Ola ola gais trublions, Bodin des Rois et ses détrousseurs de compagnons viennent soulager vos bourses bien trop remplies ! » pendant qu'un jeune voleur joue du banjo. Payer coûte les deux tiers de leur argent. Perdre le combat coûte tout. Gagner rapporte 35 sous. Quoi qu'il arrive, Bodin s'enfuit en jurant vengeance, suivi de son banjo. La nuit, des loups attaquent le camp : celui qui monte la garde fait un jet de Perception ; s'il échoue, chacun se fait mordre une fois avant de réagir.",
      npcIds: ['bodin'],
      checks: [
        { situation: "Se méfier de la voyageuse en détresse", ability: 'perception', difficulty: 12, success: "Vous remarquez des bottes qui dépassent des buissons : vous ne serez pas surpris.", failure: "Rien d'anormal : une pauvre voyageuse." },
        { situation: 'Résister au charme légendaire de Bodin des Rois pour oser le frapper', ability: 'charisme', difficulty: 8, success: 'Vous gardez la tête froide.', failure: 'Impossible de lever la main sur un homme pareil ce round-ci.' },
        { situation: 'Monter la garde la nuit et entendre les loups approcher', ability: 'perception', difficulty: 8, success: 'Vous réveillez le groupe à temps.', failure: 'Les loups sont dans le camp avant que vous ne soyez debout : chacun subit une morsure.' },
      ],
      encounter: {
        trigger: 'Les détrousseurs encerclent les héros, ou les loups attaquent le camp de nuit',
        enemies: [
          { name: 'Bodin des Rois', hp: 6, attack: 2, defense: 12, damage: '1d6', initiative: 3, xp: 20 },
          { name: 'Détrousseur', hp: 4, attack: 1, defense: 10, damage: '1d4', initiative: 1, xp: 10 },
          { name: 'Détrousseur', hp: 4, attack: 1, defense: 10, damage: '1d4', initiative: 1, xp: 10 },
        ],
        alternatives: "Payer les brigands évite le combat. Pour les loups, utiliser 2 ou 3 loups (PV 6, attaque 2, défense 12, dégâts 1d6) : ils fuient quand la moitié est tombée.",
      },
      rewards: '35 sous sur les brigands vaincus. 20 XP par épreuve surmontée.',
      exits: [{ to: 'fee', when: 'Les héros reprennent la route le lendemain.' }],
    },
    {
      id: 'fee',
      title: 'La pseudo Reine des fées',
      locationId: 'clairiere_fee',
      readAloud:
        "Au bord du sentier, assise sur une souche, une minuscule créature ailée habillée en souillon sanglote à fendre l'âme. Elle lève vers vous de grands yeux mouillés : « Je suis la Reine des fées, et j'ai perdu les perles de mon collier en fuyant un troll enragé ! Aidez-moi, je vous en supplie ! »",
      gmNotes:
        "Scène indispensable : la Reine devient une alliée pour la bataille finale. Pas de piège. Récompense proposée : un baiser chacun (deux si on refuse, pas plus). Elle ne croit pas en l'argent. Il faut retrouver quatre perles : un jet de Perception par perle, chaque essai prend trente minutes. Quand le collier est complet, elle se transforme en fée magnifique et scintillante. Son baiser rend tous leurs PV aux héros, et elle offre une potion de courage (une dose, avantage pour affronter une situation effrayante). Elle les invite dans son royaume « quand ils en auront besoin » et leur indique comment le trouver. Ajouter une quête secondaire « Alliés : la Reine des fées ».",
      npcIds: ['reine_fees'],
      checks: [
        { situation: 'Retrouver une des quatre perles dans les herbes et les fourrés (un jet par perle)', ability: 'perception', difficulty: 12, success: 'Une perle nacrée brille entre deux racines.', failure: 'Trente minutes de recherche pour rien.' },
      ],
      rewards: 'Baiser de la Reine : PV au maximum. Potion de courage. 30 XP. Une alliée pour la suite.',
      exits: [{ to: 'mine', when: 'Les héros arrivent à la mine naine.' }],
    },
    {
      id: 'mine',
      title: 'Sous la montagne',
      locationId: 'mine',
      readAloud:
        "De vieux vestiges kazads ornent les flancs de l'entrée, témoins d'une époque que tout le monde a oubliée. Au-delà, il fait noir comme dans l'antre d'un dragon. Après une heure à tourner en rond dans des galeries toutes semblables, vous débouchez dans une salle immense aux colonnes démesurées. Au centre, une statue de maître brasseur haute de cinq mètres porte un tonneau couvert de runes. Puis des cris aigus résonnent tout autour de vous. Des dizaines de gobelins surgissent de l'ombre et vous encerclent, ricanants. Leur chef, coiffé d'un casque romain à crête bien trop grand, le remonte sur ses yeux et s'exclame : « Yah ah ah ! Voici nos nouveaux frères, mes frères ! Du sang neuf pour le maître nécromant ! »",
      gmNotes:
        "Sans torche, on ne va pas loin. Ne pas transformer les galeries en labyrinthe interminable. Un lecteur du nain lit sur le tonneau : « Tonneau sans fond de l'enchanteur runique Grim Bergen » (mais il est en pierre). Les gobelins sont dix fois plus nombreux. Canif se présente, invite à se rendre et danse. Remarquer que leurs « claymores » sont de petites épées le vexe. Trois issues : se rendre (aller au sacrifice) ; négocier en gardant ses armes (Canif propose une ordalie : un champion des héros contre Cure-dent imposant, le troll, qui gagne forcément mais épargne le perdant) ; attaquer à dix contre un (arrêter le combat avant la mort, puis le sacrifice). Dans tous les cas, les héros finissent prisonniers.",
      npcIds: ['canif', 'cure_dent'],
      checks: [
        { situation: 'Déchiffrer les runes du tonneau de la statue', ability: 'intelligence', difficulty: 12, success: "« Tonneau sans fond de l'enchanteur runique Grim Bergen ». Le tonneau est en pierre massive.", failure: 'Des runes naines, illisibles.' },
      ],
      encounter: {
        trigger: "Ordalie contre le troll, ou les héros attaquent la horde",
        enemies: [{ name: 'Cure-dent imposant, troll des cavernes', hp: 14, attack: 4, defense: 13, damage: '1d8+1', initiative: 0, xp: 40 }],
        alternatives: "Se rendre évite le combat. Le combat contre la horde n'est pas gagnable : l'arrêter quand les héros faiblissent et passer au sacrifice.",
      },
      exits: [{ to: 'sacrifice', when: 'Les héros sont capturés, quelle que soit la manière.' }],
    },
    {
      id: 'sacrifice',
      title: 'Le sacrifice humain',
      locationId: 'mine',
      readAloud:
        "Les gobelins vous jettent des guenilles puantes ayant appartenu à d'anciens héros et vous forcent à les enfiler sous la pointe de leurs lames. Vos armes partent « aux bonnes œuvres de Goblin's ville ». On vous attache aux piliers kazads et on vous colle sur le visage de grossiers masques de guerriers gobelins. Canif Rutilant se plante devant vous et se lance dans un interminable monologue, ponctué de petits pas de danse.",
      gmNotes:
        "Canif explique : il faut sacrifier des adorateurs authentiques de Deboulémor, tous gobelins, et aucun gobelin ne veut mourir ; il va donc sacrifier les héros à leur place, déguisés, après les avoir intégrés au clan : « Nous faisons partie du clan. Gloire aux épées du clan ! », repris en chœur. Le rituel consiste à montrer du doigt les sacrifiés, à raconter des blagues sur eux et à se rouler par terre de rire. Puis Canif sort un petit couteau : « Je crois que je vais commencer par saigner celui-là ! » À cet instant, fracas : l'Ordre de la justice fait irruption et massacre les gobelins. Canif ouvre un portail et annonce que « seuls les vrais membres du clan des Claymores peuvent réactiver ce portail » avant de s'y jeter. Le chef des paladins hurle « Tuons les derniers ! » en voyant les héros déguisés. Il faut les convaincre qu'ils ne sont pas des gobelins : ils sont alors détachés mais emmenés comme « traîtres adorateurs de gobelins » devant le grand maître. Insister sur la phrase du portail, elle servira.",
      npcIds: ['canif'],
      checks: [
        { situation: 'Convaincre les paladins enragés de ne pas les tuer', ability: 'charisme', difficulty: 12, success: 'Les paladins baissent leurs épées, perplexes, et vous détachent… pour vous menotter.', failure: 'Une lame passe tout près : 1d4 dégâts avant que le chef ne comprenne le quiproquo.' },
      ],
      exits: [{ to: 'bastion', when: 'Les paladins emmènent les héros au bastion.' }],
    },
    {
      id: 'bastion',
      title: 'Le bastion de la justice',
      locationId: 'bastion',
      readAloud:
        "Toujours affublés de vos guenilles gobelines et les mains liées, vous voilà dans une nef glaciale aux vitraux sévères. Sur un trône de pierre, le grand maître de l'Ordre vous toise. « Vous avez commis le délit d'adoration des dieux orcs. Vous allez donc être jugés pour vos crimes religieux. » Il n'y a ni avocat, ni jury.",
      gmNotes:
        "Mascarade de procès : les héros sont condamnés à mort. Avant d'annoncer la sentence, le grand maître ajoute : « Le seul moyen de ne pas mourir serait de savoir où se trouve ce sorcier qui veut ressusciter le nécromant ! » Les héros doivent se souvenir qu'ils ont été intégrés au clan des Claymores et que le portail s'ouvre pour les membres du clan. Les guider si besoin (jet d'Intelligence). Toute autre idée crédible peut aussi fonctionner. Une fois blanchis, ils sont renvoyés dans la mine avec Vive Flèche pour les surveiller, et l'Ordre leur appose une marque magique pour toujours savoir où ils sont. Fin de l'épisode 1 : accorder l'XP.",
      npcIds: ['grand_maitre', 'vive_fleche'],
      checks: [
        { situation: "Se rappeler les mots de Canif sur le portail et l'intronisation dans le clan", ability: 'intelligence', difficulty: 8, success: "Vous êtes membres du clan des Claymores, et seul un membre du clan peut rouvrir ce portail !", failure: "Rien ne vous revient… le grand maître lève déjà la main." },
        { situation: 'Persuader le grand maître de vous laisser une chance', ability: 'charisme', difficulty: 12, success: "Il vous accorde une chance, sous surveillance.", failure: "Il exige une preuve : il faudra lui parler du portail." },
      ],
      rewards: 'Fin de l\'épisode 1 : 100 XP.',
      exits: [{ to: 'portail', when: 'Les héros retournent à la mine avec Vive Flèche.' }],
    },
    {
      id: 'portail',
      title: 'Le portail des Claymores',
      locationId: 'mine',
      readAloud:
        "Trois jours de marche plus tard, vous revoici dans les cavernes naines. L'air est froid, l'odeur du sang séché flotte encore. Il suffit de suivre les cadavres de gobelins pour retrouver les piliers où vous avez failli mourir. Vive Flèche marche derrière vous, la main jamais loin de son arc. « Le tonneau ? Ces ruines ont été fouillées cent fois. Votre tuyau était foireux à plus d'un titre. Avancez. »",
      gmNotes:
        "Un jet de Perception révèle une inscription bleue qui flotte dans l'air, mêlée de signes gobelins. Pour la lire : langue orque, magie, ou à défaut Vive Flèche (sans qu'elle fasse tout). Texte : « Avec la voix du chef, et le plus justement possible, tu annonceras le nom du clan par trois fois. Exerce-toi, car tu dois réaliser en même temps les bons pas ! Attention, tu ne pourras tenter ta chance que trois fois ; si tu échoues, le portail définitivement se fermera AH AH AH ! signé Canif Rutilant ». Il faut crier trois fois « clan des Claymores » avec la voix chantante de Canif ET faire sa danse en rythme. Ce que les héros ignorent : chacun a droit à trois essais (les gobelins ne sont pas pointilleux). Encourager les joueurs à jouer la scène. Si tous échouent leurs trois essais, le portail se ferme. Une fois ouvert, Vive Flèche les pousse à le traverser malgré leurs craintes.",
      npcIds: ['vive_fleche'],
      checks: [
        { situation: "Repérer l'inscription magique sur le lieu du sacrifice", ability: 'perception', difficulty: 12, success: 'Une écriture bleue flotte dans l\'air entre deux piliers.', failure: 'Vive Flèche soupire et vous montre la lueur du doigt.' },
        { situation: 'Imiter la voix de Canif et sa danse en même temps (trois essais par héros)', ability: 'charisme', difficulty: 16, success: 'Le portail s\'ouvre dans un tourbillon verdâtre qui sent le marécage.', failure: 'Le portail grésille. Un essai de moins.' },
      ],
      exits: [
        { to: 'jungle', when: 'Le portail est ouvert et les héros le traversent.' },
        { to: 'portail_ferme', when: 'Tous les héros ont raté leurs trois essais.' },
      ],
    },
    {
      id: 'portail_ferme',
      title: 'Le portail scellé',
      locationId: 'mine',
      ending: 'défaite',
      readAloud:
        "Dans un dernier crépitement moqueur, l'écriture bleue s'efface et le portail s'éteint pour toujours. Le silence retombe sur les cavernes. Derrière vous, vous entendez Vive Flèche encocher lentement une flèche. « Le grand maître ne sera pas content. »",
      gmNotes:
        "La piste des gobelins est perdue. Les héros peuvent fuir la marque de l'Ordre ou tenter de convaincre Vive Flèche, mais Canif lèvera son nécromant sans eux. Fin de la campagne, ou nouvelle piste à improviser.",
      exits: [],
    },
    {
      id: 'jungle',
      title: 'Bienvenue dans la jungle',
      locationId: 'jungle',
      readAloud:
        "Le portail se referme derrière vous avec un bruit de succion. Une chaleur moite vous saute au visage. Il fait nuit, et tout autour de vous la jungle bruisse de cris inconnus, de bourdonnements et de gouttes qui tombent des feuilles géantes. Les moustiques vous ont déjà trouvés.",
      gmNotes:
        "Le portail se rouvre de l'autre côté de la même façon. Un jet de Perception révèle les traces du clan, qui grimpent vers une colline. Au sommet, autour d'un feu mourant, une arrière-garde de gobelins (autant que les héros) somnole. Options : attaque surprise (une attaque gratuite), contournement discret (Agilité, sinon combat), ou combat frontal. Ensuite les traces mènent vers une montagne de silex coupants : un jet d'Endurance ou d'Agilité au choix pour ne pas se blesser (1d4 dégâts en cas d'échec).",
      npcIds: ['vive_fleche'],
      checks: [
        { situation: 'Retrouver les traces du clan dans la jungle', ability: 'perception', difficulty: 12, success: 'Des empreintes de petits pieds et des déchets gobelins mènent vers une colline.', failure: 'Vous tournez en rond une heure avant que Vive Flèche ne trouve la piste.' },
        { situation: "Contourner l'arrière-garde sans la réveiller", ability: 'agilite', difficulty: 16, success: 'Vous passez comme des ombres.', failure: 'Une branche craque : les gobelins bondissent sur leurs armes.' },
        { situation: 'Grimper la montagne de silex sans se couper', ability: 'endurance', difficulty: 12, success: 'Vous arrivez au sommet sans une égratignure.', failure: 'Glissade sur les pierres coupantes : 1d4 dégâts.' },
      ],
      encounter: {
        trigger: "Les héros attaquent l'arrière-garde ou se font repérer",
        enemies: [
          { name: 'Guerrier gobelin (chef)', hp: 6, attack: 2, defense: 12, damage: '1d6', initiative: 2, xp: 20 },
          { name: 'Gobelin pas malin', hp: 4, attack: 1, defense: 10, damage: '1d4', initiative: 1, xp: 10 },
          { name: 'Gobelin pas malin', hp: 4, attack: 1, defense: 10, damage: '1d4', initiative: 1, xp: 10 },
        ],
        alternatives: "Les gobelins pas malins sont couards : ils s'enfuient dès que leur chef tombe.",
      },
      exits: [{ to: 'dragon', when: 'Les héros atteignent le plateau au sommet.' }],
    },
    {
      id: 'dragon',
      title: 'Gare au dragon',
      locationId: 'antre_dragon',
      readAloud:
        "Le chemin s'achève sur un plateau rocailleux, humide et lugubre, sous un ciel si chargé qu'aucune étoile ne perce. Des corps jonchent le sol : des gobelins, mâchouillés et roussis. Devant vous s'ouvre une caverne dont l'entrée fait quinze mètres de haut. Au fond, deux immenses yeux rouges s'allument. Une voix grave fait vibrer les cailloux sous vos pieds : « Encore des gobelins qui veulent en découdre ? Décidément, ma pierre draconique vous est indispensable ! Approchez, que ma mâchoire et mon feu en finissent avec vous ! »",
      gmNotes:
        "C'est un grand dragon de cuivre. L'attaquer serait suicidaire : un jet de Charisme (sang-froid) pour ne pas fuir de terreur. S'ils parlent, le dragon explique que les gobelins ont voulu voler son cœur pour ressusciter un nécromant. « Je les ai mâchouillés mais pas mangés : je suis végétarien ! » Il sait où ils ont fui, mais exige un service : sa molaire abîmée le fait souffrir, il faut trouver une pierre de fluor au fond du gouffre derrière sa caverne, avant l'aube. Il leur confie une gemme qui clignote de plus en plus vite près du fluor. Ajouter une quête secondaire « La rage de dents du dragon ».",
      npcIds: ['dragon', 'vive_fleche'],
      checks: [
        { situation: 'Reconnaître la créature et comprendre à qui on parle', ability: 'intelligence', difficulty: 8, success: 'Un grand dragon de cuivre : rusé, bavard, et réputé moins cruel que ses cousins.', failure: 'Un dragon. Énorme. C\'est tout ce que votre cerveau accepte de dire.' },
        { situation: "Garder son sang-froid face au dragon s'il se met en colère", ability: 'charisme', difficulty: 20, success: 'Vous tenez bon sous son regard.', failure: 'Vos jambes décident pour vous : vous fuyez à toutes jambes.' },
      ],
      exits: [{ to: 'gouffre', when: 'Les héros acceptent le marché et descendent dans le gouffre.' }],
    },
    {
      id: 'gouffre',
      title: 'Le concours de lancer de Minus',
      locationId: 'gouffre',
      readAloud:
        "La descente est un cauchemar de roche abrupte et d'obscurité. Tout en bas, un sentier jonché d'ossements mène à une forteresse troglodyte aux proportions démesurées. Un panneau écrit en langue commune annonce : « Concours de lancer de Minus. Réservé aux ogres et aux géants ». À l'intérieur, des colosses portant des dossards numérotés se bousculent autour de cages remplies de gobelins et de gnolls. Face à un podium, une gigantesque toile d'araignée attend les projectiles. Et sur un piédestal gardé par huit ogres trône une coupe en or massif sertie d'une pierre luisante. La gemme du dragon clignote comme une folle.",
      gmNotes:
        "Descente : série de jets d'Agilité ; Vive Flèche encorde les héros d'en haut. Un raté donne droit à un jet de la dernière chance, et les autres peuvent retenir le chuteur à la corde (Force). Dans la forteresse, voler la coupe est impossible (huit gardes et une foule en colère). Se faufiler demande de la discrétion, sinon capture. Les héros remarquent que les colosses choisissent leurs projectiles dans les cages : y entrer (Agilité) ou se faire attraper (1 PV de bourre-pif). Personne ne les choisit. Ils repèrent le petit géant qui pleure : dossard zéro, dernier à choisir, banni s'il perd. Marché : ils deviennent ses projectiles, il partage la coupe. Chaque héros est lancé une fois et doit rester droit et viser le centre de la toile (Agilité) ; il faut que deux tiers des héros réussissent. Toute triche astucieuse (droguer les autres projectiles, coller les gants des lanceurs, déclencher une bagarre) donne l'avantage. Victoire : le petit géant reçoit la coupe, leur offre la pierre de fluor, leur montre un escalier secret pour remonter et les invite au village de la colline aux corbeaux, à l'est. Ajouter une quête secondaire « Alliés : le clan du petit géant ».",
      npcIds: ['petit_geant'],
      checks: [
        { situation: 'Descendre la paroi du gouffre (un jet par étape)', ability: 'agilite', difficulty: 12, success: 'Prise après prise, vous descendez.', failure: 'Vous glissez ! Jet de la dernière chance, ou un compagnon vous retient à la corde (Force 12). Sinon 1d6 dégâts.' },
        { situation: 'Se faufiler entre les colosses sans se faire attraper', ability: 'agilite', difficulty: 12, success: 'Vous passez entre des jambes grosses comme des tours.', failure: 'Une main énorme vous saisit et vous jette dans une cage.' },
        { situation: 'Être lancé droit comme un piquet au centre de la toile', ability: 'agilite', difficulty: 16, success: 'Plein centre ! La foule rugit.', failure: 'Vous tournoyez et finissez dans un coin de la toile.' },
      ],
      rewards: 'La pierre de fluor. 60 XP. Un allié pour la suite.',
      exits: [{ to: 'dentiste', when: 'Les héros remontent avec la pierre de fluor.' }],
    },
    {
      id: 'dentiste',
      title: 'Dentistes pour dragon',
      locationId: 'antre_dragon',
      readAloud:
        "Le dragon vous accueille d'une tout autre humeur en voyant la pierre de fluor. « Mes petits amis ! Je savais que je pouvais compter sur vous. Et n'ayez crainte : je suis végétarien. » Il ouvre grand sa gueule, large comme une grotte. Une odeur abominable vous saute au nez, un mélange de gaz inflammable et de gobelin pas frais. Et du fond de cette bouche, une petite voix aiguë hurle : « Au secours ! »",
      gmNotes:
        "Jet d'Endurance pour ne pas être malade. Aucune flamme dans la gueule : le gaz exploserait (le rappeler si un héros allume une torche). Un gobelin est coincé entre deux prémolaires. Il jure que le dragon a attaqué son clan, qu'il n'a rien à voir avec Canif, et que le dragon guéri dévorera les héros et rasera la région ; si on le libère, il les mènera au clan. Le dragon traite le gobelin de menteur. En s'approchant (Perception, plus facile avec une lumière magique), on voit sur son avant-bras le tatouage d'une claymore. S'ils libèrent le gobelin, le dragon menace de recracher tout le monde : faire comprendre que le gobelin est perfide. Une fois la dent frottée au fluor, le dragon, reconnaissant, montre sur une carte la plaine où Canif lève son armée et promet de les aider dans une bataille future. Récompense : un objet magique (arme, armure ou potion). Fin de l'épisode 2. Ajouter une quête secondaire « Alliés : le grand dragon ».",
      npcIds: ['dragon', 'gobelin_menteur'],
      checks: [
        { situation: "Supporter l'haleine du dragon sans être malade", ability: 'endurance', difficulty: 16, success: 'Vous retenez votre souffle et votre dîner.', failure: 'Vous êtes malade comme un chien : désavantage le temps de la scène.' },
        { situation: 'Examiner le gobelin coincé dans la pénombre', ability: 'perception', difficulty: 16, success: 'Une claymore tatouée sur son avant-bras : il est du clan de Canif !', failure: 'Il fait trop sombre pour voir quoi que ce soit.' },
      ],
      rewards: "Un objet magique offert par le dragon. Fin de l'épisode 2 : 120 XP.",
      exits: [{ to: 'recrutement', when: 'Les héros rentrent faire leur rapport au grand maître.' }],
    },
    {
      id: 'recrutement',
      title: 'La campagne de recrutement',
      locationId: 'palais_bourgmestre',
      readAloud:
        "Le grand maître a écouté votre rapport sans un mot. « La bataille est inévitable. Le conseil de la justice réunira tous les paladins possibles. Vous, allez convaincre le Bourgmestre de nous prêter ses gardes et de laisser ses villageois s'enrôler. » Vous voici de retour au bourg, dans ses rues familières… et devant la porte de l'auberge, appuyé contre un mur, Maître Vindepot vous attend avec ses gros bras.",
      gmNotes:
        "Les héros peuvent revoir leurs proches et faire des emplettes. Vindepot réclame sa dette, intérêts compris : payer, ou se battre (autant de gros bras que de héros, l'usurier regarde de loin). Ce combat doit être gagné par les héros pour leur redonner confiance : Vindepot efface alors la dette et s'enfuit en courant. Au palais, le Bourgmestre écoute mais doute (« les gobelins n'ont jamais passé nos frontières »). Il faut un vrai rapport, persuasif. Au milieu de la discussion, fracas de verre et cris : la fille du Bourgmestre est enlevée ! Les héros arrivent trop tard dans ses appartements, où des gobelins ninjas (pyjamas noirs, shurikens, katanas) les attendent. Un ninja survivant supplie qu'on l'épargne : la fille sera sacrifiée au lever du soleil sur la colline luisante, au-dessus de la plaine où se masse l'armée gobeline. Le Bourgmestre supplie les héros de la sauver et lève tous ses hommes.",
      npcIds: ['vindepot', 'bourgmestre', 'grand_maitre'],
      checks: [
        { situation: "Convaincre le Bourgmestre de l'urgence", ability: 'charisme', difficulty: 12, success: 'Il pâlit et commence à vous croire… quand une vitre vole en éclats.', failure: 'Il hausse les épaules… quand une vitre vole en éclats.' },
        { situation: 'Repérer les gobelins ninjas dissimulés dans les appartements', ability: 'perception', difficulty: 12, success: 'Vous voyez une ombre bouger sous un rideau : pas de surprise.', failure: 'Un shuriken siffle hors de nulle part : les ninjas frappent en premier.' },
      ],
      encounter: {
        trigger: 'Bagarre contre les gros bras, puis les gobelins ninjas dans les appartements',
        enemies: [
          { name: 'Gobelin ninja', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 35 },
          { name: 'Gobelin ninja', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 35 },
        ],
        alternatives: "Pour les gros bras de Vindepot, utiliser autant d'adversaires que de héros (PV 5, attaque 1, défense 10, dégâts 1d4) : ils doivent perdre. Ajuster le nombre de ninjas à la force du groupe.",
      },
      rewards: 'Dette effacée si les gros bras sont battus. 40 XP.',
      exits: [{ to: 'colline', when: 'Les héros partent au galop vers la colline luisante.' }],
    },
    {
      id: 'colline',
      title: 'La colline luisante',
      locationId: 'colline_luisante',
      readAloud:
        "Après une demi-heure de galop, vous mettez pied à terre au pied de la colline luisante. Au sommet, un feu de camp éclaire une tente gardée, entourée de lits de camp où des silhouettes en pyjama noir dorment à poings fermés. Quelques gardes font le guet. Et au-delà, en contrebas, la plaine entière scintille de milliers de feux : l'armée de Canif Rutilant.",
      gmNotes:
        "Infiltration conseillée : jets d'Agilité réguliers pour ne pas attirer un garde. Assommer un garde en le prenant à revers (Force) réduit la difficulté. Se glisser dans la tente, libérer la fille du Bourgmestre et repartir en silence. L'option frontale oppose les héros à deux fois plus de ninjas qu'eux : possible mais très coûteux. Une fois la fille délivrée, les héros voient l'armée : trois fois plus nombreuse que tout ce que l'Ordre et le bourg peuvent rassembler. Il faudra une aide extérieure.",
      npcIds: ['fille_bourgmestre'],
      checks: [
        { situation: 'Se faufiler dans le camp sans alerter les gardes', ability: 'agilite', difficulty: 12, success: 'Pas un bruit, pas une ombre.', failure: 'Un garde se retourne et plisse les yeux : prochain jet plus difficile, ou l\'alerte est donnée.' },
        { situation: 'Assommer un garde par surprise', ability: 'force', difficulty: 16, success: 'Le garde s\'effondre sans un cri.', failure: 'Il se débat et gargouille : ses voisins remuent.' },
      ],
      encounter: {
        trigger: "L'alerte est donnée ou les héros attaquent le camp",
        enemies: [
          { name: 'Gobelin ninja', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 35 },
          { name: 'Gobelin ninja', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 35 },
          { name: 'Gobelin ninja', hp: 9, attack: 3, defense: 13, damage: '1d6+1', initiative: 4, xp: 35 },
        ],
        alternatives: "L'infiltration évite le combat. Fuir à cheval avec la fille est possible si l'alerte est donnée tard.",
      },
      rewards: '50 XP pour la libération de la fille du Bourgmestre.',
      exits: [{ to: 'allies', when: 'Les héros ramènent la fille du Bourgmestre au bourg.' }],
    },
    {
      id: 'allies',
      title: "L'aide qui venait de loin",
      locationId: 'palais_bourgmestre',
      readAloud:
        "Le bourg grouille de paladins en armure : l'Ordre tout entier est là. Dans la salle du Conseil, le Bourgmestre serre sa fille dans ses bras en pleurant de joie. Mais quand vous annoncez la taille de l'armée gobeline, un silence de mort tombe sur l'assemblée. Le Bourgmestre se tourne vers vous : « Des aventuriers comme vous doivent bien avoir des amis, des gens qui vous sont redevables ? »",
      gmNotes:
        "Laisser les joueurs fouiller leur mémoire : la Reine des fées, le petit géant, le grand dragon. Les rappeler s'ils les ont oubliés. Ils peuvent aller les voir ensemble ou se séparer. La Reine, outrée, promet ses lanciers pixies et ses fées dont les charmes empêchent les gobelins de se battre. Le clan du petit géant, désormais le plus populaire des géants, acclame les héros : « Êtes-vous prêts à massacrer des gobelins, mes frères et sœurs titanesques ? » Pour le dragon, inutile de se déplacer : un soldat accourt annoncer qu'un grand dragon s'est posé sur la colline luisante pour combattre à leurs côtés. Mettre à jour les quêtes d'alliés. Si un allié manque (Reine non aidée…), la bataille sera plus dure.",
      npcIds: ['bourgmestre', 'grand_maitre', 'fille_bourgmestre', 'reine_fees', 'petit_geant'],
      checks: [
        { situation: 'Se souvenir de qui leur doit un service', ability: 'intelligence', difficulty: 8, success: 'La Reine des fées, le petit géant et le dragon !', failure: 'Il faudra un coup de pouce du Bourgmestre pour vous rafraîchir la mémoire.' },
      ],
      exits: [{ to: 'bataille', when: 'Toutes les troupes sont rassemblées face à la plaine.' }],
    },
    {
      id: 'bataille',
      title: 'Le compte à rebours final',
      locationId: 'champ_bataille',
      ending: 'victoire',
      readAloud:
        "À l'aube, les deux armées se font face. D'un côté, les paladins, les villageois, les lanciers pixies, les fées, le clan des géants et, perché sur la colline, un dragon de cuivre. De l'autre, une marée verte qui hurle « Gloire aux épées du clan ! ». Les géants écrasent les gobelins par dizaines, les fées charment et les pixies piquent, le dragon carbonise des colonnes entières. Puis, derrière l'arrière-garde gobeline, une lueur bleu nuit s'élève dans un vacarme de tonnerre. Canif Rutilant danse. Et une silhouette se dresse d'outre-tombe : Deboulémor le Nécromant… avec des couettes blondes et des boucles d'oreilles de demoiselle.",
      gmNotes:
        "Faute de mieux, Canif a sacrifié un orc déguisé en fille du Bourgmestre, avec quelques-uns de ses cheveux : Deboulémor revient ridicule et affaibli. « Mais qui ose m'invoquer ainsi ? » Il veut relever tous les gobelins morts, mais ses pouvoirs altérés ne lèvent qu'un troupeau de vaches, bœufs et moutons zombies : le champ est un ancien abattoir. Ces bestiaux zombies affamés sont le dernier combat des héros. Ne jamais faire affronter Deboulémor de front. Quand les bêtes tombent, Deboulémor disparaît dans un nuage noir en criant « Je reviendrai ! ». Les gobelins fuient en désordre ; Canif est trouvé caché derrière un tas de vaches zombies et emmené par le grand maître. Les héros sont fêtés en héros, avec crédit illimité à l'auberge. Peut-être pourront-ils enfin chercher le vrai tonneau sans fond… Mettre la quête « claymores » en réussie.",
      npcIds: ['canif', 'deboulemor', 'grand_maitre', 'dragon'],
      encounter: {
        trigger: 'Les bestiaux zombies chargent la position des héros',
        enemies: [
          { name: 'Vache zombie', hp: 8, attack: 2, defense: 10, damage: '1d6', initiative: -1, xp: 20 },
          { name: 'Mouton zombie', hp: 4, attack: 1, defense: 11, damage: '1d4', initiative: 1, xp: 10 },
          { name: 'Mouton zombie', hp: 4, attack: 1, defense: 11, damage: '1d4', initiative: 1, xp: 10 },
          { name: 'Bœuf zombie', hp: 12, attack: 3, defense: 11, damage: '1d8', initiative: -1, xp: 35 },
        ],
        alternatives: 'Les alliés (fées, géants, dragon) peuvent intervenir si les héros sont en difficulté : la victoire est collective.',
      },
      rewards: "Crédit illimité à l'auberge, gloire éternelle. Fin de la campagne : 200 XP.",
      exits: [],
    },
  ],
};
