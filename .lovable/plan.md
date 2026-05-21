## Diagnostic de l'interface actuelle

J'ai analysé `AvatarStudio.tsx` (1019 lignes, 7 onglets `Tabs` superposés + Contexte + Inférence + Règles). Les douleurs concrètes :

1. **Trop d'onglets horizontaux** (Visage, Yeux, Cheveux, Masculin, Culturel, Vêtements, Posture, Social) → ils passent à la ligne (`flex-wrap`) et l'utilisateur perd le repère.
2. **Coupure verticale** : chaque onglet déclenche un scroll interne (`overflow-y-auto`) dans une zone déjà comprimée par le `ContextPanel`, le bandeau d'inférence et le bandeau de verrou. Sur 638 px de haut, il reste ~250 px utiles pour les champs → d'où le sentiment de "coupé en bas".
3. **Navigation par onglets = on ne voit qu'une catégorie à la fois** → impossible de comparer rapidement visage + cheveux, ou de scanner l'ensemble avant génération.
4. **Hiérarchie peu lisible** : pas de progression visible (combien de champs remplis ? combien restants ?), pas de regroupement "essentiel / avancé".
5. **Actions critiques (Pré-remplir, Générer, Verrouiller) noyées** dans la colonne de droite, parfois sous le pli.
6. **Contexte (histoire courte, phrase émotionnelle)** prend une place fixe alors qu'il est rarement édité après création.

---

## Proposition de refonte (UX, sans changer la logique métier)

### A. Remplacer les onglets horizontaux par une **navigation latérale fine** (rail gauche dans le panneau d'édition)

```text
┌─────────────────────────────────────────────────────────┐
│  [Rail]    │  Section active (scroll naturel)           │
│  ◉ Visage  │                                            │
│  ○ Yeux    │   ┌────────────┐ ┌────────────┐            │
│  ○ Cheveux │   │ Genre      │ │ Âge        │            │
│  ○ Masculin│   └────────────┘ └────────────┘            │
│  ○ Culturel│   ...                                       │
│  ○ Vêtements                                            │
│  ○ Posture │                                            │
│  ○ Social  │                                            │
└─────────────────────────────────────────────────────────┘
```

- Le rail reste visible en permanence, avec **pastille de complétion** (3/5) et **point d'alerte** (warnings/erreurs).
- Plus de wrap, plus d'onglets qui disparaissent.

### B. Mode alternatif : **accordéon "tout sur une page"** (toggle utilisateur)

- Bouton de bascule "Vue par section ↔ Vue complète" en haut.
- Vue complète = toutes les sections empilées avec en-têtes sticky → l'utilisateur scrolle d'un trait, fait Ctrl+F, etc.
- Mémorisé par utilisateur (localStorage).

### C. **Barre d'actions sticky** en haut du panneau d'édition

Regroupe : Pré-remplir ✨ · Générer (preview/final) · Verrouiller 🔒 · Sauvegarde auto (état). Toujours visible, jamais sous le pli.

### D. Compresser **Contexte + Inférence**

- `ContextPanel` → repliable par défaut une fois rempli (résumé sur 1 ligne).
- `InferenceReasonsPanel` → popover déclenché par un badge ✨ "X champs auto-déduits" (au lieu d'un bandeau permanent).

### E. Indicateurs de **progression et qualité**

- En-tête de panneau : "Avatar 14/18 critères · 2 alertes" + barre de progression fine.
- Pastilles par section dans le rail (déjà partiellement présentes pour les warnings).

### F. Groupements plus naturels (sans changer les champs)

- Fusionner **Visage + Yeux** en "Visage" (sous-titres).
- Fusionner **Cheveux + Masculin** en "Cheveux & pilosité" (conditionnel).
- Garder Culturel / Vêtements / Posture / Social.
- Passe de 7-8 onglets à **5 sections**.

### G. Densité et lisibilité

- Grille responsive : `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` partout, gap 4 → confort sur 1170 px (viewport actuel).
- Labels `SelectField` raccourcis (déjà icônifiés).
- Hauteur des selects harmonisée (h-9).

---

## Détails techniques

- **Fichier principal** : `src/pages/AvatarStudio.tsx` (remplacement du bloc `<Tabs>` lignes 863-979).
- **Nouveaux composants** :
  - `src/features/avatar-studio/SectionRail.tsx` — rail latéral + pastilles complétion/warnings.
  - `src/features/avatar-studio/StickyActionBar.tsx` — extraction de la barre d'actions existante.
  - `src/features/avatar-studio/SectionAccordion.tsx` — vue "tout sur une page".
- **Hook** : `useAvatarSectionCompletion(selected)` — compte champs remplis par section, dérive warnings.
- **Persistance préférence** : `localStorage["avatar-studio.view-mode"] = "tabs" | "full"`.
- **Zéro changement** : schéma BDD, edge functions, `evaluateAvatarRules`, `inferStudioDefaultsWithReasons`, vocabulaire `AVATAR_VOCAB`, matching engine.
- **Respect mémoire `ui-stability**` : la logique d'inférence/règles/génération reste strictement inchangée, seule la présentation des champs change.

---

## Questions avant implémentation

Avant de coder, je préfère valider l'orientation. Trois choix structurants :

1. **Navigation** : rail latéral (B) ou vue accordéon repliable (A) par défaut — ou les deux avec toggle ? A
2. **Regroupement** : passe-t-on à 5 sections (fusion Visage+Yeux et Cheveux+Masculin) ou garde-t-on les 7-8 actuelles ? 5 sections
3. **Contexte / Inférence** : on les replie en popovers, ou on conserve les panneaux pleins ? replie en popovers

Je peux poser ces 3 questions de manière interactive après ton "Implémenter le plan", ou tu peux me répondre directement ici.