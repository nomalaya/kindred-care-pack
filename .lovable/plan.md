Je vais corriger le problème à trois niveaux, sans changer la logique de matching ni le reste du studio.

1. Nettoyage immédiat des données existantes
- Ajouter une migration qui repère les bénéficiaires dont `avatar_source_url` pointe vers une version qui n’existe plus dans `avatar_versions`.
- Pour ces cas, remplacer `avatar_source_url` par l’`avatar_url` actuelle si elle existe, sinon le vider.
- Objectif : Léa et les autres profils ne conservent plus une ancienne base supprimée en base.

2. Sécurité côté génération
- Dans `generate-avatar`, ne plus utiliser aveuglément `b.avatar_source_url`.
- Considérer `avatar_source_url` comme valide uniquement si :
  - elle est identique à l’avatar actif actuel, ou
  - elle existe encore dans les versions archivées du bénéficiaire.
- Si elle est périmée, la fonction la remplace par l’avatar actif et enregistre cette correction avant de générer.
- Ainsi, même si une ancienne valeur revient d’un état local ou d’un ancien enregistrement, la génération ne repartira plus d’une image supprimée.

3. Sécurité côté interface Versions
- Quand une version est supprimée et que c’était la `avatar_source_url`, réancrer immédiatement la base de retouche sur l’avatar actif actuel.
- Mettre à jour l’état local pour que le badge “Source” et les prochaines générations reflètent tout de suite la correction.
- Ajuster l’alerte “base de retouche actuelle n’existe plus” pour ne signaler que les vraies sources périmées, pas un avatar actif valide.

Résultat attendu : `avatar_source_url` ne pointera plus vers une ancienne version supprimée, et le bouton “Générer un aperçu” repartira soit de la base explicitement choisie dans Versions, soit de l’avatar actif actuel.