## Avatar Studio — page admin dédiée

Nouvelle page `/admin/avatar-studio` qui remplace l'onglet "Portraits v2". Tout en frontend + extensions ciblées sur les edge functions existantes (pas de refonte du moteur). Le cœur (`generate-avatar`, `qa-avatar`, `generate-avatar-batch`, RLS, matching) reste intact.

---

### 1. Route et structure

- Route `/admin/avatar-studio` ajoutée dans `App.tsx` (garde admin via `useAuth`).
- Layout split-screen :
  - **Colonne gauche (320px)** : liste filtrable des bénéficiaires + statut workflow (draft/generated/approved/locked) + recherche par prénom/région.
  - **Colonne centrale (flex)** : éditeur d'attributs structuré en accordéons.
  - **Colonne droite (380px)** : preview IA + actions de génération + comparateur versions.
- Lien depuis `/admin` → bouton "Ouvrir Avatar Studio" dans l'onglet Portraits + redirection de l'ancien onglet vers la nouvelle page.

---

### 2. Éditeur d'attributs — accordéons

Six sections repliables, chacune avec champs conditionnels :

- **Visage** : `face_shape`, `skin_tone`, `expression` (base).
- **Yeux** : `eye_shape` (étendu : almond, round, hooded, tired, deep_set), `eye_color`, **slider `tired_level` 0-5**, **slider `emotional_brightness` 0-5**.
- **Cheveux** : `hair_color`, `hair_length`, `hair_volume`, `hair_style`.
- **Attributs masculins** (visible uniquement si `avatar_gender = 'man'`) : `beard` (none/light/full/grey), `moustache` (none/light/full), **slider `bald_level` 0-100**, `hair_recession` (none/light/moderate/strong).
- **Attributs culturels** (visible si `culture_tags` non vide) : `head_covering` (none/optional/required), `cultural_style_override` (texte libre court ou select étendu).
- **Vêtements** : `clothing_style`, `clothing_color_palette`.
- **Posture & émotion** : `posture_type`, `emotional_state`, **slider `resilience_level` 0-5**.
- **Contexte social** : `parent_energy`, **slider `fatigue_level` 0-5**, **slider `dignity_level` 0-5** (défaut 5, baisser interdit sous 3 = warning).

Chaque modification = autosave debounced 600ms → `UPDATE beneficiaries`.

---

### 3. Auto-generate from profile

Bouton **"Déduire depuis le profil"** en haut de l'éditeur. Appelle une nouvelle fonction frontend `inferFullTraits(beneficiary)` (extension de `inferAvatarTraits` existante) qui exploite :

- `beneficiary_category`, `approx_age`, `children_count`, `urgency_level`
- `short_story` + `emotional_sentence` → mots-clés FR → `expression`, `posture`, `fatigue_level`, `parent_energy`
- `culture_tags` → biais probabiliste (déjà implémenté côté backend, exposé côté frontend ici)

Pré-remplit TOUS les champs sans écraser ceux marqués `locked` au niveau attribut (lock par champ futur, v1 = écrasement complet avec confirm dialog).

---

### 4. Rule Engine (validation visuelle)

Module `src/lib/avatarRules.ts` qui retourne des warnings non bloquants affichés sous chaque section :

- `approx_age > 50` + `hair_color != gray|white` → suggestion grisonnant
- `approx_age > 60` + `bald_level < 20` (hommes) → suggestion calvitie partielle
- `avatar_gender = 'man'` + `age > 25` + `beard = none` → info (50% adultes barbus en France)
- `children_count >= 3` + `fatigue_level < 2` → warning cohérence
- `culture_tags` contient `maghreb|moyen_orient` + `head_covering = required` + `clothing_style = casual_modest` → suggestion `modest_warm`
- `dignity_level < 3` → bloquant (toast erreur, refuse la génération)

Les règles sont **suggestives**, jamais auto-appliquées. Bouton "Appliquer la suggestion" par règle.

---

### 5. Preview IA temps réel

Colonne droite :

- Image actuelle (avatar_url ou avatar_preview_url) avec badge statut.
- Bouton **Régénérer aperçu** (Nano Banana 2, ~5s) — appelle `generate-avatar` mode `preview`.
- Bouton **Générer HD validée** (Nano Banana Pro + QA) — mode `final`.
- **Sélecteur modèle** : Nano Banana 2 (preview) / Nano Banana Pro (final). Stocké dans payload.
- **Historique versions** : table `avatar_versions` (nouvelle) qui archive chaque génération (url, model, qa_score, generated_at, seed). Permet comparaison 2-up.
- Bouton **Comparer** : ouvre dialog avec 2 versions côte à côte.
- Polling auto pendant génération (déjà en place).

