# Gestion des badges contextuels des bénéficiaires — spécification

## État existant (audit du 2 novembre 2026)
- `public.beneficiaries.context_badge` : valeur textuelle du badge d'un bénéficiaire.
- `public.beneficiaries_public.context_badge` : valeur exposée publiquement.
- Exemples de valeurs : « Logement provisoire », « Aidant familial », « Désert médical ».
- La gestion des badges n'est pas identifiée comme une fonctionnalité dédiée dans `src/pages/Admin.tsx`.

## Fonctionnalité cible
1. Onglet « Badges » réservé aux administrateurs : liste, création, renommage, activation/désactivation, ordre et aperçu.
2. Attribution manuelle depuis la fiche d'un bénéficiaire ; suppression de l'attribution.
3. Préserver l'affichage actuel des badges publics et les valeurs existantes pendant la migration.
4. Une désactivation masque le badge sur le site public sans effacer l'historique.
5. Les changements doivent être journalisés (acteur, date, ancienne/nouvelle valeur).
6. Les autorisations sont vérifiées dans Supabase (RLS / RPC), et pas seulement dans l'interface.

## Schéma proposé (à valider avant migration)
- `context_badges` : `id`, `label`, `slug`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`.
- `beneficiary_context_badges` : `beneficiary_id`, `badge_id`, `assigned_by`, `assigned_at`, `source`.
- `context_badge_audit` : journal d'opérations administrateur.
- Une phase de compatibilité doit tenir compte du champ texte actuel `context_badge`, et de la vue `beneficiaries_public`.

## Règles automatiques — phase ultérieure facultative
- Ne jamais inférer des situations sensibles à partir de texte libre ou de caractéristiques médicales.
- Règles explicites, révisables par administrateur, avec aperçu avant application.
- Priorité à l'attribution manuelle et à la validation humaine.

## Plan de livraison
1. Inventorier les composants de cartes et les règles de visibilité actuelles.
2. Vérifier la définition de `beneficiaries_public` et les politiques RLS.
3. Créer la migration de compatibilité et le catalogue initial à partir des valeurs distinctes.
4. Ajouter l'interface d'administration et les contrôles d'accès.
5. Tester sur prévisualisation Vercel et données non publiées.
6. Publier uniquement après validation.

**Aucune modification de base de données ou de production ne doit être faite à partir de ce document seul.**
