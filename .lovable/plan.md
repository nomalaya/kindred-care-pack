## Plan : Impact réaliste, progressif et différenciant — TERMINÉ ✅

### Implémenté

- ✅ Prix produits augmentés (coût logistique global) : tier 1 avg 6€, tier 2 avg 11€, tier 3 avg 18€, tier 4 avg 24€
- ✅ Types d'impact granulaires : `hygiene_days` → `hygiene_corps` + `entretien_maison`, `daily_products` vêtements → `vetements`
- ✅ Colonne `impact_type_4` ajoutée à `impact_profiles` (bonus qui apparaît à 60€+)
- ✅ Impact values recalibrées (÷3 à ÷10 selon le type)
- ✅ `formatDuration` affiche toujours en jours (jamais en semaines)
- ✅ Nouveaux labels frontend : soins corporels, entretien ménager, vêtements, jouets

### Résultat attendu par palier (exemple Aïcha)

| Palier | 🍽️ Repas | 🧒 Goûters | 👶 Soins bébé | 👕 Vêtements |
|--------|----------|------------|---------------|-------------|
| 18€ | ~2 jours | 1 | 1 jour | — |
| 36€ | ~4 jours | 3 | 2 jours | — |
| 45€ | ~5 jours | 4 | 3 jours | — |
| 60€ | ~7 jours | 5 | 4 jours | **1 vêtement** ✨ |
| 90€ | ~10 jours | 8 | 6 jours | **3 vêtements** |
