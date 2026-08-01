## Objectif
Conserver l'ancienne homepage (version avant restructuration) accessible à tout moment, sans impacter la nouvelle page d'accueil.

## Approche
Créer une copie archivée de l'ancienne page dans le code, sur une route dédiée et non référencée.

1. **Récupérer l'ancienne version** : extraire le contenu de `src/pages/Index.tsx` tel qu'il était avant la restructuration (depuis l'historique du projet, lecture seule).
2. **Créer `src/pages/legacy/IndexLegacyV1.tsx`** : copie fidèle de cette version (mêmes sections : hero d'origine, « 3 étapes », causes, stats, CTA d'origine), avec les imports ajustés au nouveau chemin.
3. **Ajouter la route** `/accueil-v1` dans `src/App.tsx`, pointant vers cette page.
4. **Ne pas la référencer** : aucun lien dans la navbar, le footer ou le sitemap ; ajouter `<meta name="robots" content="noindex,nofollow">` via le composant de la page pour éviter l'indexation.
5. **Vérification** : contrôle visuel de `/accueil-v1` (desktop + mobile) et confirmation que `/` reste la nouvelle homepage.

## Détails techniques
- Aucun changement de logique métier, de RPC ou de backend.
- Si l'ancienne page utilisait des composants supprimés depuis, ils seront recréés à l'identique sous `src/components/home/legacy/` pour rester autonomes et ne pas gêner la homepage actuelle.
- Rollback complet possible ensuite en une opération : remplacer le contenu de `Index.tsx` par celui de la page archivée.

## Alternative
Si vous préférez ne rien laisser dans le code, l'historique des versions (onglet History) permet déjà de revenir à l'état antérieur — dites-le et j'annule cet archivage.
