import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AVATAR_VOCAB, WORKFLOW_LABEL, WORKFLOW_COLOR, WorkflowStatus,
} from "@/lib/avatarTraits";
import { evaluateAvatarRules, RuleWarning } from "@/lib/avatarRules";
import { inferStudioDefaults } from "@/lib/avatarAutoInfer";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import {
  ArrowLeft, Loader2, RefreshCw, Sparkles, ShieldCheck, Lock, Unlock,
  Wand2, History, Eye, AlertTriangle, Keyboard, Check, Search, RotateCcw, Upload,
  VenusAndMars, CalendarDays, Smile, Palette, Ruler, Layers, Scissors, Waves,
  User, ArrowUp, Crown, Globe, Shirt, PersonStanding, Accessibility, Baby,
  BatteryLow, Sun, CircleDot, LucideIcon,
} from "lucide-react";

type Beneficiary = any;

const FIELD_LABELS: Record<string, string> = {
  avatar_gender: "Genre",
  avatar_age_range: "Tranche d'âge",
  avatar_face_shape: "Forme du visage",
  avatar_skin_tone: "Teint",
  avatar_eye_shape: "Forme des yeux",
  avatar_eye_color: "Couleur des yeux",
  avatar_hair_color: "Couleur de cheveux",
  avatar_hair_length: "Longueur",
  avatar_hair_volume: "Volume",
  avatar_hair_style: "Coiffure",
  avatar_hair_type: "Type de cheveux",
  avatar_beard: "Barbe",
  avatar_moustache: "Moustache",
  avatar_hair_recession: "Recul des cheveux",
  avatar_head_covering: "Couvre-chef",
  avatar_cultural_style_override: "Style culturel (override)",
  avatar_clothing_style: "Style vêtements",
  avatar_clothing_color_palette: "Palette vêtements",
  avatar_posture: "Posture",
  avatar_expression: "Expression",
  avatar_parent_energy: "Énergie parentale",
  avatar_mobility_aid: "Aide à la mobilité",
};

