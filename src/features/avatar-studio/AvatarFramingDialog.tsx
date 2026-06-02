import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw, Crosshair, Check, Loader2 } from "lucide-react";
import {
  clampFraming,
  DEFAULT_FRAMING,
  framingEquals,
  framingToRowPatch,
  framingToTransform,
  FRAMING_BOUNDS,
  maxOffsetPct,
  type AvatarFraming,
} from "@/lib/avatarFraming";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryId: string;
  imageUrl: string;
  initialFraming: AvatarFraming;
  onChange?: (f: AvatarFraming) => void;
  /** Called after the framing is persisted to the database (debounced). */
  onSaved?: (f: AvatarFraming) => void;
}

const PREVIEW_SIZE = 420;

export function AvatarFramingDialog({
  open,
  onOpenChange,
  beneficiaryId,
  imageUrl,
  initialFraming,
  onChange,
  onSaved,
}: Props) {
  const [framing, setFraming] = useState<AvatarFraming>(initialFraming);
  const [showGrid, setShowGrid] = useState(false);
  const [imageNatural, setImageNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: PREVIEW_SIZE,
    h: PREVIEW_SIZE,
  });
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    moved: boolean;
  } | null>(null);

  // Reset when reopened
  useEffect(() => {
    if (open) setFraming(initialFraming);
  }, [open, initialFraming]);

  // Observe container size
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setContainerSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const maxOffset = useMemo(
    () => maxOffsetPct(containerSize, imageNatural, framing.scale),
    [containerSize, imageNatural, framing.scale],
  );

  // Save debounced
  const saveTimer = useRef<number | null>(null);
  const lastSavedRef = useRef<AvatarFraming>(initialFraming);

  const persist = useCallback(
    async (f: AvatarFraming, immediate = false) => {
      if (framingEquals(f, lastSavedRef.current)) return;
      const doSave = async () => {
        setSaving(true);
        try {
          const patch = framingToRowPatch(f);
          const { error } = await supabase
            .from("beneficiaries")
            .update(patch as any)
            .eq("id", beneficiaryId);
          if (error) {
            toast.error("Cadrage non sauvegardé : " + error.message);
            return;
          }
          lastSavedRef.current = f;
          setSavedTick(t => t + 1);
          onSaved?.(f);
        } finally {
          setSaving(false);
        }
      };
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (immediate) {
        await doSave();
      } else {
        saveTimer.current = window.setTimeout(doSave, 400);
      }
    },
    [beneficiaryId, onSaved],
  );

  // Cancel pending save on close, force flush
  useEffect(() => {
    if (!open && saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
      if (!framingEquals(framing, lastSavedRef.current)) {
        void persist(framing, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const applyFraming = useCallback(
    (next: AvatarFraming, opts?: { immediate?: boolean }) => {
      const clamped = imageNatural.w
        ? clampFraming(next, containerSize, imageNatural)
        : next;
      setFraming(clamped);
      onChange?.(clamped);
      void persist(clamped, opts?.immediate);
    },
    [containerSize, imageNatural, onChange, persist],
  );

  // ----- Interactions -----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: framing.offsetX,
      startOffsetY: framing.offsetY,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    d.moved = true;
    const dxPct = (dx / containerSize.w) * 100;
    const dyPct = (dy / containerSize.h) * 100;
    applyFraming({
      ...framing,
      offsetX: d.startOffsetX + dxPct,
      offsetY: d.startOffsetY + dyPct,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d || d.pointerId !== e.pointerId) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    dragState.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const step = 0.04;
    const next = framing.scale + (e.deltaY < 0 ? step : -step);
    applyFraming({ ...framing, scale: next });
  };

  const onDoubleClick = () => {
    applyFraming(DEFAULT_FRAMING, { immediate: true });
  };

  // ----- Render -----
  const transformStyle = framingToTransform(framing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:w-full p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base">Ajuster le cadrage</DialogTitle>
          <DialogDescription className="text-xs">
            Zoom et position s'appliquent uniquement à l'affichage. L'image source n'est pas modifiée.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-5 pt-2">
          {/* ----- Preview ----- */}
          <div className="flex flex-col items-center gap-2">
            <div
              ref={containerRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onDoubleClick={onDoubleClick}
              className="relative w-full max-w-[420px] aspect-square bg-muted rounded-lg overflow-hidden ring-1 ring-border select-none cursor-grab active:cursor-grabbing"
              style={{ touchAction: "none" }}
              role="application"
              aria-label="Aperçu du cadrage — glisser pour déplacer, molette pour zoomer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImageNatural({ w: img.naturalWidth, h: img.naturalHeight });
                }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={transformStyle}
              />
              {showGrid && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  {/* Rule of thirds */}
                  <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                  <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                  <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                  <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                  {/* Center cross */}
                  <line x1="48" y1="50" x2="52" y2="50" stroke="white" strokeWidth="0.5" strokeOpacity="0.9" />
                  <line x1="50" y1="48" x2="50" y2="52" stroke="white" strokeWidth="0.5" strokeOpacity="0.9" />
                  {/* Dark complement for contrast */}
                  <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="black" strokeWidth="0.15" strokeOpacity="0.4" />
                  <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="black" strokeWidth="0.15" strokeOpacity="0.4" />
                  <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="black" strokeWidth="0.15" strokeOpacity="0.4" />
                  <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="black" strokeWidth="0.15" strokeOpacity="0.4" />
                </svg>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Glisser pour déplacer · Molette pour zoomer · Double-clic pour réinitialiser
            </p>
          </div>

          {/* ----- Controls ----- */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs">Zoom</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(framing.scale * 100)}%
                </span>
              </div>
              <Slider
                min={FRAMING_BOUNDS.scaleMin * 100}
                max={FRAMING_BOUNDS.scaleMax * 100}
                step={5}
                value={[Math.round(framing.scale * 100)]}
                onValueChange={(v) => applyFraming({ ...framing, scale: v[0] / 100 })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs">Position verticale</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(framing.offsetY)} / ±{Math.round(maxOffset.y)}
                </span>
              </div>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[framing.offsetY]}
                onValueChange={(v) => applyFraming({ ...framing, offsetY: v[0] })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs">Position horizontale</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(framing.offsetX)} / ±{Math.round(maxOffset.x)}
                </span>
              </div>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[framing.offsetX]}
                onValueChange={(v) => applyFraming({ ...framing, offsetX: v[0] })}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={() => applyFraming({ ...framing, offsetX: 0, offsetY: 0 }, { immediate: true })}
              >
                <Crosshair className="h-3.5 w-3.5 mr-2" />
                Recentrer automatiquement
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start text-xs"
                onClick={() => applyFraming(DEFAULT_FRAMING, { immediate: true })}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Réinitialiser le cadrage
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Label htmlFor="framing-grid" className="text-xs cursor-pointer">
                Afficher la grille
              </Label>
              <Switch id="framing-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 min-h-[18px]">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde…
                </>
              ) : savedTick > 0 ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" /> Sauvegarde automatique
                </>
              ) : (
                <span className="opacity-0">.</span>
              )}
            </div>

            <Button type="button" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarFramingDialog;
