## Diagnostic Léa confirmé

- `avatar_url` = HD du 22/05 (cheveux blancs)
- `avatar_source_url` = NULL → fallback sur `avatar_url`
- Snapshot `avatar_generated_traits` contient déjà `avatar_hair_color: "dark_brown"`, `avatar_expression: "reserved"` — identique aux attributs UI → `diffTraits()` renvoie `[]` → toast « Aucune modification détectée ».
- Cause : `traitsUpdate` (qui inclut `avatar_generated_traits`) est appliqué sur **tous** les chemins de succès, y compris ceux qui ne promeuvent pas `avatar_url`.

## Vérification NULL-vs-valeur dans `diffTraits()`

Confirmé : `normalizeForCompare()` (avatarTraits.ts l.591) traite `null/undefined/""` comme `null`. Donc snapshot `null` vs current `"dark_brown"` → `before !== after` → entrée de diff générée. La réinitialisation par NULL est sûre.

## Correctif — `supabase/functions/generate-avatar/index.ts`

Séparer le snapshot du reste du `traitsUpdate` :

```ts
// Snapshot — uniquement quand avatar_url est promu dans la même UPDATE.
const snapshotTraits = { ...traits };
const snapshotPatch = {
  avatar_generated_traits: snapshotTraits,
  avatar_generated_at: new Date().toISOString(),
};

// Traits courants — peuvent être rafraîchis partout (affichage UI).
const traitsUpdate = { ...traits, avatar_seed: traits.avatar_seed };
```

Application de `snapshotPatch` uniquement dans :
- `mode === "edit_hd"` + QA ≥ pass (l.420) : `{ ...traitsUpdate, ...snapshotPatch, avatar_url, avatar_source_url, … }`
- `mode === "final"` + QA ≥ pass (l.520) : `{ ...traitsUpdate, ...snapshotPatch, avatar_url, avatar_source_url, … }`

Les chemins sans promotion conservent uniquement `traitsUpdate` (sans snapshot) :
- `mode === "edit"` (preview) — l.384
- `mode === "edit_hd"` + QA fail (l.449)
- `mode === "preview"` (l.481)
- `mode === "final"` + QA fail / rejected (l.546)

## Réparation one-shot Léa

```sql
UPDATE public.beneficiaries
SET avatar_generated_traits = avatar_generated_traits || jsonb_build_object(
  'avatar_hair_color',  NULL,
  'avatar_expression',  NULL,
  'avatar_hair_length', NULL,
  'avatar_hair_style',  NULL,
  'avatar_hair_volume', NULL
)
WHERE id = 'de8c19bc-8643-4af8-8bc0-31a57f79cd61';
```

Aucune migration, aucun autre bénéficiaire touché.

## Vérification (point 5 corrigé)

1. SQL one-shot Léa → snapshot avec `avatar_hair_color = null`, `avatar_expression = null`.
2. « Générer un aperçu » sur Léa → logs `edit diff (≥2): avatar_hair_color:null→dark_brown, avatar_expression:null→reserved` ; `source_url = …/final-1779446309458.png`. Aperçu produit : cheveux châtain foncé + expression réservée, visage / pose / cadrage conservés.
3. **Tant que l’aperçu n’est pas promu en HD** : `avatar_url` et `avatar_generated_traits` restent inchangés. Recliquer « Générer un aperçu » sans rien modifier d’autre → diff toujours détectable (snapshot non écrasé par le preview).
4. Après un « Générer en HD » avec QA ≥ pass : même UPDATE écrit `avatar_url`, `avatar_source_url`, `avatar_generated_traits`, `avatar_generated_at`. À partir de ce moment seulement, un nouvel essai sans modification produit `edit diff (0)`.
5. Non-régression : un edit normal sur un autre bénéficiaire fonctionne ; un HD validé écrit bien snapshot + URL ensemble.

## Hors périmètre (intact)

`buildEditPrompt`, `clean-avatar-background`, `avatar_backgrounds`, attribution des fonds, `BeneficiaryAvatar.tsx`, cadrage (`avatarFraming.ts`, `avatar_scale/offset_*`), UI Avatar Studio (boutons, sliders, panneau Versions, dialog cadrage), schéma SQL, RPC.

## Livrables après exécution

- snapshot Léa avant/après réparation (extrait des champs concernés)
- diff détecté avant génération (log `[generate-avatar] de8c… edit diff (…)`)
- `source_url` utilisée
- résultat visuel du test Léa
- confirmation qu’un HD validé met bien à jour `avatar_url` + `avatar_generated_traits` ensemble (lecture base après HD)