function SelectField({
  label, value, options, onChange, disabled,
}: {
  label: string;
  value: string | null;
  options: readonly string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function SliderField({
  label, value, min = 0, max = 5, step = 1, onChange, disabled,
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono text-foreground">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min} max={max} step={step}
        onValueChange={(v) => onChange(v[0])}
        disabled={disabled}
      />
    </div>
  );
}

const AvatarStudio = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | WorkflowStatus | "failed">("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<[string?, string?]>([]);
  const [modelChoice, setModelChoice] = useState<"preview" | "final">("final");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, any>>({});
  const searchRef = useRef<HTMLInputElement | null>(null);

  const refresh = async () => {
    const { data } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });
    setBeneficiaries(data || []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh().finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedId) { setVersions([]); return; }
    (async () => {
      const { data } = await supabase
        .from("avatar_versions" as any)
        .select("*")
        .eq("beneficiary_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(20);
      setVersions((data as any[]) || []);
    })();
  }, [selectedId, beneficiaries]);

  useEffect(() => {
    if (busy !== "preview" && busy !== "final") return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [busy]);

  useEffect(() => {
    if (busy !== "preview" && busy !== "final") return;
    const cur = beneficiaries.find(b => b.id === selectedId);
    if (!cur) return;
    if (cur.avatar_status === "failed") {
      const report: any = (cur as any).avatar_qa_report || {};
      const code = report.code;
      if (code === "no_credits") {
        toast.error("Crédits Lovable AI insuffisants. Rechargez votre workspace pour générer.");
      } else if (code === "rate_limited") {
        toast.error("Trop de requêtes IA. Réessayez dans une minute.");
      } else if (report.error) {
        toast.error("Échec génération : " + String(report.error).slice(0, 120));
      } else {
        toast.error("Échec de génération de l'avatar.");
      }
      setBusy(null);
    } else if (busy === "preview" && cur.avatar_status === "preview") {
      setBusy(null);
    } else if (busy === "final" && cur.avatar_status === "validated") {
      setBusy(null);
    }
  }, [beneficiaries, busy, selectedId]);

  const selected = useMemo(
    () => beneficiaries.find(b => b.id === selectedId) || null,
    [beneficiaries, selectedId],
  );

  const filtered = useMemo(() => {
    let pool = beneficiaries;
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(b =>
        (b.alias_first_name || "").toLowerCase().includes(q) ||
        (b.region || "").toLowerCase().includes(q),
      );
    }
    if (filter === "failed") {
      pool = pool.filter(b => b.avatar_status === "failed");
    } else if (filter !== "all") {
      pool = pool.filter(b => (b.avatar_workflow_status || "draft") === filter);
    }
    return pool;
  }, [beneficiaries, search, filter]);

  const stats = useMemo(() => {
    const s = { draft: 0, generated: 0, approved: 0, locked: 0, failed: 0 };
    for (const b of beneficiaries) {
      const ws = (b.avatar_workflow_status || "draft") as WorkflowStatus;
      s[ws] = (s[ws] ?? 0) + 1;
      if (b.avatar_status === "failed") s.failed += 1;
    }
    return s;
  }, [beneficiaries]);

  const warnings: RuleWarning[] = selected ? evaluateAvatarRules(selected) : [];
  const isLocked = selected?.avatar_workflow_status === "locked";

  const patch = (patchObj: Record<string, any>) => {
    if (!selected) return;
    if (isLocked) {
      toast.error("Avatar verrouillé. Déverrouillez pour modifier.");
      return;
    }
    setBeneficiaries(prev => prev.map(b =>
      b.id === selected.id ? { ...b, ...patchObj } : b,
    ));
    setSaveState("saving");
    if (saveTimers.current[selected.id]) clearTimeout(saveTimers.current[selected.id]);
    saveTimers.current[selected.id] = setTimeout(async () => {
      const { error } = await supabase
        .from("beneficiaries")
        .update(patchObj as any)
        .eq("id", selected.id);
      if (error) {
        toast.error("Échec sauvegarde : " + error.message);
        setSaveState("idle");
      } else {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      }
    }, 600);
  };

  const applySuggestion = (s: Record<string, unknown>) => patch(s as any);

  const autoInfer = (mode: "fill" | "force" = "fill") => {
    if (!selected) return;
    const defaults = inferStudioDefaults(selected);
    let toApply: Record<string, any> = defaults;
    if (mode === "fill") {
      // n'écrase que les champs vides / nuls
      toApply = Object.fromEntries(
        Object.entries(defaults).filter(([k]) => {
          const cur = (selected as any)[k];
          return cur === null || cur === undefined || cur === "" || cur === "none";
        }),
      );
    }
    if (Object.keys(toApply).length === 0) {
      toast.info("Aucun champ vide à pré-remplir. Utilisez « Tout re-déduire » pour écraser.");
      return;
    }
    patch(toApply);
    toast.success(
      mode === "force"
        ? "Attributs re-déduits depuis le récit"
        : `${Object.keys(toApply).length} champ(s) pré-rempli(s) depuis le récit`,
    );
  };


  const generate = async (mode: "preview" | "final") => {
    if (!selected) return;
    if ((selected.avatar_dignity_level ?? 5) < 3) {
      toast.error("Génération bloquée : niveau de dignité < 3");
      return;
    }
    setBusy(mode);
    try {
      const { error } = await supabase.functions.invoke("generate-avatar", {
        body: { beneficiary_id: selected.id, mode, force: true },
      });
      if (error) throw error;
      toast.success(mode === "preview" ? "Aperçu en génération…" : "Portrait HD en génération…");
      setBeneficiaries(prev => prev.map(b =>
        b.id === selected.id ? { ...b, avatar_status: "pending" } : b,
      ));
      setTimeout(refresh, 5000);
      setTimeout(() => { refresh(); setBusy(null); }, 15000);
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "échec"));
      setBusy(null);
    }
  };

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = async (file: File) => {
    if (!selected) return;
    if (isLocked) {
      toast.error("Avatar verrouillé. Déverrouillez d'abord.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté (image uniquement).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 10 Mo).");
      return;
    }
    setBusy("import");
    try {
      const ts = Date.now();
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const canonical = `${selected.id}.${ext === "jpg" ? "jpg" : ext === "jpeg" ? "jpg" : ext === "webp" ? "webp" : "png"}`;
      const versionPath = `versions/${selected.id}/import-${ts}.${ext === "jpeg" ? "jpg" : ext}`;
      const contentType = file.type || "image/png";

      const buf = await file.arrayBuffer();
      const { error: e1 } = await supabase.storage
        .from("avatars")
        .upload(canonical, buf, { contentType, upsert: true });
      if (e1) throw e1;
      const { error: e2 } = await supabase.storage
        .from("avatars")
        .upload(versionPath, buf, { contentType, upsert: false });
      if (e2) throw e2;

      const { data: cu } = supabase.storage.from("avatars").getPublicUrl(canonical);
      const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionPath);
      const url = `${cu.publicUrl}?t=${ts}`;

      const updates: any = {
        avatar_url: url,
        avatar_preview_url: url,
        avatar_status: "validated",
        avatar_workflow_status:
          selected.avatar_workflow_status === "approved" || selected.avatar_workflow_status === "locked"
            ? selected.avatar_workflow_status
            : "generated",
        avatar_model_used: "import/external",
        avatar_generated_at: new Date().toISOString(),
      };
      const { error: upErr } = await supabase.from("beneficiaries").update(updates).eq("id", selected.id);
      if (upErr) throw upErr;

      await supabase.from("avatar_versions" as any).insert({
        beneficiary_id: selected.id,
        image_url: vu.publicUrl,
        model_used: "import/external",
        prompt: `Imported file: ${file.name}`,
      });

      setBeneficiaries(prev => prev.map(b => b.id === selected.id ? { ...b, ...updates } : b));
      toast.success("Image importée et définie comme avatar actif");
      refresh();
    } catch (e: any) {
      toast.error("Échec import : " + (e.message || "erreur"));
    } finally {
      setBusy(null);
    }
  };


  const setWorkflow = async (status: WorkflowStatus) => {
    if (!selected) return;
    if (status === "draft" && selected.avatar_workflow_status === "locked") {
      if (!confirm("Déverrouiller cet avatar ?")) return;
    }
    const { error } = await supabase
      .from("beneficiaries")
      .update({ avatar_workflow_status: status } as any)
      .eq("id", selected.id);
    if (error) toast.error("Échec : " + error.message);
    else {
      setBeneficiaries(prev => prev.map(b =>
        b.id === selected.id ? { ...b, avatar_workflow_status: status } : b,
      ));
      toast.success(`Statut : ${WORKFLOW_LABEL[status]}`);
    }
  };

  const restoreVersion = async (v: any) => {
    if (!selected) return;
    if (isLocked) {
      toast.error("Avatar verrouillé. Déverrouillez d'abord.");
      return;
    }
    if (!confirm("Réutiliser cette version comme avatar actif ? L'avatar actuel sera remplacé (statut passera à « Généré »).")) return;
    const updates: any = {
      avatar_url: v.image_url,
      avatar_preview_url: v.image_url,
      avatar_status: "validated",
      avatar_workflow_status: "generated",
      avatar_model_used: v.model_used ?? null,
      avatar_qa_score: v.qa_score ?? null,
      avatar_qa_report: v.qa_report ?? null,
      avatar_seed: v.seed ?? null,
      avatar_prompt: v.prompt ?? null,
      avatar_generated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("beneficiaries").update(updates).eq("id", selected.id);
    if (error) {
      toast.error("Échec : " + error.message);
      return;
    }
    setBeneficiaries(prev => prev.map(b => b.id === selected.id ? { ...b, ...updates } : b));
    toast.success("Version restaurée comme avatar actif");
  };

  const workflowHint = (action: "approve" | "lock" | "unlock", status: WorkflowStatus, hasImage: boolean): string | null => {
    if (action === "approve") {
      if (status === "approved") return "Avatar déjà approuvé";
      if (status === "locked") return "Avatar verrouillé — déverrouillez d'abord";
      if (status !== "generated") return hasImage ? "Réutilisez une version ou régénérez pour approuver" : "Générez d'abord un avatar HD";
      return null;
    }
    if (action === "lock") {
      if (status === "locked") return "Déjà verrouillé";
      if (status !== "approved") return "Approuvez d'abord l'avatar";
      return null;
    }
    if (action === "unlock") {
      if (status !== "locked") return "Disponible uniquement sur un avatar verrouillé";
      return null;
    }
    return null;
  };


  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      const inField = tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA" || tgt.isContentEditable);
      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (inField) return;
      if (!selected && !["ArrowDown", "ArrowUp"].includes(e.key)) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (filtered.length === 0) return;
        e.preventDefault();
        const idx = filtered.findIndex(b => b.id === selectedId);
        const next = e.key === "ArrowDown"
          ? filtered[Math.min(filtered.length - 1, idx + 1)]
          : filtered[Math.max(0, idx - 1)];
        if (next) setSelectedId(next.id);
        return;
      }
      if (e.key.toLowerCase() === "g") { e.preventDefault(); generate("final"); }
      else if (e.key.toLowerCase() === "p") { e.preventDefault(); generate("preview"); }
      else if (e.key.toLowerCase() === "a" && selected?.avatar_workflow_status === "generated") {
        e.preventDefault(); setWorkflow("approved");
      }
      else if (e.key.toLowerCase() === "l" && selected?.avatar_workflow_status === "approved") {
        e.preventDefault(); setWorkflow("locked");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId, selected]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        </div>
      </Layout>
    );
  }

  const isMan = selected?.avatar_gender === "man";
  const hasCulture = (selected?.culture_tags?.length ?? 0) > 0;

  const sectionWarnings = (section: RuleWarning["section"]) =>
    warnings.filter(w => w.section === section);

  const StatChip = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
    <button
      onClick={() => setFilter(label === "Tous" ? "all" : label === "Échec" ? "failed" : (label.toLowerCase() as any))}
      className={`text-xs px-2 py-1 rounded-md border ${tone}`}
    >
      <span className="font-semibold">{value}</span> <span className="opacity-70">{label}</span>
    </button>
  );

  return (
    <Layout>
      <div className="px-4 py-3 max-w-[1700px] mx-auto">
        {/* TOPBAR */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 mb-3 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/admin">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Button>
            </Link>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-bold">Avatar Studio</h1>
              <span className="text-xs text-muted-foreground">{beneficiaries.length} bénéficiaires</span>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <StatChip label="Brouillon" value={stats.draft} tone="bg-muted/40" />
              <StatChip label="Généré" value={stats.generated} tone="bg-amber-50 border-amber-200 text-amber-800" />
              <StatChip label="Approuvé" value={stats.approved} tone="bg-emerald-50 border-emerald-200 text-emerald-800" />
              <StatChip label="Verrouillé" value={stats.locked} tone="bg-slate-100 border-slate-300 text-slate-800" />
              {stats.failed > 0 && <StatChip label="Échec" value={stats.failed} tone="bg-rose-50 border-rose-200 text-rose-800" />}
            </div>

            <div className="flex-1" />

            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Recherche (/  pour focus)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-7 w-64 text-sm"
              />
            </div>

            <div className="flex gap-0.5 border rounded-md p-0.5">
              {(["all", "draft", "generated", "approved", "locked", "failed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-2 py-1 rounded ${
                    filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "failed" ? "Échec" : WORKFLOW_LABEL[f]}
                </button>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={refresh}><RefreshCw className="h-3.5 w-3.5" /></Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm"><Keyboard className="h-3.5 w-3.5" /></Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                <div className="space-y-0.5">
                  <div><kbd>/</kbd> recherche</div>
                  <div><kbd>↑</kbd>/<kbd>↓</kbd> naviguer</div>
                  <div><kbd>P</kbd> aperçu · <kbd>G</kbd> générer HD</div>
                  <div><kbd>A</kbd> approuver · <kbd>L</kbd> verrouiller</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* MAIN 3 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(380px,420px)_1fr] gap-3 h-[calc(100vh-130px)]">
          {/* LEFT — list */}
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
                    onClick={() => setSelectedId(b.id)}
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
                        {failed && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {b.region} · {b.approx_age}a
                        {b.avatar_qa_score ? ` · QA ${Math.round(b.avatar_qa_score)}` : ""}
                      </div>
                    </div>
                    <span className={`text-[9px] px-1 py-0.5 rounded border ${WORKFLOW_COLOR[ws]}`}>
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

          {/* CENTER — preview + actions + versions */}
          <section className="bg-card border rounded-xl overflow-hidden flex flex-col">
            {!selected && (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm p-6">
                <div>
                  <Wand2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  Sélectionnez un bénéficiaire à gauche
                </div>
              </div>
            )}
            {selected && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
                  {selected.avatar_url || selected.avatar_preview_url ? (
                    <img
                      src={selected.avatar_url || selected.avatar_preview_url}
                      alt={selected.alias_first_name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxUrl(selected.avatar_url || selected.avatar_preview_url)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Eye className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  {busy && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-1" />
                        <div className="text-xs">{busy === "preview" ? "Aperçu…" : "HD…"}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <Badge variant="outline" className={WORKFLOW_COLOR[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}>
                    {WORKFLOW_LABEL[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}
                  </Badge>
                  {selected.avatar_qa_score && (
                    <Badge variant="outline">QA {Math.round(selected.avatar_qa_score)}</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">cartoon illustré storybook · fond contextuel flou</Badge>
                </div>

                {selected.avatar_status === "failed" && (
                  <div className="text-xs rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-2 py-1.5 flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <div>
                      {(selected as any).avatar_qa_report?.code === "no_credits"
                        ? "Crédits Lovable AI insuffisants. Rechargez le workspace."
                        : (selected as any).avatar_qa_report?.code === "rate_limited"
                        ? "Trop de requêtes. Réessayez dans 1 minute."
                        : "Dernière génération échouée. Réessayez."}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-[1fr_auto_auto] gap-1.5 items-end">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Modèle</Label>
                    <Select value={modelChoice} onValueChange={(v: any) => setModelChoice(v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preview">Nano Banana 2 (rapide)</SelectItem>
                        <SelectItem value="final">Nano Banana Pro (HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => generate("preview")} variant="outline" size="sm" disabled={!!busy || isLocked} title="P">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />Aperçu
                  </Button>
                  <Button onClick={() => generate("final")} size="sm" disabled={!!busy || isLocked} title="G">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />HD
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportFile(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    onClick={() => importInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    disabled={!!busy || isLocked}
                    title="Importer une image externe (fal.ai, etc.)"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />Importer
                  </Button>
                </div>

                {/* Workflow row */}
                {(() => {
                  const ws = (selected.avatar_workflow_status || "draft") as WorkflowStatus;
                  const hasImage = !!(selected.avatar_url || selected.avatar_preview_url);
                  const approveHint = workflowHint("approve", ws, hasImage);
                  const lockHint = workflowHint("lock", ws, hasImage);
                  const unlockHint = workflowHint("unlock", ws, hasImage);
                  const wrap = (hint: string | null, disabled: boolean, node: React.ReactNode) =>
                    hint ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} className="inline-block">{node}</span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{hint}</TooltipContent>
                      </Tooltip>
                    ) : node;
                  return (
                    <div className="grid grid-cols-3 gap-1.5">
                      {wrap(approveHint, !!approveHint, (
                        <Button
                          onClick={() => setWorkflow("approved")}
                          size="sm"
                          variant={ws === "generated" ? "default" : "outline"}
                          disabled={!!approveHint}
                          className="w-full"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />Approuver
                        </Button>
                      ))}
                      {wrap(lockHint, !!lockHint, (
                        <Button
                          onClick={() => setWorkflow("locked")}
                          size="sm"
                          variant={ws === "approved" ? "secondary" : "outline"}
                          disabled={!!lockHint}
                          className="w-full"
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" />Verrouiller
                        </Button>
                      ))}
                      {wrap(unlockHint, !!unlockHint, (
                        <Button
                          onClick={() => setWorkflow("draft")}
                          size="sm"
                          variant="outline"
                          disabled={!!unlockHint}
                          className="w-full"
                        >
                          <Unlock className="h-3.5 w-3.5 mr-1" />Déverr.
                        </Button>
                      ))}
                    </div>
                  );
                })()}

                {/* Versions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-medium flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                      <History className="h-3 w-3" />Versions ({versions.length})
                    </h3>
                    {versions.length >= 2 && (
                      <Button
                        size="sm" variant="ghost" className="h-6 text-xs"
                        onClick={() => { setCompareIds([versions[0].id, versions[1].id]); setCompareOpen(true); }}
                      >
                        Comparer 2 dernières
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {versions.map(v => {
                      const isActive = selected.avatar_url === v.image_url;
                      const isHD = !!v.qa_score || (v.image_url && !v.image_url.includes("/preview/"));
                      return (
                        <div
                          key={v.id}
                          className={`relative aspect-square rounded overflow-hidden bg-muted group ${
                            isActive ? "ring-2 ring-primary" : isHD ? "hover:ring-2 hover:ring-primary/50" : "hover:ring-2 hover:ring-amber-400/50"
                          }`}
                          title={`${isHD ? "HD" : "Aperçu"} · ${v.model_used?.split("/")[1] || ""} · QA ${v.qa_score ? Math.round(v.qa_score) : "—"}`}
                        >
                          <button
                            onClick={() => setLightboxUrl(v.image_url)}
                            className="block w-full h-full"
                          >
                            <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                          </button>
                          <span className={`absolute top-0 right-0 text-[9px] px-1 rounded-bl pointer-events-none font-semibold ${
                            isHD ? "bg-emerald-600 text-white" : "bg-amber-400 text-amber-950"
                          }`}>
                            {isHD ? "HD" : "AP"}
                          </span>
                          {v.qa_score && (
                            <span className="absolute bottom-0 right-0 bg-background/80 text-[9px] px-1 rounded-tl pointer-events-none">
                              QA {Math.round(v.qa_score)}
                            </span>
                          )}
                          {!isActive && (
                            <button
                              onClick={(e) => { e.stopPropagation(); restoreVersion(v); }}
                              disabled={isLocked}
                              className="absolute inset-x-0 bottom-0 bg-primary/90 text-primary-foreground text-[10px] py-0.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                              title="Réutiliser cette version comme avatar actif"
                            >
                              <RotateCcw className="h-3 w-3" />Utiliser
                            </button>
                          )}
                          {isActive && (
                            <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] px-1 rounded-br pointer-events-none">
                              Actif
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {versions.length === 0 && (
                      <div className="text-xs text-muted-foreground p-2 col-span-4">Aucune version archivée.</div>
                    )}
                  </div>

                  {versions.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Survolez une vignette puis cliquez sur <RotateCcw className="inline h-2.5 w-2.5" /> Utiliser pour la définir comme avatar actif.
                    </p>
                  )}
                </div>

              </div>
            )}
          </section>

          {/* RIGHT — attribute editor */}
          <section className="bg-card border rounded-xl overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Éditeur d'attributs
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5 border-b flex items-center justify-between gap-3 bg-muted/20">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold truncate">{selected.alias_first_name}</h2>
                      {saveState === "saving" && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Sauvegarde…</span>}
                      {saveState === "saved" && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" />Sauvegardé</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selected.real_first_name} {selected.real_last_name} · {selected.region} · {selected.approx_age}a
                      {selected.children_count > 0 && ` · ${selected.children_count} enf.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => autoInfer("fill")} variant="outline" size="sm" disabled={isLocked} title="Pré-remplir les champs vides depuis le récit">
                      <Wand2 className="h-3.5 w-3.5 mr-1" />Pré-remplir
                    </Button>
                    <Button onClick={() => autoInfer("force")} variant="ghost" size="sm" disabled={isLocked} title="Re-déduire et écraser tous les champs">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Contexte psychosocial — toujours visible */}
                {(selected.short_story || selected.emotional_sentence) && (
                  <div className="mx-4 mt-3 rounded-md border bg-muted/30 p-3 space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      Contexte psychosocial — source des déductions
                    </div>
                    {selected.short_story && (
                      <p className="text-xs leading-relaxed text-foreground/90 italic">
                        {selected.short_story}
                      </p>
                    )}
                    {selected.emotional_sentence && (
                      <blockquote className="text-xs leading-relaxed border-l-2 border-primary/40 pl-2 text-foreground/80">
                        «&nbsp;{selected.emotional_sentence}&nbsp;»
                      </blockquote>
                    )}
                  </div>
                )}

                {isLocked && (
                  <div className="mx-4 mt-3 p-2 rounded-md border border-slate-300 bg-slate-50 text-xs flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />Avatar verrouillé — déverrouillez pour modifier.
                  </div>
                )}

                <Tabs defaultValue="face" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="mx-4 mt-3 justify-start flex-wrap h-auto">
                    <TabsTrigger value="face">Visage</TabsTrigger>
                    <TabsTrigger value="eyes">Yeux</TabsTrigger>
                    <TabsTrigger value="hair">Cheveux</TabsTrigger>
                    {isMan && <TabsTrigger value="male">Masculin</TabsTrigger>}
                    {hasCulture && <TabsTrigger value="cultural">Culturel</TabsTrigger>}
                    <TabsTrigger value="clothing">Vêtements</TabsTrigger>
                    <TabsTrigger value="posture">Posture</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value="face" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_gender} value={selected.avatar_gender} options={AVATAR_VOCAB.gender} onChange={v => patch({ avatar_gender: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_age_range} value={selected.avatar_age_range} options={AVATAR_VOCAB.age_range} onChange={v => patch({ avatar_age_range: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_face_shape} value={selected.avatar_face_shape} options={AVATAR_VOCAB.face_shape} onChange={v => patch({ avatar_face_shape: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_skin_tone} value={selected.avatar_skin_tone} options={AVATAR_VOCAB.skin_tone} onChange={v => patch({ avatar_skin_tone: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_expression} value={selected.avatar_expression} options={AVATAR_VOCAB.expression} onChange={v => patch({ avatar_expression: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("face")} onApply={applySuggestion} />
                    </TabsContent>

                    <TabsContent value="eyes" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_eye_shape} value={selected.avatar_eye_shape} options={AVATAR_VOCAB.eye_shape} onChange={v => patch({ avatar_eye_shape: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_eye_color} value={selected.avatar_eye_color} options={AVATAR_VOCAB.eye_color} onChange={v => patch({ avatar_eye_color: v })} disabled={isLocked} />
                        <SliderField label="Fatigue oculaire (0-5)" value={selected.avatar_tired_level ?? 0} onChange={v => patch({ avatar_tired_level: v })} disabled={isLocked} />
                        <SliderField label="Luminosité émotionnelle (0-5)" value={selected.avatar_emotional_brightness ?? 3} onChange={v => patch({ avatar_emotional_brightness: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("eyes")} onApply={applySuggestion} />
                    </TabsContent>

                    <TabsContent value="hair" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_hair_type} value={selected.avatar_hair_type} options={AVATAR_VOCAB.hair_type} onChange={v => patch({ avatar_hair_type: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_color} value={selected.avatar_hair_color} options={AVATAR_VOCAB.hair_color} onChange={v => patch({ avatar_hair_color: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_length} value={selected.avatar_hair_length} options={AVATAR_VOCAB.hair_length} onChange={v => patch({ avatar_hair_length: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_volume} value={selected.avatar_hair_volume} options={AVATAR_VOCAB.hair_volume} onChange={v => patch({ avatar_hair_volume: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_style} value={selected.avatar_hair_style} options={AVATAR_VOCAB.hair_style} onChange={v => patch({ avatar_hair_style: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("hair")} onApply={applySuggestion} />
                    </TabsContent>

                    {isMan && (
                      <TabsContent value="male" className="mt-0 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <SelectField label={FIELD_LABELS.avatar_beard} value={selected.avatar_beard} options={AVATAR_VOCAB.beard} onChange={v => patch({ avatar_beard: v })} disabled={isLocked} />
                          <SelectField label={FIELD_LABELS.avatar_moustache} value={selected.avatar_moustache} options={AVATAR_VOCAB.moustache} onChange={v => patch({ avatar_moustache: v })} disabled={isLocked} />
                          <SliderField label="Calvitie (0-100%)" value={selected.avatar_bald_level ?? 0} min={0} max={100} step={5} onChange={v => patch({ avatar_bald_level: v })} disabled={isLocked} />
                          <SelectField label={FIELD_LABELS.avatar_hair_recession} value={selected.avatar_hair_recession} options={AVATAR_VOCAB.hair_recession} onChange={v => patch({ avatar_hair_recession: v })} disabled={isLocked} />
                        </div>
                        <RuleList warnings={sectionWarnings("male")} onApply={applySuggestion} />
                      </TabsContent>
                    )}

                    {hasCulture && (
                      <TabsContent value="cultural" className="mt-0 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <SelectField label={FIELD_LABELS.avatar_head_covering} value={selected.avatar_head_covering ?? "none"} options={AVATAR_VOCAB.head_covering} onChange={v => patch({ avatar_head_covering: v })} disabled={isLocked} />
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{FIELD_LABELS.avatar_cultural_style_override}</Label>
                            <Input value={selected.avatar_cultural_style_override ?? ""} onChange={e => patch({ avatar_cultural_style_override: e.target.value })} disabled={isLocked} placeholder="ex. subtle_mediterranean" className="h-9" />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tags : {(selected.culture_tags || []).join(", ") || "—"}
                        </div>
                      </TabsContent>
                    )}

                    <TabsContent value="clothing" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_clothing_style} value={selected.avatar_clothing_style} options={AVATAR_VOCAB.clothing_style} onChange={v => patch({ avatar_clothing_style: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_clothing_color_palette} value={selected.avatar_clothing_color_palette} options={AVATAR_VOCAB.clothing_color_palette} onChange={v => patch({ avatar_clothing_color_palette: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("clothing")} onApply={applySuggestion} />
                    </TabsContent>

                    <TabsContent value="posture" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_posture} value={selected.avatar_posture} options={AVATAR_VOCAB.posture} onChange={v => patch({ avatar_posture: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_mobility_aid} value={selected.avatar_mobility_aid ?? "none"} options={AVATAR_VOCAB.mobility_aid} onChange={v => patch({ avatar_mobility_aid: v })} disabled={isLocked} />
                        <SliderField label="Résilience (0-5)" value={selected.avatar_resilience_level ?? 3} onChange={v => patch({ avatar_resilience_level: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("posture")} onApply={applySuggestion} />
                    </TabsContent>

                    <TabsContent value="social" className="mt-0 space-y-3">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_parent_energy} value={selected.avatar_parent_energy} options={AVATAR_VOCAB.parent_energy} onChange={v => patch({ avatar_parent_energy: v })} disabled={isLocked} />
                        <SliderField label="Fatigue (0-5)" value={selected.avatar_fatigue_level ?? 0} onChange={v => patch({ avatar_fatigue_level: v })} disabled={isLocked} />
                        <SliderField label="Dignité (0-5)" value={selected.avatar_dignity_level ?? 5} onChange={v => patch({ avatar_dignity_level: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("social")} onApply={applySuggestion} />
                    </TabsContent>
                  </div>
                </Tabs>
              </>
            )}
          </section>
        </div>
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Comparaison de versions</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {compareIds.map((id, i) => {
              const v = versions.find(x => x.id === id);
              if (!v) return <div key={i} />;
              return (
                <div key={v.id}>
                  <img src={v.image_url} alt="" className="w-full rounded-lg" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {v.model_used?.split("/")[1]} · QA {v.qa_score ? Math.round(v.qa_score) : "—"}
                    <br />
                    {new Date(v.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightboxUrl} onOpenChange={(o) => !o && setLightboxUrl(null)}>
        <DialogContent className="max-w-2xl p-2">
          {lightboxUrl && <img src={lightboxUrl} alt="" className="w-full rounded" />}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

function RuleList({
  warnings, onApply,
}: { warnings: RuleWarning[]; onApply: (s: Record<string, unknown>) => void }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {warnings.map(w => (
        <div
          key={w.id}
          className={`text-xs p-2 rounded border flex items-start gap-2 ${
            w.severity === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
            w.severity === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
            "bg-sky-50 border-sky-200 text-sky-800"
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

export default AvatarStudio;
