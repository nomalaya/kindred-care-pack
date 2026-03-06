

## Analyse des tables existantes vs. besoins du matching

### Ce qui existe deja

| Table | Contenu | Etat |
|---|---|---|
| `causes` | 6 causes | OK, peuplée |
| `situations` | 24 situations (4 par cause) | OK, peuplée |
| `beneficiaries` | 12 bénéficiaires avec alias, region, culture_tags, diet_tags | OK, peuplée |
| `products` | 15 produits basiques (riz, pates, etc.) | Insuffisant — le CSV en contient 237 |
| `beneficiary_products` | 0 enregistrements | Vide — pas de lien beneficiaire/produit |
| `donations` | Table existante avec donor_id, beneficiary_id, amount | OK structurellement |
| `profiles` | Table donateurs (user_id, display_name, email) | OK, existe |

### Ce qui manque pour que le matching fonctionne

**Il ne manque pas de table fondamentale.** Les tables `beneficiaries` (beneficiaires) et `profiles` (donateurs) existent deja. Cependant, il manque des elements critiques :

---

**1. Table `profile_mappings` — MANQUANTE (a creer)**

Le CSV "Mapping Automatique Profil" definit 6 profils types (Mere isolee, Etudiant precaire, etc.) avec des priorites par famille emotionnelle et des minimums d'items. Cette logique n'a aucune table correspondante en base.

```text
profile_mappings
├── id (uuid PK)
├── profile_type (text) — "Mère isolée avec enfants", "Étudiant précaire"...
├── tier1_family (text) — "survival"
├── tier2_family (text) — "childhood"
├── tier3_family (text) — "dignity"
├── tier4_family (text) — "autonomy"
├── min_survival_items (int)
├── min_dignity_items (int)
├── min_childhood_items (int)
├── min_autonomy_items (int)
├── religious_filter (text)
├── cultural_weighting (text)
```

**2. Colonne `profile_type` sur `beneficiaries` — MANQUANTE**

Chaque beneficiaire doit etre lie a un profil de mapping (ex: "Mere isolee avec enfants") pour que le moteur de panier sache quels produits prioriser. Cette colonne n'existe pas.

**3. Table `products` — INCOMPLETE**

Les 15 produits actuels n'ont que `name`, `category`, `price`, `tier`. Le CSV contient 237 produits avec 15+ colonnes supplementaires necessaires au matching :
- `subcategory`, `cause_relevance` (text[]), `emotional_family`, `emotional_intensity`
- `halal_compatible`, `kosher_compatible`, `vegetarian`, `vegan`, `contains_pork`, `contains_alcohol` (booleans)
- `target_groups` (text[]), `gender_specific`, `season_tag`

**4. Table `beneficiary_products` — VIDE**

La table existe mais contient 0 enregistrements. Sans ces liens, on ne sait pas quels produits sont souhaites par chaque beneficiaire.

**5. Preferences donateur — MANQUANTES sur `profiles`**

Pour le matching culturel/alimentaire entre donateur et beneficiaire, il faudrait que le donateur puisse indiquer ses preferences (region, tags culturels). La table `profiles` n'a que `display_name` et `email`.

---

### Resume

| Element | Statut | Action requise |
|---|---|---|
| Table beneficiaires (`beneficiaries`) | Existe (12 enregistrements) | Ajouter colonne `profile_type` |
| Table donateurs (`profiles`) | Existe | Optionnel : ajouter `region`, `culture_tags` pour matching avance |
| Table `profile_mappings` | N'existe pas | Creer + inserer 6 profils du CSV |
| Table `products` | Existe mais incomplete (15/237) | Ajouter ~15 colonnes + inserer 237 produits du CSV |
| Table `beneficiary_products` | Existe mais vide (0 liens) | Remplir avec les associations beneficiaire/produit |
| Table `donations` | Existe et fonctionnelle | Aucune modification |

Le plan en 4 phases propose precedemment couvre exactement ces manques. Faut-il lancer la Phase 1 (migration DB + insertion des donnees) ?

