

# Plan d'implémentation du funnel de paiement Stripe

## Problème identifié

Le système de donation actuel ne gère pas de vrais paiements. Lorsque l'utilisateur clique sur "Donner", la donation est directement créée en base de données sans transaction financière réelle. C'est pourquoi il n'y a pas de vraie gestion de paiement, d'informations donateur, ou de confirmation sécurisée.

## Architecture du nouveau funnel

### 1. Refactorisation des pages existantes
- **DonationFlow.tsx** → devient uniquement la sélection du montant et composition du panier
- **Nouvelle structure multi-étapes** : Panier → Informations → Paiement → Confirmation

### 2. Nouvelles pages/composants

#### **CheckoutFlow.tsx** (page principale multi-étapes)
```
/checkout/:beneficiaryId?step=cart|info|payment|confirmation
```

**États globaux:**
- Bénéficiaire sélectionné
- Panier (produits + montant + emergency pack)
- Informations donateur
- Statut paiement Stripe

#### **Étape 1: CartSummary.tsx**
- Récapitulatif du colis avec possibilité de modification
- Ajustement des quantités individuelles
- Ajout/suppression de produits du panier  
- Calcul tax deduction en temps réel
- Bouton "Continuer vers les informations"

#### **Étape 2: DonorInformation.tsx**
- Formulaire : prénom, nom, email, téléphone (optionnel)
- Case à cocher "Créer un compte" vs "Continuer en invité"
- Si compte : gestion mot de passe
- Validation des champs obligatoires
- Bouton "Continuer vers le paiement"

#### **Étape 3: PaymentMethods.tsx**
- Intégration Stripe Elements pour carte bancaire
- Options alternatives (si supportées par Stripe) : Apple Pay, Google Pay
- Affichage clair du montant total, frais, déduction fiscale
- Sécurisation SSL et badges de confiance
- Bouton "Finaliser le paiement"

#### **Étape 4: OrderConfirmation.tsx** 
- Extension de `DonationConfirmation.tsx` existant
- Intégration numéro de transaction Stripe
- Envoi email reçu fiscal automatique
- Options partage social
- Boutons "Voir mes dons" et "Aider quelqu'un d'autre"

### 3. Infrastructure backend nécessaire

#### **Edge Function: create-payment-intent**
```typescript
// supabase/functions/create-payment-intent/index.ts
```
- Validation des données panier
- Création PaymentIntent Stripe avec métadonnées
- Sécurisation côté serveur du montant
- Retour client_secret pour frontend

#### **Edge Function: confirm-payment**
```typescript  
// supabase/functions/confirm-payment/index.ts
```
- Webhook Stripe pour confirmation paiement
- Création ligne `donations` en BDD seulement si paiement réussi
- Mise à jour statut commande
- Envoi email reçu fiscal

#### **Webhook Stripe**
- Configuration dans Stripe Dashboard
- URL: `https://[project].supabase.co/functions/v1/confirm-payment`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4. Modèles de données étendus

#### **Table: checkout_sessions**
```sql
CREATE TABLE checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  donor_email text,
  donor_name text,
  basket_data jsonb,
  stripe_payment_intent_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

#### **Mise à jour table donations**
```sql  
ALTER TABLE donations ADD COLUMN checkout_session_id uuid REFERENCES checkout_sessions(id);
ALTER TABLE donations ADD COLUMN payment_status text DEFAULT 'completed';
```

### 5. UX/UI et neurodesign

#### **Indicateur de progression**
- Barre de progression visuelle (Étape 1/4, 2/4, etc.)
- Navigation retour possible entre étapes
- Sauvegarde automatique du panier (localStorage)

#### **Résumé persistant**
- Sidebar sticky avec photo bénéficiaire + panier résumé
- Visible sur toutes les étapes pour rassurer
- Calculs totaux mis à jour en temps réel

#### **Validation et feedback**
- Validation inline des formulaires (email, téléphone)
- Messages d'erreur clairs pour Stripe (carte refusée, etc.)
- Loading states pendant traitement paiement
- Success animations sur confirmation

#### **Sécurité visuelle**
- Badges SSL, Stripe, sécurité
- URLs https bien visibles  
- Messages de confiance ("Vos données sont protégées")

### 6. Gestion d'erreurs et edge cases

#### **Échecs de paiement**
- Retry automatique avec nouvelles cartes
- Messages d'erreur explicites (fonds insuffisants, carte expirée)
- Possibilité retour étapes précédentes

#### **Sessions abandonnées**
- Sauvegarde panier localStorage
- Email de relance après 24h (optionnel)
- Récupération session via lien email

#### **Comptes utilisateurs**
- Création automatique profil si "Créer un compte"
- Historique donations dans Dashboard existant
- Réutilisation infos pour donations futures

## Étapes d'implémentation

1. **Setup Stripe Products**: Créer les produits correspondants dans Stripe Dashboard
2. **Edge Functions**: Implémenter create-payment-intent et confirm-payment  
3. **Tables BDD**: Ajouter checkout_sessions et étendre donations
4. **Composants UI**: Créer CheckoutFlow et sous-composants
5. **Integration**: Connecter DonationFlow → CheckoutFlow
6. **Testing**: Tests paiements Stripe en mode test
7. **Production**: Configuration webhook et clés live

## Sécurité et conformité

- **PCI Compliance**: Utilisation Stripe Elements (pas de stockage cartes)
- **RGPD**: Consentement données personnelles explicite
- **Validation serveur**: Double validation montants client/serveur
- **Webhook signature**: Validation signatures Stripe côté serveur

