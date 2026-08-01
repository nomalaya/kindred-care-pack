## État réel constaté (vérifié à l'instant en base)

- **197 / 200** bénéficiaires actifs ont un avatar ; **3 sont encore en `draft` sans avatar**.
- Statuts : 192 `generated`, 5 `approved`, 3 `draft` → **aucun n'est encore publié/verrouillé**.
- Le lot de régénération **n'est plus en cours** : le bac à sable a été réinitialisé (aucun script ni fichier d'état dans `/tmp`). 12 avatars ont bien été régénérés entre 10:40 et 10:51 (Fatima 32a, Jian, Sofia, Maria 52a, Fatima 42a, Élise, Chloé, Aïcha 33a, Amadou 20a, Aïcha 22a, Maria 82a, Léia) + 3 plus tôt (Fatima 42a HdF, Maria 38a, Kwame 68a) = **15 avatars refaits avec le pipeline corrigé**.
- Le lot s'est donc arrêté à 3 avatars de la fin.

## Plan

### 1. Terminer le lot (3 avatars manquants)
Reconstituer le script de régénération séquentielle depuis la base (les 3 `draft` sans `avatar_url`), avec fichier d'état persistant, garde alpha bloquante et rollback. Génération via la clé Google directe → **0 crédit Lovable**.

### 2. Planche de contrôle des 16
Assemblage d'une planche unique (`/mnt/documents/planche-controle-finale.png`) : chaque avatar rendu **dans le rond profil réel, sur fond coloré** (pour révéler tout reste d'opacité blanche), avec nom, région, tranche d'âge, score de style et ratio alpha. Vérification visuelle avant toute publication : alpha OK, cheveux contenus, buste au ras du bas, cadrage homogène (règle trombinoscope).

### 3. Contrôle automatique avant publication
Sur les 200 fichiers : ratio d'opacité, opacité des 4 coins, marge basse, ligne des yeux. Tout avatar hors tolérance est écarté de la publication et listé pour réparation `key_only` (sans IA) ou régénération.

### 4. Publication des 200
Pour les avatars validés uniquement : `avatar_workflow_status = 'approved'` puis `'locked'` (verrou anti-régénération) et `avatar_status = 'validated'`. Publication par lots validés, jamais en aveugle. Rapport final 200/200 avec la liste des éventuels écartés.

### 5. Bouton « Exporter JSON » dans l'Avatar Studio
Nouveau bouton dans la barre d'actions de l'Avatar Studio, au design système existant (variante `outline`, icône Lucide `Download`) :
- Exporte le **périmètre courant** : tout le catalogue ou la sélection filtrée affichée.
- Contenu par bénéficiaire : `id`, `alias_first_name`, `region`, **tranche d'âge uniquement** (jamais l'âge exact — règle de confidentialité), les attributs d'avatar, `avatar_url`, statut / workflow, scores QA et style, `avatar_generated_at`.
- Téléchargement client-side (`Blob` + `URL.createObjectURL`), fichier `avatars-cashforcause-YYYY-MM-DD.json`, toast de confirmation.

## Détails techniques

- Frontend : `src/pages/AvatarStudio.tsx` (bouton) + nouveau `src/features/avatar-studio/exportJson.ts` (sérialisation, hors composant).
- Backend : aucune modification du moteur de matching ni du panier. Le pipeline avatar (`generate-avatar`, `avatarBackground.ts`, `avatarNormalize.ts`) reste tel qu'il a été corrigé — on ne fait que l'exécuter.
- Publication et statuts via mises à jour de données, pas de changement de schéma.

## Livrables

1. 200/200 avatars présents (les 3 derniers générés).
2. Planche de contrôle des 16 sur fond coloré + rapport de contrôle automatique.
3. Publication en `approved` / `locked` des avatars validés, liste explicite des écartés s'il en reste.
4. Bouton « Exporter JSON » opérationnel dans l'Avatar Studio.
