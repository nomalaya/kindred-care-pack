// Frontend mirror of the avatar trait vocabularies (read-only, for admin UI).
// The authoritative inference engine lives in supabase/functions/_shared/avatarTraits.ts
// and runs server-side. This file just exposes the vocabularies so the admin
// can display/edit visual attributes.

export const AVATAR_VOCAB = {
  gender: ["woman", "man", "person"],
  age_range: ["18-25", "25-35", "35-45", "45-55", "55-65", "65-75", "75-85"],
  skin_tone: ["fair", "light", "medium", "olive", "tan", "medium_dark", "dark", "deep"],
  hair_type: ["straight", "wavy", "curly", "coily"],
  hair_color: ["black", "dark_brown", "light_brown", "blonde", "red", "auburn", "gray", "white"],
  hair_length: ["very_short", "short", "shoulder", "medium", "long"],
  hair_volume: ["fine", "natural", "light", "thick"],
  hair_style: [
    "clean_cut", "tousled", "side_parted", "loose", "softly_tied",
    "half_up", "natural_waves", "bun", "braided_simple",
  ],
  face_shape: ["oval", "round", "square_soft", "heart", "long"],
  eye_shape: ["almond", "round", "soft", "narrow", "hooded", "tired", "deep_set"],
  eye_color: ["brown", "dark_brown", "hazel", "green", "blue", "gray"],
  facial_features: [
    "subtle_age_lines", "gentle_wrinkles", "light_freckles",
    "soft_dimples", "expressive_brows",
  ],
  clothing_style: [
    "casual_modest", "simple_layered", "practical_warm",
    "classic_simple", "soft_cardigan", "modest_warm",
  ],
  clothing_color_palette: [
    "warm_earth", "muted_neutral", "soft_jewel", "sand_ivory", "dusty_blue",
  ],
  expression: [
    "gentle_smile", "hopeful", "calm", "discreet_smile",
    "tired_but_warm", "resilient", "serious_soft",
    "thoughtful", "pensive", "reserved",
  ],
  posture: [
    "upright_calm", "leaning_slightly", "relaxed",
    "protective", "seated_dignified",
  ],
  parent_energy: [
    "none", "protective_parent", "practical_parent", "tired_but_warm_parent",
  ],
  cultural_style: [
    "neutral_european", "soft_modern",
    "subtle_mediterranean", "subtle_west_african", "subtle_central_african",
  ],
  // New Avatar Studio enums
  beard: ["none", "light", "full", "grey"],
  moustache: ["none", "light", "full"],
  hair_recession: ["none", "light", "moderate", "strong"],
  head_covering: ["none", "optional", "required"],
  workflow_status: ["draft", "generated", "approved", "locked"],
} as const;

export type AvatarStatus = "pending" | "preview" | "validated" | "failed";

export const STATUS_LABEL: Record<AvatarStatus, string> = {
  pending: "En attente",
  preview: "Aperçu",
  validated: "Validé",
  failed: "Échec QA",
};

export const STATUS_COLOR: Record<AvatarStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  preview: "bg-amber-100 text-amber-800 border-amber-300",
  validated: "bg-emerald-100 text-emerald-800 border-emerald-300",
  failed: "bg-rose-100 text-rose-800 border-rose-300",
};

export type WorkflowStatus = "draft" | "generated" | "approved" | "locked";

export const WORKFLOW_LABEL: Record<WorkflowStatus, string> = {
  draft: "Brouillon",
  generated: "Généré",
  approved: "Approuvé",
  locked: "Verrouillé",
};

export const WORKFLOW_COLOR: Record<WorkflowStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  generated: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  locked: "bg-slate-200 text-slate-800 border-slate-400",
};
