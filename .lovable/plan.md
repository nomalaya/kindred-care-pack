

# Modifications page post-don

## Fichiers modifiés

### 1. `src/components/DonationConfirmation.tsx`

**Fusionner "Contenu du colis" et "Promesse de livraison" en un seul bloc :**
- Supprimer le card "Contenu du colis" (lignes 89-108) en tant que bloc séparé
- Intégrer la liste de produits dans le bloc "Promesse de livraison" existant (lignes 131-168)
- Le titre devient : "Votre colis sera remis à {beneficiaryName} sous 3 jours maximum." suivi de la liste des produits, puis du texte email/dashboard

**Déplacer "Aider quelqu'un d'autre" :**
- Supprimer le bloc séparé (lignes 183-194)
- L'intégrer dans `PostDonSocialBlock` via une prop ou directement sur la même ligne que "Partager mon action"

### 2. `src/components/SocialProof.tsx`

**Modifier le message `confirmation` (lignes 51-55) :**
- Remplacer `"Vous faites partie des premiers donateurs de la semaine !"` par une logique de rang dynamique
- Calcul du rang : base 19, puis +5 par jour de la semaine (lundi=19-23, mardi=24-28, mercredi=29-33, jeudi=34-38, vendredi=39-43, samedi=44-48, dimanche=49-53)
- Tirage aléatoire stable (basé sur `useMemo` pour ne pas changer à chaque render) d'une valeur dans la tranche du jour
- Texte : `"Vous êtes le {rang}ème donateur de la semaine !"`
- Si `stats.week_count > 0`, utiliser le même format avec le rang calculé (pas le vrai `week_count`)

### 3. `src/components/PostDonSocialBlock.tsx`

**Supprimer :**
- Le lien "Suivre les actions CashForCause" (lignes 94-101)
- Le bloc `SocialIcons` (lignes 103-105) — déjà dans le footer

**Ajouter sur la même ligne que "Partager mon action" :**
- Le bouton "Aider quelqu'un d'autre" (variant `outline`, lien vers `/causes`)
- Les deux boutons côte à côte dans un `flex-row gap-3 justify-center`

## Résumé
3 fichiers modifiés, 0 créé, 0 supprimé.

