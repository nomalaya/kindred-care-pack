

## Adapter les images à la palette Soleil Émeraude

### Éléments visuels à harmoniser

1. **Image hero (`hero-solidarity.jpg`)** — Photo statique qui peut ne pas s'accorder chromatiquement avec la palette émeraude/vert. Régénérer une nouvelle image hero via l'AI image generation avec des tons verts/émeraude dominants.

2. **SVG fallback avatars (`BeneficiaryAvatar.tsx`)** — Deux couleurs HSL hardcodées qui ne suivent pas les variables CSS :
   - Ligne 51 : cercle de fond `hsl(160, 44%, 93%)` → utiliser `hsl(var(--primary) / 0.1)` pour suivre la palette
   - Ligne 62 : vêtement `hsl(160, 60%, 30%)` → utiliser `hsl(var(--primary))` pour suivre la palette

3. **Image confirmation (`confirmation-warmth.jpg`)** — Existe mais inutilisée. Pas d'action nécessaire.

4. **AI-generated avatars** — Déjà générés avec fond neutre blanc, pas de disharmonie majeure. Le prompt dans `generate-avatar/index.ts` utilise déjà "solid white background", ce qui est neutre et compatible avec toute palette.

### Changements techniques

**Fichier 1 : `src/assets/hero-solidarity.jpg`**
- Générer une nouvelle image hero via Lovable AI (modèle `google/gemini-2.5-flash-image`) avec un prompt adapté : scène de solidarité avec des tons verts émeraude, lumière chaude naturelle, style ONG moderne
- Sauvegarder et remplacer l'image existante

**Fichier 2 : `src/components/BeneficiaryAvatar.tsx`**
- Ligne 51 : `fill="hsl(160, 44%, 93%)"` → `fill="hsl(157, 68%, 93%)"` (ton de fond aligné sur primary 157°)
- Ligne 62 : `fill="hsl(160, 60%, 30%)"` → `fill="hsl(157, 68%, 33%)"` (vêtement aligné sur primary exact)

**Fichier 3 : `src/components/DonationBasket.tsx`**
- Ligne 88 : `hsl(160 60% 30% / 0.05)` → `hsl(157 68% 33% / 0.05)` (flash animation alignée sur primary)

