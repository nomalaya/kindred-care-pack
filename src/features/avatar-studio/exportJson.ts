// sync
/**
 * Export JSON du catalogue d'avatars depuis l'Avatar Studio.
 *
 * Règle de confidentialité : jamais l'âge exact ni les données réelles
 * (nom, adresse, email). Seule la tranche d'âge est exportée.
 */
import { getAgeRange } from "@/lib/ageRange";

export interface ExportableBeneficiary {
  id: string;
  alias_first_name?: string | null;
  region?: string | null;
  approx_age?: number | null;
  [key: string]: any;
}

/** Sérialise un bénéficiaire : identité pseudonymisée + attributs d'avatar. */
export function serializeBeneficiary(b: ExportableBeneficiary) {
  const avatar: Record<string, any> = {};
  for (const key of Object.keys(b)) {
    if (key.startsWith("avatar_")) avatar[key] = b[key];
  }
  return {
    id: b.id,
    alias_first_name: b.alias_first_name ?? null,
    region: b.region ?? null,
    age_range: typeof b.approx_age === "number" ? getAgeRange(b.approx_age) : null,
    avatar_url: b.avatar_url ?? null,
    avatar_preview_url: b.avatar_preview_url ?? null,
    avatar_status: b.avatar_status ?? null,
    avatar_workflow_status: b.avatar_workflow_status ?? null,
    avatar_qa_score: b.avatar_qa_score ?? null,
    avatar_qa_report: b.avatar_qa_report ?? null,
    avatar_generated_at: b.avatar_generated_at ?? null,
    avatar_model_used: b.avatar_model_used ?? null,
    attributes: avatar,
  };
}

export function buildExportPayload(rows: ExportableBeneficiary[], scope: string) {
  return {
    exported_at: new Date().toISOString(),
    scope,
    count: rows.length,
    beneficiaries: rows.map(serializeBeneficiary),
  };
}

export function exportFileName(date = new Date()) {
  const d = date.toISOString().slice(0, 10);
  return `avatars-cashforcause-${d}.json`;
}

/** Déclenche le téléchargement client-side. Retourne le nombre exporté. */
export function downloadAvatarsJson(rows: ExportableBeneficiary[], scope: string): number {
  const payload = buildExportPayload(rows, scope);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return payload.count;
}
