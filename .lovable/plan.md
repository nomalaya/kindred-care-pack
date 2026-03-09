

# Attribution du don additionnel à un bénéficiaire différent

## Résumé

Quand un donateur ajoute un colis d'urgence, le système sélectionnera automatiquement un bénéficiaire différent du bénéficiaire principal, en utilisant le matching par catégorie et la rotation existante.

## Changements

### 1. Migration base de données

Ajouter une colonne `emergency_beneficiary_id` (uuid, nullable) à `checkout_sessions` pour stocker le bénéficiaire du colis d'urgence.

Créer une fonction RPC `get_emergency_beneficiary(p_exclude_id uuid, p_pack_type text)` qui :
- Exclut le bénéficiaire principal (`p_exclude_id`)
- Filtre selon le type de pack :
  - `alimentaire` → bénéficiaires actifs triés par `rotation_score` (besoin alimentaire universel)
  - `hygiene` → idem (besoin hygiène universel)
  - `bebe` → bénéficiaires avec `children_count > 0` ou `beneficiary_category` contenant "enfant"/"famille"
- Trie par `rotation_score DESC` pour répartir équitablement
- Retourne 1 seul bénéficiaire

### 2. Edge function `create-payment-intent`

Quand `emergency_pack_data` est présent :
- Appeler la fonction RPC `get_emergency_beneficiary` avec le `beneficiary_id` principal et le type du pack
- Stocker `emergency_beneficiary_id` dans `checkout_sessions`
- Ajouter l'info dans les métadonnées Stripe
- Retourner `emergency_beneficiary_id` + `emergency_beneficiary_name` au frontend

### 3. Edge function `confirm-payment`

Quand le paiement est confirmé et qu'un `emergency_beneficiary_id` existe dans la session :
- Créer **2 enregistrements** dans `donations` :
  - Don principal → `beneficiary_id` avec `amount = total - emergency_pack_amount`
  - Don additionnel → `emergency_beneficiary_id` avec `amount = emergency_pack_amount`
- Les deux donations partagent le même `checkout_session_id` et `stripe_payment_id`
- Les deux ont `delivery_status: "confirmed"` (même pipeline de suivi)

### 4. Frontend — `CheckoutData` type

Ajouter `emergencyBeneficiary?: { id: string; alias_first_name: string }` au type `CheckoutData`.

### 5. Frontend — `PaymentMethods.tsx`

Récupérer `emergency_beneficiary_id` et `emergency_beneficiary_name` depuis la réponse de l'edge function et les stocker dans `checkoutData`.

### 6. Frontend — `OrderConfirmation.tsx`

Si un colis d'urgence a été ajouté, afficher le nom du bénéficiaire additionnel à côté du pack d'urgence dans le résumé :
> "Pack urgence alimentaire — pour **Fatima**"

L'attestation fiscale affiche toujours le montant total combiné (inchangé).

## Détails techniques

```text
Flux de données :
CartSummary (sélection pack) 
  → PaymentMethods (appel edge function)
    → create-payment-intent (RPC get_emergency_beneficiary → stocke emergency_beneficiary_id)
      → retourne emergency_beneficiary au frontend
  → confirm-payment (webhook → crée 2 donations séparées)
  → OrderConfirmation (affiche les 2 bénéficiaires)
```

### Fonction SQL `get_emergency_beneficiary`

```sql
CREATE FUNCTION get_emergency_beneficiary(p_exclude_id uuid, p_pack_type text)
RETURNS TABLE(id uuid, alias_first_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.alias_first_name
  FROM beneficiaries b
  WHERE b.is_active = true
    AND b.id <> p_exclude_id
    AND (
      p_pack_type <> 'bebe' 
      OR b.children_count > 0 
      OR b.beneficiary_category IN ('famille_enfants', 'jeune_enfant')
    )
  ORDER BY b.rotation_score DESC NULLS LAST
  LIMIT 1;
END;
$$;
```

## Ce qui ne change PAS

- Interface utilisateur du funnel (aucun nouveau composant)
- Système de matching existant (`get_empathy_beneficiaries`, `get_ranked_beneficiaries`)
- Suivi de colis (même pipeline pour les 2 donations)
- Calcul fiscal (montant total inchangé, une seule attestation)

