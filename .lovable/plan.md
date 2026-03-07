

## Ajout des colonnes géographiques à la table `profiles`

### Migration SQL

Ajouter 5 colonnes à `public.profiles` :

```sql
ALTER TABLE public.profiles
  ADD COLUMN country_code text,
  ADD COLUMN region_code text,
  ADD COLUMN department_code text,
  ADD COLUMN postal_prefix text,
  ADD COLUMN location_visibility boolean NOT NULL DEFAULT false;
```

### Sécurité

Les politiques RLS existantes sur `profiles` restent inchangées :
- Les utilisateurs ne peuvent lire/modifier que leur propre profil (`auth.uid() = user_id`)
- Ces colonnes ne sont pas exposées dans la vue `beneficiaries_public` ni dans aucune API publique
- `location_visibility` par défaut à `false` garantit la non-exposition

### Ce qui ne change pas

- Aucune colonne existante modifiée ou supprimée
- Aucune relation existante modifiée
- Aucun code applicatif modifié
- Aucune logique de matching modifiée (sera implémentée séparément)
- La vue `beneficiaries_public` reste identique

