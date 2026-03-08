import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// French first names by gender
const MALE_FIRST_NAMES = [
  "Jean", "Pierre", "Michel", "André", "Philippe", "René", "Louis", "Alain", "Jacques", "Bernard",
  "Marcel", "Daniel", "Roger", "Robert", "Paul", "Claude", "François", "Gérard", "Henri", "Nicolas",
  "Thomas", "Julien", "Sébastien", "David", "Christophe", "Stéphane", "Laurent", "Olivier", "Patrick",
  "Frédéric", "Éric", "Thierry", "Bruno", "Christian", "Pascal", "Didier", "Yves", "Emmanuel", "Vincent",
  "Antoine", "Maxime", "Alexandre", "Guillaume", "Mathieu", "Benjamin", "Romain", "Lucas", "Hugo",
  "Théo", "Nathan", "Léo", "Raphaël", "Arthur", "Étienne", "Gabriel", "Adrien", "Quentin", "Clément",
  "Valentin", "Alexis", "Florian", "Jérôme", "Fabien", "Cédric", "Yann", "Benoît", "Grégory", "Damien",
  "Xavier", "Marc", "Denis", "Serge", "Joël", "Gilles", "Maurice", "Dominique", "Raymond", "Georges",
  "Arnaud", "Sylvain", "Ludovic", "Kevin", "Franck", "Rémi", "Cyril", "Aurélien", "Fabrice", "Hervé",
  "Loïc", "Michaël", "Thibault", "Matthias", "Tanguy", "Gauthier", "Bastien", "Corentin", "Édouard", "Noé"
];

const FEMALE_FIRST_NAMES = [
  "Marie", "Jeanne", "Françoise", "Monique", "Catherine", "Nathalie", "Isabelle", "Sylvie", "Anne",
  "Martine", "Nicole", "Christine", "Dominique", "Valérie", "Brigitte", "Véronique", "Patricia", "Sandrine",
  "Sophie", "Céline", "Laurence", "Corinne", "Stéphanie", "Caroline", "Virginie", "Aurélie", "Julie",
  "Émilie", "Laura", "Marine", "Camille", "Léa", "Manon", "Chloé", "Sarah", "Emma", "Clara", "Inès",
  "Louise", "Alice", "Jade", "Lina", "Charlotte", "Amandine", "Mélanie", "Élodie", "Pauline", "Margaux",
  "Lucie", "Mathilde", "Anaïs", "Marion", "Justine", "Élise", "Delphine", "Laetitia", "Audrey", "Hélène",
  "Béatrice", "Florence", "Agnès", "Colette", "Madeleine", "Simone", "Thérèse", "Jacqueline", "Michèle",
  "Danielle", "Yvette", "Geneviève", "Odette", "Renée", "Suzanne", "Denise", "Lucienne", "Andrée",
  "Marguerite", "Germaine", "Josette", "Bernadette", "Christiane", "Liliane", "Josiane", "Claudine",
  "Annick", "Lydie", "Maryse", "Ghislaine", "Pascale", "Muriel", "Fabienne", "Roselyne", "Noémie",
  "Agathe", "Clémence", "Constance", "Victoire", "Capucine", "Apolline"
];

const LAST_NAMES = [
  "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent",
  "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard",
  "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent", "Muller", "Lefèvre", "Faure", "André",
  "Mercier", "Blanc", "Guérin", "Boyer", "Garnier", "Chevalier", "François", "Legrand", "Gauthier", "Garcia",
  "Perrin", "Robin", "Clément", "Morin", "Nicolas", "Henry", "Roussel", "Mathieu", "Gautier", "Masson",
  "Marchand", "Duval", "Denis", "Dumont", "Marie", "Lemaire", "Noël", "Meyer", "Dufour", "Meunier",
  "Brun", "Blanchard", "Giraud", "Joly", "Rivière", "Lucas", "Brunet", "Gaillard", "Barbier", "Arnaud",
  "Martinez", "Gérard", "Roche", "Renard", "Schmitt", "Roy", "Leroux", "Colin", "Vidal", "Caron",
  "Picard", "Roger", "Fabre", "Aubert", "Lemoine", "Renaud", "Dumas", "Lacroix", "Olivier", "Philippe",
  "Bourgeois", "Pierre", "Benoît", "Rey", "Leclerc", "Payet", "Rolland", "Leclercq", "Guillaume", "Lecomte"
];

const EMAIL_DOMAINS = [
  "gmail.com", "outlook.fr", "yahoo.fr", "hotmail.fr", "orange.fr", "free.fr", "sfr.fr",
  "laposte.net", "wanadoo.fr", "live.fr", "icloud.com", "protonmail.com", "bbox.fr"
];

