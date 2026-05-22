import { AVATAR_VOCAB } from "@/lib/avatarTraits";
import { inferStudioDefaultsWithReasons } from "@/lib/avatarAutoInfer";

/**
 * Reproduit la logique du bouton « Pré-remplir » (autoInfer) sans dépendance UI.
 * - mode "fill"  : ne remplit que les champs vides / hors-vocabulaire (n'écrase pas le manuel)
 * - mode "force" : retourne toutes les valeurs déduites (écrase)
 */
export function computePrefillPatch(
  beneficiary: any,
  mode: "fill" | "force" = "fill",
): Record<string, any> {
  const { values } = inferStudioDefaultsWithReasons(beneficiary);
  if (mode === "force") return values;

  return Object.fromEntries(
    Object.entries(values).filter(([k, _v]) => {
      const cur = beneficiary?.[k];
      if (cur === null || cur === undefined || cur === "" || cur === "none") return true;
      const vocabKey = k.replace(/^avatar_/, "") as keyof typeof AVATAR_VOCAB;
      const vocab = (AVATAR_VOCAB as any)[vocabKey];
      if (Array.isArray(vocab) && typeof cur === "string" && !vocab.includes(cur)) return true;
      return false;
    }),
  );
}

export type BatchScope =
  | "filtered"
  | "no_hd_avatar"
  | "draft_only"
  | "missing_attributes";

export interface BatchEligibility {
  eligible: any[];
  skippedLocked: any[];
  skippedDignity: any[];
}

const HAS_HD = (b: any) =>
  !!b.avatar_url && b.avatar_status === "validated";

const HAS_MISSING_ATTR = (b: any) => {
  const required = [
    "avatar_gender",
    "avatar_age_range",
    "avatar_skin_tone",
    "avatar_hair_type",
    "avatar_face_shape",
  ];
  return required.some(k => !b[k] || b[k] === "");
};

export function selectBatchPool(
  pool: any[],
  scope: BatchScope,
): BatchEligibility {
  let base = pool;
  if (scope === "no_hd_avatar") base = pool.filter(b => !HAS_HD(b));
  else if (scope === "draft_only") base = pool.filter(b => (b.avatar_workflow_status || "draft") === "draft");
  else if (scope === "missing_attributes") base = pool.filter(HAS_MISSING_ATTR);

  const skippedLocked: any[] = [];
  const skippedDignity: any[] = [];
  const eligible: any[] = [];
  for (const b of base) {
    const ws = b.avatar_workflow_status || "draft";
    if (ws === "locked" || ws === "approved") {
      skippedLocked.push(b);
      continue;
    }
    if ((b.avatar_dignity_level ?? 5) < 3) {
      skippedDignity.push(b);
      continue;
    }
    eligible.push(b);
  }
  return { eligible, skippedLocked, skippedDignity };
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
