

# Corrections page post-don

## Fichiers modifiés

### 1. `src/components/DonationConfirmation.tsx`

**Upsell séparé avec explication :**
- Extraire le bloc `emergencyPack` (lignes 116-123) hors du card "Contenu du colis"
- En faire un card séparé avec titre "Kit urgence" et explication : "Ce kit sera remis à une autre personne que {beneficiaryName}."

**Textes :**
- Ligne 81 : enlever `❤️`
- Lignes 90-93 : remplacer par `"Votre don va permettre d'aider concrètement et immédiatement {beneficiaryName}."`
- Ligne 105 : `"Contenu du colis"` (supprimer `– {montant}€`)
- Ligne 139 : `"Votre colis sera remis à {beneficiaryName} sous 3 jours maximum."` — en `text-base font-semibold`
- Ligne 142 : `"Vous recevrez une confirmation par email dès que le colis sera remis à {beneficiaryName}."`
- Retour à la ligne après, puis conditionnel :
  - Si connecté : `"Retrouvez cette confirmation dans Vos contributions dans votre espace donateur."` (lien vers `/dashboard`)
  - Si non connecté : `"Créez votre espace donateur pour suivre vos contributions."` (lien vers `/auth`)

**CTAs :**
- Supprimer le bouton "Voir mes dons" (lignes 183-188)
- Garder "Aider quelqu'un d'autre" (lignes 189-193)

### 2. `src/components/PostDonSocialBlock.tsx`

- Supprimer le titre `<h3>Partagez votre action</h3>` (ligne 58-60)
- Supprimer le paragraphe `<p>Votre don permet l'envoi d'un colis alimentaire sous 48h.</p>` (ligne 61-63)
- Garder uniquement le bouton CTA "Partager mon action" avec le dropdown, le lien "Suivre les actions" et les icônes sociales
- Fix détection mobile : `const isMobile = typeof navigator !== "undefined" && !!navigator.share && ('ontouchstart' in window || navigator.maxTouchPoints > 0);`

2 fichiers modifiés.

