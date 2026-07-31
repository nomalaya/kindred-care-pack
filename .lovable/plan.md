# Régénération conforme au style + ronds profils sans vide

Trois problèmes distincts, trois réponses séparées. Aucune déformation du physique n'est réintroduite : on ne touche jamais aux proportions du sujet.

## 1. Le vide en bas du rond (cas Fatima) — cause et correction

Le rond affiche l'image en `object-contain`, aligné `center bottom`, dans une boîte à marge commune (6 %). Si le PNG source contient lui-même une bande de fond (blanc ou transparent) sous le buste, cette bande est affichée : le sujet « flotte » et laisse un vide au bas du cercle. Le problème n'est donc pas le cercle, mais la **marge interne des fichiers**, différente d'un avatar à l'autre.

Correction : normaliser la *boîte de contenu* des fichiers, sans redimensionner le sujet de façon individuelle.

- Passe « trim » (déterministe, aucun crédit IA) : mesurer la bbox du sujet (déjà implémentée dans `avatarNormalize.ts`), puis produire un canevas carré où :
  - le bas du sujet est **au ras du bord bas** (0 % de fond sous le buste) ;
  - le haut du sujet garde le `HAIR_HEADROOM` commun (cheveux/voile/chapeau jamais coupés) ;
  - le sujet est centré horizontalement sur son axe visage.
- Une seule échelle possible en sortie : celle qui satisfait ces deux bords. Pas de cible de taille de tête, pas d'étirement.
- Résultat : tous les fichiers ont la même géométrie de marges, donc le rond n'a plus rien à corriger et le vide disparaît pour tout le catalogue, pas seulement Fatima.

Côté affichage, `avatarStudio.ts` est simplifié en conséquence : la marge haute reste, l'alignement bas devient exact (le buste est coupé par l'arc), et `STUDIO_SHIFT_Y_PCT` n'a plus lieu d'être.

## 2. Détection des avatars « hors style »

Un audit lisible avant toute régénération, pour ne pas régénérer à l'aveugle :

- Critère de style : comparaison de chaque avatar aux 3 ancres (Léa, Nguyen, Fatima) via un scoring de style (contours à l'encre, grain, palette désaturée, fond blanc) — jugé par Google AI Studio (0 crédit Lovable).
- Critère de cadrage : buste plein bord bas, épaules complètes, cheveux entiers — mesuré par code, pas par IA.
- Sortie : une planche de contrôle + un tableau `à garder / à recadrer (trim seul) / à régénérer`.

Distinction importante : beaucoup d'avatars « mal cadrés » n'ont **pas** besoin de régénération, seulement de la passe trim du point 1. On ne régénère que le vrai drift graphique (rendu vectoriel lisse type Amadou, fond coloré, style photo).

## 3. Régénération conforme au trombinoscope

Pour chaque avatar à régénérer, séquentiellement :

1. Prompt = attributs du bénéficiaire (identité, phénotype, accessoires inchangés) + `STYLE_ANCHOR_BLOCK` avec les 3 ancres en images de référence + bloc de cadrage descriptif (`medium close-up, chest up, full shoulders to borders, upper chest visible`) et prompt négatif (`tight face crop, passport photo, cropped shoulders`).
2. Détourage du fond (module partagé interne).
3. Passe trim du point 1 → géométrie de marges identique à tout le catalogue.
4. QA bloquant : style conforme aux ancres, buste plein bord bas, cheveux entiers. En dessous du seuil → rollback automatique vers la version précédente, aucun avatar publié dégradé.
5. Nouvelle version enregistrée dans `avatar_versions`, statut « à publier » — vous validez avant mise en ligne.

Exécution : par lots de 10, avec journal et planche de contrôle après chaque lot, pour arrêter net si une dérive apparaît.

## Détails techniques

- Fichiers concernés : `supabase/functions/_shared/avatarNormalize.ts` (passe trim, marges bas = 0), `avatarFramingSpec.ts` (constantes de marges), `src/lib/avatarStudio.ts` (alignement bas exact), `supabase/functions/qa-avatar/index.ts` (critère de conformité de style), `supabase/functions/generate-avatar/index.ts` (chaînage génération → détourage → trim → QA).
- Aucun changement de logique métier (matching, panier). Le mode `framed` de l'Avatar Studio reste intact pour l'outillage interne.
- Génération et mesures via Google AI Studio (clé déjà en place) : 0 crédit Lovable.

## Ordre de livraison proposé

1. Passe trim + affichage → vérification immédiate sur Fatima, Léa, Kwame (avant/après en capture).
2. Audit de style du catalogue → tableau de décision.
3. Régénération par lots des seuls avatars réellement hors style.
