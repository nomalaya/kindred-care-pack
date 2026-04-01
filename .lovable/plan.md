

# Retirer les flèches + pulse intégré au cercle de l'étape 1

## Modifications dans `src/pages/TimelineShowcase.tsx`

### 1. Supprimer les flèches
- Supprimer le composant `Arrow` et ses imports (`ChevronRight`, `ChevronDown`)
- Dans chaque variante C1–C5, supprimer les blocs conditionnels `{i < STEPS.length - 1 && (...Arrow...)}` 

### 2. Pulse intégré au cercle actif
Actuellement le pulse est un `motion.div` **séparé** superposé au cercle. Le remplacer par un effet directement sur le cercle lui-même :
- Supprimer le `motion.div` pulse séparé (absolute, scale animation)
- Ajouter sur le `div` du cercle de l'étape active une classe `animate-pulse` ou un `ring` animé intégré : `ring-4 ring-primary/20 animate-[pulse_2s_ease-in-out_infinite]`
- Cela donne un halo pulsatif **sur** le cercle, pas en overlay

Approche retenue : utiliser `shadow` pulsatif via framer-motion directement sur le cercle :
```tsx
<motion.div
  animate={{ boxShadow: ["0 0 0 0px rgba(var(--primary-rgb), 0.3)", "0 0 0 8px rgba(var(--primary-rgb), 0)", "0 0 0 0px rgba(var(--primary-rgb), 0.3)"] }}
  transition={{ duration: 2, repeat: Infinity }}
  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
>
```
Cela évite un élément supplémentaire et intègre le pulse au cercle.

### Fichier modifié
- `src/pages/TimelineShowcase.tsx` — suppression flèches + refactoring pulse dans les 5 variantes

