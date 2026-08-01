/**
 * Lot test « Diversifier » — sélection représentative de 20 profils,
 * simulation du remix, rapport AVANT/APRÈS et génération du SQL d'écriture.
 *
 * Lecture seule : n'écrit rien en base. Émet le SQL sur /tmp/remix-batch.sql
 *
 *   bun run scripts/remix-batch-test.ts
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
  "beneficiary_category", "urgency_level", "approx_age", "region",
  "avatar_workflow_status",
].join(",");

const HAIR_LOCKED = ["covered", "bald", "shaved", "thinning"];

function violations(b: any, group?: string | null): string[] {
  const out: string[] = [];
  const g = (group ?? resolveGroup(b)) as keyof typeof PHENOTYPE_RANGES | null;
  if (g) {
    const r = PHENOTYPE_RANGES[g];
    const check = (field: string, key: keyof typeof r) => {
      const v = b[field];
      if (field === "avatar_hair_type" && HAIR_LOCKED.includes(v)) return;
      if (field === "avatar_hair_color" && ["gray", "white"].includes(v)) return;
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
if (!Array.isArray(rows)) { console.error(rows); process.exit(1); }

const isLocked = (b: any) => b.avatar_workflow_status === "locked";
const covered = (b: any) => b.avatar_head_covering && !["none", ""].includes(b.avatar_head_covering);

const pool = rows.filter(b => !isLocked(b));
const byId = new Map(pool.map(b => [b.id, b]));
const picked: string[] = [];
const reason = new Map<string, string>();
const take = (b: any, why: string) => {
  if (!b || picked.includes(b.id)) return false;
  picked.push(b.id); reason.set(b.id, why); return true;
};

// 1) 2 par groupe (1 homme + 1 femme si dispo)
const GROUPS = ["north_european", "mediterranean", "mena", "sub_saharan_africa", "east_asian", "south_asian"];
for (const g of GROUPS) {
  for (const sex of ["man", "woman"]) {
    const cand = pool.find(b => resolveGroup(b) === g && b.avatar_gender === sex && !picked.includes(b.id));
    take(cand, `groupe ${g} / ${sex}`);
  }
}
// 2) 4 avec couvre-chef
let nCov = 0;
for (const b of pool) {
  if (nCov >= 4) break;
  if (covered(b) && take(b, "couvre-chef")) nCov++;
}
// 3) 2 déjà incohérents
let nInc = 0;
for (const b of pool) {
  if (nInc >= 2) break;
  if (violations(b).length && take(b, "incohérence actuelle")) nInc++;
}
// 4) 2 sans groupe identifiable
let nNone = 0;
for (const b of pool) {
  if (nNone >= 2) break;
  if (!resolveGroup(b) && take(b, "sans groupe")) nNone++;
}
// complément jusqu'à 20
for (const b of pool) {
  if (picked.length >= 20) break;
  take(b, "complément");
}
const batch = picked.slice(0, 20).map(id => byId.get(id));

console.log(`Lot test : ${batch.length} profils\n`);

const FIELDS = [
  "avatar_skin_tone", "avatar_eye_color", "avatar_eye_shape", "avatar_hair_type",
  "avatar_hair_color", "avatar_hair_length", "avatar_hair_style", "avatar_hair_volume",
  "avatar_nose", "avatar_face_shape", "avatar_body_type", "avatar_clothing_style",
  "avatar_clothing_color_palette", "avatar_expression", "avatar_posture", "avatar_facial_features",
];
const short = (v: any) => Array.isArray(v) ? (v.length ? v.join("+") : "∅") : (v ?? "-");

const sql: string[] = [];
let vB = 0, vA = 0;
const after: any[] = [];
const protectedAll = new Set<string>();

for (const b of batch) {
  const { patch, group, protectedFields } = remixAttributes(b);
  protectedFields.forEach(f => protectedAll.add(f));
  const merged = { ...b, ...patch };
  after.push(merged);
  const vb = violations(b, group), va = violations(merged, group);
  vB += vb.length ? 1 : 0; vA += va.length ? 1 : 0;

  console.log(`— ${b.alias_first_name} (${b.region ?? "?"}) · ${b.avatar_gender} · ${group ?? "sans groupe"} · [${reason.get(b.id)}]`);
  if (vb.length) console.log(`   incohérences AVANT : ${vb.join(", ")}`);
  if (va.length) console.log(`   ⚠ incohérences APRÈS : ${va.join(", ")}`);
  for (const f of FIELDS) {
    if (f in patch) console.log(`   ${f.replace("avatar_", "").padEnd(26)} ${short(b[f])}  →  ${short(patch[f])}`);
  }
  if (!Object.keys(patch).length) console.log("   (aucun changement)");

  const sets = Object.entries(patch).map(([k, v]) => {
    if (Array.isArray(v)) return `${k} = ARRAY[${v.map(x => `'${String(x).replace(/'/g, "''")}'`).join(",")}]::text[]`;
    return `${k} = '${String(v).replace(/'/g, "''")}'`;
  });
  if (sets.length) sql.push(`UPDATE public.beneficiaries SET ${sets.join(", ")} WHERE id = '${b.id}';`);
  console.log("");
}

const modal = (list: any[], f: string) => {
  const c = new Map<string, number>();
  for (const b of list) { const v = short(b[f]); c.set(v, (c.get(v) ?? 0) + 1); }
  return Math.max(...c.values()) / list.length;
};
console.log("Dominance du trait majoritaire sur le lot (1.00 = tous identiques)");
for (const f of ["avatar_skin_tone", "avatar_eye_color", "avatar_hair_color", "avatar_hair_type", "avatar_nose", "avatar_face_shape"]) {
  console.log(`  ${f.replace("avatar_", "").padEnd(16)} ${modal(batch, f).toFixed(2)} → ${modal(after, f).toFixed(2)}`);
}
console.log(`\nIncohérences : ${vB} AVANT → ${vA} APRÈS`);
console.log(`Champs protégés (signal explicite, non touchés) : ${[...protectedAll].sort().join(", ") || "aucun"}`);
console.log(`Requêtes générées : ${sql.length}`);
await Bun.write("/tmp/remix-batch.sql", sql.join("\n") + "\n");
