# Correctif — Cadrage avatar perdu sur les écrans publics

## Diagnostic

Le cadrage est **bien persisté** en base (colonnes `avatar_scale`, `avatar_offset_x`, `avatar_offset_y` sur `beneficiaries`) et **bien appliqué** dans Avatar Studio / Admin / BeneficiaryListPanel (qui lisent la table `beneficiaries` directement).

En revanche, **tous les écrans publics** passent par la vue `beneficiaries_public` ou la RPC `get_empathy_beneficiaries`, qui **n'exposent pas** ces 3 colonnes. Résultat : `readFramingFromRow(row)` reçoit `undefined` → `DEFAULT_FRAMING` → aucun transform appliqué.

Vue actuelle (vérifiée via `pg_get_viewdef`) : 26 colonnes, aucune des 3 colonnes de framing.

## Fichiers concernés

**Migration SQL** (1 seul fichier, source unique de vérité côté DB) :
- Recréer `public.beneficiaries_public` en ajoutant `avatar_scale`, `avatar_offset_x`, `avatar_offset_y`.
- Mettre à jour la signature et le `RETURNS TABLE` de la RPC `get_empathy_beneficiaries` pour exposer ces 3 colonnes (en lecture depuis `b.*`).
- Re-`GRANT SELECT` sur la vue à `anon, authenticated`.

**Front (ajustements ciblés)** :
- `src/pages/Dashboard.tsx` ligne 58 : ajouter `avatar_scale, avatar_offset_x, avatar_offset_y` dans le sous-select `beneficiaries_public!beneficiary_id(...)`.
- Aucun autre changement front nécessaire : les consommateurs utilisent `select("*")` et passent déjà la row à `readFramingFromRow`.

## Écrans vérifiés

| Écran | Source | Statut après fix |
|---|---|---|
| Avatar Studio | `beneficiaries` direct | déjà OK |
| Admin | `beneficiaries` direct | déjà OK |
| BeneficiaryListPanel | `beneficiaries` direct | déjà OK |
| Fiche bénéficiaire (DonationFlow) | `beneficiaries_public.*` | ✅ corrigé via vue |
| BeneficiarySelection | RPC + fallback `beneficiaries_public.*` | ✅ corrigé via RPC + vue |
| SituationSelection | `beneficiaries_public.*` | ✅ corrigé via vue |
| CheckoutFlow / OrderConfirmation | `beneficiaries_public.*` | ✅ corrigé via vue |
| Dashboard | sous-select nommé | ✅ corrigé via select + vue |

## Architecture finale

- **Source unique** : 3 colonnes sur `beneficiaries`.
- **Exposition publique** : vue `beneficiaries_public` + RPC `get_empathy_beneficiaries` propagent ces colonnes telles quelles.
- **Lecture front** : tous les écrans utilisent `BeneficiaryAvatar` + `readFramingFromRow(row)`. Aucun code spécifique par écran.
- Toute modification dans Avatar Studio est désormais reflétée immédiatement partout après refetch.

## Hors scope

- Pas de changement à `BeneficiaryAvatar`, `avatarFraming.ts`, ni à la logique métier (matching, basket).
- Pas de logs temporaires : la cause est identifiée formellement (vue sans les colonnes), aucun debug runtime nécessaire.
- Pas de régénération d'avatars.

## Vérification post-déploiement

1. Recharger la fiche d'Irina → l'image doit apparaître avec le scale/offset défini dans Avatar Studio.
2. Vérifier la même cohérence sur SituationSelection / Dashboard / Checkout.
