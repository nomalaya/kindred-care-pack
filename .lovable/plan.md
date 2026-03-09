
# Plan de résolution des erreurs React et finalisation du funnel Stripe

## Problèmes identifiés

### 1. Erreurs React forwardRef (CRITIQUE)
- **Composant Logo** : L'erreur "Function components cannot be given refs" survient car le composant `Logo` est utilisé dans un `Link` de React Router qui tente de lui passer une ref
- **Composant SocialProof** : Même problème, probablement causé par un parent qui essaie de passer une ref

### 2. Avertissements React Router (MINEUR)
- Avertissements de migration v7 qui polluent les logs de la console
- Non critiques mais créent du bruit

### 3. Système Stripe incomplet (FONCTIONNEL)
- Les edge functions et la base de données sont en place
- Mais les composants frontend du funnel checkout manquent
- Le routing n'est pas configuré pour le nouveau flow

## Solution technique

### Étape 1 : Corriger les erreurs forwardRef
**Composants à modifier :**
- `Logo.tsx` : Utiliser `React.forwardRef()` pour accepter les refs
- `SocialProof.tsx` : Même traitement

**Code technique :**
```typescript
const Logo = React.forwardRef<SVGSVGElement, LogoProps>(({ className, size = "md" }, ref) => {
  return (
    <svg ref={ref} className={...} viewBox="...">
      {/* SVG content */}
    </svg>
  );
});
Logo.displayName = "Logo";
```

### Étape 2 : Créer les composants manquants du funnel Stripe
**Nouveaux composants à créer :**
- `CheckoutFlow.tsx` : Composant principal avec state machine 4 étapes
- `CartSummary.tsx` : Récapitulatif panier avec ajustements
- `DonorInformation.tsx` : Formulaire infos donateur + création compte
- `PaymentMethods.tsx` : Intégration Stripe Elements + paiement

**Architecture technique :**
- State management avec `useState` pour l'étape courante
- Context ou props drilling pour partager les données du panier
- Validation des formulaires avec `react-hook-form` + `zod`
- Intégration `@stripe/react-stripe-js` pour les éléments de paiement

### Étape 3 : Intégrer le nouveau routing
**Modifications :**
- Ajouter route `/checkout/:beneficiaryId` dans `App.tsx`
- Modifier `DonationFlow.tsx` pour rediriger vers `/checkout` au lieu de soumettre directement
- Créer les pages de succès/échec du paiement

### Étape 4 : Supprimer les avertissements React Router
**Configuration future flags :**
```typescript
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

## Impact utilisateur

### Avant (problématique)
- Erreurs React dans la console polluent l'expérience développeur
- Le bouton "Donner" simule le paiement sans transaction réelle
- Pas de collecte d'informations donateur ni de vraie sécurité

### Après (résolu)
- Console propre sans erreurs
- Funnel de paiement complet en 4 étapes
- Transactions Stripe sécurisées avec collecte d'infos
- Déduction fiscale calculée et affichée
- Reçus automatiques et suivi de commande

## Ordre d'implémentation

1. **Corriger forwardRef** (5 min) - Résout immédiatement les erreurs console
2. **Créer composants checkout** (30 min) - Implémente le funnel complet
3. **Intégrer routing** (10 min) - Connecte le nouveau flow
4. **Tester end-to-end** (10 min) - Valide le parcours complet
5. **Future flags React Router** (2 min) - Supprime les warnings

La priorité est de corriger les erreurs React d'abord car elles impactent l'expérience développeur, puis de finaliser le système Stripe pour avoir une solution de paiement complète et professionnelle.
