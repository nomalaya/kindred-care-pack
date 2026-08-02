## 1. Hero « rencontre » — retour au design v1 (texte à gauche, visage à droite)

Fichier : `src/components/home/HeroBeneficiaries.tsx`

- Fond : photo `/hero-solidarity.jpg` en plein cadre + dégradé `from-background/95 via-background/80 to-background/60` (identique à la v1), section `py-20 md:py-28`.
- Grille 2 colonnes (`md:grid-cols-2`, une seule colonne empilée en mobile) :
  - **Gauche** : badge « Don transparent & centré sur l'humain », H1 « Choisissez la personne que vous voulez aider. », sous-titre « Découvrez qui a besoin d'aide et financez un colis personnalisé. Ressentez la connexion. Voyez l'impact. »
  - **Droite** : **un seul** bénéficiaire, en rotation automatique (7 s) + tirage diversifié conservé (RPC `get_homepage_hero_beneficiaries`, on affiche l'index courant de la liste de 3, puis nouveau tirage).
- **Anti-effet « carte de site de rencontre »** : suppression totale de la carte (plus de `bg-card`, plus de bordure, plus d'arrondi 2xl, plus de padding). Le portrait est posé directement sur le dégradé :
  - avatar en très grand (≈ 260 px desktop / 200 px mobile), rendu `mode="studio"` **sans fond importé** (`backgroundSeed` non transmis → conteneur transparent au lieu du fond décoratif du bucket),
  - halo doux radial derrière le visage (token `--primary` en très faible opacité) pour l'intégration au dégradé,
  - sous le visage, une ligne compacte non encadrée : **Prénom** (gras), puis `Région · Situation` en petit `text-muted-foreground` — pas de pastille de couleur,
  - CTA principal `bg-cta` : « Aider {Prénom} » → `/donate/:id`,
  - points de pagination discrets conservés pour changer de personne.
- Suppression de la ligne « Livraison 48h · Preuve de réception · Déduction fiscale 75% » dans le hero.
- Bloc bas du hero renforcé : « **D'autres personnes attendent votre aide.** » en `text-lg md:text-xl font-semibold text-foreground`, et CTA « Choisir une cause » rendu visible → `variant="outline"` remplacé par un bouton plein secondaire (`size="lg"`, fond `secondary`/bordure marquée + `backdrop-blur`) pour qu'il ressorte sur la photo.

## 2. Suppression du bandeau trombinoscope

- Retrait de `<BeneficiaryStrip />` et de son import dans `src/pages/Index.tsx`; suppression du fichier `src/components/home/BeneficiaryStrip.tsx` (le keyframe `marquee` de `tailwind.config.ts` est conservé, inoffensif).

## 3. Stats — 3 chiffres plus parlants

Fichier : `src/pages/Index.tsx`


| Avant                            | Après                                               |
| -------------------------------- | --------------------------------------------------- |
| 100% — Reversé aux bénéficiaires | **200** — Personnes en attente d'un colis en France |
| 48h — Délai moyen de livraison   | 48h — Délai moyen de livraison                      |
| 6 — Causes à soutenir            | **75%** — Déduction fiscale                         |


Le « 200 » est la donnée déjà utilisée sur le site (nombre de bénéficiaires en attente) : c'est une preuve sociale de besoin réel, plus incarnée que le nombre de causes. `SocialProof variant="homepage"` reste dessous.

## 4. Bande réassurance réécrite + icônes adaptées

Fichier : `src/pages/Index.tsx`


| Avant                              | Après                                                | Icône          |
| ---------------------------------- | ---------------------------------------------------- | -------------- |
| Association déclarée loi 1901      | Organisme déclaré d'aide aux personnes en difficulté | `ShieldCheck`  |
| Colis livré en 24 à 48h            | Envoi d'une preuve de réception                      | `PackageCheck` |
| Reçu fiscal envoyé automatiquement | Reçu fiscal automatique                              | `Receipt`      |


## Détails techniques

- Aucun changement backend : même RPC, même logique de matching et de panier.
- Couleurs exclusivement via tokens sémantiques (`background`, `foreground`, `muted-foreground`, `primary`, `cta`, `secondary`) — aucun `text-white`/hex codé.
- `BeneficiaryAvatar` est appelé sans `backgroundSeed` pour ce hero afin d'obtenir un rond sans fond importé ; le composant reste inchangé (le fond blanc n'est appliqué que si un `bgUrl` est absent → on passera `size="xl"` avec conteneur transparent via une prop `transparent` optionnelle ajoutée au composant, sans toucher au rendu des autres pages).