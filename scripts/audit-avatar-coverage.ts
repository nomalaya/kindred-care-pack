// Zero-credit static audit of Avatar Studio attribute coverage.
// Run: deno run -A scripts/audit-avatar-coverage.ts
// No AI calls, no DB, no network. Pure static analysis + prompt dry-run.

import {
  AvatarTraits,
  TraitDiff,
  STRUCTURAL_TRAIT_KEYS,
  MEDIUM_TRAIT_KEYS,
  SOFT_TRAIT_KEYS,
  TRANSFORMATIVE_TRAIT_KEYS,
  classifyDiff,
  buildTraitDiffFromKeys,
  inferAvatarTraits,
} from "../supabase/functions/_shared/avatarTraits.ts";
import {
  buildAvatarPrompt,
  buildEditPrompt,
} from "../supabase/functions/_shared/avatarArtDirection.ts";

// ---------- Vocab (mirror of src/lib/avatarTraits.ts) ----------
const AVATAR_VOCAB: Record<string, readonly string[]> = {
  gender: ["woman", "man", "person"],
  age_range: ["18-25", "25-35", "35-45", "45-55", "55-65", "65-75", "75-85"],
  skin_tone: ["fair", "light", "medium", "olive", "tan", "medium_dark", "dark", "deep"],
  hair_type: ["straight", "wavy", "curly", "coily"],
  hair_color: ["black", "dark_brown", "brown", "light_brown", "blonde", "red", "auburn", "gray", "white"],
  hair_length: ["very_short", "short", "shoulder", "medium", "long"],
  hair_volume: ["fine", "natural", "light", "thick"],
  hair_style: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "natural_waves", "bun", "braided_simple", "cornrows", "box_braids", "braided_updo"],
  nose: ["straight", "aquiline", "rounded", "wide", "narrow", "flat_bridge", "upturned"],
  face_shape: ["oval", "round", "square_soft", "heart", "long"],
  eye_shape: ["almond", "round", "soft", "narrow", "hooded", "tired", "deep_set"],
  eye_color: ["brown", "dark_brown", "hazel", "green", "blue", "gray"],
  clothing_style: ["casual_modest", "simple_layered", "practical_warm", "classic_simple", "soft_cardigan", "modest_warm"],
  clothing_color_palette: ["warm_earth", "muted_neutral", "soft_jewel", "sand_ivory", "dusty_blue"],
  expression: ["gentle_smile", "hopeful", "calm", "discreet_smile", "tired_but_warm", "resilient", "serious_soft", "thoughtful", "pensive", "reserved"],
  posture: ["upright_calm", "leaning_slightly", "relaxed", "protective", "seated_dignified"],
  parent_energy: ["none", "protective_parent", "practical_parent", "tired_but_warm_parent"],
  cultural_style: ["neutral_european", "soft_modern", "subtle_mediterranean", "subtle_west_african", "subtle_central_african"],
  beard: ["none", "light", "full", "grey", "religious_long"],
  moustache: ["none", "light", "full"],
  hair_recession: ["none", "light", "moderate", "strong"],
  head_covering: ["none", "light_scarf", "headscarf", "hijab_full", "taqiyah", "turban", "kippah"],
  forehead_mark: ["none", "bindi_red", "bindi_black", "bindi_decorative"],
  mobility_aid: ["none", "wheelchair_manual", "wheelchair_electric", "cane", "crutches", "walker", "visible_bandage", "arm_sling", "oxygen_cannula"],
  body_type: ["very_thin", "thin", "average", "chubby", "heavy"],
};

