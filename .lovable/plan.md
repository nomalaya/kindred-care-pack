

## Remplissage réaliste de la table `beneficiaries`

### Contexte
- 12 bénéficiaires existants (exemples de structure)
- 24 situations réparties sur 6 causes
- 6 `profile_type` dans `profile_mappings`
- Besoin : ~200 bénéficiaires diversifiés, réalistes, en français

### Approche

Créer une **edge function temporaire** `seed-beneficiaries` qui :

1. Récupère les 24 situations et leurs causes depuis la DB
2. Appelle l'API Lovable AI (Gemini) pour générer **8 bénéficiaires par situation** (= 192 au total) avec des données ultra-réalistes :
   - Prénoms français diversifiés (origines variées : française, maghrébine, subsaharienne, asiatique, européenne de l'Est)
   - Âges cohérents avec la situation (ex: étudiants 18-28, personnes âgées 65-90)
   - Régions françaises réelles (13 régions métropolitaines)
   - Histoires courtes émouvantes en français (~2 phrases)
   - Phrases émotionnelles à la 1ère personne
   - Tags alimentaires/culturels réalistes
   - `profile_type` correspondant à la cause
   - `beneficiary_category` (famille/individuel/jeune/senior) pour respecter la diversité requise par le moteur d'empathie
   - `children_count`, `urgency_level` (0-2), `avatar_gender/age_range/hair_type/skin_tone`
3. Supprime les 12 existants puis insère les 192 nouveaux en batch via service role key

### Diversité garantie par situation
Pour chaque situation (8 profils) :
- Au moins 1 profil familial, 1 individuel, 1 jeune, 1 adulte/senior
- Mix de genres, origines culturelles, régions
- Niveaux d'urgence variés (0, 1, 2)

### Fichiers
1. `supabase/functions/seed-beneficiaries/index.ts` — fonction temporaire
2. `supabase/config.toml` — ajout config `verify_jwt = false`
3. Nettoyage après exécution

### Sécurité
- Service role key pour bypass RLS
- Fonction supprimée après import
- Aucun changement de schéma

