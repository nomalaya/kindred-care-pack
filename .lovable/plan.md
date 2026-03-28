

# Améliorations page Causes — 3 optimisations conversion

## Modification 1 — Compteurs dynamiques par cause

Remplacer les 6 badges statiques (`CAUSE_BADGES`) par 2 compteurs réels issus de la DB :
- **"{N} bénéficiaires"** — count de `beneficiaries_public` filtrés par `cause_id`
- **"{M} proche de chez vous"** — count des bénéficiaires dont la `region_code` matche celle du donateur (IP geolocation, déjà implémentée)

Si M = 0 (pas de match région ou échec géoloc), n'afficher que le premier compteur.

### Implémentation
- Créer un RPC `get_cause_counts(p_region_code text)` qui retourne `cause_id, total_count, nearby_count` en une seule requête
- Appeler `getDonorLocationFromIP()` au mount puis passer `region_code` au RPC
- Afficher avec 2 petits badges inline : icône Users + nombre, icône MapPin + nombre

## Modification 2 — Message social proof rassurant

Dans `SocialProof.tsx`, variante `cause` :
- Remplacer le fallback "Soyez le premier à aider cette semaine" par : **"Déjà +{total_count} donateurs ont aidé une personne réelle"**
- Utiliser `total_count` de la DB (arrondi à la dizaine inférieure : `Math.floor(total_count / 10) * 10`)
- Si `total_count` < 10, afficher "Rejoignez les premiers donateurs solidaires"

## Modification 3 — CTA explicite par carte

Ajouter un bouton `"Choisir cette cause →"` en bas de chaque carte cause :
- Style : `variant="outline"` avec hover vers `variant="default"` via `group-hover`
- Positionné après les compteurs, pleine largeur dans le padding de la carte
- Texte : "Choisir cette cause" avec une flèche `→`

## Fichiers modifiés

1. **Migration SQL** — nouveau RPC `get_cause_counts(p_region_code text)`
2. **`src/pages/CauseSelection.tsx`** — supprimer `CAUSE_BADGES`, appeler le RPC, afficher les 2 compteurs + bouton CTA
3. **`src/components/SocialProof.tsx`** — modifier le message variante `cause`

## Rendu visuel attendu

```text
┌──────────────────────────────┐
│  [photo cause]               │
├──────────────────────────────┤
│  Aider un enfant en aidant   │
│  sa famille                  │
│                              │
│  Soutenez les familles...    │
│                              │
│  👤 42 bénéficiaires         │
│  📍 7 proche de chez vous    │
│                              │
│  [ Choisir cette cause →   ] │
└──────────────────────────────┘
```