// French labels — mirrored shortlist (presence check only).
const VOCAB_LABELS_KEYS: Record<string, string[]> = {
  gender: ["woman", "man", "person"],
  age_range: AVATAR_VOCAB.age_range as string[],
  skin_tone: AVATAR_VOCAB.skin_tone as string[],
  hair_type: AVATAR_VOCAB.hair_type as string[],
  hair_color: AVATAR_VOCAB.hair_color as string[],
  hair_length: AVATAR_VOCAB.hair_length as string[],
  hair_volume: AVATAR_VOCAB.hair_volume as string[],
  hair_style: AVATAR_VOCAB.hair_style as string[],
  nose: AVATAR_VOCAB.nose as string[],
  face_shape: AVATAR_VOCAB.face_shape as string[],
  eye_shape: AVATAR_VOCAB.eye_shape as string[],
  eye_color: AVATAR_VOCAB.eye_color as string[],
  clothing_style: AVATAR_VOCAB.clothing_style as string[],
  clothing_color_palette: AVATAR_VOCAB.clothing_color_palette as string[],
  expression: AVATAR_VOCAB.expression as string[],
  posture: AVATAR_VOCAB.posture as string[],
  parent_energy: AVATAR_VOCAB.parent_energy as string[],
  cultural_style: AVATAR_VOCAB.cultural_style as string[],
  beard: AVATAR_VOCAB.beard as string[],
  moustache: AVATAR_VOCAB.moustache as string[],
  hair_recession: AVATAR_VOCAB.hair_recession as string[],
  head_covering: AVATAR_VOCAB.head_covering as string[],
  forehead_mark: AVATAR_VOCAB.forehead_mark as string[],
  mobility_aid: AVATAR_VOCAB.mobility_aid as string[],
  body_type: AVATAR_VOCAB.body_type as string[],
};

// Map vocab key → corresponding AvatarTraits trait key
const VOCAB_TO_TRAIT: Record<string, keyof AvatarTraits> = {
  gender: "avatar_gender",
  age_range: "avatar_age_range",
  skin_tone: "avatar_skin_tone",
  hair_type: "avatar_hair_type",
  hair_color: "avatar_hair_color",
  hair_length: "avatar_hair_length",
  hair_volume: "avatar_hair_volume",
  hair_style: "avatar_hair_style",
  nose: "avatar_nose" as any,
  face_shape: "avatar_face_shape",
  eye_shape: "avatar_eye_shape",
  eye_color: "avatar_eye_color",
  clothing_style: "avatar_clothing_style",
  clothing_color_palette: "avatar_clothing_color_palette",
  expression: "avatar_expression",
  posture: "avatar_posture",
  parent_energy: "avatar_parent_energy",
  cultural_style: "avatar_cultural_style",
  beard: "avatar_beard" as any,
  moustache: "avatar_moustache" as any,
  hair_recession: "avatar_hair_recession" as any,
  head_covering: "avatar_head_covering" as any,
  forehead_mark: "avatar_forehead_mark" as any,
  mobility_aid: "avatar_mobility_aid" as any,
  body_type: "avatar_body_type" as any,
};

// Source-level scan of avatarArtDirection.ts to detect:
//   - which values have a grammar entry in *_DESC dicts
//   - which values are referenced inside buildAvatarPrompt body
const ART_SRC = await Deno.readTextFile(
  new URL("../supabase/functions/_shared/avatarArtDirection.ts", import.meta.url),
);

function hasGrammarEntry(vocabKey: string, value: string): boolean {
  // Match the *_DESC dict for this vocab and look up the value key.
  // Strategy: search for `value: "..."` in the file. Cheap heuristic that
  // works because every grammar entry lives in a key:string literal block.
  const re = new RegExp(`\\b${value}\\s*:\\s*"`);
  return re.test(ART_SRC);
}

// EDIT_VALUE_LABELS dict scan — list of trait keys that have an edit label dict.
const EDIT_VALUE_LABELS_KEYS = [
  "avatar_hair_color", "avatar_hair_type", "avatar_hair_length", "avatar_hair_volume",
  "avatar_hair_style", "avatar_skin_tone", "avatar_nose", "avatar_body_type",
  "avatar_clothing_color_palette", "avatar_clothing_style", "avatar_expression",
  "avatar_posture", "avatar_eye_color", "avatar_eye_shape", "avatar_beard",
  "avatar_moustache", "avatar_mobility_aid", "avatar_head_covering",
  "avatar_forehead_mark", "avatar_parent_energy",
];

