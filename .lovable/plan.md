# Restructuration de la page d'accueil

Header, footer et design système inchangés : aucune nouvelle couleur, aucun nouveau composant. Uniquement les tokens existants (`primary`, `secondary`, `muted`, `card`, `cta`, `border`) et les composants `Button`, `Card`, `Skeleton` déjà présents.

## Étape 1 — Fonction backend de tirage

Création d'une fonction `get_homepage_beneficiaries(p_count)` en base :
- retourne 3 profils actifs tirés **au hasard à chaque appel**, uniquement ceux qui ont un avatar publié et une histoire renseignée ;
- expose seulement des champs publics : prénom d'alias, région, phrase émotionnelle, histoire courte, avatar, identifiant de situation ;
- accessible aux visiteurs non connectés (lecture seule, aucune donnée réelle exposée).

## Étape 2 — Nouvel ordre des sections dans `src/pages/Index.tsx`

**1. Bénéficiaires (nouvelle, en premier)**
- Titre « Rencontrez ceux que vous pouvez aider », sous-titre « Trois personnes différentes vous attendent. Revenez — vous en découvrirez d'autres. »
- Un seul appel au chargement, sans cache (`staleTime: 0`, pas de mise en mémoire).
- Grille : 3 colonnes desktop / 2 tablette / 1 mobile, gap 20px.
- Carte : rayon 12px, bordure fine, fond neutre, padding 20px → avatar rond 80px centré (icône `UserRound` en repli), prénom gras 16px + région avec `MapPin` 14px, phrase émotionnelle en italique couleur primaire (2 lignes max), histoire 13px en couleur secondaire (3 lignes max tronquées), bouton outline pleine largeur « Aider [Prénom] » vers `/situations/[situation_id]`.
- États : skeleton pendant le chargement ; section masquée silencieusement si 0 résultat ou erreur.

**2. Hero simplifié**
- Titre et sous-titre conservés, photo de fond supprimée, fond uni en couleur primaire chaude, hauteur limitée à 180px, boutons « Je donne » et « Comment ça marche » conservés.

**3. Réassurance (nouvelle)**
- Bande légèrement colorée, 3 items en ligne, sans CTA : `Award` « Association déclarée loi 1901 », `Clock` « Colis livré en 24 à 48h », `Receipt` « Reçu fiscal envoyé automatiquement ».

**4. Causes** — aucune section causes ajoutée sur l'accueil (décision validée) ; l'accès se fait par les CTA.

**5. Stats** — mise en forme inchangée, textes ajustés : « 100% reversé aux bénéficiaires », « Livraison en 24 à 48h », « 6 causes à soutenir ». Le bloc de preuve sociale existant est conservé.

**6. Suppression** — la section « Trois étapes simples pour changer une vie » est retirée entièrement.

**7. CTA final avec photo** — remplace le bloc CTA actuel :
- 2 colonnes desktop / 1 colonne mobile.
- Gauche : la photo bénévoles existante (`/hero-solidarity.jpg`, libérée du hero), pleine hauteur, `object-cover`, rayon 12px à gauche, légende 12px italique « Nos bénévoles préparent votre colis dans notre entrepôt partenaire ».
- Droite : fond primaire, rayon 12px à droite, padding 40px → titre « Prêt à aider quelqu'un aujourd'hui ? », texte 15px sur l'équipe réelle et les 24–48h, bouton plein blanc « Trouver quelqu'un à aider » vers `/causes`, mention 12px « Dès 20€ · Reçu fiscal automatique · Livraison garantie sous 48h ».

## Détails techniques

- Nouveau composant de section `src/components/home/HomeBeneficiaries.tsx` (assemblé uniquement à partir de composants UI existants) pour garder `Index.tsx` lisible ; les autres sections restent dans `Index.tsx`.
- Troncature via `line-clamp-2` / `line-clamp-3` (Tailwind déjà disponible).
- Les contrastes blancs du bloc CTA utilisent les tokens `primary-foreground` existants, pas de couleur littérale.
- Vérification finale sur navigateur en desktop et mobile (rendu, skeleton, liens).
