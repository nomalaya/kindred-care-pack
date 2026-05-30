# Système de fonds personnalisés pour les avatars

## Objectif

Vous fournirez vos propres fonds (mesh gradients). L'IA génère uniquement le personnage sur fond transparent. La composition se fait **en CSS dans l'UI**, ce qui garantit cohérence, contrôle, performance et variations infinies.

---

## 1. Spécifications des fonds que vous importerez

À respecter pour chaque image :

- **Format** : PNG ou **WebP** (WebP recommandé, ~3× plus léger)
- **Dimensions** : carré **1024 × 1024 px** minimum (idéal 1536 × 1536)
- **Ratio** : strictement 1:1, **fond perdu edge-to-edge** (pas de marge blanche, pas de cadre)
- **Poids cible** : < 300 Ko (WebP qualité 80)
- **Espace colorimétrique** : sRGB
- **Composition** :
  - Centre clair / quasi-blanc (~60-70% de la surface) pour préserver la lisibilité du visage
  - Maximum **3 halos colorés** sur les bords, style mesh gradient moderne
  - Couleurs pastel / modérées, luminosité haute, saturation moyenne-basse
  - **Aucune** texture, **aucun** objet, **aucun** décor réaliste, **aucun** texte/logo
  - Pas de fond sombre, pas de contraste fort
- **Nommage des fichiers** : `bg-001.webp`, `bg-002.webp`, … `bg-200.webp` (numérotation à 3 chiffres pour tri stable)

---

## 2. Stockage : bucket Cloud public

- Nouveau bucket public `avatar-backgrounds` (séparé du bucket `avatars` existant)
- RLS : lecture publique, écriture admin uniquement
- URL prédictibles : `https://…/storage/v1/object/public/avatar-backgrounds/bg-001.webp`
- Vous pourrez ajouter/retirer des fonds à tout moment depuis l'admin, sans redéploiement

---

## 3. Génération IA : avatars sur fond transparent

Modification de `supabase/functions/_shared/avatarArtDirection.ts` :

- Suppression du `buildBackgroundBlock` (système des 3 halos) — devenu inutile
- Remplacement par un bloc strict :
  > « BACKGROUND : pure plain white background, no halo, no gradient, no shadow, no decoration. Subject must be cleanly isolated, ready for background removal. »
- Ajout d'une étape post-traitement légère côté edge function `generate-avatar` :
  - Soit on garde le fond blanc (composition CSS suffisante avec `mix-blend-mode: multiply` derrière)
  - Soit on appelle une passe de détourage automatique (à confirmer — voir question ci-dessous)

Recommandation : **commencer sans détourage**, juste fond blanc strict. C'est plus rapide, plus fiable, et le rendu visuel est déjà excellent en CSS via superposition.

---

## 4. Composition CSS dans l'UI

Modification de `src/components/BeneficiaryAvatar.tsx` (et là où l'avatar est affiché en grand) :

```text
┌─────────────────────────┐
│  <div backgroundImage>  │  ← fond importé, cover, center
│   ┌───────────────┐     │
│   │   <img>       │     │  ← avatar IA, fond blanc/transparent
│   │   avatar      │     │
│   └───────────────┘     │
└─────────────────────────┘
```

- `background-size: cover`, `background-position: center`
- Avatar centré, `object-fit: cover`, `border-radius: 50%` (cercle) ou carré arrondi selon le contexte
- Responsive : le fond suit la taille du container (sm / md / lg déjà gérés)
- Conservation du fallback gradient + initiale quand pas d'avatar généré

---

## 5. Sélection déterministe par seed

Nouveau helper `src/lib/avatarBackground.ts` :

- Hash FNV-1a sur `beneficiary.avatar_seed` (déjà existant)
- `index = hash % nombreDeFonds`
- Retourne l'URL publique `bg-XXX.webp`
- Le nombre de fonds disponibles est lu depuis une **table légère** `avatar_backgrounds` (id, filename, is_active) — permet d'ajouter/désactiver des fonds sans toucher au code

Résultat : même bénéficiaire = toujours le même fond, mais 200 fonds répartis équitablement sur l'ensemble du catalogue.

---

## Détails techniques

**Migration DB**
- Bucket Storage `avatar-backgrounds` (public)
- Table `public.avatar_backgrounds` : `id`, `filename`, `is_active`, `created_at`
- RLS : SELECT public, INSERT/UPDATE/DELETE admin uniquement
- Index actif pour lecture rapide

**Upload de vos 200 fonds**
- Soit via l'admin Lovable Cloud (drag & drop dans le bucket)
- Soit via un petit écran admin que je peux ajouter dans `/admin` (upload multiple + insertion auto dans la table)

**Fichiers impactés**
- `supabase/migrations/…` — bucket + table
- `supabase/functions/_shared/avatarArtDirection.ts` — fond blanc strict
- `src/lib/avatarBackground.ts` — nouveau helper de sélection
- `src/components/BeneficiaryAvatar.tsx` — composition CSS
- `src/pages/BeneficiarySelection.tsx`, `Dashboard.tsx`, `OrderConfirmation.tsx`, `CartSummary.tsx`, `DonationFlow.tsx` — passent le seed à l'avatar (déjà disponible via le bénéficiaire)
- `src/pages/AvatarStudio.tsx` — preview avec le bon fond

**Régénération**
- Pas besoin de régénérer les 200+ avatars existants pour appliquer les fonds : la composition est CSS
- En revanche, pour avoir des sujets **vraiment sur fond blanc strict**, il faudra régénérer (bouton batch déjà présent dans l'Avatar Studio)

---

## 2 décisions à prendre avant que je code

1. **Upload des fonds** : je vous ajoute un petit écran admin de drag & drop multiple (recommandé pour 200 fichiers), ou vous préférez uploader manuellement dans le bucket ?
2. **Détourage automatique** : on reste sur fond blanc strict (simple, rapide, rendu déjà très propre sur halo clair) ou on ajoute une passe de suppression de fond (plus lourd, plus coûteux, mais avatar parfaitement intégré au fond) ?

Une fois ces deux points tranchés, je lance l'implémentation.
