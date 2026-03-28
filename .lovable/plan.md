

# Proximité automatique via IP Geolocation

## Problème
Actuellement, le badge "Proche de chez vous" ne s'affiche que pour les donateurs connectés avec un profil géographique rempli. Les visiteurs anonymes (majorité du trafic) ne voient jamais ce badge.

## Solution
Appeler un service gratuit d'IP geolocation (ip-api.com) pour obtenir automatiquement le département/région du visiteur, puis passer ces données au RPC `get_empathy_beneficiaries` qui calcule déjà le `proximity_score`.

## Logique de priorité
1. **Donateur connecté avec profil** → utiliser `profiles.postal_prefix / department_code / region_code`
2. **Donateur anonyme** → appeler `http://ip-api.com/json/?fields=regionName,countryCode` puis mapper la région française vers un `region_code`
3. **Échec IP / VPN / hors France** → pas de `p_donor_location`, pas de badge proximité (badges contextuels normaux)

## Mapping région → code
ip-api.com retourne `regionName` (ex: "Île-de-France", "Auvergne-Rhône-Alpes"). Un dictionnaire statique mappe les 18 régions françaises vers leur code INSEE (ex: "IDF" → "11", "ARA" → "84"). Le `country_code` est directement le code ISO retourné.

## Fichiers modifiés

### 1. `src/lib/geoLocation.ts` (nouveau)
- Fonction `getDonorLocationFromIP()` → appelle ip-api.com, retourne `{ postal_prefix, department_code, region_code, country_code }` ou `null`
- Dictionnaire `REGION_NAME_TO_CODE` pour les 18 régions françaises
- Cache en `sessionStorage` pour ne pas re-appeler à chaque navigation
- Timeout de 3s pour ne pas bloquer le chargement

### 2. `src/pages/BeneficiarySelection.tsx`
- Si pas de `donorLocation` depuis le profil → appeler `getDonorLocationFromIP()`
- Passer le résultat dans `p_donor_location` comme c'est déjà fait pour les connectés
- Aucune modification du RPC (contrainte respectée)

## Seuils de proximité (déjà en place dans le RPC)
| Score | Label | Condition |
|-------|-------|-----------|
| 100 | Proche de chez vous | Même préfixe postal |
| 90 | Dans votre département | Même département |
| 70 | Dans votre région | Même région |
| 40 | Dans votre pays | Même pays |

Pour l'IP geolocation, seuls `region_code` et `country_code` seront renseignés (pas de précision au département via IP). Le badge le plus probable sera donc **"Dans votre région"** ou **"Dans votre pays"**.

## Limites connues
- ip-api.com : 45 req/min (gratuit, suffisant pour le trafic actuel)
- Précision : niveau région uniquement (pas département ni ville)
- VPN/proxy : peut retourner une mauvaise localisation → le badge sera simplement absent ou inexact, sans conséquence grave

