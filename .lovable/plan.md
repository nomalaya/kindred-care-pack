## Modale "Voir en grand" enrichie + nettoyage fond sur n'importe quelle version

Option B validée : petite extension backend pour permettre le nettoyage du fond sur une version arbitraire (pas seulement l'avatar actif).

### 1. Extension `clean-avatar-background` (edge function)

Fichier : `supabase/functions/clean-avatar-background/index.ts`

Ajout d'un mode alternatif accepté dans le `body` :
- `source_url` (string, optionnel) — URL publique de la version à nettoyer.
- `version_id` (string, optionnel) — id de la ligne `avatar_versions` correspondante, pour traçabilité.

Comportement :
- Si `source_url` fourni → nettoie cette image spécifique, crée une nouvelle ligne `avatar_versions` (model_used `clean-bg/version/...`), **sans** modifier `avatar_url` ni `avatar_preview_url` du bénéficiaire. Retourne l'URL nettoyée.
- Si `source_url` absent → comportement actuel inchangé (nettoie `avatar_url` ou `avatar_preview_url` selon `target`).
- Chemin d'upload distinct : `cleaned/version-{version_id or hash}.png` pour éviter les collisions.
- Toutes les protections existantes conservées (seuil `transparentRatio`, gestion 402/429).

Aucune modification de `config.toml`, aucune nouvelle variable d'environnement.

### 2. Modale "Voir en grand" enrichie

Fichier : `src/pages/AvatarStudio.tsx` (bloc `Dialog` `detailVersionId` uniquement).

**Bloc Informations (colonne droite ou sous l'image sur mobile) :**
- Date absolue complète (`Intl.DateTimeFormat("fr-FR")` avec heure).
- Type : Portrait HD / Aperçu rapide / Import / Nettoyage fond (déduit de `model_used`).
- Score QA global si présent, avec code couleur (vert ≥85, ambre 70-84, rouge <70).
- Modèle utilisé (`model_used` brut, texte petit, muted).
- Statut fond : `Fond transparent ✓` (si URL contient `/cleaned/` et `.png`) ou `Fond blanc` sinon.
- Statut d'usage : phrase explicite selon Actif / Source explicite / Historique.
- Lien discret « Ouvrir dans un nouvel onglet » sur l'URL publique.

**Bloc Actions (footer de la modale) :**
- **Utiliser cette version** (primary) — inchangé, comportement actuel.
- **Nettoyer le fond** — visible uniquement si le fond n'est pas déjà transparent. Appelle `clean-avatar-background` avec `source_url = v.image_url` et `version_id = v.id`. Affiche un spinner pendant l'appel. Ajoute la version nettoyée à la liste (via refetch local ou insertion optimiste). Toast succès/erreur. Désactivé pendant tout `busy` global.
- **Télécharger** — lien `<a href={url} download>`.
- **Copier l'URL** — `navigator.clipboard.writeText`, toast confirmation.
- **Comparer avec l'actif** — visible si la version n'est pas déjà l'actif. Pré-remplit la sélection multi (actif + version courante), ferme la modale et scroll vers le comparateur (réutilise la logique §8 du plan précédent).
- **Supprimer** (rouge, à gauche visuellement) — inchangé, avec protections existantes.
- **Fermer** (ghost).

### 3. Nouvel état local

- `cleaningVersionId: string | null` — spinner ciblé sur le bouton "Nettoyer le fond" dans la modale.

### 4. Confirmations

- **Aucun appel IA nouveau non déclenché explicitement par l'utilisateur.** Le bouton "Nettoyer le fond" appelle Gemini (comme aujourd'hui côté avatar actif) — c'est le seul consommateur de crédits, uniquement sur clic explicite.
- Aucun changement sur : prompts de génération, modèles avatar, cadrage, QA, matching, panier, checkout, SQL schéma, RLS.
- L'extension edge function est **additive** — l'appel existant (sans `source_url`) continue de fonctionner à l'identique.

### 5. Fichiers modifiés

- `supabase/functions/clean-avatar-background/index.ts` — ajout du mode `source_url`.
- `src/pages/AvatarStudio.tsx` — enrichissement du bloc `Dialog` `detailVersionId` uniquement.
- `.lovable/plan.md` — mise à jour de la section §5 pour refléter la modale enrichie.
