
## Contexte

Le workflow actuel a **4 états** : `draft` → `generated` → `approved` → `locked`. La transition `generated → approved` sert de **garde-fou avant publication publique** : seuls les avatars `approved`/`locked` sont considérés "prêts" (utilisés par `hasFinalAvatar`, filtres « Validés », etc.). Aujourd'hui elle est :
- automatique si QA ≥ 75 (ligne 149),
- sinon manuelle via raccourci clavier `A` (ligne 863),
- **sans bouton visible dans l'UI** → d'où votre confusion.

**Décision** : garder le garde-fou (c'est bien un contrôle de sécurité éditoriale avant publication publique), mais le rendre **explicite et lisible**, et remplacer le vocabulaire technique par un vocabulaire produit.

## Renommage du vocabulaire

Dans `src/lib/avatarTraits.ts` (`WORKFLOW_LABEL`) et `src/lib/avatarVocabLabels.ts` (`workflow_status`) :

| Clé technique (inchangée en base) | Ancien libellé | Nouveau libellé |
|---|---|---|
| `draft` | Brouillon | **À générer** |
| `generated` | Généré | **À publier** |
| `approved` | Approuvé | **Publié** |
| `locked` | Verrouillé | **Publié (verrouillé)** |

Aucune migration DB. Les valeurs en base restent `draft/generated/approved/locked`.

## 1. Colonne 1 (BeneficiaryListPanel) — remplacer les initiales A/G

Bloc lignes 76–78 de `src/features/avatar-studio/BeneficiaryListPanel.tsx`.

Remplacer le badge lettre par un **point de couleur 8×8 px** (dot) coloré selon `WORKFLOW_COLOR`, avec `title` = nouveau libellé complet au survol :

```tsx
<span
  className={`h-2 w-2 rounded-full border ${WORKFLOW_COLOR[ws]}`}
  title={WORKFLOW_LABEL[ws]}
  aria-label={WORKFLOW_LABEL[ws]}
/>
```

Lisible d'un coup d'œil, cohérent avec les filtres du topbar (Tous / À faire / À valider / Validés), pas d'ambiguïté « A vs G ».

## 2. Bouton « Publier » explicite dans la 2ᵉ colonne

Bloc lignes ~1280–1330 de `src/pages/AvatarStudio.tsx` (la CTA principale « avatar-cta »).

Actuellement la logique construit un bouton principal dont le libellé change selon `ws`. Ajustements :

- Quand `ws === "generated"` (avatar HD prêt mais non publié) : la CTA principale devient **`Publier l'avatar`** (icône `ShieldCheck`, variant `default`), appelant `setWorkflow("approved")`. Raccourci `P` (au lieu de `A`).
- Quand `ws === "approved"` : CTA désactivée avec libellé **`Publié ✓`** + un lien secondaire discret « Retirer de la publication » (`setWorkflow("generated")`) pour l'undo (déjà présent en `showUndo`, on garde).
- Quand `ws === "draft"` : la CTA reste **`Générer l'avatar HD`** (comportement actuel inchangé).
- Quand `ws === "locked"` : CTA désactivée « Publié · Verrouillé ».

Retirer l'auto-approve à QA ≥ 75 (lignes 148–160) — la publication doit toujours être un acte explicite. Remplacer par un simple `toast.success("QA élevé — prêt à publier")` quand `qa >= 75 && ws === "generated"`.

## 3. Badge de statut dans la 2ᵉ colonne (ligne 1054)

Utilise déjà `WORKFLOW_LABEL` / `WORKFLOW_COLOR` → hérite automatiquement du renommage. Aucun changement de code, juste vérifier que le rendu reste lisible avec les nouveaux libellés (plus longs).

## 4. Raccourcis clavier

Dans le handler `keydown` (~ligne 862) :
- Retirer le raccourci `A` = approuver.
- Ajouter `P` = publier (`setWorkflow("approved")`) quand `ws === "generated"`.
- Conserver `L` = verrouiller quand `ws === "approved"`.

Mettre à jour la modale « Raccourcis clavier » en conséquence.

## 5. Filtres du topbar (`À faire` / `À valider` / `Validés`)

Renommer visuellement pour cohérence avec le nouveau vocabulaire :
- `À faire` → **À générer** (`draft`)
- `À valider` → **À publier** (`generated`)
- `Validés` → **Publiés** (`approved` + `locked`)

Fichier : `src/pages/AvatarStudio.tsx` (chercher les libellés des filtres, ~ ligne 250 pour les compteurs).

## Portée

- `src/lib/avatarTraits.ts` — libellés uniquement.
- `src/lib/avatarVocabLabels.ts` — libellés uniquement.
- `src/features/avatar-studio/BeneficiaryListPanel.tsx` — remplacement lettre → dot.
- `src/pages/AvatarStudio.tsx` — CTA « Publier », suppression auto-approve, raccourci, filtres topbar.

**Aucun changement** : base de données, RLS, edge functions, backend matching/panier, autres pages.
