# Cadre blanc dans les ronds profils : ce que montrent les mesures

## Le fait mesuré

J'ai téléchargé les 187 fichiers d'avatars et mesuré leur canal alpha. **20 fichiers sur 187 sont totalement opaques** (alpha = 255 partout, coins blancs) : ils contiennent un carré blanc cuit dans l'image. Comme le rond affiche le fond importé *derrière* l'image, ce carré blanc masque le fond — c'est exactement le « cadre blanc » que vous voyez.

Les 20 fichiers concernés, tous générés cette nuit entre 22h20 et 23h37 (le lot de régénération de style) :

```text
Léa (Occitanie 35) · Léa (Île-de-France 28, fichier RGB sans canal alpha) · Léa (Auvergne-Rhône-Alpes 20)
Aïcha (ARA 28) · Aïcha (Hauts-de-France 45) · Aïsha (N-Aquitaine 35) · Amadou (IDF 65)
Clara (Pays de la Loire 70) · Colette (Grand Est 88) · Diogo (N-Aquitaine 22) · Éloïse (Bretagne 28)
Fatima (PACA 78) · Fatima (IDF 32) · Kwame (Hauts-de-France 35) · Lina (PACA 35)
Maria (N-Aquitaine 48) · Olga (Grand Est 24) · Olga (Hauts-de-France 78) · Sophie (Occitanie 61) · Sophie (Occitanie 35)
```

Les 167 autres avatars ont bien un fond transparent : le problème est circonscrit au lot de cette nuit, et il s'aggrave à chaque avatar régénéré. **Le lot en cours doit être arrêté avant d'en produire d'autres.**

## Cause : diagnostic non encore confirmé

Deux mécanismes possibles dans `supabase/functions/generate-avatar/index.ts` / `_shared/avatarBackground.ts`, et les journaux ne permettent pas encore de trancher :

1. **Détourage sauté.** Dans `cleanAvatarBackground`, le détourage est ignoré quand l'image semble « déjà découpée » (`preAlpha >= 0.05`). Or `normalize()` tourne *avant* l'upload et remplit le fond en blanc opaque (`canvas.fill(0xffffffff)` quand aucune transparence n'est détectée) : si l'estimation de transparence se trompe, le blanc reste cuit.
2. **Réécriture après détourage.** Un fichier trouvé en mode **RGB** (Léa Île-de-France 28), c'est-à-dire sans canal alpha du tout, indique qu'une étape ré-encode l'image sans alpha après le détourage et écrase le fichier propre.

Première étape du chantier : rejouer une génération sur un bénéficiaire témoin avec un journal explicite à chaque étape (octets entrants / sortants, ratio de transparence, mode couleur) pour identifier l'étape fautive avec certitude, avant toute correction. Je ne corrige pas à l'aveugle.

## Correction

1. **Arrêt du lot** de régénération en cours (il produit des fichiers opaques).
2. **Correctif de la cause** une fois identifiée, avec deux garde-fous non négociables :
   - le détourage devient la **dernière** étape avant l'upload, jamais l'inverse ;
   - garde bloquante : un fichier dont le coin est opaque, ou sans canal alpha, n'est jamais publié (rollback automatique, comme pour le style).
3. **Réparation des 20 fichiers existants** : passe déterministe (blanc → alpha, sans IA, 0 crédit) sur les 20 fichiers, puis re-vérification alpha. Aucune régénération nécessaire, le dessin est conservé tel quel.
4. **Reprise du lot** avec le pipeline corrigé, planche de contrôle sur fond importé (et non sur blanc) pour que ce défaut soit visible à la relecture.

## Cas séparé : Léa (Bretagne · 21 ans)

Son fichier est bien transparent — son défaut est autre : le portrait est un gros plan de visage, cheveux coupés par les bords latéraux, avec un rendu lisse type vectoriel hors direction artistique. Le QA lui a donné 88 parce qu'il ne juge que le buste et le cadrage, pas la conformité de style. Elle fait partie des avatars à régénérer avec les ancres de style, et ce sera l'occasion d'ajouter le critère de style au QA bloquant.

## Détails techniques

- Fichiers concernés : `supabase/functions/_shared/avatarBackground.ts` (ordre des passes, condition de saut du détourage), `supabase/functions/generate-avatar/index.ts` (remplissage blanc avant upload, garde alpha bloquante), `supabase/functions/qa-avatar/index.ts` (critère alpha + critère de style).
- Aucune modification du rendu React : `src/lib/avatarStudio.ts` et `BeneficiaryAvatar.tsx` sont corrects, ils affichent le fond derrière l'image — c'est le fichier qui est en faute.
- Aucun changement de logique métier (matching, panier). Mesures et régénérations via Google AI Studio : 0 crédit Lovable.
