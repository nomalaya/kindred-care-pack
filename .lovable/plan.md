

## Générer des PDFs des thèmes

### Approche

Ajouter un bouton "Exporter en PDF" sur la page ThemeShowcase qui génère un PDF pour chaque thème (ou le thème actif). On utilisera les librairies **html2canvas** (capture du DOM en image) + **jsPDF** (génération PDF).

### Fonctionnement

1. **Installer** `html2canvas` et `jspdf`
2. **Ajouter un bouton** "Télécharger PDF" dans la barre sticky du sélecteur de thème
3. **Logique d'export** :
   - Si un thème est sélectionné → exporte la page actuelle en un PDF nommé `theme-{nom}.pdf`
   - Option "Exporter tous les thèmes" → boucle sur chaque thème, applique les couleurs, capture la page, et génère un PDF multi-pages contenant tous les thèmes (1 thème par page)
4. **Masquer** la barre sticky et le bouton d'export lors de la capture pour un rendu propre

### Fichiers modifiés

- **package.json** : ajout de `html2canvas` et `jspdf`
- **src/pages/ThemeShowcase.tsx** : ajout du bouton d'export et de la fonction de génération PDF (capture du contenu via html2canvas, conversion en PDF via jsPDF)

### Détails techniques

- Le contenu de la page sera wrappé dans un `ref` pour cibler la zone à capturer
- Pendant la capture, la barre sticky sera temporairement masquée via une classe CSS
- Le PDF sera en format A4 portrait, avec le contenu redimensionné pour tenir sur la page
- Un état `isExporting` affichera un indicateur de chargement pendant la génération

