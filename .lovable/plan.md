

## Plan : Vider et recréer les profils donateurs selon les 3 personas

### Étape 1 — Vider les données existantes
- Créer une edge function temporaire `cleanup-profiles` qui utilise le service role pour :
  - Supprimer les 1 994 utilisateurs de `auth.users` (ce qui cascade vers `profiles` via la FK)
- Exécuter puis supprimer la fonction

### Étape 2 — Ajouter les colonnes persona à `profiles`
Migration SQL pour ajouter :
- `persona_type` (text) — `emotional_responsible`, `empathic_occasional`, `fiscal_optimizer`
- `age` (integer)
- `gender` (text)
- `donation_frequency` (text)
- `avg_donation_amount` (numeric)
- `tax_deduction_sensitive` (boolean)
- `social_media_active` (boolean)
- `csp_category` (text)
- `motivation_tags` (text[])
- `preferred_causes` (text[])

### Étape 3 — Créer 2 000 profils réalistes
Edge function temporaire `seed-donors` qui crée des utilisateurs via `auth.admin.createUser()` en batch :

**Répartition :**
- **1 000 Persona 1** (Émotionnel Responsable) : 30-55 ans, CSP+, don 1-3x/an, 45-80€ moy., sensible fiscalité
- **600 Persona 2** (Empathique Occasionnelle) : 25-45 ans, active réseaux sociaux, don impulsif, 20-50€ moy.
- **400 Persona 3** (Fiscal Optimisateur) : 40-65 ans, don fin d'année, rationnel, 80-150€ moy.

Chaque profil inclut :
- Prénom/nom français réaliste (généré via Lovable AI Gemini Flash en batch)
- Email réaliste (prénom.nom@domaine.fr)
- Localisation française réaliste (région, département, code postal)
- Mot de passe uniforme `Cash4Cause2024!`
- Métadonnées persona complètes

Le trigger `handle_new_user` crée automatiquement l'entrée dans `profiles`, puis on UPDATE avec les colonnes persona et localisation.

### Étape 4 — Nettoyage
- Suppression de la fonction `seed-donors` et `cleanup-profiles`
- Revert `config.toml`

### Fichiers modifiés
1. Migration SQL — nouvelles colonnes persona
2. `supabase/functions/cleanup-profiles/index.ts` — temporaire
3. `supabase/functions/seed-donors/index.ts` — temporaire
4. `supabase/config.toml` — verify_jwt temporaire

