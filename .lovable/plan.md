# Diagnostic — Avatar Studio (lecture seule, aucun crédit IA)

Pas de modification de code dans ce plan. Objectif : expliquer **d'où viennent** les 3 défauts visibles sur Léa, et où la chaîne s'est complexifiée par rapport au besoin simple (avatar propre, détouré, fond aléatoire).

---

## 1. Pourquoi le fond blanc n'est plus supprimé sur les versions HD

**Cause racine : le style des prompts a changé, donc le détourage automatique ne fonctionne plus.**

Le pipeline de détourage est en 2 étapes (`supabase/functions/clean-avatar-background/index.ts`) :
1. Gemini reçoit l'image et doit la renvoyer avec un **fond pur #FFFFFF**.
2. Un chroma-key serveur convertit les pixels **quasi-blancs** (`minC ≥ 248`, `chroma ≤ 6`) en alpha = 0.

Or le style imposé dans `avatarArtDirection.ts` ligne 107 est désormais :
> "clean modern editorial illustration. Fine soft ink linework… **soft colored-pencil shading with a light digital wash**."

Le **"light digital wash"** + la texture aquarelle/crayon débordent autour du sujet et **ne sont plus du blanc pur**. Le chroma-key les laisse opaques. Conséquence visible : un halo / rectangle gris pâle reste dans le cercle de l'avatar.

Confirmation côté logs : la dernière exécution de `clean-avatar-background` sur Léa renvoie `transparent_ratio = 0.439` (43,9% transparent seulement). Le seuil d'échec est `< 0.05`, donc le pipeline considère que c'est OK et publie l'image — mais visuellement le fond reste sale.

**Ce n'est pas un bug du code de détourage — c'est le prompt qui ne produit plus un fond exploitable.**

---

## 2. Pourquoi un trait / rectangle apparaît sous l'avatar de Léa

**Cause racine : c'est une instruction explicite du prompt, écrite pendant le travail anti-fondu.**

`FRAMING_BLOCK` (ligne 114-124 de `avatarArtDirection.ts`) impose maintenant :
> "The lower edge of the upper bust must end as a **CLEAN DRAWN PORTRAIT (a real garment line + a clean horizontal canvas crop)**, NOT as a fading wash…"

Le modèle dessine donc **une ligne horizontale franche** au bas du buste pour ne pas se faire rejeter par la QA `bust_completeness`. Dans le cercle de l'avatar (qui rogne le bas du buste), cette ligne devient le "trait/rectangle" sous le menton.

C'est l'effet collatéral direct du correctif Plan v4 (anti-fade-out). On a remplacé "fondu aquarelle" par "trait net" — visuellement gênant dans un cercle Instagram-like.

---

## 3. Pourquoi cheveux blancs avec mèches noires + yeux "comme une écriture"

**Cause racine : le style "fine ink linework" appliqué partout sur des éléments fins.**

Ligne 107 du même fichier :
> "**Fine soft ink linework** with subtle organic outlines."

Et les valeurs `curly` / `coily` du dictionnaire (lignes 82-83) décrivent des boucles **denses et marquées**.

Conjugaison :
- Sur des **cheveux blancs/gris**, le modèle trace chaque boucle au trait d'encre noir → impression de "mèches noires aquarelle/fusain" sur fond blanc.
- Sur les **yeux** (zone détaillée), le même trait d'encre fin crée des micro-traits parasites qui ressemblent à de l'écriture / une signature.

Aucune consigne ne dit "ne pas surligner chaque mèche au trait noir" ni "garder les détails du visage lisses". Le `STYLE` lui-même produit ces artefacts.

---

## 4. Les prompts sont-ils dysfonctionnels / trop complexes ?

**Oui, surtout `FRAMING_BLOCK` + `STYLE`** — ils combinent des objectifs contradictoires accumulés au fil des itérations :

| Objectif demandé | Instruction ajoutée | Effet de bord visible |
|---|---|---|
| Pas de fondu en bas | "clean horizontal canvas crop" | Ligne / rectangle sous le buste |
| Style éditorial chaleureux | "soft digital wash" | Fond pas blanc pur → détourage cassé |
| Cheveux crépus reconnaissables | "tightly coiled, dense kinky texture" | Boucles tracées à l'encre noire sur cheveux blancs |
| Anti-fade-out garantie | 14 tokens négatifs + 3 blocs CAPS | Le modèle bétonne les contours = trait visible |
| Bust complet | QA `bust_completeness ≥ 75` + retry | Le modèle dessine un buste fermé "à la règle" |

Désaccord avec ChatGPT : très probable, parce que la chaîne Lovable empile aujourd'hui **3 couches de garde-fou** (prompt STYLE + FRAMING_BLOCK + QA `bust_completeness` + clean-bg + post-clean QA + rollback) qui se renforcent mutuellement vers un rendu "dessin technique fermé", alors qu'à l'origine vous vouliez un **rendu illustratif simple + fond transparent**.

---

## 5. Synthèse — ce que la chaîne actuelle fait vs ce que vous demandez

Ce que vous voulez (rappel) :
- avatar propre, détouré, sans artefact, fond aléatoire derrière.

Ce que la chaîne fait aujourd'hui :
```text
generate-avatar (edit_hd)
  └─ prompt STYLE "light digital wash"           ← casse le fond blanc pur
  └─ FRAMING_BLOCK "clean horizontal crop"       ← dessine le trait sous le buste
  └─ ink linework + coily dense                  ← mèches noires + yeux parasités
  └─ QA pre-clean (bust ≥ 75) + retry seed
  └─ clean-avatar-background (Gemini + chroma)   ← ne capte plus le wash → fond gris
  └─ QA post-clean (bust ≥ 75) + rollback
```

**Conclusion** : aucun bug isolé. Trois défauts = trois ajouts de prompt validés successivement qui, mis bout à bout, contredisent le besoin produit initial.

---

## 6. Pistes de correction (à valider avant tout build)

Aucune action n'est prise tant que vous n'avez pas choisi. Options possibles, classées de la plus simple à la plus large :

A. **Retour au style simple** — supprimer "light digital wash" + adoucir "fine ink linework" dans `STYLE`. Restaure la possibilité d'un vrai fond blanc → détourage redevient propre. Supprime aussi les mèches noires et les artefacts oculaires.

B. **Supprimer la ligne franche sous le buste** — remplacer "clean horizontal canvas crop + garment line" par une consigne neutre. Garde la protection anti-fade mais sans trait visible.

C. **Réduire la QA `bust_completeness`** — abaisser le poids/seuil, qui force le modèle à "fermer" le buste à tout prix.

D. **Restaurer l'image source antérieure de Léa** (avant édits HD) sans relancer de génération, si une version d'avant ces ajouts est conservée dans `avatar_versions`.

Dites-moi laquelle (ou quelle combinaison) vous voulez que je planifie en détail. Je ne touche à rien avant.
