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
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AVATAR_VOCAB, WORKFLOW_LABEL, WORKFLOW_COLOR, WorkflowStatus,
} from "@/lib/avatarTraits";
import { evaluateAvatarRules, RuleWarning } from "@/lib/avatarRules";
import { inferStudioDefaults } from "@/lib/avatarAutoInfer";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import {
  ArrowLeft, Loader2, RefreshCw, Sparkles, ShieldCheck, Lock, Unlock,
  Wand2, History, Eye, AlertTriangle,
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
  const saveTimers = useRef<Record<string, any>>({});

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

  // Auto-refresh while a generation is pending + surface failures clearly
  useEffect(() => {
    if (busy !== "preview" && busy !== "final") return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [busy]);

  // Detect generation failure on the selected beneficiary and report it
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

  const warnings: RuleWarning[] = selected ? evaluateAvatarRules(selected) : [];
  const isLocked = selected?.avatar_workflow_status === "locked";

  const patch = (patchObj: Record<string, any>) => {
    if (!selected) return;
    if (isLocked) {
      toast.error("Avatar verrouillé. Déverrouillez pour modifier.");
      return;
    }
    // Optimistic update
    setBeneficiaries(prev => prev.map(b =>
      b.id === selected.id ? { ...b, ...patchObj } : b,
    ));
    // Debounce save
    if (saveTimers.current[selected.id]) clearTimeout(saveTimers.current[selected.id]);
    saveTimers.current[selected.id] = setTimeout(async () => {
      const { error } = await supabase
        .from("beneficiaries")
        .update(patchObj as any)
        .eq("id", selected.id);
      if (error) toast.error("Échec sauvegarde : " + error.message);
    }, 600);
  };

  const applySuggestion = (s: Record<string, unknown>) => patch(s as any);

  const autoInfer = () => {
    if (!selected) return;
    if (!confirm("Pré-remplir tous les champs depuis le profil ? Les valeurs actuelles seront écrasées.")) return;
    const defaults = inferStudioDefaults(selected);
    patch(defaults);
    toast.success("Attributs déduits depuis le profil");
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Avatar Studio</h1>
            <p className="text-sm text-muted-foreground">
              Édition fine des portraits — attributs, règles, génération IA, workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_380px] gap-4">
          {/* LEFT — beneficiaries list */}
          <aside className="bg-card border rounded-2xl p-3 h-[calc(100vh-160px)] flex flex-col">
            <Input
              placeholder="Rechercher (prénom, région)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2 h-9"
            />
            <div className="flex flex-wrap gap-1 mb-3">
              {(["all", "draft", "generated", "approved", "locked", "failed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "failed" ? "Échec" : WORKFLOW_LABEL[f]}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {loading && <div className="text-sm text-muted-foreground p-2">Chargement…</div>}
              {filtered.map(b => {
                const ws = (b.avatar_workflow_status || "draft") as WorkflowStatus;
                const isSel = b.id === selectedId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isSel ? "bg-primary/10 border border-primary/30" : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <BeneficiaryAvatar
                      name={b.alias_first_name}
                      avatarUrl={b.avatar_url}
                      previewUrl={b.avatar_preview_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.alias_first_name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {b.region} · {b.approx_age} ans
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${WORKFLOW_COLOR[ws]}`}>
                      {WORKFLOW_LABEL[ws]}
                    </Badge>
                  </button>
                );
              })}
              {!loading && filtered.length === 0 && (
                <div className="text-sm text-muted-foreground p-3 text-center">Aucun résultat</div>
              )}
            </div>
          </aside>

          {/* CENTER — attribute editor */}
          <main className="bg-card border rounded-2xl p-5 min-h-[calc(100vh-160px)]">
            {!selected && (
              <div className="text-center text-muted-foreground py-20">
                <Wand2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                Sélectionnez un bénéficiaire pour éditer son portrait.
              </div>
            )}
            {selected && (
              <>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selected.alias_first_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selected.real_first_name} {selected.real_last_name} · {selected.region} · {selected.approx_age} ans
                      {selected.children_count > 0 && ` · ${selected.children_count} enfants`}
                    </p>
                  </div>
                  <Button onClick={autoInfer} variant="outline" size="sm" disabled={isLocked}>
                    <Wand2 className="h-4 w-4 mr-1" />Déduire depuis le profil
                  </Button>
                </div>

                {isLocked && (
                  <div className="mb-4 p-3 rounded-lg border border-slate-300 bg-slate-50 text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />Avatar verrouillé — déverrouillez pour modifier.
                  </div>
                )}

                <Accordion type="multiple" defaultValue={["face", "eyes", "hair"]}>
                  <AccordionItem value="face">
                    <AccordionTrigger>Visage</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_gender} value={selected.avatar_gender} options={AVATAR_VOCAB.gender} onChange={v => patch({ avatar_gender: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_age_range} value={selected.avatar_age_range} options={AVATAR_VOCAB.age_range} onChange={v => patch({ avatar_age_range: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_face_shape} value={selected.avatar_face_shape} options={AVATAR_VOCAB.face_shape} onChange={v => patch({ avatar_face_shape: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_skin_tone} value={selected.avatar_skin_tone} options={AVATAR_VOCAB.skin_tone} onChange={v => patch({ avatar_skin_tone: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_expression} value={selected.avatar_expression} options={AVATAR_VOCAB.expression} onChange={v => patch({ avatar_expression: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("face")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="eyes">
                    <AccordionTrigger>Yeux</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_eye_shape} value={selected.avatar_eye_shape} options={AVATAR_VOCAB.eye_shape} onChange={v => patch({ avatar_eye_shape: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_eye_color} value={selected.avatar_eye_color} options={AVATAR_VOCAB.eye_color} onChange={v => patch({ avatar_eye_color: v })} disabled={isLocked} />
                        <SliderField label="Fatigue oculaire (0-5)" value={selected.avatar_tired_level ?? 0} onChange={v => patch({ avatar_tired_level: v })} disabled={isLocked} />
                        <SliderField label="Luminosité émotionnelle (0-5)" value={selected.avatar_emotional_brightness ?? 3} onChange={v => patch({ avatar_emotional_brightness: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("eyes")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="hair">
                    <AccordionTrigger>Cheveux</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_hair_type} value={selected.avatar_hair_type} options={AVATAR_VOCAB.hair_type} onChange={v => patch({ avatar_hair_type: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_color} value={selected.avatar_hair_color} options={AVATAR_VOCAB.hair_color} onChange={v => patch({ avatar_hair_color: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_length} value={selected.avatar_hair_length} options={AVATAR_VOCAB.hair_length} onChange={v => patch({ avatar_hair_length: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_volume} value={selected.avatar_hair_volume} options={AVATAR_VOCAB.hair_volume} onChange={v => patch({ avatar_hair_volume: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_hair_style} value={selected.avatar_hair_style} options={AVATAR_VOCAB.hair_style} onChange={v => patch({ avatar_hair_style: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("hair")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>

                  {isMan && (
                    <AccordionItem value="male">
                      <AccordionTrigger>Attributs masculins</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          <SelectField label={FIELD_LABELS.avatar_beard} value={selected.avatar_beard} options={AVATAR_VOCAB.beard} onChange={v => patch({ avatar_beard: v })} disabled={isLocked} />
                          <SelectField label={FIELD_LABELS.avatar_moustache} value={selected.avatar_moustache} options={AVATAR_VOCAB.moustache} onChange={v => patch({ avatar_moustache: v })} disabled={isLocked} />
                          <SliderField label="Calvitie (0-100%)" value={selected.avatar_bald_level ?? 0} min={0} max={100} step={5} onChange={v => patch({ avatar_bald_level: v })} disabled={isLocked} />
                          <SelectField label={FIELD_LABELS.avatar_hair_recession} value={selected.avatar_hair_recession} options={AVATAR_VOCAB.hair_recession} onChange={v => patch({ avatar_hair_recession: v })} disabled={isLocked} />
                        </div>
                        <RuleList warnings={sectionWarnings("male")} onApply={applySuggestion} />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {hasCulture && (
                    <AccordionItem value="cultural">
                      <AccordionTrigger>Attributs culturels</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          <SelectField label={FIELD_LABELS.avatar_head_covering} value={selected.avatar_head_covering ?? "none"} options={AVATAR_VOCAB.head_covering} onChange={v => patch({ avatar_head_covering: v })} disabled={isLocked} />
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{FIELD_LABELS.avatar_cultural_style_override}</Label>
                            <Input value={selected.avatar_cultural_style_override ?? ""} onChange={e => patch({ avatar_cultural_style_override: e.target.value })} disabled={isLocked} placeholder="ex. subtle_mediterranean" className="h-9" />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Tags : {(selected.culture_tags || []).join(", ") || "—"}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  <AccordionItem value="clothing">
                    <AccordionTrigger>Vêtements</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_clothing_style} value={selected.avatar_clothing_style} options={AVATAR_VOCAB.clothing_style} onChange={v => patch({ avatar_clothing_style: v })} disabled={isLocked} />
                        <SelectField label={FIELD_LABELS.avatar_clothing_color_palette} value={selected.avatar_clothing_color_palette} options={AVATAR_VOCAB.clothing_color_palette} onChange={v => patch({ avatar_clothing_color_palette: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("clothing")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="posture">
                    <AccordionTrigger>Posture & émotion</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_posture} value={selected.avatar_posture} options={AVATAR_VOCAB.posture} onChange={v => patch({ avatar_posture: v })} disabled={isLocked} />
                        <SliderField label="Résilience (0-5)" value={selected.avatar_resilience_level ?? 3} onChange={v => patch({ avatar_resilience_level: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("posture")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="social">
                    <AccordionTrigger>Contexte social visuel</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
                        <SelectField label={FIELD_LABELS.avatar_parent_energy} value={selected.avatar_parent_energy} options={AVATAR_VOCAB.parent_energy} onChange={v => patch({ avatar_parent_energy: v })} disabled={isLocked} />
                        <SliderField label="Fatigue (0-5)" value={selected.avatar_fatigue_level ?? 0} onChange={v => patch({ avatar_fatigue_level: v })} disabled={isLocked} />
                        <SliderField label="Dignité (0-5)" value={selected.avatar_dignity_level ?? 5} onChange={v => patch({ avatar_dignity_level: v })} disabled={isLocked} />
                      </div>
                      <RuleList warnings={sectionWarnings("social")} onApply={applySuggestion} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </main>

          {/* RIGHT — preview + workflow */}
          <aside className="bg-card border rounded-2xl p-4 h-[calc(100vh-160px)] flex flex-col">
            {!selected && (
              <div className="text-center text-muted-foreground py-12 text-sm">
                Aperçu IA disponible après sélection.
              </div>
            )}
            {selected && (
              <>
                <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-3 relative">
                  {selected.avatar_url || selected.avatar_preview_url ? (
                    <img
                      src={selected.avatar_url || selected.avatar_preview_url}
                      alt={selected.alias_first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Eye className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  {busy && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </div>

                <Badge variant="outline" className={`mb-3 self-start ${WORKFLOW_COLOR[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}`}>
                  {WORKFLOW_LABEL[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}
                  {selected.avatar_qa_score && ` · QA ${Math.round(selected.avatar_qa_score)}`}
                </Badge>

                {selected.avatar_status === "failed" && (
                  <div className="mb-3 text-xs rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-2 py-1.5">
                    {(selected as any).avatar_qa_report?.code === "no_credits"
                      ? "Échec : crédits Lovable AI insuffisants. Rechargez le workspace."
                      : (selected as any).avatar_qa_report?.code === "rate_limited"
                      ? "Échec : trop de requêtes. Réessayez dans 1 minute."
                      : "Dernière génération échouée. Réessayez."}
                  </div>
                )}

                <div className="space-y-2 mb-3">
                  <Label className="text-xs text-muted-foreground">Modèle</Label>
                  <Select value={modelChoice} onValueChange={(v: any) => setModelChoice(v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preview">Nano Banana 2 (aperçu rapide)</SelectItem>
                      <SelectItem value="final">Nano Banana Pro (HD + QA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    onClick={() => generate("preview")}
                    variant="outline" size="sm"
                    disabled={!!busy || isLocked}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />Aperçu
                  </Button>
                  <Button
                    onClick={() => generate("final")}
                    size="sm"
                    disabled={!!busy || isLocked}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />Générer HD
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selected.avatar_workflow_status === "generated" && (
                    <Button onClick={() => setWorkflow("approved")} size="sm" variant="default" className="col-span-2">
                      <ShieldCheck className="h-4 w-4 mr-1" />Approuver
                    </Button>
                  )}
                  {selected.avatar_workflow_status === "approved" && (
                    <Button onClick={() => setWorkflow("locked")} size="sm" variant="secondary" className="col-span-2">
                      <Lock className="h-4 w-4 mr-1" />Verrouiller
                    </Button>
                  )}
                  {selected.avatar_workflow_status === "locked" && (
                    <Button onClick={() => setWorkflow("draft")} size="sm" variant="outline" className="col-span-2">
                      <Unlock className="h-4 w-4 mr-1" />Déverrouiller
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <History className="h-4 w-4" />Versions ({versions.length})
                  </h3>
                  {versions.length >= 2 && (
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { setCompareIds([versions[0].id, versions[1].id]); setCompareOpen(true); }}
                    >
                      Comparer
                    </Button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 space-y-1">
                  {versions.map(v => (
                    <div key={v.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted text-xs">
                      <img src={v.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{v.model_used?.split("/")[1] || "—"}</div>
                        <div className="text-muted-foreground">
                          {new Date(v.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          {v.qa_score && ` · QA ${Math.round(v.qa_score)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2">Aucune version archivée.</div>
                  )}
                </div>
              </>
            )}
          </aside>
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
