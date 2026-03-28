

# Picto ℹ️ fiscal — lien vers /avantage-fiscal avec retour

## Principe

Créer un petit composant `TaxInfoLink` : une icône `Info` (Lucide) cliquable qui redirige vers `/avantage-fiscal?from=<current-path>`. La page TaxAdvantage affiche un bouton retour qui ramène à l'URL d'origine.

## Composant à créer

### `src/components/TaxInfoLink.tsx`
- Icône `Info` de Lucide, taille 14px, couleur `text-primary`
- Enveloppé dans un `Link` vers `/avantage-fiscal?from={encodeURIComponent(currentPath)}`
- `useLocation()` pour récupérer le path courant
- Tooltip natif via `title="En savoir plus sur l'avantage fiscal"`
- Style : `inline-flex items-center` pour s'aligner avec le texte environnant
- Petit cercle `bg-primary/10 rounded-full p-0.5` autour de l'icône pour le rendre visible

## Modification de la page TaxAdvantage

### `src/pages/TaxAdvantage.tsx`
- Lire `searchParams.get("from")` via `useSearchParams()`
- Si `from` existe, afficher le `BackButton` avec `to={from}` en haut de page (au-dessus du hero)
- Sinon, pas de BackButton (accès direct depuis la navbar)

## Insertions du picto (6 emplacements)

| Fichier | Emplacement | Position du picto |
|---|---|---|
| `TaxDeductionOptionC.tsx` | Texte "Réduction de 66%…" (ligne 68) | À droite du texte |
| `OrderConfirmation.tsx` | Ligne "Déduction fiscale (66%)" | À côté du label |
| `OrderConfirmation.tsx` | Ligne "Coût réel après réduction" | À côté du label |
| `DonorInformation.tsx` | Texte "reçu fiscal sera envoyé" | À côté du texte |
| `DonorInformation.tsx` | Ligne "Coût réel après réduction" | À côté du label |
| `TaxDeduction.tsx` | Ligne "Coût réel après déduction" | À côté du label |

Chaque insertion = `<TaxInfoLink />` ajouté inline après le texte concerné.

## Fichiers concernés
1. **Créer** `src/components/TaxInfoLink.tsx`
2. **Modifier** `src/pages/TaxAdvantage.tsx` — ajout BackButton conditionnel via query param
3. **Modifier** `src/components/TaxDeductionOptionC.tsx` — insertion picto
4. **Modifier** `src/components/checkout/OrderConfirmation.tsx` — 2 insertions
5. **Modifier** `src/components/checkout/DonorInformation.tsx` — 2 insertions
6. **Modifier** `src/components/TaxDeduction.tsx` — 1 insertion

