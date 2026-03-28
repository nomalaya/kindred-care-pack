

# Corrections page Causes — 3 ajustements

## 1. Social proof : toujours afficher un chiffre fictif rassurant

Dans `src/components/SocialProof.tsx`, variante `cause` (lignes 41-45) :
- Supprimer le fallback "Rejoignez les premiers donateurs solidaires"
- Toujours afficher : `"Deja +2 340 donateurs ont aide une personne reelle"` 
- Si `stats.total_count >= 10`, utiliser le chiffre arrondi comme aujourd'hui ; sinon, afficher le chiffre fictif `2 340` (crédible, effet mouvement collectif)

## 2. Badges en haut a droite

Dans `src/pages/CauseSelection.tsx`, ligne 119 :
- Changer `left-3` en `right-3` pour positionner le badge beneficiaires en haut a droite de la photo

## 3. Couleurs design system sur les badges

Remplacer les badges noirs semi-transparents par des couleurs du design system :
- Badge beneficiaires (sur photo) : `bg-primary/80 text-primary-foreground` au lieu de `bg-black/50 text-white`
- Badge proximite (dans le body) : garder `variant="outline"` avec `text-primary border-primary/30` (deja conforme)

## Fichiers modifies

1. **`src/components/SocialProof.tsx`** — ligne 42-44 : remplacer le fallback par le chiffre fictif `2 340`
2. **`src/pages/CauseSelection.tsx`** — ligne 119 : `left-3` → `right-3` ; ligne 120 : couleurs design system

