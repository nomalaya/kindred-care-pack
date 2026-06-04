## Diagnostic

J'ai inspecté la base de données pour Léa Île-de-France 28 ans (`de8c19bc-…`) :

| champ | valeur |
|---|---|
| `avatar_status` | `preview` |
| `avatar_url` (HD validé d'avant) | image **stale** (générée le 11/11/2026) |
| `avatar_preview_url` (aperçu d'aujourd'hui) | image **fraîche** avec cheveux chatain + expression réservée |
| `avatar_hair_color` | `dark_brown` ✅ |
| `avatar_expression` | `reserved` ✅ |
| `avatar_generated_traits` (snapshot) | présent ✅ |

**Le pipeline a bien fonctionné** : l'aperçu rapide a généré un nouveau portrait avec les bons attributs, l'a stocké dans `avatar_preview_url` et écrit le snapshot. Le détourage du fond s'est aussi exécuté.

**Le bug est uniquement côté affichage** : dans `AvatarStudio.tsx`, le portrait principal et le lightbox utilisent partout :

```tsx
selected.avatar_url || selected.avatar_preview_url
```

→ tant que le HD validé existe, on continue d'afficher l'**ancien** avatar, même quand un aperçu plus récent (avec les modifications demandées) est disponible. C'est pour ça que Léa "garde" ses cheveux blancs visuellement, alors qu'en réalité un nouvel aperçu avec cheveux chatain a été produit.

Conséquence : l'opérateur ne voit jamais le résultat d'un Aperçu rapide lancé sur un bénéficiaire déjà approuvé, ni en mode Édition contrôlée, ni en mode bootstrap. Inutile de toucher au pipeline de génération.

## Correctif

Règle d'affichage : quand `avatar_status === "preview"` ET qu'un `avatar_preview_url` existe, on montre l'aperçu en priorité. Sinon, on garde l'avatar HD validé.

Helper local dans `src/pages/AvatarStudio.tsx` :

```ts
const displayAvatarUrl = (b: any): string | null => {
  if (!b) return null;
  if (b.avatar_status === "preview" && b.avatar_preview_url) return b.avatar_preview_url;
  return b.avatar_url || b.avatar_preview_url || null;
};
```

Remplacement aux 5 sites identifiés (lignes 850, 852, 856, 1027, 1177, 1535, 1540) de `selected.avatar_url || selected.avatar_preview_url` par `displayAvatarUrl(selected)`.

## Indicateurs UX complémentaires (légers)

Pour qu'il soit évident qu'on regarde un aperçu non encore validé :

1. Sous la vignette du portrait, quand on affiche un aperçu (status `preview`), ajouter un petit badge "Aperçu en attente de validation" (réutilise `STATUS_COLOR.preview`).
2. Lorsqu'un avatar a un `avatar_url` HD ET un `avatar_preview_url` plus récent, ajouter un lien discret "Voir l'avatar HD validé" qui bascule temporairement vers l'ancien (utile pour comparer avant approbation).

Ces ajouts restent purement UI, aucune logique métier ni schéma touché.

## Fichiers modifiés

- `src/pages/AvatarStudio.tsx` (helper + 7 remplacements + badge "Aperçu en attente" + toggle de comparaison)

Aucun changement edge function, aucune migration. Le pipeline backend (preview / final / edit / edit_hd + auto-clean) reste tel quel.
