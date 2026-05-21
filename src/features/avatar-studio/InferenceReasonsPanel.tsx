import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import type { FieldReason } from "@/lib/avatarAutoInfer";

const FIELD_SHORT: Record<string, string> = {
  avatar_expression: "Expression",
  avatar_posture: "Posture",
  avatar_parent_energy: "Énergie parentale",
  avatar_mobility_aid: "Mobilité",
  avatar_fatigue_level: "Fatigue",
  avatar_tired_level: "Fatigue oculaire",
  avatar_emotional_brightness: "Luminosité",
  avatar_resilience_level: "Résilience",
  avatar_clothing_style: "Vêtements",
  avatar_head_covering: "Couvre-chef",
};

interface Props {
  reasons: Record<string, FieldReason[]>;
}

export function InferenceReasonsPanel({ reasons }: Props) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(reasons);
  if (entries.length === 0) return null;

  return (
    <div className="mx-4 mt-2 rounded-md border bg-primary/5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-primary/10 rounded-md"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Pourquoi ces choix ? ({entries.length} champ{entries.length > 1 ? "s" : ""})
        </span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1.5 text-[11px] leading-snug">
          {entries.map(([field, rs]) => (
            <div key={field} className="grid grid-cols-[110px_1fr] gap-2 items-start">
              <div className="font-medium text-muted-foreground">{FIELD_SHORT[field] || field}</div>
              <div className="text-foreground/85">
                {rs.map((r, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-muted-foreground"> · </span>}
                    <span className="text-primary/80">{r.signalLabel}</span>
                    <span className="text-muted-foreground"> ← « {r.keyword} »</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
