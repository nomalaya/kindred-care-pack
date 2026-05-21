Appliquer un **flou CSS de 22px** sur tous les portraits v2 (status `validated` ou `preview`) affichés via le composant `BeneficiaryAvatar`. Réversible — aucune modification des fichiers stockés dans le bucket.

## Changement

Un seul fichier modifié : `src/components/BeneficiaryAvatar.tsx`

Quand `avatarUrl` (validated) ou `previewUrl` (preview) est présent, ajouter sur le `<img>` :

```tsx
style={{ filter: "blur(22px)", transform: "scale(1.08)" }}
```

- `scale(1.08)` évite les bords transparents créés par le flou.
- `overflow-hidden` ajouté sur le wrapper pour garder le cercle net.
- Le fallback gradient (status `pending` / `failed`) reste net.
- Le badge "Aperçu IA" reste net.

## Ce qui n'est PAS touché

- Bucket Storage `avatars/` — fichiers inchangés.
- Base de données — aucune migration.
- Pipeline de génération, QA, batch backfill — inchangés.
- Admin portrait panel — les vignettes seront aussi floutées (cohérent puisqu'elles passent par le même composant). Si besoin de garder l'admin net, on peut ajouter une prop `unblur` plus tard.

## Réversibilité

Pour réactiver les portraits nets : supprimer les 2 lignes de style. Aucune perte de données.
