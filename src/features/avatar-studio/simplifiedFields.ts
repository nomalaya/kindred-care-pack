// Simplified Avatar Studio controls — pure helpers, no IA, no DB writes.
// Maps a small set of user-facing values to the underlying base avatar_* fields.

// -----------------------------------------------------------------------------
// 1. Fatigue visible
// -----------------------------------------------------------------------------
export type FatigueVisible = "none" | "light" | "moderate" | "marked";

export const FATIGUE_VISIBLE_OPTIONS: readonly FatigueVisible[] = [
  "none",
  "light",
  "moderate",
  "marked",
] as const;

export const FATIGUE_VISIBLE_LABELS: Record<FatigueVisible, string> = {
  none: "Aucune",
  light: "Légère",
  moderate: "Modérée",
  marked: "Marquée",
};

const FATIGUE_TO_LEVELS: Record<FatigueVisible, { tired: number; fatigue: number }> = {
  none: { tired: 0, fatigue: 0 },
  light: { tired: 1, fatigue: 1 },
  moderate: { tired: 3, fatigue: 3 },
  marked: { tired: 5, fatigue: 5 },
};

export function fatigueVisibleToPatch(v: FatigueVisible) {
  const { tired, fatigue } = FATIGUE_TO_LEVELS[v];
  return { avatar_tired_level: tired, avatar_fatigue_level: fatigue };
}

export function readFatigueVisible(row: {
  avatar_tired_level?: number | null;
  avatar_fatigue_level?: number | null;
}): FatigueVisible {
  const max = Math.max(row.avatar_tired_level ?? 0, row.avatar_fatigue_level ?? 0);
  if (max <= 0) return "none";
  if (max <= 2) return "light";
  if (max <= 4) return "moderate";
  return "marked";
}

// -----------------------------------------------------------------------------
// 2. Tonalité émotionnelle (exactly 4 values)
// -----------------------------------------------------------------------------
export type EmotionalTone = "reserved" | "warm" | "tired" | "worried";

export const EMOTIONAL_TONE_OPTIONS: readonly EmotionalTone[] = [
  "reserved",
  "warm",
  "tired",
  "worried",
] as const;

export const EMOTIONAL_TONE_LABELS: Record<EmotionalTone, string> = {
  reserved: "Réservée",
  warm: "Chaleureuse",
  tired: "Fatiguée",
  worried: "Inquiète",
};

// Uses ONLY existing avatar_expression enum values from AVATAR_VOCAB.expression.
const TONE_TO_FIELDS: Record<
  EmotionalTone,
  { expression: string; brightness: number; resilience: number }
> = {
  reserved: { expression: "reserved", brightness: 2, resilience: 3 },
  warm: { expression: "gentle_smile", brightness: 5, resilience: 3 },
  tired: { expression: "tired_but_warm", brightness: 2, resilience: 3 },
  worried: { expression: "pensive", brightness: 2, resilience: 3 },
};

export function emotionalToneToPatch(t: EmotionalTone) {
  const m = TONE_TO_FIELDS[t];
  return {
    avatar_expression: m.expression,
    avatar_emotional_brightness: m.brightness,
    avatar_resilience_level: m.resilience,
  };
}

// Reverse mapping: pick the closest tone from existing avatar_expression.
// Other expression values map to the nearest tone without writing to DB.
const EXPRESSION_TO_TONE: Record<string, EmotionalTone> = {
  reserved: "reserved",
  calm: "reserved",
  serious_soft: "reserved",
  thoughtful: "reserved",
  resilient: "reserved",
  gentle_smile: "warm",
  discreet_smile: "warm",
  hopeful: "warm",
  tired_but_warm: "tired",
  pensive: "worried",
};

export function readEmotionalTone(row: {
  avatar_expression?: string | null;
}): EmotionalTone {
  const e = row.avatar_expression ?? "";
  return EXPRESSION_TO_TONE[e] ?? "reserved";
}