// ---------- Baseline (Léa-like) ----------
function makeBaseline(): AvatarTraits {
  return inferAvatarTraits({
    id: "audit-baseline-lea",
    alias_first_name: "Léa",
    approx_age: 34,
    avatar_gender: "woman",
    avatar_age_range: "25-35",
    avatar_skin_tone: "light",
    avatar_hair_type: "curly",
    avatar_hair_color: "dark_brown",
    avatar_hair_length: "medium",
    avatar_hair_volume: "natural",
    avatar_hair_style: "loose",
    avatar_face_shape: "oval",
    avatar_nose: "straight",
    avatar_eye_shape: "almond",
    avatar_eye_color: "brown",
    avatar_expression: "calm",
    avatar_posture: "upright_calm",
    avatar_clothing_style: "casual_modest",
    avatar_clothing_color_palette: "muted_neutral",
    avatar_body_type: "average",
    avatar_parent_energy: "none",
    avatar_beard: "none",
    avatar_moustache: "none",
    avatar_head_covering: "none",
    avatar_forehead_mark: "none",
    avatar_mobility_aid: "none",
    avatar_cultural_style: "neutral_european",
    culture_tags: [],
    children_count: 0,
  });
}

// ---------- Coverage matrix ----------
interface Cell {
  vocab: string;
  value: string;
  ui: boolean;
  labelFR: boolean;
  grammar: boolean;
  inCreatePrompt: boolean;
  inEditLabels: boolean;
  comparedByDiff: boolean;
  classification: string;
  status: string;
}

const UI_FIELDS_FROM_FIELDS_TSX = new Set([
  "avatar_gender", "avatar_age_range", "avatar_face_shape", "avatar_nose",
  "avatar_skin_tone", "avatar_expression",
  "avatar_eye_shape", "avatar_eye_color",
  "avatar_hair_type", "avatar_hair_color", "avatar_hair_length",
  "avatar_hair_volume", "avatar_hair_style",
  "avatar_beard", "avatar_moustache",
  "avatar_hair_recession",
  "avatar_head_covering", "avatar_forehead_mark", "avatar_cultural_style_override",
  "avatar_clothing_style", "avatar_clothing_color_palette",
  "avatar_posture", "avatar_mobility_aid",
  "avatar_parent_energy",
  "avatar_body_type",
]);

const ALL_DIFF_KEYS = new Set<string>([
  ...STRUCTURAL_TRAIT_KEYS as string[],
  ...MEDIUM_TRAIT_KEYS as string[],
  ...SOFT_TRAIT_KEYS as string[],
]);

function classifyKey(traitKey: string): string {
  if ((STRUCTURAL_TRAIT_KEYS as string[]).includes(traitKey)) return "structural";
  if ((MEDIUM_TRAIT_KEYS as string[]).includes(traitKey)) return "medium";
  if ((SOFT_TRAIT_KEYS as string[]).includes(traitKey)) return "soft";
  return "—";
}

function checkInCreatePrompt(traits: AvatarTraits, value: string, vocabKey: string): boolean {
  // Build the prompt and check whether the value (raw or de-underscored) appears.
  const prompt = buildAvatarPrompt(traits);
  if (value === "none" || value === "average") return true; // default no-op
  const variants = [value, value.replace(/_/g, " "), value.replace(/_/g, "-")];
  return variants.some(v => prompt.toLowerCase().includes(v.toLowerCase()));
}

const cells: Cell[] = [];

