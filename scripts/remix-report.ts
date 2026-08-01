/**
 * Rapport de distribution des attributs avatar — AVANT / APRÈS remix.
 * Lecture seule : n'écrit rien en base.
 *
 *   bun run scripts/remix-report.ts
 */
import { remixAttributes, resolveGroup } from "../src/lib/avatarRemix";
import { PHENOTYPE_RANGES } from "../src/lib/phenotypeRanges";

const URL = process.env.VITE_SUPABASE_URL!;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const COLS = [
  "id", "alias_first_name", "real_first_name", "avatar_gender", "avatar_age_range",
  "culture_tags", "avatar_private_notes", "short_story", "emotional_sentence",
  "avatar_skin_tone", "avatar_eye_color", "avatar_eye_shape", "avatar_hair_type",
  "avatar_hair_color", "avatar_hair_length", "avatar_hair_style", "avatar_hair_volume",
  "avatar_nose", "avatar_face_shape", "avatar_head_covering", "avatar_body_type",
  "avatar_clothing_style", "avatar_clothing_color_palette", "avatar_expression",
  "avatar_posture", "avatar_facial_features", "children_count",
  "beneficiary_category", "urgency_level", "approx_age",
].join(",");

const IDENTITY_FIELDS = [
  "avatar_skin_tone", "avatar_eye_color", "avatar_eye_shape", "avatar_hair_type",
  "avatar_hair_color", "avatar_hair_length", "avatar_hair_style", "avatar_nose",
  "avatar_face_shape",
];

const signature = (b: any) => IDENTITY_FIELDS.map(f => b[f] ?? "-").join("|");

function violations(b: any, group?: string | null): string[] {
  const out: string[] = [];
  const g = (group ?? resolveGroup(b)) as keyof typeof PHENOTYPE_RANGES | null;
  if (g) {
    const r = PHENOTYPE_RANGES[g];
    const check = (field: string, key: keyof typeof r) => {
      const v = b[field];
      if (v && !r[key].includes(v)) out.push(`${field}=${v} hors plage ${g}`);
    };
    check("avatar_skin_tone", "skin_tone");
    check("avatar_eye_color", "eye_color");
    check("avatar_hair_color", "hair_color");
    check("avatar_hair_type", "hair_type");
    check("avatar_nose", "nose");
  }
  const covered = b.avatar_head_covering && !["none", ""].includes(b.avatar_head_covering);
  if (covered) {
    if (["fair", "light"].includes(b.avatar_skin_tone)) out.push("voile + peau claire");
    if (["blonde", "red", "auburn"].includes(b.avatar_hair_color)) out.push("voile + cheveux clairs/roux");
    if (["blue", "green", "gray"].includes(b.avatar_eye_color)) out.push("voile + yeux clairs");
  }
  if ((b.avatar_facial_features ?? []).includes("light_freckles")
      && !["fair", "light"].includes(b.avatar_skin_tone)) {
    out.push("taches de rousseur sur peau foncée");
  }
  return out;
}

const res = await fetch(`${URL}/rest/v1/beneficiaries?select=${COLS}&is_active=eq.true&limit=1000`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const rows: any[] = await res.json();
console.log(`Bénéficiaires actifs : ${rows.length}\n`);

const byGroup = new Map<string, any[]>();
for (const b of rows) {
  const g = `${resolveGroup(b) ?? "inconnu"} / ${b.avatar_gender ?? "?"}`;
  byGroup.set(g, [...(byGroup.get(g) ?? []), b]);
}

let vBefore = 0, vAfter = 0, changed = 0;
const lines: string[] = [];
lines.push("| Groupe / sexe | n | combinaisons uniques AVANT | APRÈS |");
lines.push("|---|---|---|---|");

let totalUniqBefore = 0, totalUniqAfter = 0;
for (const [g, list] of [...byGroup.entries()].sort()) {
  const before = new Set(list.map(signature));
  const after = new Set<string>();
  for (const b of list) {
    const { patch } = remixAttributes(b);
    if (Object.keys(patch).length) changed++;
    const merged = { ...b, ...patch };
    after.add(signature(merged));
    const grp = g.split(" / ")[0];
    const gk = grp === "inconnu" ? null : grp;
    vBefore += violations(b, gk).length ? 1 : 0;
    const va = violations(merged, gk);
    if (va.length) {
      vAfter++;
      console.log(`⚠ ${b.alias_first_name} (${g}) : ${va.join(", ")}`);
    }
  }
  totalUniqBefore += before.size;
  totalUniqAfter += after.size;
  lines.push(`| ${g} | ${list.length} | ${before.size} | ${after.size} |`);
}

// Concentration : part de la valeur la plus fréquente par champ (plus bas = plus divers)
const modalShare = (list: any[], field: string) => {
  const counts = new Map<string, number>();
  for (const b of list) {
    const v = String(b[field] ?? "-");
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Math.max(...counts.values()) / list.length;
};

console.log(lines.join("\n"));

const FIELDS = ["avatar_skin_tone", "avatar_eye_color", "avatar_hair_color", "avatar_hair_type", "avatar_nose", "avatar_face_shape", "avatar_eye_shape"];
console.log("\nConcentration de la valeur dominante (1.00 = tous identiques)");
console.log("| Groupe / sexe | n | " + FIELDS.map(f => f.replace("avatar_", "")).join(" | ") + " |");
console.log("|---|---|" + FIELDS.map(() => "---|").join(""));
for (const [g, list] of [...byGroup.entries()].sort()) {
  if (list.length < 5) continue;
  const after = list.map(b => ({ ...b, ...remixAttributes(b).patch }));
  const cells = FIELDS.map(f => `${modalShare(list, f).toFixed(2)} → ${modalShare(after, f).toFixed(2)}`);
  console.log(`| ${g} | ${list.length} | ${cells.join(" | ")} |`);
}
console.log(`\nCombinaisons uniques totales : ${totalUniqBefore} → ${totalUniqAfter} (sur ${rows.length} profils)`);
console.log(`Profils modifiés par le remix : ${changed}`);
console.log(`Incohérences phénotypiques : ${vBefore} AVANT → ${vAfter} APRÈS`);
