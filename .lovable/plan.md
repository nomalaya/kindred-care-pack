

# Plan d'implémentation — Refonte post-don

## Résumé

Supprimer le faux tracker e-commerce, remplacer par une promesse honnête avec lien conditionnel vers le dashboard, anonymiser le texte de partage, proposer le choix du réseau social, et simplifier le dashboard.

## Fichiers modifiés

### 1. Modifier `src/components/DonationConfirmation.tsx`
- **Supprimer** tout le bloc "Suivi de livraison" (lignes 124-156) — la timeline 4 étapes
- **Remplacer** par un bloc "Promesse de livraison" simple :
  - Icône Package + texte : "Votre colis sera préparé et remis à {beneficiaryName} sous 72h."
  - Deuxième ligne conditionnelle selon `useAuth()` :
    - Si connecté : "Vous recevrez une confirmation par email dès que le colis lui sera remis. Retrouvez aussi cette confirmation dans **Vos contributions** dans votre espace donateur." — "Vos contributions" = `<Link to="/dashboard">`
    - Si non connecté : "Vous recevrez une confirmation par email dès que le colis lui sera remis. **Créez votre espace donateur** pour suivre vos contributions." — lien vers `/auth`
- Supprimer l'import de `Truck` et `DELIVERY_STATUSES`

### 2. Modifier `src/components/PostDonSocialBlock.tsx`
- **Supprimer** le bouton "Voir l'impact réel" (lignes 50-55) — le lien LinkedIn "Suivre les actions" en dessous remplit déjà ce rôle
- **Anonymiser le partage** : remplacer `"Je viens d'aider ${beneficiaryName}"` par `"Je viens d'aider une personne dans le besoin via CashForCause"`
- **Remplacer le bouton "Partager mon action"** par un menu déroulant (Popover ou DropdownMenu) proposant 3 options :
  - Instagram (ouvre un lien de story/post pré-rempli — en pratique, copie le texte + ouvre Instagram car l'API Instagram ne supporte pas le partage direct de texte)
  - TikTok (copie le texte + ouvre TikTok, même raison)
  - LinkedIn (utilise `https://www.linkedin.com/sharing/share-offsite/?url=...` qui supporte le partage direct via URL)
  - Fallback "Copier le message" pour coller manuellement
- Conserver `navigator.share` sur mobile (qui propose nativement tous les réseaux installés) — le menu n'apparaît que sur desktop

### 3. Modifier `src/components/dashboard/DonationCard.tsx`
- **Simplifier** les statuts à 2 états visuels :
  - "Don confirmé — colis en préparation" (statuts confirmed/prepared/shipped)
  - "Remis à {prénom}" (statut delivered uniquement)
- **Supprimer** la barre de progression 4 étapes (lignes 89-114) et la remplacer par un simple badge textuel coloré
- Garder le bouton Attestation

### 4. Modifier `src/lib/constants.ts`
- Simplifier `DELIVERY_STATUSES` à 2 entrées ou ajouter un mapping simplifié pour le dashboard (les statuts DB restent inchangés pour la logique interne)

## Détail technique — Partage par réseau

Sur **mobile** : `navigator.share()` est maintenu tel quel (l'OS propose tous les réseaux installés — c'est la meilleure UX).

Sur **desktop** (pas de `navigator.share`) : un `DropdownMenu` (composant déjà disponible dans `src/components/ui/dropdown-menu.tsx`) avec 4 options :
- **LinkedIn** : `window.open("https://www.linkedin.com/sharing/share-offsite/?url=...")` — partage natif
- **Instagram** : copie le texte dans le presse-papiers + `window.open(SOCIAL_LINKS.instagram)` + toast "Texte copié, collez-le dans votre story"
- **TikTok** : même mécanisme que Instagram
- **Copier le message** : copie dans le presse-papiers uniquement

Instagram et TikTok ne proposent pas d'API de partage web, donc copier + rediriger est la seule solution viable sur desktop.

## Fichiers concernés
1. **Modifier** `src/components/DonationConfirmation.tsx`
2. **Modifier** `src/components/PostDonSocialBlock.tsx`
3. **Modifier** `src/components/dashboard/DonationCard.tsx`
4. **Modifier** `src/lib/constants.ts`

4 fichiers modifiés, 0 créé, 0 supprimé.