for (const [vocabKey, values] of Object.entries(AVATAR_VOCAB)) {
  const traitKey = VOCAB_TO_TRAIT[vocabKey];
  for (const value of values) {
    const ui = traitKey ? UI_FIELDS_FROM_FIELDS_TSX.has(traitKey as string) : false;
    const labelFR = (VOCAB_LABELS_KEYS[vocabKey] ?? []).includes(value);
    const grammar = hasGrammarEntry(vocabKey, value);

    // Build a trait variant where only this attribute is changed.
    const traits = makeBaseline();
    if (traitKey) (traits as any)[traitKey] = value;

    let inCreatePrompt = false;
    try {
      inCreatePrompt = checkInCreatePrompt(traits, value, vocabKey);
    } catch (_) { inCreatePrompt = false; }

    const inEditLabels = traitKey ? EDIT_VALUE_LABELS_KEYS.includes(traitKey as string) : false;
    const comparedByDiff = traitKey ? ALL_DIFF_KEYS.has(traitKey as string) : false;
    const classification = traitKey ? classifyKey(traitKey as string) : "—";

    const problems: string[] = [];
    if (!ui) problems.push("absent UI");
    if (!labelFR) problems.push("label FR manquant");
    if (!grammar) problems.push("grammaire absente");
    if (!inCreatePrompt) problems.push("absent création");
    if (!inEditLabels) problems.push("absent édition");
    if (!comparedByDiff) problems.push("non comparé");

    cells.push({
      vocab: vocabKey, value, ui, labelFR, grammar,
      inCreatePrompt, inEditLabels, comparedByDiff,
      classification,
      status: problems.length === 0 ? "OK" : problems.join(" · "),
    });
  }
}

// ---------- Dry-run prompts ----------
interface PromptSample {
  vocab: string; value: string;
  createFragment: string;
  editFragment: string;
  hasTransformBlock: boolean;
  level: string;
}

function extractFragment(prompt: string, value: string): string {
  const v = value.replace(/_/g, " ");
  const lines = prompt.split("\n");
  const hit = lines.find(l => l.toLowerCase().includes(v.toLowerCase()) || l.toLowerCase().includes(value.toLowerCase()));
  return hit ? hit.trim().slice(0, 240) : "(non trouvé)";
}

const promptSamples: PromptSample[] = [];

for (const [vocabKey, values] of Object.entries(AVATAR_VOCAB)) {
  const traitKey = VOCAB_TO_TRAIT[vocabKey];
  if (!traitKey) continue;
  for (const value of values) {
    const baseline = makeBaseline();
    const before = (baseline as any)[traitKey];
    const traits = makeBaseline();
    (traits as any)[traitKey] = value;

    const createPrompt = buildAvatarPrompt(traits);
    const createFragment = extractFragment(createPrompt, value);

    const diff: TraitDiff[] = buildTraitDiffFromKeys(
      baseline,
      traits,
      [traitKey as string],
      { [traitKey as string]: before },
    );
    const cls = classifyDiff(diff);
    const editPrompt = diff.length ? buildEditPrompt(diff, traits) : "(no diff)";
    const editFragment = diff.length ? extractFragment(editPrompt, value) : "(no diff)";
    const hasTransformBlock = diff.length > 0 && /TRANSFORMATION — SAME PERSON/i.test(editPrompt) && diff.some(d => /body_type|age_range|expression|hair_type/.test(d.key));

    promptSamples.push({
      vocab: vocabKey, value,
      createFragment, editFragment, hasTransformBlock,
      level: cls.level,
    });
  }
}

// ---------- Diff simulations ----------
interface DiffSim {
  key: string; before: string; after: string;
  level: string;
  expectedMode: string;
  fullRegen: boolean;
  imageEditable: boolean;
}

