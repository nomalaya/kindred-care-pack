// Dictionnaire pays/gentilés → groupe phénotypique → defaults visuels (H/F).
// Source : tableau classification_phenotypes_humains (Hommes + Femmes).
// Valeurs alignées sur AVATAR_VOCAB (src/lib/avatarTraits.ts).
// Utilisé en weak-default par inferStudioDefaultsWithReasons : n'écrase jamais
// une valeur déjà saisie manuellement ni un signal explicite (yeux marrons, hijab…).

export type GroupKey =
  | "north_european"
  | "mediterranean"
  | "mena"
  | "sub_saharan_africa"
  | "east_asian"
  | "south_asian";

export interface PhenotypeDefaults {
  avatar_skin_tone?: string;
  avatar_eye_shape?: string;
  avatar_eye_color?: string;
  avatar_hair_type?: string;
  avatar_hair_color?: string;
  avatar_hair_length?: string;
  avatar_hair_style?: string;
  avatar_face_shape?: string;
  avatar_nose?: string;
  avatar_head_covering?: string;
  avatar_beard?: string;
  avatar_moustache?: string;
  culture_tags?: string[];
}

export const PHENOTYPE_DEFAULTS: Record<
  GroupKey,
  { male: PhenotypeDefaults; female: PhenotypeDefaults }
> = {
  north_european: {
    male: {
      avatar_skin_tone: "fair",
      avatar_eye_shape: "round",
      avatar_eye_color: "blue",
      avatar_hair_type: "straight",
      avatar_hair_color: "blonde",
      avatar_face_shape: "oval",
      avatar_head_covering: "none",
      avatar_beard: "light",
      avatar_moustache: "none",
      culture_tags: ["europe_nord"],
    },
    female: {
      avatar_skin_tone: "fair",
      avatar_eye_shape: "round",
      avatar_eye_color: "blue",
      avatar_hair_type: "straight",
      avatar_hair_color: "blonde",
      avatar_hair_length: "long",
      avatar_face_shape: "oval",
      avatar_head_covering: "none",
      culture_tags: ["europe_nord"],
    },
  },
  mediterranean: {
    male: {
      avatar_skin_tone: "olive",
      avatar_eye_shape: "almond",
      avatar_eye_color: "brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "dark_brown",
      avatar_face_shape: "oval",
      avatar_head_covering: "none",
      avatar_beard: "full",
      avatar_moustache: "none",
      culture_tags: ["mediterranee"],
    },
    female: {
      avatar_skin_tone: "olive",
      avatar_eye_shape: "almond",
      avatar_eye_color: "brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "dark_brown",
      avatar_hair_length: "long",
      avatar_face_shape: "oval",
      avatar_head_covering: "none",
      culture_tags: ["mediterranee"],
    },
  },
  mena: {
    male: {
      avatar_skin_tone: "olive",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "black",
      avatar_face_shape: "long",
      avatar_head_covering: "optional",
      avatar_beard: "full",
      avatar_moustache: "full",
      culture_tags: ["maghreb"],
    },
    female: {
      avatar_skin_tone: "olive",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "black",
      avatar_hair_length: "long",
      avatar_face_shape: "oval",
      avatar_head_covering: "optional",
      culture_tags: ["maghreb"],
    },
  },
  sub_saharan_africa: {
    male: {
      avatar_skin_tone: "deep",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "coily",
      avatar_hair_color: "black",
      avatar_face_shape: "oval",
      avatar_head_covering: "none",
      avatar_beard: "light",
      avatar_moustache: "none",
      culture_tags: ["afrique_subsaharienne"],
    },
    female: {
      avatar_skin_tone: "deep",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "coily",
      avatar_hair_color: "black",
      avatar_hair_length: "medium",
      avatar_face_shape: "oval",
      avatar_head_covering: "optional",
      culture_tags: ["afrique_subsaharienne"],
    },
  },
  east_asian: {
    male: {
      avatar_skin_tone: "light",
      avatar_eye_shape: "narrow",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "straight",
      avatar_hair_color: "black",
      avatar_face_shape: "square_soft",
      avatar_head_covering: "none",
      avatar_beard: "none",
      avatar_moustache: "none",
      culture_tags: ["est_asie"],
    },
    female: {
      avatar_skin_tone: "light",
      avatar_eye_shape: "narrow",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "straight",
      avatar_hair_color: "black",
      avatar_hair_length: "long",
      avatar_face_shape: "round",
      avatar_head_covering: "none",
      culture_tags: ["est_asie"],
    },
  },
  south_asian: {
    male: {
      avatar_skin_tone: "tan",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "black",
      avatar_face_shape: "oval",
      avatar_head_covering: "optional",
      avatar_beard: "full",
      avatar_moustache: "full",
      culture_tags: ["sud_asie"],
    },
    female: {
      avatar_skin_tone: "tan",
      avatar_eye_shape: "almond",
      avatar_eye_color: "dark_brown",
      avatar_hair_type: "wavy",
      avatar_hair_color: "black",
      avatar_hair_length: "long",
      avatar_face_shape: "oval",
      avatar_head_covering: "optional",
      culture_tags: ["sud_asie"],
    },
  },
};