// French regions with departments and postal prefixes
const REGIONS = [
  { code: "IDF", name: "Île-de-France", departments: [
    { code: "75", prefix: "75" }, { code: "77", prefix: "77" }, { code: "78", prefix: "78" },
    { code: "91", prefix: "91" }, { code: "92", prefix: "92" }, { code: "93", prefix: "93" },
    { code: "94", prefix: "94" }, { code: "95", prefix: "95" }
  ]},
  { code: "ARA", name: "Auvergne-Rhône-Alpes", departments: [
    { code: "01", prefix: "01" }, { code: "03", prefix: "03" }, { code: "07", prefix: "07" },
    { code: "15", prefix: "15" }, { code: "26", prefix: "26" }, { code: "38", prefix: "38" },
    { code: "42", prefix: "42" }, { code: "43", prefix: "43" }, { code: "63", prefix: "63" },
    { code: "69", prefix: "69" }, { code: "73", prefix: "73" }, { code: "74", prefix: "74" }
  ]},
  { code: "NAQ", name: "Nouvelle-Aquitaine", departments: [
    { code: "16", prefix: "16" }, { code: "17", prefix: "17" }, { code: "19", prefix: "19" },
    { code: "23", prefix: "23" }, { code: "24", prefix: "24" }, { code: "33", prefix: "33" },
    { code: "40", prefix: "40" }, { code: "47", prefix: "47" }, { code: "64", prefix: "64" },
    { code: "79", prefix: "79" }, { code: "86", prefix: "86" }, { code: "87", prefix: "87" }
  ]},
  { code: "OCC", name: "Occitanie", departments: [
    { code: "09", prefix: "09" }, { code: "11", prefix: "11" }, { code: "12", prefix: "12" },
    { code: "30", prefix: "30" }, { code: "31", prefix: "31" }, { code: "32", prefix: "32" },
    { code: "34", prefix: "34" }, { code: "46", prefix: "46" }, { code: "48", prefix: "48" },
    { code: "65", prefix: "65" }, { code: "66", prefix: "66" }, { code: "81", prefix: "81" }, { code: "82", prefix: "82" }
  ]},
  { code: "HDF", name: "Hauts-de-France", departments: [
    { code: "02", prefix: "02" }, { code: "59", prefix: "59" }, { code: "60", prefix: "60" },
    { code: "62", prefix: "62" }, { code: "80", prefix: "80" }
  ]},
  { code: "PAC", name: "Provence-Alpes-Côte d'Azur", departments: [
    { code: "04", prefix: "04" }, { code: "05", prefix: "05" }, { code: "06", prefix: "06" },
    { code: "13", prefix: "13" }, { code: "83", prefix: "83" }, { code: "84", prefix: "84" }
  ]},
  { code: "GES", name: "Grand Est", departments: [
    { code: "08", prefix: "08" }, { code: "10", prefix: "10" }, { code: "51", prefix: "51" },
    { code: "52", prefix: "52" }, { code: "54", prefix: "54" }, { code: "55", prefix: "55" },
    { code: "57", prefix: "57" }, { code: "67", prefix: "67" }, { code: "68", prefix: "68" },
    { code: "88", prefix: "88" }
  ]},
  { code: "PDL", name: "Pays de la Loire", departments: [
    { code: "44", prefix: "44" }, { code: "49", prefix: "49" }, { code: "53", prefix: "53" },
    { code: "72", prefix: "72" }, { code: "85", prefix: "85" }
  ]},
  { code: "BRE", name: "Bretagne", departments: [
    { code: "22", prefix: "22" }, { code: "29", prefix: "29" }, { code: "35", prefix: "35" }, { code: "56", prefix: "56" }
  ]},
  { code: "NOR", name: "Normandie", departments: [
    { code: "14", prefix: "14" }, { code: "27", prefix: "27" }, { code: "50", prefix: "50" },
    { code: "61", prefix: "61" }, { code: "76", prefix: "76" }
  ]},
  { code: "BFC", name: "Bourgogne-Franche-Comté", departments: [
    { code: "21", prefix: "21" }, { code: "25", prefix: "25" }, { code: "39", prefix: "39" },
    { code: "58", prefix: "58" }, { code: "70", prefix: "70" }, { code: "71", prefix: "71" },
    { code: "89", prefix: "89" }, { code: "90", prefix: "90" }
  ]},
  { code: "CVL", name: "Centre-Val de Loire", departments: [
    { code: "18", prefix: "18" }, { code: "28", prefix: "28" }, { code: "36", prefix: "36" },
    { code: "37", prefix: "37" }, { code: "41", prefix: "41" }, { code: "45", prefix: "45" }
  ]},
  { code: "COR", name: "Corse", departments: [
    { code: "2A", prefix: "20" }, { code: "2B", prefix: "20" }
  ]}
];

