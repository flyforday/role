# Portraits des personnages

## Retouche de la paire naine

Les cornes apparues lors de la première génération ont été supprimées avec l’outil intégré. Consigne exacte :

```text
Use case: precise-object-edit. Edit target: attached paired dwarf portraits. Change ONLY the two horn shapes growing from each dwarf's head. Dwarves must have NO HORNS, NO ANTLERS, NO HELMETS, NO animal ears. Remove all four horns completely, replacing them with the same plain cream background and where necessary matching red or brown hair. Preserve both dwarf faces, humanlike round ears, noses, eyes, braids, beard, expressions, clothing, black linework, colors, composition, image size, 2:1 paired square layout and all other details exactly. These are humanoid dwarves, with ordinary hair on top of their heads.
```


Les 24 portraits originaux sont générés avec l’outil intégré de création d’images, puis fournis avec l’application. Aucun appel à un service d’images n’est effectué pendant les parties.

Les trois illustrations fournies par l’utilisateur servent de références de direction artistique : contours noirs irréguliers, aplats de couleurs sourdes, expressions cartoon et fantasy humoristique. Elles ne sont pas distribuées dans le dépôt. Les personnages, accessoires et compositions ne doivent pas reproduire ceux des références.

## Fichiers et sélection

- `apps/web/src/assets/portraits/<race>.jpg` : une paire de portraits carrés côte à côte, 1 024 × 512 px.
- Deux portraits par race : féminin à gauche et masculin à droite, au libre choix du joueur.
- Les identifiants `<race>-1` et `<race>-2` sont stables, indépendants de la classe. Seuls ces identifiants sont enregistrés dans le personnage.
- Le composant `CharacterPortrait` affiche la moitié correspondante. Sans portrait connu, il affiche une initiale ; il ne charge aucune URL issue d’une sauvegarde.
- Les versions PNG de travail ne sont pas incluses afin de limiter la taille du jeu.

## Consignes exactes de génération

Les consignes sont conservées dans leur langue d’envoi à l’outil pour permettre de reproduire la direction artistique.

### humain

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: HUMANS, round human ears, warm brown skin woman with curly dark hair, freckled light skin man with messy auburn hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### elfe

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: ELVES, distinctly long pointed ears and narrow faces, amber skin woman with long blue-black braid, pale skin man with chin-length silver hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### nain

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: DWARVES, broad square faces and large noses, ruddy woman with thick red braids, tan older man with huge braided brown beard.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### orc

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: ORCS, green-gray skin, strong heavy jaws and two upward lower tusks, olive green woman with short dark mohawk, slate green man with tied black hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### demi-orc

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: HALF-ORCS, mostly human faces with broad noses, subtly pointed ears and small lower tusks, olive skin woman with curly hair, gray-green skin man with short brown hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### demi-elfe

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: HALF-ELVES, mainly human features with short gently pointed ears, warm brown skin woman with tied auburn hair, freckled light skin man with messy dark hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### gobelin

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: GOBLINS, moss-green skin, huge triangular batlike ears, giant yellow eyes, wide expressive mouths and small uneven teeth, woman with short black topknot, man with messy brown hair.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### gnome

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: GNOMES, very expressive small faces with prominent round noses and slightly pointed ears, rosy woman with curly pale hair, brown skin man with swept-up gray hair and tiny beard.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### halfelin

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: HALFLINGS, very rounded youthful-looking ADULT faces, small round ears, freckles and curly hair, tan woman with dark curls, light skin man with ginger curls and sideburns.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### drakeide

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: DRAGON FOLK, fully reptilian dragon heads with short snouts, visible scales and swept-back horns, woman with turquoise scales and cream horns, man with rust-red scales and dark charcoal horns.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### felin

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: CAT FOLK, fully feline heads with fur, whiskers, upright cat ears and expressive eyes, orange tabby woman with green eyes, charcoal gray cat man with amber eyes.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```

### cornu

```text
Use case: stylized-concept. Asset type: paired player portraits for an original fantasy tabletop RPG. Use the attached images ONLY as references for general cartoon visual qualities: loose irregular hand-inked bold black outlines, flat muted earthy colors, very simple graphic shapes, oversized expressive round eyes, awkward charming faces, understated absurd humor and old-school fantasy zine illustration. Create ORIGINAL designs, do not copy any supplied characters, poses, logos, lettering or costumes.
Create ONE landscape image in exactly 2:1 ratio split into TWO equal square portrait cells side by side. LEFT is a feminine adult, RIGHT is a masculine adult. Species and distinctive appearances: HORNED HUMANOIDS, humanlike faces with curved horns, pointed ears and unusual eyes, dusty lilac skin woman with short black curls and cream horns, muted red skin man with swept dark hair and charcoal horns.
Both are HEAD AND SHOULDERS ONLY, same scale, head centered within its own square cell, ears and horns completely visible with generous padding at the sides and top. Wear simple neutral patched travel tunics, cloth scarves or modest waistcoats, no class-specific armor, weapons, instruments, magic effects or symbols. Different amusing but sympathetic expressions, original individual faces. Clean plain warm cream background for each cell, no dividing line, no text, no frame, no scenery, no other objects. Crisp black line art, VERY flat matte fills, almost no shading, no gradients, no painterly texture, no realism, no 3D. Portraits must be readable as small game avatars.
```


