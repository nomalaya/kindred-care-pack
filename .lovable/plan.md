## Diagnostic (vérifié)

Les attributs en base sont bien diversifiés. Pour les 3 profils de vos captures :

| | Léa (IdF) | Sophie (Pays de la Loire) | Maria (Occitanie 75+) |
|---|---|---|---|
| peau | medium | fair | medium |
| cheveux | ondulés, courts, châtain foncé | **bouclés, roux, chignon** | bouclés, mi-longs, brun |
| nez / visage | rond / long | retroussé / long | — / carré doux |
| corpulence | moyenne | **forte** | moyenne |

Le prompt enregistré pour Sophie demande bien « short clearly curly **red** hair … **fair** skin … clearly fuller body ». L'image produite est une brune châtain de corpulence moyenne, quasi identique à Léa. Le remix d'attributs fonctionne : **c'est la génération d'image qui n'obéit pas au texte.**

Cause : `avatarStyleAnchors.ts` joint **3 photos de référence complètes (Léa, Nguyen, Fatima) à chaque génération**, y compris en text-to-image. Les modèles Gemini image copient l'identité des images jointes beaucoup plus fortement qu'ils ne suivent le texte ; la consigne « COPY THE STYLE ONLY — NEVER THE PEOPLE » ne pèse presque rien. Toutes les femmes jeunes ou d'âge moyen convergent donc vers le visage et les boucles châtain de l'ancre Léa.

Second facteur : `qa-avatar` note 11 critères (cadrage, style, dignité, anonymat…) mais **aucun critère de conformité aux attributs**. Sophie a donc obtenu 88 et le statut « validé » malgré une couleur de cheveux, une carnation et une corpulence non conformes.

## Correctif proposé (sans nouvelle couche technique)

1. **Ancres sans visage pour la génération from scratch** (`avatarStyleAnchors.ts`)
   Remplacer les 3 portraits entiers par **une seule planche de style figée** composée de fragments des 3 mêmes avatars validés (détails de trait d'encre, de grain, de mèche, de tissu, de dégradé de fond) — aucun visage entier, donc plus rien à copier en termes d'identité. La planche est produite une fois, stockée dans `avatars/style-anchors/`, et le bloc texte STYLE reste inchangé. La direction artistique actuelle est conservée parce que la planche est extraite des rendus qui vous plaisent.

2. **Le mode édition n'est pas touché**
   `STYLE_ANCHOR_BLOCK_EDIT` et le pipeline `edit_hd` gardent leur comportement actuel (image 1 = sujet à retoucher). C'est là que le respect de l'attribut modifié fonctionne déjà ; on n'y touche pas.

3. **Un critère QA bloquant en plus, dans l'appel existant** (`qa-avatar/index.ts`)
   Ajout de `attribute_conformity` (poids fort, seuil de rejet) : le juge reçoit les attributs cibles (peau, couleur/texture/longueur de cheveux, corpulence, âge, forme du visage) et vérifie que l'image les respecte. Aucun appel supplémentaire, aucun coût additionnel : c'est le même appel QA déjà passé après chaque génération. Un avatar non conforme est rejeté au lieu d'être validé à 88.

4. **Cadrage, fond transparent, garde alpha, garde-fous phénotypiques : inchangés.** Aucune modification de `avatarNormalize.ts`, `avatarStudio.ts`, `phenotypeRanges.ts`, ni de la logique de sélection.

## Validation sur échantillon

Régénération de **6 profils seulement**, choisis pour être le pire cas de ressemblance : Léa (IdF), Sophie (Pays de la Loire), Maria (Occitanie 75+) plus 3 femmes brunes bouclées d'âge moyen. Génération via Google AI Studio direct : **0 crédit Lovable**, 6 images côté Google.

Livrables : planche de contrôle avant/après côte à côte, et tableau attribut demandé vs attribut observé pour chacun des 6. Si un profil reste non conforme, je corrige avant toute extension — rien n'est publié sans votre accord, et le reste du catalogue n'est pas touché à ce stade.

## Détails techniques

- `supabase/functions/_shared/avatarStyleAnchors.ts` : `STYLE_ANCHOR_URLS` passe à une seule entrée (planche de texture), `STYLE_ANCHOR_BLOCK` reformulé en « référence de matière et de trait », suppression de la formulation « ne copie pas les personnes » devenue sans objet.
- `supabase/functions/qa-avatar/index.ts` : ajout de `attribute_conformity` dans `WEIGHTS` (2.0) et `HARD_FAIL_THRESHOLDS` (65), passage des attributs cibles dans le prompt du juge ; l'appelant (`generate-avatar/index.ts`) transmet les attributs déjà en mémoire.
- Le miroir `src/lib` correspondant est resynchronisé si nécessaire (fichiers marqués `// sync`).
