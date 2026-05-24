# Uniformiser le cadrage des avatars

## Problème observé

- Image 1 (Fatima 45 ans, Hauts-de-France) : cadrage buste, fond pleine image (cuisine floutée jusqu'aux bords), composition propre — référence attendue.
- Image 2 (Fatima 42 ans, Hauts-de-France) : effet « aquarelle sur feuille » avec bordure blanche/papier visible tout autour, le fond s'arrête net avant les bords — non conforme.

La cause est l'imprécision des consignes de cadrage et de fond dans `buildAvatarPrompt` : le modèle interprète parfois la phrase « hand-applied shading reminiscent of colored pencil + light watercolor wash » + « paper-grain texture » comme une licence pour livrer une illustration encadrée sur papier.

## Changements (frontend / prompt uniquement)

Fichier : `supabase/functions/_shared/avatarArtDirection.ts`

1. Renforcer la section `FRAMING` dans `ART_DIRECTION_INVARIANTS` :
   - Imposer explicitement : image pleine cadre 1:1, fond qui s'étend bord à bord, AUCUNE bordure, AUCUNE marge, AUCUN cadre, AUCUN passe-partout, AUCUN halo blanc autour du sujet.
   - Re-spécifier : buste centré, ~65-75% du cadre, regard doux vers la caméra, fond contextuel flouté allant jusqu'aux quatre bords de l'image.

2. Ajuster la section `SHADING` :
   - Conserver le rendu illustré chaleureux mais retirer la mention de « paper-grain texture » qui pousse le modèle à matérialiser une feuille.

3. Étendre `NEGATIVE_PROMPT` avec :
   - "no white border", "no paper border", "no torn paper edge", "no deckled edge", "no vignette", "no frame", "no passe-partout", "no mat", "no scrapbook look", "no sticker outline", "no rounded corner card", "no watercolor paper texture", "no visible paper grain", "no margin around the illustration", "background must extend fully to all four edges of the image".

Aucun changement de schéma DB, de modèle, ni de logique métier. Pas d'impact sur le moteur de matching ou de panier. Pure mise à jour du prompt d'art direction utilisée par `generate-avatar` et `generate-avatar-batch`.

## Validation

- Régénérer un avatar via Avatar Studio pour Fatima (Hauts-de-France) et vérifier que le fond va jusqu'aux bords, sans bordure de papier.
- Vérifier qu'un avatar masculin et un avatar avec head_covering conservent le même cadrage buste.
