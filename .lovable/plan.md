

## Plan : Traduire CashForCause en français

L'ensemble de l'interface est actuellement en anglais. Il faut traduire tous les textes statiques du frontend en français, ainsi que mettre à jour les données en base (causes, situations, bénéficiaires, produits) si elles sont en anglais. Aussi adapter les formats (dates, monnaie) aux conventions françaises.

### Fichiers à modifier

**1. Navbar** (`src/components/Navbar.tsx`)
- "Causes" → "Causes" (identique)
- "How it works" → "Comment ça marche"
- "My Donations" → "Mes dons"
- "Logout" → "Déconnexion"
- "Sign in" → "Se connecter"
- "Start helping" → "Je donne"

**2. Layout / Footer** (`src/components/Layout.tsx`)
- "Making human connection through giving..." → "Créer du lien humain par la générosité. Chaque don raconte une histoire."
- "All rights reserved." → "Tous droits réservés."

**3. Homepage** (`src/pages/Index.tsx`)
- Hero : "Give to a real person, not just a cause." → "Donnez à une vraie personne, pas juste à une cause."
- Steps, stats, CTA — tout en français

**4. Cause Selection** (`src/pages/CauseSelection.tsx`)
- "Choose a cause" → "Choisissez une cause"
- Description en français

**5. Situation Selection** (`src/pages/SituationSelection.tsx`)
- "Back to causes" → "Retour aux causes"
- Textes en français

**6. Beneficiary Selection** (`src/pages/BeneficiarySelection.tsx`)
- Titres et boutons en français ("Aider", "Découvrir d'autres causes")

**7. Donation Flow** (`src/pages/DonationFlow.tsx`)
- "Choose your donation" → "Choisissez votre don"
- "Care package contents" → "Contenu du colis"
- Bouton "Donate X€ to Y" → "Donner X€ à Y"
- Textes de sécurité en français

**8. Dashboard** (`src/pages/Dashboard.tsx`)
- "My Donations" → "Mes dons"
- "No donations yet" → "Aucun don pour le moment"
- Date locale `fr-FR`

**9. Auth** (`src/pages/Auth.tsx`)
- "Welcome back" → "Content de vous revoir"
- "Join CashForCause" → "Rejoignez CashForCause"
- Labels et messages en français

**10. How It Works** (`src/pages/HowItWorks.tsx`)
- Toutes les étapes et textes en français

**11. Admin** (`src/pages/Admin.tsx`)
- Titres des onglets en français

**12. NotFound** (`src/pages/NotFound.tsx`)
- "Page not found" → "Page introuvable"

**13. Constants** (`src/lib/constants.ts`)
- Tier labels et descriptions en français ("Essentiel", "Confort", etc.)
- Delivery statuses en français

**14. Données en base** — Migration SQL pour mettre à jour les textes des causes, situations et produits en français (si les seeds étaient en anglais).

**15. `index.html`** — `lang="fr"`, meta description en français

### Pas de changement structurel
Aucune modification de logique ou de schéma. Uniquement du texte.

