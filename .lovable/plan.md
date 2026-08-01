## État vérifié (base de données, à l'instant)

| Mesure | Valeur |
|---|---|
| Bénéficiaires actifs | 200 |
| Régénérés avec la planche de style abstraite + QA `attribute_conformity` | 131 |
| Restant à régénérer | 69 |
| Statut `failed` | 17 |
| Statut `validated` | 183 |
| Sans avatar du tout | 0 |
| Score QA moyen des régénérations récentes | 85 |

Le script de fond de la vague précédente n'est plus en cours d'exécution (aucun processus actif, dossier de travail perdu). Rien n'a été publié à moitié : les profils non encore régénérés gardent leur image précédente, aucun trou visuel dans le catalogue.

Causes des 17 échecs, telles qu'enregistrées dans `avatar_qa_report` : `score_below_60` (rejet QA légitime — conformité aux attributs), `work_error` et `retry_failed` (interruption de la fonction Edge, pas un défaut d'image). Les cas `work_error` / `retry_failed` sont donc de simples relances.

## Ce que je fais

1. **Reprise séquentielle des 69 profils restants**
   Relance de `generate-avatar` en mode `final`, par vagues de 4 en parallèle, avec suivi de progression en base sur `avatar_generated_at` après chaque vague. Génération via Google AI Studio direct : **0 crédit Lovable**. Aucun changement de code de pipeline — on exécute la configuration déjà validée sur les 6 profils témoins.

2. **Rattrapage des 17 échecs, en deux traitements distincts**
   - `work_error` / `retry_failed` : simple relance identique.
   - `score_below_60` (Maria, Sophie, Fatima, Yukiko, Léa…) : jusqu'à 3 tentatives, la graine de génération changeant à chaque passe. Le rejet QA fait son travail — ces profils sont précisément ceux qui clonaient un visage d'ancre. Si un profil reste rejeté après 3 passes, je le signale au lieu de le publier de force, avec le détail du critère non conforme.

3. **Contrôles de sortie appliqués à chaque image** (déjà en place, non modifiés)
   Garde alpha (fond transparent obligatoire, jamais de blanc cuit), `trimToStudioBox` (buste à 0 % de marge basse), cadrage trombinoscope, QA bloquant sur `style_match`, `bottom_fill`, `no_gap_under_shoulders` et `attribute_conformity`.

4. **Audit final anti-clones**
   Sur les 200 avatars : tableau attribut demandé vs attribut observé, et relevé des dominances phénotypiques (couleur/texture de cheveux, carnation, corpulence) pour confirmer qu'aucune famille de visages ne réapparaît. Livrable : planche de contrôle du catalogue complet.

5. **Publication**
   Une fois les 200 conformes : passage en `approved` / `validated`, puis export JSON via le bouton déjà présent dans l'Avatar Studio. Je ne publie rien avant ton accord sur la planche de contrôle.

## Détails techniques

- Aucune modification de fichier prévue. `avatarStyleAnchors.ts`, `qa-avatar/index.ts`, `generate-avatar/index.ts`, `avatarNormalize.ts`, `avatarStudio.ts` et la logique de sélection restent en l'état validé.
- Orchestration par script jetable hors dépôt (`/tmp/regen/`), pas de nouvelle fonction Edge : `generate-avatar-batch` s'interrompt sur les longues séries (« CPU Time exceeded » observé dans les logs), l'appel unitaire séquentiel est le mode fiable.
- Durée estimée : environ 25 à 35 minutes pour les 69, plus les relances. Je fais des points d'étape sans attendre la fin.
