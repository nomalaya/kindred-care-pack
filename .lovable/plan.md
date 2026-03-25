

# Réinitialiser les impact_values — supprimer les facteurs ÷3 à ÷10

## Constat actuel

Les impact_values ont été divisées par des facteurs de 3 à 10 selon le type, donnant des valeurs fractionnaires peu lisibles :

| Type | Avg actuel | Facteur appliqué estimé |
|---|---|---|
| meals | 0.96 | ÷3 |
| breakfasts | 0.91 | ÷3 |
| kids_snacks | 1.13 | ÷3 |
| quick_meals | 1.49 | ÷3 |
| hygiene_corps | 1.14 | ÷5 |
| entretien_maison | 1.41 | ÷5 |
| baby_care | 2.30 | ÷3 |
| wellbeing | 0.67 | ÷5 |
| vetements | 2.56 | ÷3 |
| daily_products | 2.08 | ÷5 |

## Action

Une seule migration SQL avec 10 UPDATEs :

```
UPDATE impact_units SET impact_value = impact_value * 3 WHERE impact_type IN ('meals', 'breakfasts', 'kids_snacks', 'quick_meals', 'baby_care', 'vetements');
UPDATE impact_units SET impact_value = impact_value * 5 WHERE impact_type IN ('hygiene_corps', 'entretien_maison', 'wellbeing', 'daily_products');
```

## Résultat attendu (moyennes après reset)

| Type | Avant | Après |
|---|---|---|
| meals | 0.96 | ~2.9 |
| breakfasts | 0.91 | ~2.7 |
| kids_snacks | 1.13 | ~3.4 |
| hyg