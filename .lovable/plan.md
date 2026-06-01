## Audit UI senior — Avatar Studio

État actuel : 1475 lignes, layout 2 colonnes (`280px_1fr`), panneau principal en 2 onglets **Visuel** / **Attributs**, header global haut (filtres, batch, refresh, raccourcis), footer sticky d'approbation. Beaucoup de fonctions, mais **densité info/espace sub-optimale** : l'utilisateur scrolle pour atteindre les versions, les attributs sont dans un onglet séparé, les actions importantes (générer, importer, nettoyer fond, comparer) sont éparpillées.

### Diagnostic — frictions actuelles

1. **Onglets Visuel/Attributs cloisonnent** — pour ajuster un attribut puis re-générer, il faut basculer 2× d'onglet et perdre le contexte visuel. Un studio efficace montre **image + paramètres + versions en même temps**.
2. **Vignette d'avatar 200×200 figée à gauche** — bonne décision compacité, mais le reste de la largeur (~700 px à 1202 px viewport) est *vide* à côté.
3. **Carrousel des versions caché sous la vignette** — il faut scroller. C'est pourtant la zone la plus utilisée.
4. **Header global trop chargé** : filtres workflow + bouton échecs + BatchActionsBar + refresh + raccourcis sur une seule ligne → surcharge cognitive avant même de regarder le bénéficiaire.
5. **Footer sticky d'approbation** dédouble l'info du badge workflow déjà présent dans le header du panneau.
6. **Split-button Générer** centré avec `max-w-md mx-auto` → reproduit la même bande blanche latérale qu'on vient de corriger sur la vignette.
7. **Onglet Attributs** : sous-titres `text-[10px] uppercase`, grid 2/3 colonnes, accordion fermé par défaut → bon, mais le bouton **Pré-remplir / Tout re-déduire / Contexte / Pourquoi** vit dans une 3e barre d'outils encore distincte.
8. **Comparer 2 dernières** caché en `ghost` à droite du titre Versions — fonction rare bien rangée, mais on perd le sélecteur libre (comparer **2 versions au choix** parmi le carrousel).
9. **QA score** affiché à 3 endroits différents (badge header panneau, badge sur la vignette de la liste à gauche, badge dans le carrousel versions) sans hiérarchie.
10. **Aucune indication de coût / durée estimée** avant de lancer Aperçu vs HD, ni feedback de progression durant les ~10-30s de génération (juste un spinner sur l'image).
11. **Pas de raccourci clavier** pour : suppression version sélectionnée (`⌫`), comparaison (`C`), basculer fond (`B`), exporter (`E`).
12. **Mobile** : la sheet liste est OK mais l'onglet Attributs en grid `xl:grid-cols-3` retombe sur 2 colonnes étroites — formulaires trop denses < 1024 px.

### Améliorations proposées (priorisées)

**Priorité 1 — Layout 3 colonnes "studio pro" (impact majeur)**

Remplacer `grid-cols-[280px_1fr]` + tabs par `grid-cols-[240px_320px_1fr]` :

- **Col 1** (240 px) — Liste bénéficiaires (rétrécie de 280→240).
- **Col 2** (320 px) — **Aperçu vivant** : vignette **carrée 320×320**, sous elle le split-button Générer + bouton Nettoyer fond + Importer, puis le **carrousel des versions vertical** (4 colonnes de vignettes 64 px = 8 versions visibles sans scroll).
- **Col 3** (flex) — **Attributs toujours visibles**, accordion 3 sections ouvertes par défaut (Visage / Cheveux / Vêtements), grid 3-4 cols.

→ Suppression des onglets Visuel/Attributs. Édition + génération + comparaison en parallèle, **0 scroll, 0 changement d'onglet**.

**Priorité 2 — Toolbar d'action contextuelle unique**

Fusionner le footer sticky d'approbation + la barre d'outils Attributs (Pré-remplir / Contexte / Pourquoi) en **une seule barre fixe en bas** :

```
[Approuver/Verrouiller] | [Contexte] [Pré-remplir] [Pourquoi N] | [Comparer] [Exporter] [⋯]
```

**Priorité 3 — Header global allégé**

- Filtres workflow (Tous / Brouillon / À valider / Validés) → segmented control compact.
- BatchActions → masquer par défaut, dépliable depuis un bouton "Traitement par lot".
- Refresh + raccourcis → icônes seules, alignées à droite.
- Récupérer ~40 px de hauteur verticale.

**Priorité 4 — Carrousel versions enrichi**

- Badge unifié "HD/AP/Importé" + score QA en pastille colorée (vert ≥80, ambre 50-80, rouge <50).
- **Compare mode** : Ctrl+click ou case à cocher → max 2 sélections → bouton Compare devient actif.
- **Drag-to-reorder** désactivé (versions chronologiques), mais pin/unpin pour figer une version "preferred" en tête.
- Affichage timestamp relatif ("il y a 3 min").

**Priorité 5 — Feedback de génération**

- Barre de progression estimée (15 s aperçu / 30 s HD) avec étape : "Génération… → QA… → Upload…".
- Coût estimé visible dans le dropdown du split-button (ex. "Aperçu rapide · ~0,5¢ · 15 s").
- Notification toast persistante avec bouton "Annuler" tant que la requête tourne.

**Priorité 6 — Raccourcis clavier étendus**


| Touche  | Action                           |
| ------- | -------------------------------- |
| `⌫`     | Supprimer versions sélectionnées |
| `C`     | Comparer (2 sélectionnées)       |
| `B`     | Nettoyer le fond                 |
| `I`     | Importer une image               |
| `E`     | Exporter l'avatar actif          |
| `1`-`9` | Activer la N-ième version        |


**Priorité 7 — Densité visuelle & polish**

- Vignette principale 320×320 avec **overlay info au survol** (modèle, seed, prompt tronqué, "Copier prompt").
- Indicateur "Dignité 5/5" + "Cadrage clavicules" sous la vignette en mini-badges colorés (au lieu de cachés dans Attributs).
- Mode **comparaison split-screen** dans la vignette principale (avant/après une modification d'attribut).
- Dark mode optionnel pour le studio (admin travaille longtemps).

**Priorité 8 — Mobile/tablet**

- < 1024 px : col 2+3 fusionnent en un seul panneau scrollable, vignette plus petite (160 px).
- Sticky bottom action bar reste accessible.

### Ce que je propose comme livrable

Plutôt qu'un mega-refactor d'un seul coup, **deux jalons** :

1. **Sprint 1 (~½ journée)** — Priorités 1 + 2 + 3 : nouveau layout 3 colonnes, toolbar unique, header allégé. Tout le reste reste fonctionnellement identique.
2. **Sprint 2 (~½ journée)** — Priorités 4 + 5 + 6 : carrousel enrichi, feedback génération, raccourcis.

Priorités 7 et 8 = améliorations cosmétiques à faire au coup par coup.

**Hors périmètre** : aucun changement backend, edge function, RLS, prompt IA, ou logique de matching. Pur refactor frontend de `src/pages/AvatarStudio.tsx` + éventuellement `BeneficiaryListPanel.tsx`.

---

**Question pour vous** : voulez-vous que je démarre par le **Sprint 1** (layout 3 colonnes), ou préférez-vous picorer des améliorations spécifiques de la liste ci-dessus ? Sprint 1