// Weighted region distribution (matching French population)
const REGION_WEIGHTS = [
  { code: "IDF", weight: 0.19 }, { code: "ARA", weight: 0.12 }, { code: "NAQ", weight: 0.09 },
  { code: "OCC", weight: 0.09 }, { code: "HDF", weight: 0.09 }, { code: "PAC", weight: 0.08 },
  { code: "GES", weight: 0.08 }, { code: "PDL", weight: 0.06 }, { code: "BRE", weight: 0.05 },
  { code: "NOR", weight: 0.05 }, { code: "BFC", weight: 0.04 }, { code: "CVL", weight: 0.04 },
  { code: "COR", weight: 0.02 }
];

const CAUSES = [
  "Précarité alimentaire", "Aide aux sans-abri", "Soutien aux familles monoparentales",
  "Aide aux réfugiés", "Protection de l'enfance", "Aide aux personnes âgées"
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickWeighted(): typeof REGIONS[0] {
  const r = Math.random();
  let cumulative = 0;
  for (const rw of REGION_WEIGHTS) {
    cumulative += rw.weight;
    if (r <= cumulative) {
      return REGIONS.find(reg => reg.code === rw.code)!;
    }
  }
  return REGIONS[0];
}

function normalize(str: string): string {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

interface PersonaConfig {
  type: string;
  ageMin: number;
  ageMax: number;
  femaleRatio: number;
  cspOptions: string[];
  donationFrequency: string[];
  avgAmountMin: number;
  avgAmountMax: number;
  taxSensitive: [number, number]; // [trueWeight, falseWeight]
  socialMediaActive: [number, number];
  motivations: string[][];
  causeCount: [number, number];
}

const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    type: "emotional_responsible",
    ageMin: 30, ageMax: 55,
    femaleRatio: 0.52,
    cspOptions: ["CSP+", "CSP+", "CSP+", "CSP"],
    donationFrequency: ["1_per_year", "2_per_year", "3_per_year", "2_per_year"],
    avgAmountMin: 45, avgAmountMax: 80,
    taxSensitive: [85, 15],
    socialMediaActive: [40, 60],
    motivations: [
      ["impact_concret", "connexion_humaine", "transparence"],
      ["impact_concret", "deduction_fiscale", "connexion_humaine"],
      ["connexion_humaine", "transparence", "impact_concret"],
      ["deduction_fiscale", "impact_concret", "transparence"]
    ],
    causeCount: [2, 3]
  },
  {
    type: "empathic_occasional",
    ageMin: 25, ageMax: 45,
    femaleRatio: 0.72,
    cspOptions: ["CSP", "CSP", "CSP+", "CSP-", "student"],
    donationFrequency: ["impulse", "impulse", "1_per_year", "impulse"],
    avgAmountMin: 20, avgAmountMax: 50,
    taxSensitive: [25, 75],
    socialMediaActive: [90, 10],
    motivations: [
      ["storytelling", "identification", "impact_immediat"],
      ["identification", "storytelling", "connexion_humaine"],
      ["impact_immediat", "storytelling", "identification"],
      ["storytelling", "impact_immediat", "connexion_humaine"]
    ],
    causeCount: [1, 2]
  },
  {
    type: "fiscal_optimizer",
    ageMin: 40, ageMax: 65,
    femaleRatio: 0.38,
    cspOptions: ["CSP+", "CSP+", "CSP+", "CSP+"],
    donationFrequency: ["end_of_year", "end_of_year", "quarterly", "end_of_year"],
    avgAmountMin: 80, avgAmountMax: 150,
    taxSensitive: [95, 5],
    socialMediaActive: [15, 85],
    motivations: [
      ["optimisation_fiscale", "transparence", "impact_concret"],
      ["deduction_fiscale", "optimisation_fiscale", "transparence"],
      ["transparence", "optimisation_fiscale", "deduction_fiscale"],
      ["optimisation_fiscale", "don_intelligent", "transparence"]
    ],
    causeCount: [1, 3]
  }
];

