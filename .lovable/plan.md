

## Analyse de l'existant

En examinant le code, je constate qu'un système de proximité basique existe déjà :
- **BeneficiarySelection.tsx** : Badge "Proche de chez vous" quand `b.region === donorRegion`
- **Table profiles** : Colonnes `country_code`, `region_code`, `department_code`, `postal_prefix` déjà présentes
- **Table beneficiaries** : Seulement `region` (text) et `address` (text)

La logique actuelle simule la région du donateur via localStorage et compare avec le champ texte `region` des bénéficiaires.

## Plan d'implémentation

### ÉTAPE 1 : Ajouter colonnes géographiques à beneficiaries

**Migration SQL** :
```sql
ALTER TABLE public.beneficiaries 
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS region_code TEXT,
ADD COLUMN IF NOT EXISTS department_code TEXT,
ADD COLUMN IF NOT EXISTS postal_prefix TEXT,
ADD COLUMN IF NOT EXISTS location_visibility TEXT DEFAULT 'region';
```

### ÉTAPE 2 : Peupler automatiquement les données géographiques

**Edge Function** : `supabase/functions/populate-beneficiary-locations/index.ts`
- Parser les adresses existantes avec regex pour extraire codes postaux français
- Mapper codes postaux → département → région → pays selon référentiel INSEE
- Mettre à jour les colonnes géographiques massivement

**Logique de mapping** :
- Code postal 75001-20 → Paris (75) → Île-de-France → FR
- Code postal 69001-9 → Rhône (69) → Auvergne-Rhône-Alpes → FR
- etc.

### ÉTAPE 3 : Améliorer la détection donateur

**Fichier** : `src/hooks/useGeolocation.tsx`
```typescript
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  
  // 1. Géolocalisation IP (via service externe)
  // 2. Fallback navigateur (avec permission)
  // 3. Fallback localStorage actuel
  // 4. Fallback pays par défaut (FR)
};
```

**Integration avec profiles** :
- Sauvegarder la localisation détectée dans `profiles` du donateur connecté
- Utiliser cette donnée pour le matching de proximité

### ÉTAPE 4 : Calculer score de proximité

**Fichier** : `src/lib/proximityEngine.ts`
```typescript
export const calculateProximityScore = (
  donorLocation: LocationData,
  beneficiary: BeneficiaryData
) => {
  if (donorLocation.postal_prefix === beneficiary.postal_prefix) return 100;
  if (donorLocation.department_code === beneficiary.department_code) return 90;
  if (donorLocation.region_code === beneficiary.region_code) return 70;
  if (donorLocation.country_code === beneficiary.country_code) return 40;
  return 10;
};

export const getProximityLabel = (score: number) => {
  if (score >= 100) return "Proche de chez vous";
  if (score >= 90) return "Dans votre département";  
  if (score >= 70) return "Dans votre région";
  if (score >= 40) return "Dans votre pays";
  return null;
};
```

### ÉTAPE 5 : Mettre à jour la fonction RPC

**Modification** : `get_empathy_beneficiaries`
- Ajouter paramètre `p_donor_location` optionnel  
- Inclure calcul de proximité dans la sélection
- Garantir au moins 1 profil avec score élevé quand possible
- Retourner `proximity_score` et `proximity_label` dans les résultats

### ÉTAPE 6 : Mettre à jour l'UI

**BeneficiarySelection.tsx** :
- Remplacer la logique actuelle `donorRegion === b.region` 
- Utiliser le nouveau `proximity_score` de la RPC
- Afficher badge avec `proximity_label` retourné
- Conserver l'icône Navigation et les styles existants

**Badge amélioré** :
```jsx
{proximity_label && (
  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
    <Navigation className="h-3 w-3 mr-1" />
    {proximity_label}
  </Badge>
)}
```

### ÉTAPE 7 : Respecter la vie privée

**Sécurité** :
- Les colonnes géographiques détaillées restent dans la table `beneficiaries` (accès admin uniquement)
- La vue `beneficiaries_public` ne doit PAS exposer ces colonnes
- Seuls `proximity_score` et `proximity_label` calculés sont retournés au frontend
- Aucune donnée géographique brute n'est jamais envoyée au client

## Fichiers à modifier

1. **Migration** : Nouvelles colonnes beneficiaries
2. **Edge Function** : Population automatique des données géographiques  
3. **Hook** : `src/hooks/useGeolocation.tsx` (nouveau)
4. **Library** : `src/lib/proximityEngine.ts` (nouveau)
5. **RPC Function** : Modification `get_empathy_beneficiaries`
6. **Component** : Mise à jour `BeneficiarySelection.tsx`

## Résultat attendu

- Badge "Proche de chez vous" basé sur vraies données géographiques
- Détection automatique de la localisation donateur (IP + navigateur)
- Algorithme intelligent privilégiant la proximité dans la sélection des 4 profils
- Préservation totale de la vie privée (aucune adresse exposée)
- Interface identique avec badges de proximité plus précis

