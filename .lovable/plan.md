

# Espace personnel donateur — Historique et attestations fiscales

## Architecture : enrichir le Dashboard existant avec des Tabs

Pas de nouvelle page. Le `/dashboard` actuel devient un espace personnel complet avec 2 onglets.

## Onglet 1 — "Mes contributions"

Reprend le contenu actuel du Dashboard avec ameliorations :
- Chaque carte de don affiche : avatar, prenom, region, montant, date, barre de statut
- Wording humanise : "Don confirme" / "Colis en preparation" / "En route vers [Prenom]" / "Remis a [Prenom]"
- Ajout d'un bouton discret "Attestation" (icone Download) sur chaque carte pour telecharger le recu fiscal individuel en PDF

## Onglet 2 — "Attestations fiscales"

- Selecteur d'annee en haut (2025, 2026...)
- Carte recapitulative : nombre de dons, total donne, deduction fiscale 66%, cout reel
- Bouton principal : "Telecharger l'attestation annuelle [annee]" → PDF recapitulatif
- En dessous : liste des dons de l'annee avec bouton "Telecharger" individuel par don

## Generation des PDF

- Generation cote client avec une librairie JS (jspdf ou pdf-lib)
- Contenu du PDF individuel : nom du donateur, date, montant, beneficiaire (prenom + region), numero de don, mention legale deduction fiscale 66%
- Contenu du PDF annuel : en-tete association, nom du donateur, tableau recapitulatif de tous les dons de l'annee, total, mention legale, signature
- Pas de stockage fichier — generation a la volee depuis les donnees en base

## Modifications techniques

### 1. `src/pages/Dashboard.tsx`
- Restructurer avec le composant `Tabs` (deja disponible dans ui/tabs)
- Onglet "Mes contributions" : contenu actuel + bouton attestation par don
- Onglet "Attestations fiscales" : nouveau composant

### 2. Nouveau composant `src/components/dashboard/TaxCertificates.tsx`
- Selecteur d'annee
- Carte recap annuelle (total, deduction, nombre de dons)
- Liste des dons avec bouton telecharger individuel
- Bouton telecharger attestation annuelle

### 3. Nouveau composant `src/components/dashboard/DonationCard.tsx`
- Extraction de la carte de don actuelle en composant reutilisable
- Ajout du bouton attestation individuelle

### 4. Nouveau utilitaire `src/lib/generateReceipt.ts`
- Fonction `generateIndividualReceipt(donation, donorInfo)` → telecharge un PDF
- Fonction `generateAnnualReceipt(donations, donorInfo, year)` → telecharge un PDF
- Utilise jspdf (a ajouter comme dependance)

### 5. Mise a jour `src/components/checkout/OrderConfirmation.tsx`
- Remplacer le TODO du bouton "Recu fiscal" par un vrai appel a `generateIndividualReceipt`

### 6. Dependance
- Ajouter `jspdf` au package.json

## Aucune modification de base de donnees
Toutes les donnees necessaires sont deja en base (donations, profiles). Pas de nouvelle table requise.

