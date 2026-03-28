

# Correction des photos de situations trop artificielles

## Diagnostic

Sur la capture fournie, la photo "Personne agee en etablissement" (gauche) a un rendu documentaire realiste et naturel. La photo "Retraite sans pension" (droite) presente les marqueurs typiques d'une image IA : peau trop lisse, eclairage trop dramatique, regard trop "pose", fond flou artificiellement parfait.

Ce probleme affecte probablement plusieurs des 24 photos generees. Les portraits frontaux en gros plan sont les plus a risque (uncanny valley), tandis que les photos en plan moyen avec contexte/environnement passent mieux.

## Methode d'identification

Sur les 24 photos, les categories les plus a risque sont :
- **Portraits serres avec regard camera** : retired-no-pension, elderly-couple, chronic-illness, disability, mental-health, violence-survivor
- **Personnes seules sans contexte environnemental** : woman-no-income, freelancer-crisis, precarious-worker, job-loss
- **Enfants/jeunes** (souvent trop "stock photo") : orphan-student, sick-student, working-student

Les photos qui fonctionnent bien (type plan moyen, environnement visible, lumiere naturelle) : elderly-alone, elderly-facility, single-mother, refugee-family, part-time, rural-student

## Plan de correction

### Approche : regenerer avec des prompts documentaires stricts

Pour chaque photo problematique, regenerer avec un prompt qui force le style photojournalistique :
- **Cadrage** : plan moyen ou plan americain (jamais gros plan portrait)
- **Lumiere** : naturelle, interieur avec fenetre ou exterieur couvert
- **Contexte** : toujours un environnement reel visible (cuisine, chambre, bureau, rue)
- **Sujet** : personne en action ou en situation (pas de regard camera, pas de pose)
- **Grain** : legere imperfection, style reportage photo 35mm
- **Pas de** : peau lisse, eclairage studio, bokeh excessif, regard direct intense

### Photos a regenerer (estimation ~12 sur 24)

| Fichier | Situation | Probleme probable |
|---------|-----------|-------------------|
| sit-retired-no-pension.jpg | Retraite sans pension | Portrait frontal IA evident |
| sit-elderly-couple.jpg | Couple age | Deux visages = double risque uncanny |
| sit-chronic-illness.jpg | Maladie chronique | Portrait trop pose |
| sit-disability.jpg | Handicap | Risque de cliche visuel |
| sit-mental-health.jpg | Sante mentale | Portrait dramatique artificiel |
| sit-violence-survivor.jpg | Victime de violence | Eclairage trop studio |
| sit-woman-no-income.jpg | Femme sans revenus | Portrait sans contexte |
| sit-freelancer-crisis.jpg | Freelance en crise | Trop "stock photo" |
| sit-precarious-worker.jpg | Travailleur precaire | Portrait pose |
| sit-job-loss.jpg | Perte d'emploi | Risque de surjeu emotionnel |
| sit-orphan-student.jpg | Etudiant orphelin | Enfant/jeune = souvent artificiel |
| sit-sick-student.jpg | Etudiant malade | Idem |

### Etape 1 — Audit visuel

Naviguer sur chacune des 6 pages situations pour capturer et evaluer chaque photo. Classer en 3 categories :
- **OK** : realiste, documentaire, on garde
- **Limite** : acceptable mais ameliorable
- **A refaire** : clairement IA, a regenerer

### Etape 2 — Regeneration

Pour chaque photo "A refaire", utiliser le modele image avec un prompt strict de type :
> "Documentary photograph, natural light from window, [description situation], medium shot showing environment, 35mm film grain, no direct eye contact, candid moment, French interior/exterior, realistic imperfections"

### Etape 3 — Remplacement

Ecraser les fichiers dans `src/assets/situations/` — aucune modification de code necessaire car le mapping `SITUATION_PHOTOS` reste identique.

## Fichiers modifies
- ~12 fichiers `.jpg` dans `src/assets/situations/` (remplacement binaire, pas de changement de code)

