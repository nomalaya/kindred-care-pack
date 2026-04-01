

# Mise en production de la timeline C5 (Glassmorphism)

## Actions

### 1. Remplacer `src/components/ImpactTimeline.tsx`
Réécrire le composant avec le code de la variante C5 du showcase :
- Accepte `beneficiaryName` en prop (remplace "Aïcha" par le prénom dynamique)
- 4 étapes : Heart/Aujourd'hui, Package/Demain, Truck/Sous 2 j, Gift/Sous 3 j
- Fond glassmorphism (`bg-card/80 backdrop-blur-sm border-white/20 shadow-warm`)
- Barre de progression : desktop `left-[12.5%] right-[12.5%]`, mobile verticale
- Premier nœud avec pulse intégré (`boxShadow` animé via framer-motion)
- Nœuds inactifs : `bg-primary/15 backdrop-blur border-white/20`
- Bloc transparence ShieldCheck : "Vous recevrez une confirmation dès que le colis lui sera remis."
- Responsive mobile/desktop via `useIsMobile()`

### 2. Supprimer `src/pages/TimelineShowcase.tsx`
Page temporaire devenue inutile.

### 3. Nettoyer `src/App.tsx`
Supprimer la route `/timeline-showcase` et son import.

## Fichiers concernés
1. **Modifier** `src/components/ImpactTimeline.tsx` — remplacement complet
2. **Supprimer** `src/pages/TimelineShowcase.tsx`
3. **Modifier** `src/App.tsx` — retirer 1 route + 1 import

