

# Badges contextuels dynamiques sur les cartes bénéficiaires

## Approche

Ajouter une colonne `context_badge` à la table `beneficiaries`, la peupler avec des badges cohérents par situation, et réécrire la logique d'affichage dans `BeneficiarySelection.tsx`. Aucune modification du système de matching, du RPC, ni des edge functions.

## 1. Migration DB

**Ajouter la colonne :**
```sql
ALTER TABLE beneficiaries ADD COLUMN context_badge text;
```

**Recréer la vue `beneficiaries_public`** pour inclure `context_badge`.

## 2. Peupler les badges (UPDATE via insert tool)

Chaque situation (24 situations × 8 bénéficiaires, sauf b24 × 16) reçoit 4 badges différents répartis équitablement (2 par badge). Mapping par situation :

| Situation | Badges attribués |
|-----------|-----------------|
| b1 — Mère célibataire | Difficile de vivre seule · Logement provisoire · Démarches administratives en cours · Manque de commerces de proximité |
| b2 — Famille enfant handicapé | Aidant familial · Désert médical · Démarches administratives en cours · Manque de commerces de proximité |
| b3 — Famille réfugiée | Très loin de sa famille · Manque de repères dans la ville · Démarches juridiques en cours · Logement provisoire |
| b4 — Famille perte d'emploi | Début de vie active · Démarches administratives en cours · Impact de l'inflation · Manque de commerces de proximité |
| b5 — Femme violences conjugales | Démarches juridiques en cours · Logement provisoire · Parcours de transition · Difficile de vivre seule |
| b6 — Jeune mère sans logement | Logement provisoire · Nourrisson arrivé récemment · 1ère grossesse · Démarches administratives en cours |
| b7 — Femme convalescence | Désert médical · Parcours de transition · Démarches administratives en cours · Zone rurale isolée |
| b8 — Femme seule sans revenus | Difficile de vivre seule · Apprend un nouveau métier · Démarches administratives en cours · Manque de commerces de proximité |
| b9 — Étudiant travaillant | 1ère année universitaire · Très loin de sa famille · Début de vie active · Manque de commerces de proximité |
| b10 — Étudiant orphelin | Très loin de sa famille · Difficile de vivre seul(e) · Début de vie active · Démarches administratives en cours |
| b11 — Étudiant rural en ville | Manque de repères dans la ville · Très loin de sa famille · 1ère année universitaire · Zone rurale isolée |
| b12 — Étudiant santé chronique | Désert médical · 1ère année universitaire · Démarches administratives en cours · Parcours de transition |
| b13 — Personne âgée seule | Zone rurale isolée · Désert médical · Manque de commerces de proximité · Difficile de vivre seul(e) |
| b14 — Couple âgé santé | Désert médical · Aidant familial · Démarches administratives en cours · Zone rurale isolée |
| b15 — Personne âgée établissement | Très loin de sa famille · Démarches administratives en cours · Parcours de transition · Désert médical |
| b16 — Retraité sans pension | Impact de l'inflation · Démarches administratives en cours · Zone rurale isolée · Manque de commerces de proximité |
| b17 — Travailleur SMIC famille | Impact de l'inflation · Manque de commerces de proximité · Démarches administratives en cours · Aidant familial |
| b18 — Travailleur précaire | Logement provisoire · Début de vie active · Démarches administratives en cours · Impact de l'inflation |
| b19 — Temps partiel subi | Impact de l'inflation · Manque de commerces de proximité · Apprend un nouveau métier · Démarches administratives en cours |
| b20 — Indépendant en crise | Démarches juridiques en cours · Impact de l'inflation · Début de vie active · Apprend un nouveau métier |
| b21 — Maladie chronique | Désert médical · Démarches administratives en cours · Parcours de transition · Impact de l'inflation |
| b22 — Convalescence post-op | Désert médical · Parcours de transition · Démarches administratives en cours · Zone rurale isolée |
| b23 — Troubles psychiques | Parcours de transition · Désert médical · Démarches administratives en cours · Difficile de vivre seul(e) |
| b24 — Handicap | Aidant familial · Désert médical · Démarches administratives en cours · Zone rurale isolée |

