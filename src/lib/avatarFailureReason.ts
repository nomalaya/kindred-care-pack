// Maps an avatar generation failure code (stored in beneficiaries.avatar_qa_report.reason
// or .code) to a precise French operator-facing message.
//
// Keeping this in one place ensures the toast (Realtime path) and the persistent
// "failed banner" in Avatar Studio always show the SAME human explanation —
// never a generic "Dernière génération échouée".

export function failureReasonToMessage(
  reason: string | null | undefined,
  report?: { error?: string; scores?: any; notes?: string[] } | null,
): string {
  switch (reason) {
    case "no_credits":
      return "Crédits Lovable AI insuffisants. Rechargez le workspace.";
    case "rate_limited":
      return "Trop de requêtes IA. Réessayez dans 1 minute.";
    case "bust_incomplete_pre_clean":
    case "bust_incomplete_after_clean":
      return "La génération a été rejetée car le bas du buste était incomplet (fondu, coupé ou dissous).";
    case "body_type_unstable":
      return "La transformation de corpulence n'a pas convergé après 2 tentatives. Réessayez ou confirmez une régénération complète.";
    case "edit_qa_below_pass":
      return "L'édition a été acceptée en aperçu mais la QA est en dessous du seuil de validation HD.";
    case "score_below_60":
      return "La QA globale a rejeté l'image (score < 60).";
    case "retry_failed":
      return "La QA a rejeté l'image après 2 tentatives.";
    case "clean_invoke_failed":
      return "Le nettoyage du fond a échoué et la génération a été annulée.";
    case "post_qa_failed":
      return "La QA post-détourage a échoué (infrastructure). Réessayez.";
    case "work_error":
      return report?.error
        ? `Erreur de génération : ${report.error}`
        : "Erreur de génération. Réessayez.";
    default:
      return report?.error
        ? `Échec génération : ${report.error}`
        : "Dernière génération échouée. Réessayez.";
  }
}
