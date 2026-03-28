/**
 * IP-based geolocation for anonymous donors.
 * Uses ip-api.com (free, 45 req/min) to get region-level location.
 * Results are cached in sessionStorage.
 */

const CACHE_KEY = "donor_geo_location";

/** Mapping ip-api.com regionName → INSEE region_code */
const REGION_NAME_TO_CODE: Record<string, string> = {
  "Île-de-France": "11",
  "Centre-Val de Loire": "24",
  "Bourgogne-Franche-Comté": "27",
  "Normandie": "28",
  "Hauts-de-France": "32",
  "Grand Est": "44",
  "Pays de la Loire": "52",
  "Bretagne": "53",
  "Nouvelle-Aquitaine": "75",
  "Occitanie": "76",
  "Auvergne-Rhône-Alpes": "84",
  "Provence-Alpes-Côte d'Azur": "93",
  "Corse": "94",
  // Outre-mer
  "Guadeloupe": "01",
  "Martinique": "02",
  "Guyane": "03",
  "La Réunion": "04",
  "Mayotte": "06",
};

export interface DonorLocation {
  postal_prefix: string;
  department_code: string;
  region_code: string;
  country_code: string;
}

export async function getDonorLocationFromIP(): Promise<DonorLocation | null> {
  // Check cache first
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed === "none") return null;
      return parsed as DonorLocation;
    }
  } catch {
    // sessionStorage unavailable
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      "http://ip-api.com/json/?fields=regionName,countryCode",
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      cacheResult("none");
      return null;
    }

    const data = await res.json();
    const regionCode = REGION_NAME_TO_CODE[data.regionName] || "";
    const countryCode = data.countryCode || "";

    if (!regionCode && countryCode !== "FR") {
      // Not in France and no region match — still pass country
      if (countryCode) {
        const loc: DonorLocation = {
          postal_prefix: "",
          department_code: "",
          region_code: "",
          country_code: countryCode,
        };
        cacheResult(loc);
        return loc;
      }
      cacheResult("none");
      return null;
    }

    const loc: DonorLocation = {
      postal_prefix: "",
      department_code: "",
      region_code: regionCode,
      country_code: countryCode || "FR",
    };
    cacheResult(loc);
    return loc;
  } catch {
    cacheResult("none");
    return null;
  }
}

function cacheResult(value: DonorLocation | "none") {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}
