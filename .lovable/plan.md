## Objectif
Rendre les boutons **Enregistrer** et **Enregistrer + re-déduire** utilisables dès que les notes privées sont modifiées, y compris quand l’utilisateur saisit seulement un pays comme « Pakistan ».

## Diagnostic
La logique du composant affiche bien les boutons quand les notes changent, mais leur état désactivé dépend de `disabled={isLocked}` côté Avatar Studio. Si le bénéficiaire/avatar est verrouillé, les notes privées deviennent modifiables visuellement dans certains cas ou restent en état incohérent, mais les actions restent désactivées.

## Plan de correction
1. **Sécuriser le panneau Contexte**
   - Conserver le comportement existant pour les champs publics.
   - Empêcher l’état incohérent où les notes semblent modifiées mais les boutons restent gris sans explication.
   - Ajouter un message clair si l’avatar est verrouillé : déverrouiller avant sauvegarde/re-déduction.

2. **Autoriser le flux attendu pour les notes privées**
   - Si les notes privées changent, les deux boutons doivent être activables seulement quand l’avatar n’est pas verrouillé et qu’aucune sauvegarde n’est en cours.
   - Le bouton **Enregistrer + re-déduire** sauvegardera d’abord « Pakistan », puis relancera l’inférence des attributs.

3. **Préserver l’existant**
   - Ne pas modifier la logique de matching, panier, don, base de données ou parcours donateur.
   - Ne pas toucher au fichier client backend auto-généré.
   - Garder les valeurs déjà saisies prioritaires sur les déductions automatiques.

4. **Vérification ciblée**
   - Vérifier dans le code que `Pakistan` est bien détecté par l’inférence pays.
   - Vérifier que le panneau affiche un état explicite au lieu de boutons gris inexpliqués.