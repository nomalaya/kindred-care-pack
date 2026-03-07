

## Import de 2000 profils authentiques dans la table `profiles`

### Problème clé

Pour que ces profils soient "accessibles via l'auth classique", il faut que chaque `user_id` du CSV corresponde à un utilisateur réel dans `auth.users`. Sinon, les politiques RLS (`auth.uid() = user_id`) empêcheront tout accès.

De plus, le trigger `handle_new_user` crée automatiquement un profil lors de l'inscription — il faut donc coordonner la création.

### Approche

Créer une **edge function temporaire** `import-profiles` qui, pour chaque ligne du CSV :

1. **Crée un utilisateur auth** via `supabase.auth.admin.createUser()` avec l'`id` (= `user_id`), l'email, et un mot de passe par défaut (ex: `Cash4Cause2024!`)
   - Le trigger `handle_new_user` créera automatiquement une ligne dans `profiles`
2. **Met à jour le profil** créé par le trigger avec les colonnes géographiques (`country_code`, `region_code`, `department_code`, `postal_prefix`, `location_visibility`) et le `display_name`
3. Traite les lignes **par batch de 50** pour éviter les timeouts

### Détails techniques

- **Séparateur CSV** : `;`
- **Conversion** : `location_visibility` de `"False"/"True"` → `false/true`
- **Service role key** : utilisé pour `auth.admin` et pour bypass RLS sur les updates
- **Config** : `verify_jwt = false` dans `config.toml`
- Le CSV sera copié dans le projet pour être lu par la fonction
- Après import réussi, la fonction et le CSV seront supprimés

### Fichiers à créer/modifier

1. Copier le CSV → `supabase/functions/import-profiles/data.csv`
2. Créer `supabase/functions/import-profiles/index.ts`
3. Ajouter la config dans `supabase/config.toml`
4. Déployer, invoquer une fois, puis nettoyer

### Risque

Les 2000 appels `createUser` + `update` prendront du temps. La fonction traitera par batches et retournera un rapport de progression.

