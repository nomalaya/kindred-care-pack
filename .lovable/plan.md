

# Rendre l'image hero téléchargeable

## Problème
Les fichiers dans `src/assets/` ne sont pas accessibles directement via URL en production — ils sont bundlés par Vite.

## Solution
Déplacer `hero-solidarity.jpg` dans le dossier `public/` (accessible directement via URL) et mettre à jour l'import dans `Index.tsx`.

## Modifications

### 1. Déplacer le fichier
- Copier `src/assets/hero-solidarity.jpg` → `public/hero-solidarity.jpg`

### 2. Modifier `src/pages/Index.tsx`
- Supprimer `import heroImage from "@/assets/hero-solidarity.jpg";`
- Remplacer `src={heroImage}` par `src="/hero-solidarity.jpg"`

## Résultat
L'image sera accessible à `https://id-preview--0f96d648-3a03-42f6-85f7-ce35f8005b9b.lovable.app/hero-solidarity.jpg`

2 modifications, 1 déplacement de fichier.

