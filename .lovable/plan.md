Ajustements ciblés sur `src/pages/AvatarStudio.tsx` (aucun changement backend).

## 1. Auto-approbation (rappel — inchangé du plan précédent)

Génération HD réussie avec `QA ≥ 75` → passage automatique à `approved`. En dessous du seuil, on reste en `generated` avec bouton « Approuver quand même ». Import manuel : idem, approbation manuelle.

## 2. Modale — badge QA toujours visible

**Précision demandée** : il n'existe **aucun forçage à QA = 100**. Le pipeline (`generate-avatar/index.ts`) accepte tout HD dont `global_score ≥ 75` (`QA_PASS`). Les scores réels varient typiquement entre 75 et 100 selon la difficulté du sujet. Si vous ne voyez que 100, c'est parce que les cas récents étaient faciles à noter, pas parce que le code filtre.

**Correctif modale** :
- Afficher le badge « QA {valeur} » **dans tous les cas** où `qa_score` est défini (retirer la condition `< 100`).
- Placement : petit overlay `text-[10px]` en bas-droit de l'image de la modale, fond `bg-background/85`, couleur du texte modulée : vert (≥ 90), ambre (75-89), rouge (<75).
- Retirer le badge « Hist. » et la ligne « il y a X jours » (comme convenu).
- Retirer aussi le libellé technique `nano-banana-2` / typeLabel dupliqué si redondant avec le badge QA (à confirmer visuellement en implémentation).

## 3. Vignettes de la grille

**Repositionner les badges Aperçu / HD** :
- Les conserver, mais les déplacer en **bas-centre** de la vignette (petit chip absolu `bottom-1 left-1/2 -translate-x-1/2`).
- Nouvelle couleur pour « HD » : **bleu ardoise** (`bg-slate-700 text-white`) — franchement distinct du vert primaire de « Actif ».
- « Aperçu » reste ambre (`bg-amber-400 text-amber-950`).
- Comme le coin haut-droit est libéré, remettre la corbeille en `right-1 top-1` sans décalage.
- La date en bas-gauche reste ; le QA passe en bas-droit (position d'origine, cohabite avec le badge central).

## 4. Nouvel aperçu contextuel dans la modale (image jointe comme référence)

Ajouter, en haut de la modale de détail d'une version, un **aperçu « tel qu'affiché dans le parcours donateur »** :

- Rendu via le composant existant `<BeneficiaryAvatar />` (mêmes props que celles utilisées sur les cartes bénéficiaires du funnel).
- Utilise :
  - `avatarUrl = v.image_url` (la version consultée, pas nécessairement l'active),
  - `backgroundSeed = selected.id` (même seed que celle utilisée en production, ce qui reproduit **exactement** le fond aléatoire depuis le bucket `avatar-backgrounds`),
  - `framing = readFramingFromRow(selected)` (respect du zoom/offset appliqué),
  - `size = "lg"` (120 px, comme sur les listes).
- Placement : à droite de l'image principale de la modale, dans un petit cartouche « Aperçu parcours donateur », avec libellé sous le rond du type « Prénom · Région ».
- Le rond utilise le vrai fond aléatoire déterministe déjà en place — **aucun appel supplémentaire à Supabase** (le hook `useAvatarBackground` a un cache module).
- L'utilisateur voit ainsi immédiatement le rendu final sans passer par « Ouvrir la fiche ».

Le bouton « Ouvrir la fiche telle qu'elle apparaîtra » reste disponible pour la fiche complète, mais devient secondaire.

## Portée

- Fichier unique modifié : `src/pages/AvatarStudio.tsx`.
- Imports ajoutés : `BeneficiaryAvatar`, `readFramingFromRow` (déjà présent probablement).
- Aucun changement backend, pas de migration, pas de consommation de crédits IA.
