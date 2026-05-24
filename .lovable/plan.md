
# Plan : pré-remplissage Avatar Studio par origine géographique (H + F)

Quand l'admin tape un pays ou un gentilé dans **Notes privées** (ou dans short_story / emotional_sentence) et clique sur **Pré-remplir**, les attributs visuels correspondants sont auto-sélectionnés, en respectant les valeurs déjà saisies manuellement et les signaux médicaux/émotionnels existants.

## Périmètre confirmé
- Frontend / inférence uniquement. **Zéro changement DB**, **zéro changement UI** (pas de nouveau champ, pas de nouvelle option). On enrichit `avatarAutoInfer.ts` qui alimente déjà le bouton Pré-remplir.
- `head_covering` reste sur `"optional"` (jamais `"required"`) pour MENA et Sud-asiatique, H comme F → respecte la dignité, n'impose pas de port systématique.

## Mapping des 6 groupes phénotypiques (sources : CSV Hommes + Femmes)

Variants `male` / `female` par groupe, valeurs alignées sur le vocabulaire existant de `src/lib/avatarTraits.ts` :

| Groupe | culture_tags | Spécificités F | Spécificités H |
|---|---|---|---|
| `north_european` | `european_north` | head_covering=none | beard=light, head_covering=none |
| `mediterranean` | `mediterranean` | head_covering=none | beard=full, head_covering=none |
| `mena` (Moyen-Orient + Maghreb) | `maghreb`, `moyen_orient` | head_covering=optional (hijab) | beard=full, head_covering=optional (taqiyah) |
| `sub_saharan_africa` | `afrique_subsaharienne` | head_covering=optional (foulard/tresses) | head_covering=none |
| `east_asian` | `est_asie` | head_covering=none, beard non applicable | beard=none, moustache=none |
| `south_asian` | `sud_asie` | head_covering=optional (bindi/hijab) | beard=full, head_covering=optional (turban) |

Champs transférables (mêmes pour H et F sauf indiqué) :
- `avatar_skin_tone`, `avatar_eye_shape`, `avatar_eye_color`
- `avatar_hair_type`, `avatar_hair_color`, `avatar_hair_length` (F uniquement : H pas de colonne longueur dans le CSV)
- `avatar_face_shape`, `avatar_head_covering`, `culture_tags`
- H uniquement : `avatar_beard`, `avatar_moustache`

Champs **non mappés** (nez, lèvres, sourcils, taches de rousseur) : pas d'attribut UI dédié → **ignorés** dans ce plan (pas d'injection prompt non plus, pour ne pas casser l'existant).

## Architecture des changements

### 1. `src/lib/countryPhenotypes.ts` (nouveau)
```
COUNTRY_TO_GROUP: Record<string, GroupKey>  // ~60 entrées normalisées (gentilés + pays, FR)
PHENOTYPE_DEFAULTS: Record<GroupKey, { male: Partial<...>, female: Partial<...> }>
detectCountryGroup(text: string): { group: GroupKey, matchedKeyword: string } | null
```
- Normalisation : minuscules + suppression accents (cohérent avec `avatarAutoInfer.ts`).
- Liste pays/gentilés : marocain·e, algérien·ne, sénégalais·e, japonais·e, chinois·e, indien·ne, pakistanais·e, espagnol·e, italien·ne, grec·que, norvégien·ne, suédois·e, allemand·e, néerlandais·e, etc. + termes génériques (maghrébin, mena, subsaharien, asiatique, slave…).
- Match du **mot le plus long en premier** pour éviter qu'« indien » écrase « ouest-indien » par exemple.

### 2. `src/lib/avatarAutoInfer.ts` (extension)
- Nouveau bloc, exécuté **après** les signaux médicaux et **avant** la finalisation des `values` :
  1. `detectCountryGroup(rawText)` (combinant short_story + emotional + notes privées).
  2. Si match → choisir variant selon `effectiveGender` (`male` / `female`). Si `non_specifie` ou absent : ne rien faire (pas de défaut hasardeux).
  3. Pour chaque champ du variant : appliquer **uniquement si** `values[field]` n'a pas déjà été défini par les règles précédentes **ET** `b[field]` est null/undefined côté bénéficiaire.
  4. Ajouter `culture_tags` du groupe à la liste existante (sans doublon) — n'écrase pas les tags déjà présents.
  5. Émettre `FieldReason { signal: "country_phenotype", signalLabel: "Origine détectée", keyword: <gentilé matché> }` pour chaque champ affecté.
- Signaux explicites conservent la priorité : couleur yeux/cheveux dans le texte (déjà géré) **écrase** le phénotype car traitée après dans le pipeline → on ré-ordonne pour que le phénotype soit appliqué **avant** les overrides explicites yeux/cheveux/barbe, qui restent les derniers à écrire.
- Ordre final dans la fonction :
  1. Signaux médicaux/émotionnels (inchangé)
  2. Âge / culture par défaut (inchangé)
  3. **Phénotype pays (nouveau, weak defaults)**
  4. Overrides explicites (yeux marrons, cheveux blancs, barbe musulmane, hijab…) **inchangés**, écrasent le phénotype

### 3. `SIGNAL_LABELS`
Ajout d'une entrée `country_phenotype: "Origine détectée"`.

### 4. Tests `src/lib/__tests__/avatarAutoInfer.test.ts`
Nouveaux cas :
- **Mehdi, marocain** → skin=olive, hair_type=wavy, hair_color=black, eye_color=dark_brown, head_covering=optional, beard=full, culture_tags inclut `maghreb`.
- **Yumi, japonaise** + corpulence légère (note privée) → eye_shape=almond, hair_type=straight, hair_color=black, face_shape=round, head_covering=none. (résout le bug Yumi signalé)
- **Aïcha, sénégalaise** → skin=very_dark, hair_type=coily, hair_color=black, head_covering=optional.
- **Priya, indienne** → skin=golden_beige, hair_type=wavy, eye_color=dark_brown, head_covering=optional.
- **Conflit explicite** : « sénégalais aux yeux verts » → skin=very_dark MAIS eye_color=green préservé.
- **Conflit manuel** : bénéficiaire avec `avatar_skin_tone='light'` déjà saisi + note « marocain » → skin reste `light`, autres champs phénotype appliqués.
- **Non-régression** : Fatima, vétéran SDF, mère enceinte, orphelin, vide → résultats identiques aux tests actuels.

## Hors scope
- Pas d'enrichissement du prompt image (`avatarArtDirection.ts`) avec les traits "bonus" (nez/lèvres/sourcils) — peut faire l'objet d'un plan ultérieur dédié.
- Pas de modification du parcours donateur, du matching, du panier, ou des RPC publiques.
- Pas de nouvelle colonne DB ni de nouveau composant UI.
- Pas d'auto-reseed silencieux (déjà tranché : bouton manuel 🎲 dans plan précédent).

## Question
Aucune — feu vert pour implémentation dès approbation.
