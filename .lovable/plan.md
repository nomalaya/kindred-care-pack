

# Fix: Les impacts doivent refléter le montant actuel du don

## Problème
Le composant `DonationImpactCard` utilise un mécanisme "high-water mark" qui empêche les valeurs d'impact de baisser quand le donateur réduit son don. Les chiffres restent bloqués au maximum atteint.

## Solution
Supprimer la logique high-water mark pour que les impacts reflètent fidèlement le panier actuel.

## Changements

**`src/components/DonationImpactCard.tsx`** — 4 suppressions :
1. Supprimer le `useRef` de `highWaterMark` (ligne 94)
2. Supprimer le `useEffect` de reset (lignes 96-99)
3. Remplacer `const displayed = Math.max(total, highWaterMark.current[type] || 0);` par `const displayed = total;`
4. Supprimer `highWaterMark.current[type] = displayed;`

Aucun autre fichier modifié.

