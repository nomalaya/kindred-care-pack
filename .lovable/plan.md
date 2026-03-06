

## Harmoniser les éléments visuels à la palette Soleil Émeraude (sans toucher aux images)

### Changements

**1. `src/components/BeneficiaryAvatar.tsx`**
- Ligne 51 : cercle de fond `hsl(160, 44%, 93%)` → `hsl(157, 68%, 93%)` (aligné sur primary 157°)
- Ligne 62 : vêtement `hsl(160, 60%, 30%)` → `hsl(157, 68%, 33%)` (primary exact)
- Ligne 24 : couleur du voile `#7B9E87` → `#2A9D6E` (vert émeraude plus saturé, cohérent avec la palette)

**2. `src/components/DonationBasket.tsx`**
- Ligne 88 : flash animation `hsl(160 60% 30% / 0.05)` → `hsl(157 68% 33% / 0.05)` (aligné sur primary)

Tous les autres éléments du site utilisent déjà les variables CSS (`hsl(var(--primary))`, etc.) et s'adaptent automatiquement.

