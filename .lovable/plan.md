

# Configurer la clé publique Stripe

## Ce qui sera fait

Mise à jour du fichier `src/components/checkout/PaymentMethods.tsx` pour remplacer la clé Stripe placeholder par la vraie clé publique fournie.

## Détail technique

- Remplacer `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_..."` par la clé publique directement dans le code
- Cette clé est **publique** (préfixe `pk_live_`), donc parfaitement sûre à inclure dans le code frontend — c'est la pratique recommandée par Stripe

## Changement unique

**Fichier** : `src/components/checkout/PaymentMethods.tsx` ligne 14  
Remplacer le fallback par la clé réelle.

