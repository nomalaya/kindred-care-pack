

# Déclinaisons de la Solution C avec flèches — Page Showcase

## Contenu mis à jour

**4 étapes** (prénom = Aïcha) :
1. `Heart` — **Aujourd'hui** — "Vous déclenchez une aide ultra-concrète"
2. `Package` — **Demain** — "Colis préparé pour Aïcha"
3. `Truck` — **Sous 2 j** — "Colis en route vers Aïcha"
4. `Gift` — **Sous 3 j** — "Aïcha reçoit votre aide"

**Mention transparence** : "Vous recevrez une confirmation dès que le colis lui sera remis."

**Flèches** : icône `ChevronRight` (desktop horizontal) / `ChevronDown` (mobile vertical) entre chaque étape.

---

## 5 déclinaisons design de la Solution C

### C1 — Épurée (baseline)
- Fond `bg-card`, bordure fine `border`
- Nœuds : premier rempli `bg-primary`, suivants outline `border-primary/20 bg-background`
- Barre de progression fine derrière les nœuds
- Flèches `text-primary/30`
- Pulse sur le premier nœud

### C2 — Fond émeraude doux
- Fond `bg-primary/5` avec bordure `border-primary/15`
- Nœuds : premier `bg-primary`, suivants `bg-primary/10 border-primary/30`
- Flèches `text-primary/40`
- Barre de progression `bg-primary/20` → `bg-primary`
- Ombre `shadow-warm`

### C3 — Gradient fond
- Fond dégradé : `bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5`
- Nœuds avec ombre portée `shadow-card`
- Premier nœud : `bg-primary shadow-warm`
- Flèches en gradient via `text-primary/50`
- Bordure `border-primary/10`

### C4 — Cards en relief
- Chaque étape est une mini-card avec `shadow-card` et `bg-card rounded-xl p-3`
- Premier nœud card : `shadow-warmLg border-primary/30`
- Hover sur desktop : `hover:shadow-cardHover hover:-translate-y-1`
- Flèches entre les cards `text-muted-foreground`
- Fond section `bg-muted/30`

### C5 — Glassmorphism subtil
- Fond `bg-card/80 backdrop-blur-sm`
- Nœuds avec fond semi-transparent `bg-primary/15 backdrop-blur`
- Premier nœud plein `bg-primary`
- Bordure `border-white/20`
- Flèches `text-primary/25`
- Ombre `shadow-warm`

---

## Fichier modifié

### `src/pages/TimelineShowcase.tsx`
- Supprimer les solutions A, B, D
- Remplacer par les 5 déclinaisons C1–C5
- Mettre à jour les données (textes, prénom Aïcha, délais Sous 2 j / Sous 3 j)
- Mettre à jour le `TransparencyBlock`
- Ajouter `ChevronRight` / `ChevronDown` entre les étapes
- Chaque déclinaison est une section distincte avec titre et description

1 fichier modifié.