---

### 6. Workflow de validation

Nouveau champ `avatar_workflow_status` enum : `draft | generated | approved | locked`.

- `draft` : attributs édités, pas de génération récente.
- `generated` : génération HD réussie (QA ≥ 75), en attente revue.
- `approved` : admin a cliqué "Approuver" → visible côté donateur (front lit déjà `avatar_url`).
- `locked` : verrouillé, modifications attributs désactivées (bouton "Déverrouiller" requis).

Actions workflow dans la colonne droite :
- `draft → generated` : automatique après génération HD ≥ 75.
- `generated → approved` : bouton **Approuver**.
- `approved → locked` : bouton **Verrouiller**.
- `locked → draft` : bouton **Déverrouiller** avec confirm.

---

### 7. Liste bénéficiaires (colonne gauche)

- Recherche live (prénom, région).
- Filtres rapides : tous / draft / generated / approved / locked / failed.
- Card compacte : avatar miniature + nom + badge workflow + score QA.
- Tri : récents / score QA / non-validés en premier.
- Bouton **Lancer batch** (réutilise `generate-avatar-batch` existant) sur la sélection filtrée.

---

### 8. Schéma base — migration

Ajouts sur `beneficiaries` :
- `avatar_tired_level` int default 0
- `avatar_emotional_brightness` int default 3
- `avatar_beard` text
- `avatar_moustache` text
- `avatar_bald_level` int default 0
- `avatar_hair_recession` text
- `avatar_head_covering` text default 'none'
- `avatar_cultural_style_override` text
- `avatar_resilience_level` int default 3
- `avatar_fatigue_level` int default 0
- `avatar_dignity_level` int default 5
- `avatar_workflow_status` text default 'draft' check in (draft, generated, approved, locked)

Nouvelle table `avatar_versions` :
- `id`, `beneficiary_id` (fk), `image_url`, `model_used`, `qa_score`, `qa_report` jsonb, `seed`, `prompt`, `created_at`
- RLS : admin read/write only.

Vue `beneficiaries_public` étendue pour exposer `avatar_workflow_status` (utile pour cacher les `draft` côté front si souhaité plus tard).

---

### 9. Extension edge function `generate-avatar`

- Lit les nouveaux champs (tired_level, beard, bald_level, etc.) et les injecte dans `buildAvatarPrompt` (extension de `avatarArtDirection.ts`).
- Accepte payload optionnel `{ model_override: 'preview' | 'final' }` (déjà via `mode`).
- À la fin de chaque génération réussie : `INSERT INTO avatar_versions` (archivage).
- Passe `avatar_workflow_status = 'generated'` après QA ≥ 75.
- Refuse génération si `dignity_level < 3` (validation côté serveur aussi).

---

### Détails techniques

```text
src/
  pages/
    AvatarStudio.tsx              (nouveau, route /admin/avatar-studio)
    Admin.tsx                     (lien vers Studio, simplification onglet Portraits)
  components/
    avatar-studio/
      BeneficiaryList.tsx
      AttributeEditor.tsx
      AttributeSection.tsx        (accordéon réutilisable)
      PreviewPanel.tsx
      WorkflowActions.tsx
      VersionCompareDialog.tsx
      RuleWarnings.tsx
  lib/
    avatarTraits.ts               (étendre AVATAR_VOCAB avec nouveaux enums)
    avatarRules.ts                (nouveau — moteur de règles suggestives)
    avatarAutoInfer.ts            (nouveau — wrapper d'inférence depuis profil)

supabase/
  migrations/<ts>_avatar_studio.sql
  functions/_shared/
    avatarTraits.ts               (miroir des nouveaux champs)
    avatarArtDirection.ts         (intègre beard, bald_level, tired_level, etc.)
  functions/generate-avatar/index.ts  (lit nouveaux champs + archive version + workflow_status)
```

### Hors scope (à confirmer si à ajouter)

- Lock par champ individuel (v1 = lock global).
- A/B testing entre versions sur les donateurs.
- Export catalogue avatars en grille PDF pour revue offline.
- Multi-langue de l'éditeur.

### Vérification

1. Migration appliquée → types regénérés.
2. Studio ouvre, liste 192 bénéficiaires.
3. Édition d'un slider `tired_level` sur Fatima → autosave OK en BDD.
4. "Déduire depuis le profil" sur 3 bénéficiaires variés → champs remplis cohérents.
5. Règle âge>50/cheveux noirs → warning visible.
6. Génération preview Nano Banana 2 → preview affichée < 10s.
7. Génération HD → QA ≥ 75 → `avatar_versions` contient 1 row → workflow passe à `generated`.
8. Approve → Lock → tentative édition → champs désactivés.