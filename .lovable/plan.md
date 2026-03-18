## Plan: Refonte base produits — TERMINÉ ✅

### Implémenté

- ✅ Migration schéma : ajout colonnes `display_name`, `labels`, `cultural_origin_tags`, `territory_usage`, `climate_tags`, `usage_context`
- ✅ Nettoyage : suppression des 536 anciens produits incohérents + impact_units
- ✅ Insertion de 587 produits neufs répartis sur 10 catégories normalisées
- ✅ 587 impact_units correspondants (meals, breakfasts, hygiene_days, kids_care_days, kids_items, daily_products)
- ✅ Produits culturels : Maghreb, Afrique subsaharienne, Asie, DOM, Europe
- ✅ Frontend : utilisation de `display_name || name` dans DonationBasket, CartSummary, OrderConfirmation, DonationConfirmation, Admin
- ✅ ProductRecord type mis à jour avec `display_name`

### Répartition finale

| Catégorie | emotional_family | Nb |
|---|---|---|
| alimentaire | survival + comfort | 190 |
| hygiène | dignity | 97 |
| vêtements | autonomy | 50 |
| entretien | dignity | 50 |
| bébé | childhood | 50 |
| boissons | comfort | 40 |
| enfant | childhood | 30 |
| santé | survival | 30 |
| bien-être | comfort | 30 |
| autonomie | autonomy | 20 |
