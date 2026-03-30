

# Expérience de connexion et création de compte — Refonte UX complète

## Vue d'ensemble

Refonte de la page Auth et du flow post-don pour réduire la friction, améliorer la récupération des donateurs, et ajouter des méthodes de connexion alternatives (Google, magic link, mot de passe oublié).

---

## Fichiers à créer

### 1. `src/pages/ResetPassword.tsx`
Page de réinitialisation du mot de passe. Détecte `type=recovery` dans le hash URL, affiche un formulaire pour saisir un nouveau mot de passe, appelle `supabase.auth.updateUser({ password })`.

---

## Fichiers à modifier

### 2. `src/pages/Auth.tsx` — Refonte complète

**Messages d'erreur humanisés** :
- Remplacer `toast.error(err.message)` par des messages en français contextuels :
  - Login échoué → "Email ou mot de passe incorrect. Vérifiez vos informations ou réinitialisez votre mot de passe."
  - Signup échoué → message adapté selon l'erreur

**Conservation de l'email** : l'email n'est jamais vidé (comportement déjà correct avec les `useState`, mais on s'assure que le `catch` ne reset pas le champ).

**Icône œil mot de passe** : ajouter un toggle show/hide avec l'icône `Eye`/`EyeOff` de Lucide.

**Lien "Mot de passe oublié ?"** : visible sous le champ mot de passe en mode login. Ouvre un mode "forgot" inline qui affiche un champ email + bouton "Envoyer le lien". Appelle `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.

**Bouton "Continuer avec Google"** : ajouté au-dessus du formulaire, séparé par un divider "ou". Utilise `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` via le module Lovable Cloud.

**Option Magic Link** : lien "Recevoir un lien de connexion par email" sous le formulaire. Ouvre un mode "magic-link" inline : champ email + bouton. Appelle `supabase.auth.signInWithOtp({ email })`. Message de confirmation : "Un lien de connexion vous a été envoyé par email."

**Structure des modes** : état `mode: 'login' | 'signup' | 'forgot' | 'magic-link'` remplaçant le booléen `isLogin`.

### 3. `src/components/checkout/OrderConfirmation.tsx` — Section post-don pour non-connectés

Après le don, si l'utilisateur n'est pas connecté, afficher un bloc entre les actions et "Prochaines étapes" :
- Titre : "Accédez à votre espace donateur"
- Texte : "Recevez un lien par email pour suivre votre don et télécharger vos reçus fiscaux — sans mot de passe."
- Bouton : "Recevoir mon lien d'accès" → appelle `supabase.auth.signInWithOtp({ email: checkoutData.donorInfo.email })`
- Message de succès : "Lien envoyé ! Vérifiez votre boîte email."

### 4. `src/App.tsx`
- Ajouter route `/reset-password` → composant `ResetPassword`

### 5. Configuration Google OAuth
- Appeler l'outil "Configure Social Login" pour générer le module `src/integrations/lovable/`

---

## Rattachement automatique des dons (point 8)

Le rattachement est déjà fonctionnel : les dons sont liés au `donor_id` (auth user id) lors de l'insertion. Si un donateur donne sans compte puis crée un compte avec le même email, les dons ne sont pas automatiquement rattachés car le `donor_id` n'existait pas au moment du don.

**Solution** : dans `CheckoutFlow`, quand `donorInfo.createAccount` est true ou quand le magic link post-don est utilisé, après confirmation d'authentification, exécuter un UPDATE des donations du `checkout_session_id` courant pour y ajouter le `donor_id` du user nouvellement authentifié. Cela se fait via une edge function ou un trigger `on auth signup` qui cherche les donations orphelines par email.

→ Pas de nouveau trigger ni edge function : on peut simplement, dans `OrderConfirmation`, après connexion via magic link, appeler un update du `checkout_sessions` et `donations` avec le nouveau `user.id`.

---

## Aucune modification de base de données requise

Toutes les fonctionnalités utilisent les APIs Supabase Auth existantes et les tables actuelles.

---

## Fichiers concernés (résumé)
1. **Créer** `src/pages/ResetPassword.tsx`
2. **Modifier** `src/pages/Auth.tsx` — refonte complète (erreurs, œil, forgot, Google, magic link)
3. **Modifier** `src/components/checkout/OrderConfirmation.tsx` — bloc magic link post-don
4. **Modifier** `src/App.tsx` — 1 route
5. **Configurer** Google OAuth via l'outil Social Login

