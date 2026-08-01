
# Homepage v2 — design v1, trois visages dès le premier écran

## Principe directeur
Trois visages en grand, côte à côte, chacun avec **prénom · région · situation** dans un bloc compact, et son propre bouton « Aider [Prénom] » qui mène directement au don. Aucune phrase de storytelling sous les portraits, aucun dégradé dans le hero. Rotation garantissant **3 situations différentes issues de 3 causes différentes** (parmi les 6 causes).

## 1. Hero « rencontre »

```text
┌──────────────────────────────────────────────────────────────────┐
│  [badge ShieldCheck · Don transparent & centré sur l'humain]      │
│                                                                   │
│  Choisissez la personne que vous voulez aider.                    │
│  Découvrez qui a besoin d'aide et financez un colis personnalisé. │
│  Ressentez la connexion. Voyez l'impact.                          │
│                                                                   │
│   ╭─────────────╮   ╭─────────────╮   ╭─────────────╮            │
│   │  PORTRAIT   │   │  PORTRAIT   │   │  PORTRAIT   │            │
│   ╰─────────────╯   ╰─────────────╯   ╰─────────────╯            │
│      Léa              Kwame             Aïcha                     │
│    ⌖ Grand Est      ⌖ Île-de-France   ⌖ Occitanie                │
│   [Famille mono…]   [Sans-abri]       [Senior isolé]              │
│   [ Aider Léa → ]  [ Aider Kwame → ] [ Aider Aïcha → ]            │
│                                                                   │
│   D'autres personnes attendent d'être aidées                      │
│                   [ Choisir une cause ]                           │
│   Livraison 48h · Preuve de réception · Déduction fiscale 75%     │
└──────────────────────────────────────────────────────────────────┘
```

- **Titre** : « Choisissez la personne que vous voulez aider. »
- **Sous-titre** : « Découvrez qui a besoin d'aide et financez un colis personnalisé. Ressentez la connexion. Voyez l'impact. »
- **Fond uni** (`bg-background`), **aucun dégradé** (ni fond, ni `text-gradient`), aucune photo de fond. Le graphisme vient de la structure : grille de 3 colonnes alignées, portraits ronds de diamètre identique, rythme vertical identique dans les 3 blocs.
- **Bloc compact** : portrait rond ~180–200 px, prénom (`font-bold`), région avec micro-icône `MapPin` en `text-muted-foreground`, situation en badge discret (tokens de `badgeStyles.ts`), puis le bouton. Interlignes serrés, carte sobre (`border-[0.5px]`, léger hover lift).
- **Sous le trio** : ligne « D'autres personnes attendent d'être aidées » + bouton **Choisir une cause** (`/causes`), puis la ligne de réassurance **« Livraison 48h · Preuve de réception · Déduction fiscale 75% »**.
- **Rotation** : nouveau tirage toutes ~7 s en crossfade `framer-motion` (les 3 changent ensemble), pause au survol, pastilles cliquables. Chaque rafraîchissement donne aussi un nouveau tirage.
- **Contrainte de diversité** : chaque tirage impose 3 situations distinctes appartenant à 3 causes distinctes.
- Animations d'entrée du v1 conservées (fade + translateY décalé par colonne).
- Mobile : 1 colonne, portraits centrés, blocs empilés.

## 2. Raccourci du parcours
Chaque bouton « Aider [Prénom] » pointe vers **`/donate/:beneficiaryId`** — un seul clic entre l'émotion et l'action.

## 3. Bandeau trombinoscope
Sous le hero : bande de ~12 portraits ronds de 56 px en défilement horizontal lent et continu (marquee CSS, boucle sans couture, `prefers-reduced-motion` respecté), avec la mention **« 200 personnes attendent un colis en France »**. Bande entièrement cliquable → `/causes`.

## 4. « Trois étapes simples » — incarné
Section v1 restaurée à l'identique (tuiles `bg-primary/10`, numéro d'étape, animations au scroll), textes réécrits :
1. **Vous rencontrez quelqu'un** — un prénom, une région, une situation réelle.
2. **Vous financez son colis** — produits essentiels adaptés à sa situation.
3. **Il le reçoit sous 48h** — vous êtes notifié de la livraison.

## 5. Réassurance + stats + CTA final
- Bande réassurance conservée (loi 1901 · colis livré en 24-48h · reçu fiscal automatique).
- Stats v1 (100% reversé / 48h / 6 causes) + `SocialProof`.
- **CTA final : version d'origine v1** — bloc centré `rounded-3xl` (dégradé primary→secondary conservé, comme en v1), « Prêt à faire la différence ? », bouton « Choisir une cause ». Le bloc 2 colonnes avec `/hero-solidarity.jpg` est supprimé.

## 6. Suppression
`HomeBeneficiaries` (les 3 cartes détaillées) est retiré de la homepage et le composant supprimé.

## Ordre final
1. Hero rencontre → 2. Bandeau trombinoscope → 3. Trois étapes incarnées → 4. Réassurance → 5. Stats + preuve sociale → 6. CTA final v1.

## Détails techniques

**Données** — le RPC actuel `get_homepage_beneficiaries` ne renvoie ni la situation ni la cause et ne garantit aucune diversité. Nouvelle fonction `get_homepage_hero_beneficiaries(p_count int)` :
- bénéficiaires actifs avec avatar publié,
- jointure `situations` (titre) et `causes` (id, titre),
- une seule personne par situation **et** par cause (`DISTINCT ON` sur la cause + `random()`), limité à `p_count`,
- renvoie `id, alias_first_name, region, situation_id, situation_title, cause_id, cause_title, avatar_url, avatar_preview_url`,
- `SECURITY DEFINER`, `search_path = public`, `GRANT EXECUTE` à `anon` et `authenticated` (aucune donnée privée : pseudonyme, région, situation uniquement).
- Un appel avec `p_count: 12` (ou une fonction dédiée portraits seuls) alimente le bandeau trombinoscope.

**Frontend**
- `src/components/home/HeroBeneficiaries.tsx` — grille 3 colonnes, rotation, skeleton au chargement, repli silencieux (titre + « Choisir une cause ») si le RPC échoue ou renvoie moins de 3 profils.
- `src/components/home/BeneficiaryStrip.tsx` — marquee de portraits 56 px.
- `src/pages/Index.tsx` — réécrit sur la base de `src/pages/legacy/IndexLegacyV1.tsx` (mêmes tokens, composants et animations), hero remplacé, sections dans l'ordre ci-dessus.
- Suppression de `src/components/home/HomeBeneficiaries.tsx`.
- Portraits via `BeneficiaryAvatar` en `mode="studio"` avec `backgroundSeed={id}` : aucune régression du pipeline avatars.
- Zéro couleur en dur, uniquement les tokens sémantiques. Aucune modification du moteur de panier, du matching ou du tunnel de don. `/accueil-v1` reste archivée en noindex.
- Vérification Playwright desktop 1280 + mobile 390, captures fournies.

## Point de vigilance
La mention « Déduction fiscale 75% » remplace « Reçu fiscal automatique » comme demandé. À noter : le reste du site (page `/avantage-fiscal`, composants `TaxDeduction*`) communique **66%**. Le taux de 75% n'existe que pour les organismes d'aide aux personnes en difficulté (dons plafonnés à 1 000 €). Si ce statut s'applique, il faudra harmoniser le reste du site dans un second temps — dites-moi si je le fais.
