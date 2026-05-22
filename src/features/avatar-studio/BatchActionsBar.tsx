import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Loader2, StopCircle, Wand2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  selectBatchPool, type BatchScope,
} from "./batchPrefill";

export interface BatchProgress {
  done: number;
  total: number;
  failed: number;
  running: boolean;
}

interface Props {
  pool: any[]; // bénéficiaires actuellement filtrés à l'écran
  progress: BatchProgress;
  onLaunch: (opts: { scope: BatchScope; mode: "fill" | "force"; chunkSize: number; maxItems: number }) => void;
  onStop: () => void;
}

export function BatchActionsBar({ pool, progress, onLaunch, onStop }: Props) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<BatchScope>("no_hd_avatar");
  const [mode, setMode] = useState<"fill" | "force">("fill");
  const [chunkSize, setChunkSize] = useState(5);
  const [maxItems, setMaxItems] = useState(10);

  const eligibility = useMemo(() => selectBatchPool(pool, scope), [pool, scope]);
  const eligibleCount = Math.min(eligibility.eligible.length, maxItems);

  const handleLaunch = () => {
    if (mode === "force") {
      const ok = confirm(
        `Mode « Tout re-déduire » : ${eligibleCount} bénéficiaire(s) verront leurs attributs avatar écrasés à partir du récit. Continuer ?`,
      );
      if (!ok) return;
    }
    setOpen(false);
    onLaunch({ scope, mode, chunkSize, maxItems });
  };

  if (progress.running) {
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md border bg-muted/30">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span className="text-xs">
          Lot en cours · {progress.done}/{progress.total}
          {progress.failed > 0 && <span className="text-destructive ml-1">({progress.failed} échec)</span>}
        </span>
        <div className="w-24"><Progress value={pct} className="h-1.5" /></div>
        <Button size="sm" variant="ghost" onClick={onStop} title="Arrêter le lot">
          <StopCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" title="Pré-remplir et générer en lot">
          <Layers className="h-3.5 w-3.5 mr-1" />Lot
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Pré-remplir + Générer (lot)</h4>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Applique « Pré-remplir » sur chaque bénéficiaire puis lance la génération HD, par paquets.
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs">Portée</Label>
          <Select value={scope} onValueChange={v => setScope(v as BatchScope)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="filtered">Tous (filtre actif)</SelectItem>
              <SelectItem value="no_hd_avatar">Sans avatar HD</SelectItem>
              <SelectItem value="draft_only">Brouillons uniquement</SelectItem>
              <SelectItem value="missing_attributes">Attribut avatar manquant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Mode</Label>
          <Select value={mode} onValueChange={v => setMode(v as "fill" | "force")}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fill">Pré-remplir (n'écrase pas)</SelectItem>
              <SelectItem value="force">Tout re-déduire (écrase)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Total max</Label>
            <Input
              type="number" min={1} max={100} value={maxItems}
              onChange={e => setMaxItems(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Taille de paquet</Label>
            <Input
              type="number" min={1} max={20} value={chunkSize}
              onChange={e => setChunkSize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="rounded-md bg-muted/40 px-2 py-1.5 text-[11px] space-y-0.5">
          <div><span className="font-medium">{eligibleCount}</span> bénéficiaire(s) traité(s)</div>
          {eligibility.skippedLocked.length > 0 && (
            <div className="text-muted-foreground">{eligibility.skippedLocked.length} verrouillé/approuvé ignoré(s)</div>
          )}
          {eligibility.skippedDignity.length > 0 && (
            <div className="text-muted-foreground">{eligibility.skippedDignity.length} dignité &lt; 3 ignoré(s)</div>
          )}
        </div>

        <Button onClick={handleLaunch} size="sm" className="w-full" disabled={eligibleCount === 0}>
          Lancer sur {eligibleCount}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