Pour "1ère grossesse" : attribué uniquement si `avatar_gender = 'woman'` et `approx_age < 40`.
Pour "Difficile de vivre seul(e)" : genré dynamiquement dans le front selon `avatar_gender`.

## 3. Couleurs des badges (constantes front)

| Badge | Classes CSS |
|-------|------------|
| Proche de chez vous | `border-primary/40 text-primary bg-primary/10` (vert, existant) |
| Nouveau bénéficiaire inscrit | `border-blue-400/40 text-blue-600 bg-blue-50` |
| Logement provisoire | `border-amber-400/40 text-amber-700 bg-amber-50` |
| Démarches juridiques / administratives | `border-indigo-400/40 text-indigo-600 bg-indigo-50` |
| Très loin de sa famille | `border-violet-400/40 text-violet-600 bg-violet-50` |
| Désert médical | `border-rose-400/40 text-rose-600 bg-rose-50` |
| Zone rurale isolée | `border-emerald-400/40 text-emerald-600 bg-emerald-50` |
| Impact de l'inflation | `border-slate-400/40 text-slate-600 bg-slate-50` |
| Apprend un nouveau métier | `border-teal-400/40 text-teal-600 bg-teal-50` |
| 1ère année universitaire | `border-cyan-400/40 text-cyan-600 bg-cyan-50` |
| Nourrisson arrivé récemment / 1ère grossesse | `border-pink-400/40 text-pink-600 bg-pink-50` |
| Difficile de vivre seul(e) | `border-orange-400/40 text-orange-600 bg-orange-50` |
| Début de vie active | `border-lime-400/40 text-lime-700 bg-lime-50` |
| Aidant familial | `border-purple-400/40 text-purple-600 bg-purple-50` |
| Parcours de transition | `border-sky-400/40 text-sky-600 bg-sky-50` |
| Manque de repères / commerces | `border-stone-400/40 text-stone-600 bg-stone-50` |

## 4. Frontend — `BeneficiarySelection.tsx`

**Supprimer :**
- Badge "Besoin urgent" (tout le bloc urgency_level === 2 + import AlertTriangle)
- La logique `getDonorRegion()` / `DONOR_REGIONS` / `localStorage`
- Le badge proximité basé sur `b.region === donorRegion`

**Ajouter :**
- `context_badge` dans l'interface `Beneficiary` + `proximity_label`
- Après le fetch RPC, un second appel léger pour récupérer `context_badge` depuis `beneficiaries_public` (car le RPC ne retourne pas ce champ et on ne touche pas au RPC)
- Fonction `getDisplayBadge(b)` : priorité **proximity_label > context_badge > "Impact de l'inflation"**
- Fonction `getBadgeStyle(badge)` : mappe chaque badge vers ses classes CSS couleur
- Déduplication : parmi les 4 cartes affichées, si 2 bénéficiaires auraient le même badge, le second reçoit son fallback
- Genrage de "Difficile de vivre seul(e)" → "seule" si woman, "seul" sinon
- Badge affiché sous le nom/âge, centré, 1 seul par carte

**Badge "Nouveau bénéficiaire inscrit"** : calculé en front si `created_at` < 30 jours (priorité au-dessus de context_badge mais en dessous de proximity).

## 5. Proximité — état actuel

Le badge "Proche de chez vous" est déjà calculé par le RPC via `proximity_score` / `proximity_label`. Mais le front ne passe actuellement pas `p_donor_location`. Pour l'activer :
- Si le donateur est connecté : récupérer `postal_prefix`, `department_code`, `region_code`, `country_code` depuis son profil et les passer au RPC
- Si non connecté : le badge proximité n'apparaitra pas (acceptable, le context_badge prend le relais)
- Aucune modification du RPC lui-même

## Ce qui ne change PAS
- `get_empathy_beneficiaries`, `composeBasket`, `matching_rules`, edge functions
- Checkout, paiement, confirmation
- Structure des autres pages

