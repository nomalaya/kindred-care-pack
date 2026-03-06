

## Plan : Améliorations avancées de CashForCause

Ce plan couvre les 10 améliorations demandées. L'interface reste 100% en français.

---

### Phase 1 — Schema & backend

**Migration SQL** — Ajouter les colonnes suivantes à la table `beneficiaries` :

```sql
-- Rotation
total_donations_received INTEGER DEFAULT 0
last_donation_date TIMESTAMPTZ
rotation_score NUMERIC DEFAULT 0

-- Urgence
urgency_level INTEGER DEFAULT 0  -- 0=normal, 1=priority, 2=urgent
urgent_reason TEXT
urgent_until TIMESTAMPTZ

-- Score émotionnel
profile_views INTEGER DEFAULT 0
donation_clicks INTEGER DEFAULT 0
donation_conversion_rate NUMERIC DEFAULT 0
emotional_score NUMERIC DEFAULT 0
```

**Fonction DB `compute_rotation_score`** — Calcule le score pour chaque bénéficiaire actif d'une situation donnée. Formule : pondère la priorité d'urgence, le temps écoulé depuis le dernier don, et inversement le nombre total de dons reçus. Appelée côté client ou via une RPC.

**Fonction DB `get_ranked_beneficiaries(situation_id, limit)`** — Retourne les 3-4 meilleurs profils triés par `rotation_score` décroissant, avec un léger boost pour `urgency_level = 2` et `emotional_score` élevé.

**Trigger sur `donations` INSERT** — Incrémente `total_donations_received` et met à jour `last_donation_date` sur le bénéficiaire correspondant.

**Edge function `track-profile-view`** — Incrémente `profile_views` sur un bénéficiaire. Appelée quand un donneur ouvre un profil. Recalcule `emotional_score` périodiquement.

---

### Phase 2 — Avatars IA réalistes

**Edge function `generate-avatar`** — Utilise Lovable AI (google/gemini-2.5-flash-image) pour générer un portrait réaliste basé sur les attributs stockés (genre, âge, teint, cheveux). Le prompt demande un portrait style portrait photography, fond neutre, lumière naturelle, expression bienveillante. L'image est sauvegardée dans un bucket Storage `avatars`.

**Migration** — Ajouter `avatar_url TEXT` à `beneficiaries`. Le composant `BeneficiaryAvatar` affiche l'image si `avatar_url` existe, sinon fallback sur le SVG actuel.

**Bucket Storage** — Créer un bucket `avatars` (public read).

**Admin** — Bouton "Générer avatar" dans le panneau admin pour chaque bénéficiaire.

---

### Phase 3 — Donation flow amélioré

**Slider continu** — Remplacer les 4 boutons de tier par un `Slider` (déjà installé via Radix) allant de 32€ à 75€, avec les paliers marqués visuellement.

**Barre de progression visuelle** — Au-dessus du panier, une `Progress` bar montrant le pourcentage du montant max atteint. Quand le slider passe un palier, animation de nouveaux produits avec `framer-motion` (scale-in + fade).

**Déduction fiscale live** — Sous le slider, afficher dynamiquement :
- Don : X€
- Déduction fiscale estimée : X × 0.66 = Y€
- Coût réel : X - Y€

Le calcul utilise le taux de 66% (dons aux associations d'intérêt général en France, plafonné).

**Quantités dynamiques** — Pour les produits essentiels (tier 1), augmenter visuellement la quantité affichée quand le montant dépasse 45€ (ex: "Riz ×2").

**Page de confirmation** — Après le don, au lieu de rediriger directement vers `/dashboard`, afficher une page/modale de remerciement avec :
- Message personnalisé : "Votre aide va permettre d'envoyer ce colis à {nom}."
- Liste des produits inclus
- Timeline de livraison attendue
- Bouton "Voir mes dons"

---

### Phase 4 — Sélection des bénéficiaires améliorée

**`BeneficiarySelection.tsx`** — Appeler `get_ranked_beneficiaries` au lieu de `select *` pour afficher 3-4 profils triés par score de rotation.

**Badge urgence** — Si `urgency_level === 2`, afficher un badge discret "Besoin urgent" (Badge component, variant outline, couleur ambre) sur la carte du bénéficiaire.

**Tracking** — Appeler `track-profile-view` quand le donneur clique sur "Aider" (avant la navigation vers `/donate`).

---

### Phase 5 — Images storytelling

**Illustrations statiques** — Ajouter des images d'illustration aux sections clés :
- Homepage hero : image de solidarité (bénévoles préparant des colis)
- Section "Comment ça marche" : icônes illustrées pour chaque étape
- Page de confirmation : illustration chaleureuse

Générer 3-4 images via Lovable AI (gemini-2.5-flash-image) avec des prompts respectueux et positifs, les stocker dans le bucket Storage.

---

### Phase 6 — Micro-interactions & UI polish

- Animation de sélection de bénéficiaire (scale + glow border)
- Animation du bouton CTA au hover (pulse subtil)
- Transition fluide entre les paliers de don
- Animation confetti légère sur la page de confirmation

---

### Fichiers impactés

| Fichier | Changements |
|---|---|
| Migration SQL | Colonnes rotation/urgence/émotionnel, fonctions DB, trigger |
| `supabase/functions/generate-avatar/` | Edge function génération avatar IA |
| `supabase/functions/track-profile-view/` | Edge function tracking vues |
| `src/components/BeneficiaryAvatar.tsx` | Support `avatar_url` avec fallback SVG |
| `src/pages/BeneficiarySelection.tsx` | Rotation algorithm, badge urgence, tracking |
| `src/pages/DonationFlow.tsx` | Slider, progress bar, déduction fiscale, confirmation |
| `src/pages/Index.tsx` | Images storytelling |
| `src/pages/Admin.tsx` | Bouton génération avatar, gestion urgence |
| `src/components/DonationConfirmation.tsx` | Nouveau composant page de remerciement |
| `src/lib/constants.ts` | Taux déduction fiscale |

### Détail technique

- **Rotation score** : calculé en DB via `(urgency_level + 1) * EXTRACT(EPOCH FROM (now() - COALESCE(last_donation_date, '2020-01-01'))) / (total_donations_received + 1)`. Score plus élevé = affiché en priorité.
- **Emotional score** : `(profile_views * 0.2) + (donation_clicks * 0.4) + (donation_conversion_rate * 0.4)`. Utilisé comme tiebreaker dans le tri, pas comme facteur dominant.
- **Avatars** : Prompt type "Portrait photograph of a [gender] person, approximately [age] years old, [skin_tone] skin, [hair_type] hair, warm smile, neutral background, soft natural lighting, NGO campaign style, dignified and hopeful expression". Image 512x512 PNG.
- **Déduction fiscale** : 66% du montant du don, dans la limite de 20% du revenu imposable (on affiche seulement l'estimation à 66%).

