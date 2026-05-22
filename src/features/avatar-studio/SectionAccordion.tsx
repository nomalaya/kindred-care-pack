import { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface SectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
  filled: number;
  total: number;
  errors: number;
  warnings: number;
  content: ReactNode;
}

interface Props {
  sections: SectionDef[];
  defaultOpen?: string[];
}

export function SectionAccordion({ sections, defaultOpen }: Props) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen ?? sections.map(s => s.id)}
      className="w-full"
    >
      {sections.map((s) => {
        const pct = s.total > 0 ? Math.round((s.filled / s.total) * 100) : 0;
        return (
          <AccordionItem key={s.id} value={s.id} className="border-b last:border-b-0">
            <AccordionTrigger className="px-4 py-2.5 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{s.label}</span>

                <div className="flex items-center gap-1.5 ml-auto mr-2">
                  {s.errors > 0 && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-failed-fg))]"
                      aria-label={`${s.errors} erreur(s)`}
                    />
                  )}
                  {s.errors === 0 && s.warnings > 0 && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-generated-fg))]"
                      aria-label={`${s.warnings} avertissement(s)`}
                    />
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-normal h-5 px-1.5 ${
                      pct === 100 ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : ""
                    }`}
                  >
                    {s.filled}/{s.total}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              {s.content}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
