

## Plan : Reprendre les migrations de base de données

Les migrations précédentes ont échoué (erreurs internes). Les colonnes nécessaires au plan approuvé n'existent pas encore dans la base de données.

### Approche : migrations atomiques

Au lieu d'une grosse migration, effectuer **4 migrations séparées très simples**, une par colonne :

1. **Migration 1** : `ALTER TABLE products ADD COLUMN priority_score integer DEFAULT 3;`
2. **Migration 2** : `ALTER TABLE products ADD COLUMN situation_relevance text[] DEFAULT '{}';`
3. **Migration 3** : `ALTER TABLE beneficiaries ADD COLUMN children_count integer DEFAULT 0;`
4. **Migration 4** : `ALTER TABLE beneficiaries ADD COLUMN beneficiary_category text;`

Puis, une fois le schema en place :

5. **Migration 5** : Créer la table `matching_rules`
6. **Migration 6** : Mettre à jour la vue `beneficiaries_public` pour inclure les nouvelles colonnes
7. **Migration 7** : Créer la RPC `get_empathy_beneficiaries`

Ensuite, les modifications de code (constants, basketEngine, BeneficiarySelection) suivront.

### Fichiers modifiés (code, après les migrations)

| Fichier | Changement |
|---|---|
| `src/lib/constants.ts` | Tiers → 30/45/60/80 |
| `src/lib/basketEngine.ts` | Moteur situation_relevance + nudge |
| `src/pages/BeneficiarySelection.tsx` | Appel `get_empathy_beneficiaries` |
| `src/components/DonationBasket.tsx` | Fix logique pictogrammes |

