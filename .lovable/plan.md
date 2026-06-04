## Diagnostic

Non, aujourd’hui la logique n’est pas suffisamment fiable pour tous les bénéficiaires déjà générés.

Le bug n’est pas la génération elle-même : il vient de la **source utilisée pour l’édition contrôlée**.

Cas observé sur Léa :

- La version que vous voulez conserver est bien dans `Versions` : l’avatar cheveux blancs.
- Mais quand vous restaurez / utilisez cette version, le studio met surtout à jour `avatar_url` et `avatar_preview_url`.
- Il ne met pas correctement à jour `avatar_source_url`, qui est pourtant la source prioritaire utilisée par la fonction de génération en mode édition.
- En plus, `avatar_generated_traits` peut rester aligné sur le dernier aperçu déjà modifié (`châtain foncé` + `réservé`).

Résultat : quand vous cliquez sur **Générer un aperçu**, l’édition contrôlée peut :

1. repartir d’une mauvaise image source ;
2. croire qu’il n’y a aucun changement à faire ;
3. ou réutiliser un ancien aperçu qui ne correspond plus à la version choisie.

C’est exactement l’inverse de ce que vous voulez : **prendre l’avatar cheveux blancs comme base visuelle, puis seulement modifier cheveux + expression**.

## Correctif à appliquer

### 1. Quand une version est restaurée, elle devient la source officielle de retouche

Dans `restoreVersion()` (`src/pages/AvatarStudio.tsx`) :

- définir `avatar_url = v.image_url` ;
- définir `avatar_preview_url = null` pour ne pas garder un ancien aperçu concurrent ;
- définir `avatar_source_url = v.image_url` ;
- remettre `avatar_status = "validated"` ;
- conserver le statut workflow cohérent (`generated` ou approuvé ensuite par l’utilisateur).

Ainsi, si vous cliquez sur la version cheveux blancs puis générez un aperçu, l’édition contrôlée partira bien de cette image-là.

### 2. Recréer un snapshot d’attributs cohérent avec la version restaurée

Quand une version est restaurée, on doit reconstruire `avatar_generated_traits` à partir des attributs actuels, mais avec les valeurs visuelles de référence de la version restaurée quand elles sont connues.

Pour Léa, comme la version restaurée est l’avatar cheveux blancs :

- la source visuelle = cheveux blancs ;
- les attributs actuels demandés = châtain foncé + réservé ;
- le diff doit donc contenir au minimum :
  - couleur de cheveux : blanc → châtain foncé ;
  - expression : ancienne expression → réservé.

Pour éviter les incohérences, j’ajouterai un petit helper frontend qui prépare un snapshot de référence au moment de la restauration. Si la version n’a pas de métadonnées traits complètes, on force au moins les champs nécessaires à ne pas être considérés comme déjà modifiés.

### 3. Côté génération, sécuriser la source utilisée

Dans `generate-avatar/index.ts` :

- garder la priorité à `avatar_source_url` quand il existe ;
- mais ajouter des logs explicites et retourner dans la réponse :
  - `source_url` utilisée ;
  - `diff` détecté ;
  - `mode` réel (`edit` ou fallback).

Objectif : dans le toast / debug, on verra clairement si l’édition part bien de la version restaurée.

### 4. Indicateur UI dans Avatar Studio

Dans la zone “Versions”, je rendrai l’action plus explicite :

- clic normal : aperçu grand format comme aujourd’hui ;
- bouton / action claire : **Définir comme base de retouche**.

Quand cette base est active, afficher un libellé discret :

> Base de retouche : version HD sélectionnée

Cela évite la confusion entre “voir une version” et “dire à l’IA de repartir de cette version”.

## Fichiers concernés

- `src/pages/AvatarStudio.tsx`
  - restauration de version ;
  - nettoyage de l’ancien aperçu ;
  - mise à jour de `avatar_source_url` ;
  - UI “base de retouche”.

- `supabase/functions/generate-avatar/index.ts`
  - retour debug `source_url` / `diff` ;
  - logs plus explicites.

Aucune migration n’est nécessaire : les colonnes existent déjà.