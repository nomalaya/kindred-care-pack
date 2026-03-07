

## Plan : Moteurs intelligents de sélection et composition

**Objectif** : Remplacer les données et la logique backend par le modèle Excel fourni, sans modifier aucun composant UI.

---

### Etat actuel vs. cible

| | Actuel | Cible |
|---|---|---|
| Produits | 237, avec prix/cause_relevance/tier | 300 (Excel), sans prix → à générer |
| Bénéficiaires | 12, sur 6 situations | ~96+ (4 min par situation × 24) |
| Situations | 24 ✓ | 24 ✓ (alignement titres Excel) |
| Tiers | 32/45/60/75€ | 30/45/60/80€ |
| Sélection | rotation_score simple | Algorithme empathie avec diversité |
| Colis | cause_relevance filtering | situation_relevance + nudge émotionnel |

---

### Phase 1 : Schema & données

**1.1 Migration DB**
- Ajouter colonnes `products` : `priority_score integer DEFAULT 3`, `situation_relevance text[] DEFAULT '{}'`
- Créer table `matching_rules` (rule_id, cause_id, situation_id, age_min, age_max, gender, emotional_family_priority text[], target_group_priority text[], halal_filter, kosher_filter)
- Ajouter colonne `beneficiaries` : `children_count integer DEFAULT 0`, `beneficiary_category text` (family/individual/young/senior)

**1.2 Remplacer les 237 produits par les 300 du Excel**
- Supprimer les produits existants
- Insérer les 300 produits avec :
  - Prix générés par catégorie (Alimentaire: 1-5€, Hygiène: 2-6€, Bébé: 3-8€, Enfant: 2-7€, Maison: 2-8€, Autonomie: 5-15€)
  - `situation_relevance` peuplé à partir des rules (Page 5) : chaque produit dont le `target_groups` et `emotional_family` matchent une rule est lié aux situations correspondantes
  - `priority_score` = `emotional_intensity` (déjà dans le Excel)

**1.3 Insérer les 5 matching_rules** (Page 5 du Excel)

**1.4 Générer ~96 bénéficiaires** (4 par situation)
- Pour chaque situation : créer 4 profils respectant les contraintes de cohérence :
  - `student` → âge 18-28
  - `mother` → gender=female, children_count>0
  - `elderly` → âge 65-99
  - `family` → children_count≥1
- Diversité par quatuor : 1 familial, 1 individuel, 1 jeune, 1 adulte/senior
- Prénoms anonymisés (banque de ~50 prénoms crédibles français/multiculturels)
- Régions variées, short_story et emotional_sentence contextualisés par situation
- `profile_type` mappé depuis les profile_mappings existants
- Attributs avatar variés (gender, age_range, skin_tone, hair_type)

**1.5 Mettre à jour les situations** pour aligner les titres avec le Excel (Page 3) si différents

**1.6 Mettre à jour constants** : `DONATION_TIERS` → 30/45/60/80€, `MIN_DONATION` → 30, `MAX_DONATION` → 80

---

### Phase 2 : Moteur 1 — Algorithme d'empathie

**Nouvelle RPC `get_empathy_beneficiaries(p_situation_id, p_limit)`**

Remplace `get_ranked_beneficiaries` avec :
1. Filtrer bénéficiaires actifs de la situation
2. Appliquer les contraintes de diversité obligatoires :
   - Au moins 1 `beneficiary_category = 'family'`
   - Au moins 1 `beneficiary_category = 'individual'`  
   - Au moins 1 `beneficiary_category = 'young'`
   - Au moins 1 `beneficiary_category = 'senior'` (ou adult si pas de senior dans cette situation)
3. Score de sélection = `(urgency_level + 1) * time_since_last_donation / (total_donations_received + 1)`
4. Dans chaque catégorie, prendre le profil avec le meilleur score
5. Fallback : si une catégorie n'a pas de candidat, remplir avec le meilleur score global

**Mise à jour de `BeneficiarySelection.tsx`** : appeler la nouvelle RPC au lieu de `get_ranked_beneficiaries` (uniquement le nom de la fonction appelée, pas l'UI).

---

### Phase 3 : Moteur 2 — Composition intelligente du colis

**Refactorer `basketEngine.ts`** :

1. **Filtrage par situation** : remplacer `cause_relevance` par `situation_relevance` comme filtre primaire (avec fallback cause_relevance)
2. **Tri par priorité** : trier les produits candidats par `priority_score DESC, emotional_intensity DESC` au lieu de `price ASC`
3. **Diversité catégorielle** : garantir au moins 1 produit de chaque catégorie disponible (Alimentaire, Hygiène, Bébé/Enfant si pertinent) avant de remplir le budget
4. **Nudge émotionnel** : quand le budget restant est < 15% du montant total ET qu'un produit à forte intensité émotionnelle (≥4) est disponible à +2-5€ au-dessus du budget → l'inclure dans le basket comme "suggestion" (le produit est affiché mais le slider n'est pas modifié — le donateur voit naturellement qu'augmenter de quelques euros débloque un produit fort)
5. **Anti-monotonie** : limiter à max 2 produits du même `subcategory` par colis

**Aucun changement UI** dans `DonationBasket.tsx` ou `DonationImpact.tsx` — les composants consomment déjà le basket via props.

---

### Phase 4 : Pictogrammes produits

**Mise à jour de `getProductDietBadges()` dans `DonationBasket.tsx`** (logique uniquement) :
- Afficher `sans_porc` si `contains_pork === true` (alerte, pas compatibilité)
- Afficher `sans_alcool` si `contains_alcohol === true`
- Corriger la condition actuelle qui vérifie `=== false` (inversée)
- Les pictogrammes restent discrets (déjà le cas dans l'UI actuelle)

---

### Résumé des fichiers modifiés

| Fichier | Type de changement |
|---|---|
| `src/lib/constants.ts` | Tiers 30/45/60/80, CAUSE_KEY_MAP alignement |
| `src/lib/basketEngine.ts` | Nouveau moteur : situation_relevance, priority_score, nudge, anti-monotonie |
| `src/pages/BeneficiarySelection.tsx` | Appel RPC `get_empathy_beneficiaries` (1 ligne) |
| `src/pages/DonationFlow.tsx` | Filtrage situation_relevance au lieu de cause_relevance (logique interne) |
| `src/components/DonationBasket.tsx` | Fix logique `getProductDietBadges` (3 lignes) |
| DB migrations | 3 migrations (schema, data, RPC) |

Aucun changement de layout, cartes, blocs, sliders, boutons, structure visuelle, indicateurs, calcul fiscal, ou fiche bénéficiaire.

