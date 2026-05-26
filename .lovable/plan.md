## Objectif

Produire **une seule planche PNG** (downloadable artifact) qui montre, côte à côte, le **même portrait de bénéficiaire** (avatar déjà généré, récupéré depuis Supabase) décliné sur **~12 fonds abstraits différents** issus des familles proposées au tour précédent. Tu pourras ainsi juger visuellement ce qui marche.

Aucun changement de code applicatif. Aucun déploiement. Aucune modification de l'avatar studio. C'est un livrable visuel pour décision.

## Méthode

1. **Récupérer un avatar existant**
   - Requête `supabase--read_query` sur la table `beneficiaries` : prendre le premier bénéficiaire avec `avatar_url IS NOT NULL` (de préférence cadrage chest-up classique, p. ex. Irina si elle a un avatar).
   - Télécharger l'image source.
   - Détourer automatiquement le sujet du fond actuel via segmentation (rembg / fond uniforme + alpha) pour pouvoir le recomposer sur n'importe quel arrière-plan.

2. **Générer 12 fonds abstraits** en Python (Pillow + numpy), tous au format carré, dans la palette « Soleil Émeraude » (terracotta poudré, sauge, sable, crème, bleu brume, prune fanée, ocre) :
   - `solid_warm` — aplat uni texturé grain crayon
   - `radial_halo` — halo radial centré derrière la tête
   - `gradient_linear` — dégradé bicolore diagonal
   - `arch` — arche colorée haute, fond plus clair en bas
   - `color_block_2zones` — deux aplats horizontaux
   - `blob_organic` — formes blob floues
   - `wash_aquarelle` — lavis aquarelle abstrait (sans bord papier)
   - `dots_soft` — pois larges basse opacité
   - `pencil_hatch` — hachures crayon dispersées
   - `bokeh` — cercles lumineux flous
   - `arcs_geom` — demi-lunes superposées asymétriques
   - `risograph_noise` — bruit organique fin monochrome

3. **Composer la planche**
   - Grille 4 colonnes × 3 rangées sur fond crème.
   - Chaque tuile = cercle (style avatar app) ou carré (style studio), au choix le plus parlant.
   - Sous chaque tuile : petit label (nom de la famille + 1 mot-clé).
   - En haut : titre court « Fonds abstraits — exploration ».
   - Export PNG haute résolution dans `/mnt/documents/avatar-backgrounds-exploration.png`.

4. **QA visuel**
   - Ouvrir le PNG, vérifier : pas de chevauchement, sujet bien centré sur chaque fond, lisibilité des labels, cohérence de palette, aucun fond qui renvoie une info de richesse/pauvreté.
   - Itérer si une déclinaison sort du registre.

5. **Livrer**
   - `<presentation-artifact>` pointant vers le PNG.
   - Court récap : 2-3 fonds qui me semblent les plus pertinents pour le projet, à confirmer par toi avant tout passage en code.

## Hors scope

- Pas de modification du prompt Gemini.
- Pas de génération via Gemini (les fonds sont rendus en Python pour itérer instantanément).
- Une fois ton choix fait, on fera dans un second tour le plan de mise en prod (modif `avatarArtDirection.ts` + sélection déterministe par seed).
