# Dry-run cadrage — catalogue complet (187 avatars)

Aucune image modifiée, aucun crédit IA consommé.

## Synthèse
- Avatars mesurés : **187** (0 erreur)
- Détourés (fond transparent) : **131**
- Fond opaque + bbox pleine image (détection impossible → **à exclure**, détourage requis) : **55**
- Autres fonds opaques exploitables : **1**

## Marges mesurées (% du côté)

| | min | médiane | max |
|---|---|---|---|
| gauche | 1 | 17 | 28 |
| haut | 4 | 14 | 20 |
| droite | 1 | 17 | 25 |
| bas | 0 | 12 | 20 |
| remplissage hauteur | 60 | 74 | 94 |

123 avatars sur 187 ont une marge basse ≥ 5 % → c'est le blanc visible sous le buste dans le rond profil.

## Ampleur de la correction (facteur d'agrandissement)

| Groupe | Avatars |
|---|---|
| Déjà conforme (×<1,05) | 60 |
| Léger (×1,05–1,3) | 28 |
| Fort (×1,3–1,6) | 80 |
| Très fort (×>1,6) | 19 |

> Les 60 « déjà conformes » sont en réalité les 55 fonds opaques non détourés (×0,94 = simple recadrage neutre) : ils doivent être détourés avant normalisation.

## Top 20 des cas les plus dégradés

| Bénéficiaire | G/H/D/B (%) | Remplissage H | Facteur |
|---|---|---|---|
| Léa | 28/15/25/14 | 71% | ×1.97 |
| Mei-Lin | 25/17/25/17 | 67% | ×1.83 |
| Léa | 24/17/24/17 | 66% | ×1.78 |
| Fatima | 23/17/25/17 | 66% | ×1.77 |
| Irina | 24/17/24/18 | 65% | ×1.77 |
| Fatima | 25/16/23/16 | 68% | ×1.76 |
| Fatima | 24/13/24/12 | 75% | ×1.74 |
| Aïcha | 23/18/23/18 | 63% | ×1.71 |
| Ndèye | 23/15/24/13 | 72% | ×1.71 |
| Aïcha | 23/16/23/15 | 68% | ×1.69 |
| Fatima | 23/18/23/13 | 69% | ×1.69 |
| Elsa | 24/13/21/14 | 73% | ×1.67 |
| Sofia | 22/17/23/16 | 66% | ×1.67 |
| Léa | 22/16/22/15 | 69% | ×1.66 |
| Fatima | 20/14/23/13 | 73% | ×1.63 |
| Fatou | 21/16/23/14 | 70% | ×1.63 |
| Léa | 21/13/22/12 | 75% | ×1.62 |
| Sofia | 22/12/21/13 | 75% | ×1.62 |
| Anja | 22/12/21/9 | 79% | ×1.6 |
| Aïsha | 21/20/21/20 | 60% | ×1.59 |

## Recommandation
1. Normaliser les **131 avatars détourés** (zéro crédit, original archivé dans `pre-normalize/`).
2. Exclure les **55 avatars à fond opaque** : passer d'abord par `clean-avatar-background`, puis normaliser.
3. Détail complet par bénéficiaire : `.lovable/audit-coverage/dryrun-framing.json`.