const SIMULATIONS: Array<[string, string, string]> = [
  ["avatar_body_type", "average", "heavy"],
  ["avatar_hair_type", "curly", "coily"],
  ["avatar_hair_color", "white", "dark_brown"],
  ["avatar_hair_length", "medium", "short"],
  ["avatar_hair_style", "loose", "bun"],
  ["avatar_expression", "reserved", "gentle_smile"],
  ["avatar_posture", "upright_calm", "leaning_slightly"],
  ["avatar_beard", "none", "full"],
  ["avatar_mobility_aid", "none", "cane"],
  ["avatar_head_covering", "none", "hijab_full"],
  ["avatar_skin_tone", "light", "dark"],
  ["avatar_nose", "straight", "aquiline"],
  ["avatar_forehead_mark", "none", "bindi_red"],
  ["avatar_clothing_style", "casual_modest", "soft_cardigan"],
  ["avatar_parent_energy", "none", "protective_parent"],
];

function modeForLevel(level: string): { mode: string; fullRegen: boolean; editable: boolean } {
  if (level === "none") return { mode: "no_changes", fullRegen: false, editable: false };
  if (level === "light") return { mode: "edit", fullRegen: false, editable: true };
  if (level === "medium") return { mode: "edit_hd", fullRegen: false, editable: true };
  return { mode: "requires_confirmation (structural → full regen)", fullRegen: true, editable: false };
}

const diffSims: DiffSim[] = SIMULATIONS.map(([key, before, after]) => {
  const baseline = makeBaseline();
  (baseline as any)[key] = before;
  const current = makeBaseline();
  (current as any)[key] = after;
  const diff = buildTraitDiffFromKeys(baseline, current, [key], { [key]: before });
  const cls = classifyDiff(diff);
  const m = modeForLevel(cls.level);
  return { key, before, after, level: cls.level, expectedMode: m.mode, fullRegen: m.fullRegen, imageEditable: m.editable };
});

// ---------- Issues ----------
const issues: string[] = [];

for (const c of cells) {
  if (c.status === "OK") continue;
  issues.push(`- **${c.vocab}.${c.value}** — ${c.status}`);
}

// Attributes in EDIT_VALUE_LABELS but missing from diff lists
for (const k of EDIT_VALUE_LABELS_KEYS) {
  if (!ALL_DIFF_KEYS.has(k)) issues.push(`- **${k}** : présent dans EDIT_VALUE_LABELS mais non comparé par diffTraits (édition aveugle)`);
}

// Attributes compared by diff but no edit labels
for (const k of ALL_DIFF_KEYS) {
  if (!EDIT_VALUE_LABELS_KEYS.includes(k) && !k.endsWith("_level") && k !== "avatar_cultural_style" && k !== "avatar_facial_features") {
    issues.push(`- **${k}** : comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS`);
  }
}

// Sliders absent from diff
const SLIDERS = ["avatar_tired_level", "avatar_emotional_brightness", "avatar_bald_level", "avatar_resilience_level", "avatar_fatigue_level", "avatar_dignity_level"];
for (const s of SLIDERS) {
  if (!ALL_DIFF_KEYS.has(s)) issues.push(`- **${s}** : slider non comparé par diffTraits (changement silencieux)`);
}

// Hardcoded near-duplicates flagged for human review
const NEAR_DUPLICATES = [
  ["hair_type", "curly", "coily", "Texture très proche en sortie image — à vérifier avec test réel"],
  ["body_type", "chubby", "heavy", "Volumes proches, vérifier que la grammaire heavy reste lisible vs chubby"],
  ["hair_length", "medium", "shoulder", "Différence subtile, risque de no_changes visuel"],
  ["hair_style", "tousled", "loose", "Sémantique proche, possible doublon"],
  ["expression", "calm", "reserved", "Expressions très proches"],
  ["expression", "discreet_smile", "gentle_smile", "Sourires proches"],
];
for (const [v, a, b, note] of NEAR_DUPLICATES) {
  issues.push(`- **${v}.${a} ↔ ${v}.${b}** : ${note}`);
}

