

# Création du document DOCX — Guide fonctionnel Matching, Impact & Colis

## Contenu du document

Un document Word structuré en 5 sections, pédagogique et visuel, avec tableaux et exemples concrets.

### Section 1 — Le parcours donateur (vue d'ensemble)
Schéma textuel du tunnel : Cause → Situation → Bénéficiaire → Don → Colis → Paiement. Explication de chaque étape et de ce que voit le donateur.

### Section 2 — Le matching bénéficiaire
- Tableau des 6 causes et 24 situations
- Logique de sélection des 4 bénéficiaires (waterfall : match exact → même cause → fallback, avec diversité obligatoire)
- Rôle de la proximité géographique (badges "Proche de chez vous", etc.)
- Exemple concret : "Le donateur choisit Cause 1, Situation 1.1 → il voit 4 profils diversifiés"

### Section 3 — La composition du colis (basket engine)
- Tableau des 4 paliers (18€, 36€, 60€, 80€) et familles émotionnelles activées
- Logique de remplissage : minimums par famille → remplissage budget → augmentation quantités
- Tableau des 5 familles émotionnelles (survival, dignity, childhood, autonomy, comfort) avec exemples de produits
- Personnalisation culturelle : tableau du CULTURE_REGION_MAP (15 régions → pays), boost priority +1
- Personnalisation situationnelle : boost priority +2
- Règle anti-monotonie : max 2 items par sous-catégorie
- Exemple concret : "Mère célibataire, Maroc, 36€" → panier détaillé avec ✨

### Section 4 — L'impact visible par le donateur
- Tableau des 11 types d'impact (meals, breakfasts, hygiene_corps, etc.) avec emoji et formulation
- Rôle de la table impact_profiles : chaque situation a 3-4 types d'impact configurés
- Logique de calcul : somme des impact_values des produits du panier × quantité
- Tableau de progression : ce que voit le donateur à 18€, 36€, 45€, 60€, 75€
- Règle clé : les valeurs baissent quand le don baisse (pas de "high-water mark")

### Section 5 — Les badges et indicateurs visuels du colis
- Badges de valeurs (Bio, Équitable, France, Éco) — max 2 par produit
- Indicateur ✨ "Choisi pour [Prénom]" — quand et pourquoi il apparaît
- Ce qui n'est PAS affiché : marques, prix unitaires, codes produit

## Implémentation technique
- Script Node.js avec la librairie `docx` pour générer le .docx
- ~15 tableaux, schémas textuels ASCII, exemples concrets
- Sortie dans `/mnt/documents/guide_fonctionnel_matching.docx`
- QA visuelle obligatoire (conversion PDF → images → inspection)

