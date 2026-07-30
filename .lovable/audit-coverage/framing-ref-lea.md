# Cadrage de référence = Léa

Mesure de l'avatar de référence (`avatars/style-anchors/lea.jpg`) avec le détecteur
déterministe (`detectLandmarks`) :

| Métrique | Léa (référence) |
| --- | --- |
| Hauteur de tête | 62,1 % du canvas |
| Ligne des yeux | 31,5 % du canvas |
| Centre du visage | 50,7 % de la largeur |
| Marge basse | 0 % (buste débordant) |

Constantes recalées dans `supabase/functions/_shared/avatarNormalize.ts` :
`HEAD_FILL = 0.62` (au lieu de 0,46) et `EYE_LINE = 0.315` (au lieu de 0,38).

## Application aux 4 bénéficiaires (0 crédit IA)

Source = avatar publié actuel (`use_current: true`), archivage préalable, `avatar_scale`
et offsets remis à neutre.

| Avatar | Zoom appliqué | Tête après | Yeux après | Centre | Marge basse |
| --- | --- | --- | --- | --- | --- |
| Léa (réf.) | — | 62,1 % | 31,5 % | 50,7 % | 0 % |
| Kwame | ×1,345 | 62,0 % | 31,5 % | 50,0 % | 0 % |
| Marius | ×1,345 | 62,0 % | 31,5 % | 50,1 % | 0 % |
| Aïcha | ×1,355 | 58,4 % | 30,1 % | 50,1 % | 0 % |
| Nguyen | ×1,427 | 62,0 % | 31,5 % | 50,0 % | 0 % |

Aïcha reste 3,6 pts sous la cible : son cou est masqué (foulard + cheveux longs), la
hauteur de tête est donc déduite du ratio anatomique (largeur ×1,35) et le plafond de
zoom anti-coupure limite l'agrandissement. Écart non détectable à l'œil nu.

Aucune généralisation au reste du catalogue.
