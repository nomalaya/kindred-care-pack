import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { WORKFLOW_COLOR, WORKFLOW_LABEL, WorkflowStatus } from "@/lib/avatarTraits";

interface Beneficiary {
  id: string;
  alias_first_name: string;
  region?: string | null;
  approx_age?: number | null;
  avatar_url?: string | null;
  avatar_preview_url?: string | null;
  avatar_workflow_status?: string | null;
  avatar_status?: string | null;
  avatar_qa_score?: number | null;
}

export function BeneficiaryListPanel({
  filtered, loading, selectedId, onSelect,
}: {
  filtered: Beneficiary[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-2 py-1.5 border-b text-[11px] uppercase tracking-wide text-muted-foreground bg-muted/30">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </div>
      <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5">
        {loading && <div className="text-sm text-muted-foreground p-2">Chargement…</div>}
        {filtered.map(b => {
          const ws = (b.avatar_workflow_status || "draft") as WorkflowStatus;
          const isSel = b.id === selectedId;
          const failed = b.avatar_status === "failed";
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              aria-label={`Sélectionner ${b.alias_first_name}`}
              className={`w-full text-left p-1.5 rounded-md flex items-center gap-2 transition-colors ${
                isSel ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-muted"
              }`}
            >
              <BeneficiaryAvatar
                name={b.alias_first_name}
                avatarUrl={b.avatar_url}
                previewUrl={b.avatar_preview_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-1">
                  {b.alias_first_name}
                  {failed && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-failed-fg))]" aria-label="Échec dernière génération" />}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {b.region} · {b.approx_age}a
                  {b.avatar_qa_score ? ` · QA ${Math.round(b.avatar_qa_score)}` : ""}
                </div>
              </div>
              <span className={`text-[9px] px-1 py-0.5 rounded border ${WORKFLOW_COLOR[ws]}`} aria-label={WORKFLOW_LABEL[ws]}>
                {WORKFLOW_LABEL[ws][0]}
              </span>
            </button>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-muted-foreground p-3 text-center">Aucun résultat</div>
        )}
      </div>
    </aside>
  );
}
