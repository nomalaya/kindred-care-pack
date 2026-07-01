
# Plan UI — Zone Versions Avatar Studio (zéro-crédit)

## Périmètre strict
Uniquement `src/pages/AvatarStudio.tsx` (bloc "Versions carousel" ~L1245-1391 + ligne source sous bouton de génération + états `busy`). Aucun autre fichier touché.

**Aucun appel IA. Aucune génération. Aucune modification de** : prompts, modèles, attributs, fonds, cadrage, edge functions, SQL, RPC, base de données, schéma, matching, panier, checkout.

---

## 1. Badges permanents sur chaque miniature (fin du "tout au survol")

Chaque miniature 80×80 affiche des badges **toujours visibles** :

- **Coin haut-gauche** — statut principal (un seul, ordre de priorité) :
  - `Actif` (bleu primary, plein) si `avatar_url === v.image_url`
  - `Source` (secondary + icône RotateCcw) **uniquement si `avatar_source_url` est explicitement défini** et matche cette version. Le fallback implicite (source = actif) n'affiche plus le badge Source — la nuance est expliquée dans la ligne "Source utilisée".
  - sinon `Historique` (outline gris discret)
- **Coin haut-droit** — nature : `HD` (emerald) ou `Preview` (amber)
- **Coin bas-droit** — `QA 87` si `qa_score` présent
- **Coin bas-gauche** — date relative `il y a 2 j` (formatée fr-FR, `Intl.RelativeTimeFormat`)

L'anneau : bleu si actif, ambre si source explicite, rouge si sélectionné multi.

## 2. Tri et épinglage

Les versions sont triées **plus récent → plus ancien**. Actif et Source (si explicite) sont **épinglés en tête**, dans cet ordre, séparés du reste par un léger espacement vertical / une fine barre verticale. Le reste défile normalement.

## 3. Actions par miniature — fin du survol caché

- Un **bouton `…`** (MoreHorizontal) en coin haut-droite de chaque miniature, **toujours visible** en opacité 60%, pleine opacité au hover. Ouvre un `DropdownMenu` :
  - `Voir en grand`
  - `Utiliser cette version` (une seule action, cf. §4) — désactivé si déjà active + source
  - séparateur
  - `Supprimer` (rouge, cf. §6)
- **Clic simple sur la miniature** → ouvre la modale "Voir en grand" (§5). Shift+clic conserve le mode sélection multiple existant.
- La **poubelle directe au survol disparaît** complètement.

## 4. Action unique « Utiliser cette version » (option B validée)

Une seule action, comportement identique à `restoreVersion` actuel : met à jour à la fois `avatar_url` et `avatar_source_url` sur la ligne bénéficiaire. Aucun appel IA, aucune génération.

Tooltip explicatif au survol :
> « Cette version devient l'avatar affiché ET la base pour la prochaine retouche. »

Bouton désactivé si déjà active + source, avec tooltip « Version déjà utilisée ».

## 5. Modale "Voir en grand" (nouvelle)

Composant local dans le fichier, basé sur `Dialog` déjà importé.

Contenu :
- Image agrandie (max-h 70vh, `object-contain`, fond neutre)
- Bandeau de badges : `Actif` / `Source` / `HD`|`Preview` / `QA xx` / date absolue `12/05/2026`
- Boutons alignés à droite :
  - `Utiliser cette version` (désactivé si déjà active + source, ou si un `busy` est en cours, cf. §7)
  - `Comparer` — visible uniquement si exactement 1 autre version est cochée dans la sélection multi ; sinon caché (cf. §8)
  - `Fermer`
- Menu `…` dans le header de la modale → `Supprimer cette version` (rouge) avec protections §6.

## 6. Protections suppression

Nouvelle fonction `attemptDelete(v)` :

- Si `v.image_url === selected.avatar_url` → refus, toast d'erreur :
  « Cette image est l'avatar actif. Définissez une autre version comme active avant de la supprimer. »
- Sinon si `avatar_source_url` explicite et `v.image_url === avatar_source_url` → refus, toast :
  « Cette image est utilisée comme source de retouche. Choisissez une autre source avant de la supprimer. »
- Sinon → **`confirm()` natif** (comme aujourd'hui, faible friction sur l'action fréquente).

Pour la **suppression multiple** : `AlertDialog` obligatoire (action lourde). Les IDs actifs/source sont filtrés automatiquement, un texte l'indique dans la modale.

## 7. États `busy` — désactivation des actions risquées

Bannière au-dessus des Versions selon `busy` :
- `clean` → « Nettoyage du fond en cours… »
- `preview` → « Génération de l'aperçu en cours… »
- `final` → « Génération HD en cours… »
- `import` → « Import de l'image en cours… »

Pendant **tout `busy` non nul**, désactiver dans la zone Versions :
- `Utiliser cette version` (menu + modale)
- `Supprimer` (unitaire + multiple)
- Bouton `Générer` principal (déjà `disabled={!!busy}` — vérifier).

Modale reste ouvrable en lecture seule, boutons `disabled` avec tooltip « Action indisponible pendant `<état>`. »

## 8. Comparer — logique simplifiée

- Retrait de « Comparer avec… » du menu par miniature.
- Le bouton **`Comparer`** du header (déjà présent) devient visible **uniquement quand exactement 2 versions sont cochées** en sélection multi. Sinon caché.
- Supprime l'ambiguïté du "Comparer" actuel qui prend arbitrairement les 2 premières versions.

## 9. Ligne "Source utilisée" sous le bouton Générer

Insérée juste sous le bouton principal (`Générer`/`Régénérer`), lecture seule :

- `avatar_source_url` explicite + trouvé dans versions :
  → `Source utilisée : version du 12/05/2026 · HD · QA 92` avec miniature 16×16.
- `avatar_source_url` explicite mais orphelin :
  → `Source utilisée : image absente — sélectionnez une version dans la liste.` (ambre)
- `avatar_source_url` null mais `avatar_url` présent :
  → `Source utilisée : avatar actif (source implicite).` (explique la nuance §1)
- Aucun avatar :
  → `Source utilisée : aucune — première génération.`

## 10. Détail technique

- Icônes ajoutées depuis `lucide-react` (déjà utilisé) : `MoreHorizontal`, `Eye`.
- Nouveaux états locaux : `detailVersionId: string | null`, `pendingBulkDelete: boolean`.
- Composants réutilisés : `DropdownMenu`, `Dialog`, `AlertDialog`, `Tooltip` — tous déjà présents, aucune nouvelle dépendance.
- Formatage dates : `Intl.RelativeTimeFormat("fr-FR")` + `Intl.DateTimeFormat("fr-FR")`.
- Vocabulaire strictement fr-FR (conforme mémoire projet).

---

## Confirmations

- **Aucun appel IA ne sera fait.**
- **Aucune génération d'image ne sera lancée.**
- **Aucun prompt, modèle, attribut, fond, cadrage, ni schéma BD ne sera modifié.**
- Les seuls écrits BD conservés sont ceux qui existent déjà (`avatar_source_url`, `avatar_url`, suppression de lignes `avatar_versions`), déclenchés uniquement par action utilisateur explicite.

## Fichiers concernés

- `src/pages/AvatarStudio.tsx` — unique fichier modifié.