// Pays + gentilés (FR), normalisés (minuscule, sans accents).
// Trié par longueur décroissante au runtime pour éviter qu'un mot court
// (« indien ») écrase un plus long.
const RAW_COUNTRY_TO_GROUP: Record<string, GroupKey> = {
  // Europe du Nord
  "norvege": "north_european", "norvegien": "north_european", "norvegienne": "north_european",
  "suede": "north_european", "suedois": "north_european", "suedoise": "north_european",
  "danemark": "north_european", "danois": "north_european", "danoise": "north_european",
  "finlande": "north_european", "finlandais": "north_european", "finlandaise": "north_european",
  "islande": "north_european", "islandais": "north_european", "islandaise": "north_european",
  "pays-bas": "north_european", "neerlandais": "north_european", "neerlandaise": "north_european", "hollandais": "north_european",
  "allemand du nord": "north_european", "scandinave": "north_european",

  // Méditerranée
  "espagne": "mediterranean", "espagnol": "mediterranean", "espagnole": "mediterranean",
  "italie": "mediterranean", "italien": "mediterranean", "italienne": "mediterranean",
  "grece": "mediterranean", "grec": "mediterranean", "grecque": "mediterranean",
  "portugal": "mediterranean", "portugais": "mediterranean", "portugaise": "mediterranean",
  "malte": "mediterranean", "maltais": "mediterranean", "maltaise": "mediterranean",
  "mediterraneen": "mediterranean", "mediterraneenne": "mediterranean",
  "sud de la france": "mediterranean", "sud-francais": "mediterranean",

  // MENA
  "maroc": "mena", "marocain": "mena", "marocaine": "mena",
  "algerie": "mena", "algerien": "mena", "algerienne": "mena",
  "tunisie": "mena", "tunisien": "mena", "tunisienne": "mena",
  "egypte": "mena", "egyptien": "mena", "egyptienne": "mena",
  "arabie saoudite": "mena", "saoudien": "mena", "saoudienne": "mena",
  "irak": "mena", "irakien": "mena", "irakienne": "mena",
  "syrie": "mena", "syrien": "mena", "syrienne": "mena",
  "jordanie": "mena", "jordanien": "mena", "jordanienne": "mena",
  "liban": "mena", "libanais": "mena", "libanaise": "mena",
  "iran": "mena", "iranien": "mena", "iranienne": "mena",
  "maghreb": "mena", "maghrebin": "mena", "maghrebine": "mena",
  "moyen-orient": "mena", "moyen orient": "mena", "moyen-oriental": "mena",
  "mena": "mena", "arabe": "mena",

  // Afrique subsaharienne
  "senegal": "sub_saharan_africa", "senegalais": "sub_saharan_africa", "senegalaise": "sub_saharan_africa",
  "nigeria": "sub_saharan_africa", "nigerian": "sub_saharan_africa", "nigeriane": "sub_saharan_africa",
  "ghana": "sub_saharan_africa", "ghaneen": "sub_saharan_africa", "ghaneenne": "sub_saharan_africa",
  "cameroun": "sub_saharan_africa", "camerounais": "sub_saharan_africa", "camerounaise": "sub_saharan_africa",
  "congo": "sub_saharan_africa", "congolais": "sub_saharan_africa", "congolaise": "sub_saharan_africa",
  "angola": "sub_saharan_africa", "angolais": "sub_saharan_africa", "angolaise": "sub_saharan_africa",
  "ethiopie": "sub_saharan_africa", "ethiopien": "sub_saharan_africa", "ethiopienne": "sub_saharan_africa",
  "kenya": "sub_saharan_africa", "kenyan": "sub_saharan_africa", "kenyane": "sub_saharan_africa",
  "afrique du sud": "sub_saharan_africa", "sud-africain": "sub_saharan_africa", "sud-africaine": "sub_saharan_africa",
  "subsaharien": "sub_saharan_africa", "subsaharienne": "sub_saharan_africa",
  "afrique subsaharienne": "sub_saharan_africa", "afrique noire": "sub_saharan_africa",
  "ouest-africain": "sub_saharan_africa", "afrique de l'ouest": "sub_saharan_africa",

  // Asie de l'Est
  "chine": "east_asian", "chinois": "east_asian", "chinoise": "east_asian",
  "japon": "east_asian", "japonais": "east_asian", "japonaise": "east_asian",
  "coree": "east_asian", "coreen": "east_asian", "coreenne": "east_asian",
  "mongolie": "east_asian", "mongol": "east_asian", "mongole": "east_asian",
  "taiwan": "east_asian", "taiwanais": "east_asian", "taiwanaise": "east_asian",
  "asiatique": "east_asian", "est-asiatique": "east_asian",

  // Asie du Sud
  "inde": "south_asian", "indien": "south_asian", "indienne": "south_asian",
  "pakistan": "south_asian", "pakistanais": "south_asian", "pakistanaise": "south_asian",
  "bangladesh": "south_asian", "bangladais": "south_asian", "bangladaise": "south_asian",
  "sri lanka": "south_asian", "sri-lankais": "south_asian", "sri-lankaise": "south_asian",
  "nepal": "south_asian", "nepalais": "south_asian", "nepalaise": "south_asian",
  "sud-asiatique": "south_asian",
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Pré-trié par longueur décroissante (longest-match d'abord).
const SORTED_COUNTRY_ENTRIES: Array<[string, GroupKey]> = Object.entries(
  RAW_COUNTRY_TO_GROUP,
).sort((a, b) => b[0].length - a[0].length);

export function detectCountryGroup(
  text: string | null | undefined,
): { group: GroupKey; matchedKeyword: string } | null {
  if (!text) return null;
  const t = ` ${normalize(text)} `;
  for (const [keyword, group] of SORTED_COUNTRY_ENTRIES) {
    // Bordures : non-alphanumérique avant et après pour éviter "indien" dans "indienne"… mais "indien" ET "indienne" sont tous deux dans le dict, et le tri longest-first prend "indienne" en premier.
    const re = new RegExp(`(^|[^a-z])${keyword.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")}([^a-z]|$)`);
    if (re.test(t)) return { group, matchedKeyword: keyword };
  }
  return null;
}