// classifyDiff incoherences for the key simulations
for (const sim of diffSims) {
  if (sim.key === "avatar_hair_type" && sim.level === "structural") {
    issues.push(`- **avatar_hair_type** : classé \`structural\` → un simple curly→coily déclenche \`requires_confirmation\` + full regen. Reclassement medium proposé.`);
  }
  if (sim.key === "avatar_clothing_style" && sim.level === "light") {
    issues.push(`- **avatar_clothing_style** : classé \`soft\` — OK pour édition légère, vérifier que la palette est aussi diffée.`);
  }
}

// ---------- Render reports ----------
await Deno.mkdir(".lovable/audit-coverage", { recursive: true });

function renderMatrix(): string {
  const head = "| Vocab | Valeur | UI | Label FR | Grammaire | Création | Édition | Diff | Classe | Statut |\n|---|---|:-:|:-:|:-:|:-:|:-:|:-:|---|---|";
  const rows = cells.map(c =>
    `| ${c.vocab} | \`${c.value}\` | ${c.ui ? "✓" : "✗"} | ${c.labelFR ? "✓" : "✗"} | ${c.grammar ? "✓" : "✗"} | ${c.inCreatePrompt ? "✓" : "✗"} | ${c.inEditLabels ? "✓" : "✗"} | ${c.comparedByDiff ? "✓" : "✗"} | ${c.classification} | ${c.status} |`
  );
  return `# Avatar Studio — Matrice de couverture\n\nGénéré sans appel IA. ${cells.length} valeurs auditées.\n\n${head}\n${rows.join("\n")}\n`;
}

function renderPrompts(): string {
  const blocks = promptSamples.map(p =>
    `### ${p.vocab}.${p.value}\n- **Création** : ${p.createFragment}\n- **Édition** : ${p.editFragment}\n- **Bloc « same person transformed »** : ${p.hasTransformBlock ? "oui" : "non"}\n- **Niveau classifyDiff** : ${p.level}\n`
  );
  return `# Avatar Studio — Dry-run prompts\n\nFragments création + édition par valeur. Aucun appel IA.\n\n${blocks.join("\n")}\n`;
}

function renderDiffs(): string {
  const head = "| Attribut | Avant | Après | Niveau | Mode attendu | Full regen | Image-to-image |\n|---|---|---|---|---|:-:|:-:|";
  const rows = diffSims.map(s =>
    `| \`${s.key}\` | \`${s.before}\` | \`${s.after}\` | ${s.level} | ${s.expectedMode} | ${s.fullRegen ? "oui" : "non"} | ${s.imageEditable ? "oui" : "non"} |`
  );
  return `# Avatar Studio — Simulations de diff\n\n15 scénarios, simulation pure (\`buildTraitDiffFromKeys\` + \`classifyDiff\`). Aucun appel IA.\n\n${head}\n${rows.join("\n")}\n`;
}

function renderIssues(): string {
  const dedup = Array.from(new Set(issues));
  return `# Avatar Studio — Problèmes détectés\n\n${dedup.length} entrées (avant dédoublonnage humain).\n\n${dedup.join("\n")}\n`;
}

await Deno.writeTextFile(".lovable/audit-coverage/coverage-matrix.md", renderMatrix());
await Deno.writeTextFile(".lovable/audit-coverage/dry-run-prompts.md", renderPrompts());
await Deno.writeTextFile(".lovable/audit-coverage/diff-simulations.md", renderDiffs());
await Deno.writeTextFile(".lovable/audit-coverage/issues.md", renderIssues());

// Summary
const koCells = cells.filter(c => c.status !== "OK");
console.log(`[audit] ${cells.length} valeurs auditées, ${koCells.length} avec au moins un défaut.`);
console.log(`[audit] ${diffSims.length} simulations de diff.`);
console.log(`[audit] ${new Set(issues).size} problèmes uniques détectés.`);
console.log(`[audit] Rapports : .lovable/audit-coverage/{coverage-matrix,dry-run-prompts,diff-simulations,issues}.md`);
