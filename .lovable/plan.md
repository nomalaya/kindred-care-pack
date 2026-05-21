# Icônes contextuelles sur les libellés de champs (Avatar Studio)

## Objectif

Permettre de scanner instantanément l'éditeur d'attributs grâce à une icône à gauche de chaque libellé (Genre, Tranche d'âge, Forme du visage, etc.).

## Implémentation

1. **Map icônes → champs** dans `src/pages/AvatarStudio.tsx` (à côté de `FIELD_LABELS`) :

| Champ | Icône lucide |
|---|---|
| Genre | `VenusAndMars` |
| Tranche d'âge | `CalendarDays` |
| Forme du visage | `Smile` |
| Teint | `Palette` |
| Forme des yeux | `Eye` |
| Couleur des yeux | `Eye` |
| Couleur de cheveux | `Palette` |
| Longueur | `Ruler` |
| Volume | `Layers` |
| Coiffure | `Scissors` |
| Type de cheveux | `Waves` |
| Barbe | `User` |
| Moustache | `User` |
| Recul des cheveux | `ArrowUp` |
| Couvre-chef | `Crown` |
| Style culturel (override) | `Globe` |
| Style vêtements | `Shirt` |
| Palette vêtements | `Palette` |
| Posture | `PersonStanding` |
| Aide à la mobilité | `Accessibility` |
| Expression | `Smile` |
| Énergie parentale | `Baby` |

Sliders (fatigue, dignité, résilience, luminosité, calvitie) reçoivent aussi des icônes : `BatteryLow`, `ShieldCheck`, `Sparkles`, `Sun`, `CircleDot`.

2. **`SelectField` et `SliderField`** acceptent un nouveau prop optionnel `icon?: LucideIcon` et l'affichent en `h-3.5 w-3.5 text-muted-foreground` à gauche du `<Label>`.

3. **Tous les appels** dans les onglets (Visage / Yeux / Cheveux / Masculin / Culturel / Vêtements / Posture / Social) passent l'icône correspondante depuis la map.

## Hors scope

Pas de changement de logique métier, ni de styles globaux du design system. Seulement un ajout visuel dans l'éditeur d'Avatar Studio.
