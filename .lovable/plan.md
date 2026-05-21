## Objectif

Garder uniquement la route récente `/avatar-studio` et supprimer l'ancienne `/admin/avatar-studio`.

## Fichier modifié

**`src/App.tsx`**

- Supprimer la ligne :
  ```
  <Route path="/admin/avatar-studio" element={<Navigate to="/avatar-studio" replace />} />
  ```
- Retirer `Navigate` de l'import `react-router-dom` (plus utilisé ailleurs dans le fichier)

## Impact

- L'URL `/admin/avatar-studio` retournera désormais 404 (NotFound)
- Tous les liens internes pointent déjà sur `/avatar-studio` (vérifié dans `src/pages/Admin.tsx`), donc aucun bouton ne casse
- Si quelqu'un a un ancien bookmark sur `/admin/avatar-studio`, il devra mettre à jour son lien
