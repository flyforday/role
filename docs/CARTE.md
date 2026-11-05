# Carte du lieu en temps réel

## Jouer

La carte apparaît au-dessus du récit, en solo et dans les salles multijoueur. Elle représente le lieu actuel sur une grille de 14 × 10 cases. Les joueurs utilisent leurs portraits ; les PNJ connus et présents, les compagnons et les ennemis visibles pendant un combat ont aussi un pion. La légende permet de retrouver chaque nom. Un PNJ mort ou situé ailleurs n’est pas affiché.

Sélectionner son pion puis une case voisine éclairée, ou utiliser les quatre flèches, déplace d’une case. Les murs, arbres, rochers et l’eau bloquent le passage ; les portes sont franchissables. Un pion ne peut pas occuper la case d’un autre. Cliquer le pion d’autrui permet de le consulter, pas de le déplacer. L’hôte peut déplacer les PNJ. Le zoom et le défilement du plan fonctionnent aussi sur petit écran. « Masquer la carte » redonne la place au récit.

Les déplacements libres ne consomment ni appel IA ni tour narratif. Ils ne déclenchent pas automatiquement de rencontre ou de changement de lieu : pour agir ou voyager, utiliser l’action au MJ. Pendant la narration et en combat, la carte n’accepte aucun déplacement libre ; les manœuvres de combat restent déclarées au MJ. Cette version ne remplace pas les règles d’initiative par un combat tactique fondé sur la distance.

## Décor et PNJ

Un plan indicatif stable est disponible immédiatement, y compris pour les anciennes sauvegardes. Il suggère un intérieur, des bois ou une rive à partir du nom et de la description publique du lieu. Ce plan n’est pas une reconstitution exacte d’un texte ni un système de brouillard de guerre. Le MJ peut le préciser avec les éléments établis dans le récit, sans dévoiler de secret.

- `map_tiles` : modifier jusqu’à 24 cases par tour dans le lieu actuel. Terrains autorisés : sol, herbe, chemin, mur, eau, arbre, rocher, porte, table et feu. Impossible de poser un obstacle sur un pion ou de changer le décor pendant un combat.
- `map_position` : déplacer un PNJ présent ou un compagnon, sur un trajet libre de 6 cases maximum par cible et par tour. Le MJ ne prend jamais le contrôle des déplacements d’un joueur. Les positions sont verrouillées pendant un combat.

Ces opérations existent dans `StateChange`, `StateChangeSchema`, `GM_OUTPUT_SCHEMA` et `applyChanges`. Les budgets sont dans `DEFAULT_LIMITS` et partagés entre les différentes réponses IA du même tour. Le contexte du MJ contient le plan et les coordonnées.

## Sauvegarde et multijoueur

`GameState.maps` est facultatif et indexé par identifiant de lieu. Il conserve le décor et les positions, y compris lors du retour dans un lieu et dans les exports JSON. Le moteur ignore les cases et positions importées mal formées. Les annulations et régénérations existantes restaurent aussi la carte contenue dans l’état précédent.

En ligne, `map_move` est une demande dans la file de la salle. Elle contient le pion, le lieu, l’origine et la destination. La salle vérifie le propriétaire (ou les droits d’hôte pour un PNJ), les coordonnées, le lieu, la connexion de l’hôte et la fin de la narration. Une seule demande de déplacement par joueur peut attendre, avec un intervalle minimal de 200 ms entre les demandes acceptées. Une action narrative déjà déclarée n’est pas remplacée par un déplacement.

Le navigateur de l’hôte vérifie ensuite la position d’origine, la case adjacente, les obstacles, l’occupation, la conscience du personnage et l’absence de combat avec la fonction pure `moveOnMap`. Seul l’état validé est diffusé et persisté. Il n’y a pas de déplacement optimiste pouvant diverger entre joueurs. Les demandes sont traitées avant la résolution narrative et attendent le retour de l’hôte si nécessaire. Les écritures WebSocket de la salle sont sérialisées pour conserver les demandes simultanées. Une reconnexion ou une reprise de main retrouve le dernier état et libère un verrou de narration abandonné.

Le message `map_state`, réservé à l’hôte, diffuse seulement le plan et les positions du lieu, sans renvoyer l’historique ni la pile d’annulation à chaque pas. La salle conserve l’état complet pour la reconnexion. Ce message ne résout que des demandes de déplacement ; les actions narratives en attente sont conservées.

La carte est dessinée localement, sans bibliothèque de cartographie, images distantes, clé API ni service payant supplémentaire.
