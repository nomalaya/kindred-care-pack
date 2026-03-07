

## Corriger les textes anglais des bénéficiaires et garantir le français pour les futures créations

### Constat

Sur 12 bénéficiaires actifs, **9 ont leurs textes (`short_story` et `emotional_sentence`) en anglais** :

| Prénom | short_story | emotional_sentence |
|--------|------------|-------------------|
| Samira | ✅ FR | ✅ FR |
| Marie | ✅ FR | ✅ FR |
| Fatou | ✅ FR | ✅ FR |
| Claire | ❌ EN | ❌ EN |
| Nadia | ❌ EN | ❌ EN |
| Youssef | ❌ EN | ❌ EN |
| Emma | ❌ EN | ❌ EN |
| Lucienne | ❌ EN | ❌ EN |
| Mohamed | ❌ EN | ❌ EN |
| David | ❌ EN | ❌ EN |
| Amina | ❌ EN | ❌ EN |
| Sophie | ❌ EN | ❌ EN |

### Plan

#### 1. Corriger les données existantes (UPDATE via insert tool)

Traduire les 9 bénéficiaires en français avec des textes naturels et cohérents avec leur `profile_type` :

- **Claire** (Femme en reconstruction) — « Claire a reconstruit sa vie à partir de rien après des années de violence conjugale. Elle vit aujourd'hui dans un foyer d'hébergement. » / « J'apprends enfin ce que signifie se sentir en sécurité. »
- **Nadia** (Femme en reconstruction) — « Nadia a tout quitté pour se protéger, elle et sa fille. » / « La liberté a commencé le jour où j'ai franchi cette porte. »
- **Youssef** (Étudiant précaire) — « Youssef cumule trois emplois à temps partiel tout en étudiant l'ingénierie, sautant souvent des repas. » / « J'étudie pour que ma famille n'ait plus jamais à s'inquiéter. »
- **Emma** (Étudiant précaire) — « Emma vient d'une petite ville rurale, première de sa famille à entrer à l'université. » / « L'éducation est le pont entre là où je suis et là où je veux aller. »
- **Lucienne** (Personne âgée isolée) — « Lucienne vit seule depuis 12 ans, depuis le décès de son mari. » / « Parfois, le silence est la partie la plus difficile de la journée. »
- **Mohamed** (Personne âgée isolée) — « Mohamed a immigré il y a 50 ans et vit aujourd'hui seul, loin de toute sa famille. » / « J'ai construit une vie ici, mais la vieillesse est venue avec la solitude. »
- **David** (Travailleur pauvre) — « David travaille à temps plein dans un entrepôt mais peine à payer le loyer et nourrir ses deux enfants. » / « Je travaille 8 heures par jour et je n'arrive toujours pas à acheter les fournitures scolaires. »
- **Amina** (Travailleur pauvre) — « Amina nettoie des bureaux chaque matin avant l'aube, ses enfants dorment encore. » / « Je pars avant qu'ils se réveillent, en espérant qu'ils ne sentent jamais à quel point c'est dur. »
- **Sophie** (Situation santé / handicap) — « Sophie a été diagnostiquée avec une maladie chronique qui l'a forcée à arrêter de travailler. » / « Mon corps a peut-être des limites, mais pas mon courage. »

#### 2. Ajouter une contrainte de validation en base (migration)

Créer un trigger de validation sur la table `beneficiaries` qui vérifie que `short_story` et `emotional_sentence` ne contiennent pas de mots anglais courants (heuristique simple). Cela servira de garde-fou pour les futures insertions/mises à jour.

Le trigger rejettera les insertions contenant des mots comme "the ", "and ", "is ", "are ", "was ", "her ", "his " en début ou milieu de phrase, avec un message d'erreur en français indiquant que les textes doivent être rédigés en français.

### Fichiers modifiés
- Aucun fichier code modifié
- 9 UPDATE en base de données (via insert tool)
- 1 migration pour le trigger de validation linguistique