function generateProfile(config: PersonaConfig, index: number) {
  const isFemale = Math.random() < config.femaleRatio;
  const gender = isFemale ? "F" : "M";
  const firstName = isFemale ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const age = randInt(config.ageMin, config.ageMax);
  
  const region = pickWeighted();
  const dept = pick(region.departments);
  
  const emailFirst = normalize(firstName);
  const emailLast = normalize(lastName);
  const emailDomain = pick(EMAIL_DOMAINS);
  const emailSuffix = randInt(1, 999);
  const email = `${emailFirst}.${emailLast}${emailSuffix}@${emailDomain}`;
  
  const displayName = `${firstName} ${lastName.charAt(0)}.`;
  
  const taxSensitive = Math.random() * 100 < config.taxSensitive[0];
  const socialActive = Math.random() * 100 < config.socialMediaActive[0];
  const avgAmount = randFloat(config.avgAmountMin, config.avgAmountMax);
  const donationFreq = pick(config.donationFrequency);
  const csp = pick(config.cspOptions);
  const motivations = pick(config.motivations);
  
  const numCauses = randInt(config.causeCount[0], config.causeCount[1]);
  const shuffledCauses = [...CAUSES].sort(() => Math.random() - 0.5);
  const preferredCauses = shuffledCauses.slice(0, numCauses);

  return {
    email,
    password: "Cash4Cause2024!",
    displayName,
    metadata: {
      display_name: displayName,
      first_name: firstName,
      last_name: lastName
    },
    profileUpdate: {
      persona_type: config.type,
      age,
      gender,
      donation_frequency: donationFreq,
      avg_donation_amount: avgAmount,
      tax_deduction_sensitive: taxSensitive,
      social_media_active: socialActive,
      csp_category: csp,
      motivation_tags: motivations,
      preferred_causes: preferredCauses,
      country_code: "FR",
      region_code: region.code,
      department_code: dept.code,
      postal_prefix: dept.prefix,
      location_visibility: Math.random() < 0.3
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { batch = 0, batchSize = 50 } = await req.json().catch(() => ({}));
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Distribution: 1000 P1, 600 P2, 400 P3 = 2000 total
    const distribution = [
      { config: PERSONA_CONFIGS[0], count: 1000 },
      { config: PERSONA_CONFIGS[1], count: 600 },
      { config: PERSONA_CONFIGS[2], count: 400 },
    ];

    // Flatten all profiles
    const allProfiles: ReturnType<typeof generateProfile>[] = [];
    for (const { config, count } of distribution) {
      for (let i = 0; i < count; i++) {
        allProfiles.push(generateProfile(config, i));
      }
    }

    // Shuffle to mix personas
    allProfiles.sort(() => Math.random() - 0.5);

    // Process requested batch
    const start = batch * batchSize;
    const end = Math.min(start + batchSize, allProfiles.length);
    const batchProfiles = allProfiles.slice(start, end);

    if (batchProfiles.length === 0) {
      return new Response(
        JSON.stringify({ done: true, total: allProfiles.length, message: "All batches processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let created = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (const profile of batchProfiles) {
      try {
        // Create auth user
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: profile.email,
          password: profile.password,
          email_confirm: true,
          user_metadata: profile.metadata,
        });

        if (createError) {
          // Duplicate email - add random suffix and retry
          if (createError.message.includes("already")) {
            const retryEmail = profile.email.replace("@", `${randInt(1000, 9999)}@`);
            const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.createUser({
              email: retryEmail,
              password: profile.password,
              email_confirm: true,
              user_metadata: profile.metadata,
            });
            if (retryError) {
              errors++;
              errorMessages.push(retryError.message);
              continue;
            }
            if (retryData.user) {
              // Update profile with persona data
              const { error: updateError } = await supabaseAdmin
                .from("profiles")
                .update(profile.profileUpdate)
                .eq("user_id", retryData.user.id);
              if (updateError) errorMessages.push(`Profile update: ${updateError.message}`);
              created++;
            }
          } else {
            errors++;
            errorMessages.push(createError.message);
          }
          continue;
        }

        if (userData.user) {
          // Update profile with persona data
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update(profile.profileUpdate)
            .eq("user_id", userData.user.id);
          if (updateError) errorMessages.push(`Profile update: ${updateError.message}`);
          created++;
        }
      } catch (e) {
        errors++;
        errorMessages.push(e.message);
      }
    }

    return new Response(
      JSON.stringify({
        batch,
        created,
        errors,
        errorMessages: errorMessages.slice(0, 10),
        totalBatches: Math.ceil(allProfiles.length / batchSize),
        nextBatch: end < allProfiles.length ? batch + 1 : null,
        done: end >= allProfiles.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
