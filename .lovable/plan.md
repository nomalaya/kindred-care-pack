## Plan: Refonte UX page don + badges bénéficiaires — TERMINÉ ✅

### Implémenté

- ✅ DonationAmountSelector: sélecteur [-] montant [+] avec paliers [18-90] + 15€ incréments
- ✅ DonationImpactCard: carte impact dynamique avec repas/produits/hygiène/famille
- ✅ ImpactTimeline: timeline visuelle avec connecteurs verticaux
- ✅ DonationFlow: layout vertical single-column, intégration nouveaux composants
- ✅ DonationBasket: simplifié (plus de headers famille, juste produits + badges diet)
- ✅ BeneficiarySelection: badges plus grands, fond coloré par badge, hover effects, hiérarchie visuelle nom/âge/région, cœur suivi
- ✅ Dashboard: section "Personnes suivies"
- ✅ Table followed_beneficiaries + RLS
- ✅ Supprimé: DonationSlider, DonationImpact, SocialProof sur DonationFlow
- ✅ Constants: DONATION_STEPS, DONATION_TIERS ajustés (tier1 à 18€), DEFAULT_DONATION = 36€
