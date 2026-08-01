## Objectif

Remplacer la page actuelle `/how-it-works` par une nouvelle page complète sur l'URL francisée `/comment-ca-marche`, en réutilisant strictement le design système existant (tokens `primary`, `cta`, `card`, Inter, `CARD_STYLES`, `SECTION_HEADER`, composants shadcn du projet).

## Contenu et structure (page unique)

1. **Hero** — `SECTION_HEADER` : H1 « Comment fonctionne CashForCause ? », sous-titre « Le don habituel est une abstraction. CashForCause est une connexion. » + ligne « Voici comment ça fonctionne, étape par étape. »
2. **4 étapes** — grille `grid-cols-2 lg:grid-cols-4`, cartes `CARD_STYLES.page` (padding réduit) : icône Lucide 48px en `text-primary` dans une pastille `bg-primary/10`, numéro d'étape discret (`text-xs font-semibold text-primary`), titre gras, texte court (2-3 lignes). Icônes : Heart, ShoppingBag, Truck, Bell. Le texte long fourni est condensé en 2-3 lignes par carte, avec la version complète affichée dans une section détaillée sous la grille (titre d'étape + paragraphes intégraux), pour ne rien perdre du contenu rédigé.
3. **Bandeau garantie** — 3 éléments en ligne (`flex`/`grid-cols-3`, empilés en mobile) sur fond `bg-muted/50` arrondi : Shield « Bénéficiaires vérifiés par des travailleurs sociaux », Clock « Livraison garantie en 24-48h », FileCheck « Reçu fiscal automatique ».
4. **FAQ** — `Accordion` shadcn (type single, collapsible), titre « Vos questions les plus fréquentes », les 4 Q/R exactes fournies. La 4e réponse inclut un `Link` vers `/avantage-fiscal` (« Voir la page Avantage fiscal »).
5. **CTA final** — bouton centré `bg-cta` « Trouver quelqu'un à aider » → `/causes`, avec `ArrowRight`, identique aux autres pages.

## Détails techniques

- Réécriture de `src/pages/HowItWorks.tsx` (composant renommé en interne, wrappé dans `Layout`).
- `src/App.tsx` : route `/comment-ca-marche` ; `/how-it-works` conservé en redirection (`<Navigate to="/comment-ca-marche" replace />`) pour ne pas casser les liens existants.
- Mise à jour des liens : `src/components/Navbar.tsx` (desktop + mobile) et `src/pages/Index.tsx` pointent vers `/comment-ca-marche`.
- SEO : un seul H1, sections `<section>` sémantiques, headings hiérarchisés.
- Aucune couleur codée en dur, aucune modification de logique backend.
