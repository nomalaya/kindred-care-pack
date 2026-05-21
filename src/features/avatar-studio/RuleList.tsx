import { AlertTriangle } from "lucide-react";
import type { RuleWarning } from "@/lib/avatarRules";

export function RuleList({
  warnings, onApply,
}: { warnings: RuleWarning[]; onApply: (s: Record<string, unknown>) => void }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {warnings.map(w => (
        <div
          key={w.id}
          className={`text-xs p-2 rounded border flex items-start gap-2 ${
            w.severity === "error" ? "bg-[hsl(var(--status-failed-bg))] border-[hsl(var(--status-failed-border))] text-[hsl(var(--status-failed-fg))]" :
            w.severity === "warning" ? "bg-[hsl(var(--status-generated-bg))] border-[hsl(var(--status-generated-border))] text-[hsl(var(--status-generated-fg))]" :
            "bg-muted border-border text-muted-foreground"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <div className="flex-1">{w.message}</div>
          {w.suggestion && w.suggestionLabel && (
            <button
              onClick={() => onApply(w.suggestion!)}
              className="underline font-medium whitespace-nowrap"
            >
              {w.suggestionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
