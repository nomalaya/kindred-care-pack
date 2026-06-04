import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Tabs removed — replaced by SectionAccordion
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AVATAR_VOCAB, WORKFLOW_LABEL, WORKFLOW_COLOR, WorkflowStatus,
} from "@/lib/avatarTraits";
import { evaluateAvatarRules, RuleWarning } from "@/lib/avatarRules";
import { inferStudioDefaultsWithReasons, type FieldReason } from "@/lib/avatarAutoInfer";
import { ContextPanel } from "@/features/avatar-studio/ContextPanel";
import { InferenceReasonsPanel } from "@/features/avatar-studio/InferenceReasonsPanel";
import { BeneficiaryListPanel } from "@/features/avatar-studio/BeneficiaryListPanel";
import { BatchActionsBar, type BatchProgress } from "@/features/avatar-studio/BatchActionsBar";
import { computePrefillPatch, selectBatchPool, chunk, type BatchScope } from "@/features/avatar-studio/batchPrefill";
import { RuleList } from "@/features/avatar-studio/RuleList";
import { SectionAccordion, type SectionDef } from "@/features/avatar-studio/SectionAccordion";
import {
  FIELD_LABELS, FIELD_ICONS, FIELD_ACCENT, SelectField, SliderField,
} from "@/features/avatar-studio/fields";
import { labelFor } from "@/lib/avatarVocabLabels";

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, Loader2, RefreshCw, Sparkles, ShieldCheck, Lock, Unlock,
  Wand2, History, Eye, AlertTriangle, Keyboard, Check, Search, RotateCcw, Upload,
  Smile, Scissors, User, Globe, Shirt, PersonStanding, Baby, FileText,
  BatteryLow, Sun, CircleDot, LucideIcon, ChevronDown, ExternalLink,
  PanelLeft, Image as ImageIcon, SlidersHorizontal, Info, Trash2, X,
  Crop,
} from "lucide-react";
import { AvatarFramingDialog } from "@/features/avatar-studio/AvatarFramingDialog";
import { readFramingFromRow, isDefaultFraming, framingToTransform } from "@/lib/avatarFraming";


type Beneficiary = any;



const AvatarStudio = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "review" | "done">("all");
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  // panelTab removed — 3-column layout shows Visuel + Attributs side-by-side
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [defaultGenMode, setDefaultGenMode] = useState<"preview" | "final">(
    () => (typeof window !== "undefined" && (localStorage.getItem("avatar-studio-default-mode") as any)) || "final",
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<[string?, string?]>([]);
  const [modelChoice, setModelChoice] = useState<"preview" | "final">("final");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [selectedVersionIds, setSelectedVersionIds] = useState<Set<string>>(new Set());
  const [framingDialogOpen, setFramingDialogOpen] = useState(false);

  const [inferenceReasons, setInferenceReasons] = useState<Record<string, FieldReason[]>>({});
  const saveTimer = useRef<any>(null);
  const pendingPatch = useRef<Record<string, any>>({});
  const searchRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef<string | null>(null);
  busyRef.current = busy;

  const refresh = async () => {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Échec chargement : " + error.message);
      return;
    }
    setBeneficiaries(data || []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh().finally(() => setLoading(false));
  }, [isAdmin]);

  // Realtime : remplace le polling pendant la génération
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("avatar-studio-beneficiaries")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "beneficiaries" },
        (payload) => {
          const next = payload.new as any;
          setBeneficiaries(prev => prev.map(b => (b.id === next.id ? { ...b, ...next } : b)));
          // libère busy si la génération est terminée
          const cur = busyRef.current;
          if (cur === "preview" && next.avatar_status === "preview") setBusy(null);
          if (cur === "final" && next.avatar_status === "validated") setBusy(null);
          if (next.avatar_status === "failed" && (cur === "preview" || cur === "final")) {
            const r: any = next.avatar_qa_report || {};
            if (r.code === "no_credits") toast.error("Crédits Lovable AI insuffisants.");
            else if (r.code === "rate_limited") toast.error("Trop de requêtes IA. Réessayez dans 1 minute.");
            else toast.error("Échec génération : " + (r.error || "erreur"));
            setBusy(null);
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedId) { setVersions([]); setInferenceReasons({}); setSelectedVersionIds(new Set()); return; }
    setInferenceReasons({}); // reset à chaque changement de bénéficiaire
    setSelectedVersionIds(new Set());
    (async () => {
      const { data } = await supabase
        .from("avatar_versions" as any)
        .select("*")
        .eq("beneficiary_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(20);
      setVersions((data as any[]) || []);
    })();
  }, [selectedId]);


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
    if (filter === "todo") {
      pool = pool.filter(b => {
        const ws = b.avatar_workflow_status || "draft";
        return ws === "draft" || b.avatar_status === "failed";
      });
      if (showFailedOnly) pool = pool.filter(b => b.avatar_status === "failed");
    } else if (filter === "review") {
      pool = pool.filter(b => (b.avatar_workflow_status || "draft") === "generated");
    } else if (filter === "done") {
      pool = pool.filter(b => {
        const ws = b.avatar_workflow_status || "draft";
        return ws === "approved" || ws === "locked";
      });
    }
    return pool;
  }, [beneficiaries, search, filter, showFailedOnly]);

  const stats = useMemo(() => {
    const s = { draft: 0, generated: 0, approved: 0, locked: 0, failed: 0 };
    for (const b of beneficiaries) {
      const ws = (b.avatar_workflow_status || "draft") as WorkflowStatus;
      s[ws] = (s[ws] ?? 0) + 1;
      if (b.avatar_status === "failed") s.failed += 1;
    }
    return {
      ...s,
      todo: s.draft + s.failed,
      review: s.generated,
      done: s.approved + s.locked,
    };
  }, [beneficiaries]);

  const warnings: RuleWarning[] = selected ? evaluateAvatarRules(selected) : [];
  const isLocked = selected?.avatar_workflow_status === "locked";
  const dignityBlocked = (selected?.avatar_dignity_level ?? 5) < 3;

  // Patch avec accumulation : fusionne tous les diffs <600ms dans un seul UPDATE
  const patch = (patchObj: Record<string, any>, opts: { silent?: boolean } = {}) => {
    if (!selected) return;
    if (isLocked) {
      toast.error("Avatar verrouillé. Déverrouillez pour modifier.");
      return;
    }
    setBeneficiaries(prev => prev.map(b =>
      b.id === selected.id ? { ...b, ...patchObj } : b,
    ));
    pendingPatch.current = { ...pendingPatch.current, ...patchObj };
    if (!opts.silent) setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const targetId = selected.id;
    saveTimer.current = setTimeout(async () => {
      const toSend = pendingPatch.current;
      pendingPatch.current = {};
      const { error } = await supabase
        .from("beneficiaries")
        .update(toSend as any)
        .eq("id", targetId);
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
    if (mode === "force" && !confirm("Re-déduire et écraser tous les attributs avatar à partir du récit ? Les modifications manuelles seront perdues.")) {
      return;
    }
    const { reasons } = inferStudioDefaultsWithReasons(selected);
    const toApply: Record<string, any> = computePrefillPatch(selected, mode);

    if (Object.keys(toApply).length === 0) {
      toast.info("Aucun champ vide à pré-remplir. Utilisez « Tout re-déduire » pour écraser.");
      return;
    }
    // ne conserve que les raisons pour les champs réellement appliqués
    const filteredReasons = Object.fromEntries(
      Object.entries(reasons).filter(([k]) => k in toApply),
    );
    setInferenceReasons(filteredReasons);
    patch(toApply);
    toast.success(
      mode === "force"
        ? "Attributs re-déduits depuis le récit"
        : `${Object.keys(toApply).length} champ(s) pré-rempli(s) depuis le récit`,
    );
  };


  // Auto-prefill genre + tranche d'âge à la sélection (depuis prénom/age connus)
  const autoPrefilledFor = useRef<string | null>(null);
  useEffect(() => {
    if (!selected || isLocked) return;
    if (autoPrefilledFor.current === selected.id) return;
    if (selected.avatar_gender && selected.avatar_age_range) {
      autoPrefilledFor.current = selected.id;
      return;
    }
    const { values, reasons } = inferStudioDefaultsWithReasons(selected);
    const toApply: Record<string, any> = {};
    const keptReasons: Record<string, FieldReason[]> = {};
    for (const key of ["avatar_gender", "avatar_age_range"] as const) {
      const cur = (selected as any)[key];
      const vocabKey = key.replace(/^avatar_/, "") as keyof typeof AVATAR_VOCAB;
      const vocab = (AVATAR_VOCAB as any)[vocabKey] as string[] | undefined;
      const isEmpty = cur === null || cur === undefined || cur === "";
      const isInvalid = !isEmpty && Array.isArray(vocab) && typeof cur === "string" && !vocab.includes(cur);
      if ((isEmpty || isInvalid) && values[key]) {
        toApply[key] = values[key];
        if (reasons[key]) keptReasons[key] = reasons[key];
      }
    }

    if (Object.keys(toApply).length > 0) {
      autoPrefilledFor.current = selected.id;
      setInferenceReasons(prev => ({ ...prev, ...keptReasons }));
      patch(toApply, { silent: true });
    } else {
      autoPrefilledFor.current = selected.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.avatar_gender, selected?.avatar_age_range, isLocked]);


  // Auto-route: if the selected beneficiary already has an approved avatar
  // (avatar_url + workflow approved/locked OR an avatar_source_url snapshot),
  // we switch to the edit pipeline so only the changed attributes are altered.
  // Otherwise, a full text-to-image generation is performed.
  const isEditCapable = !!selected
    && !!((selected as any).avatar_url || (selected as any).avatar_source_url)
    && !!((selected as any).avatar_generated_traits);

  const generate = async (mode: "preview" | "final") => {
    if (!selected) return;
    if (dignityBlocked) {
      toast.error("Génération bloquée : niveau de dignité < 3");
      return;
    }
    const effectiveMode: "preview" | "final" | "edit" | "edit_hd" = isEditCapable
      ? (mode === "preview" ? "edit" : "edit_hd")
      : mode;
    setBusy(mode);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { beneficiary_id: selected.id, mode: effectiveMode, force: true },
      });
      if (error) throw error;
      const skipped = (data as any)?.skipped;
      if (skipped === true) {
        const reason = (data as any)?.reason;
        if (reason === "no_changes") {
          toast.info("Aucune modification détectée — l'avatar reste inchangé.");
        } else {
          toast.info(`Génération ignorée (${reason ?? "raison inconnue"}).`);
        }
        setBusy(null);
        return;
      }
      const wasEdited = (data as any)?.edited === true;
      const diffLabels: string[] = ((data as any)?.diff ?? []).map((d: any) => d.label);
      const baseMsg = effectiveMode === "edit" || effectiveMode === "edit_hd"
        ? `Édition contrôlée en cours${diffLabels.length ? ` (${diffLabels.join(", ")})` : ""}…`
        : (mode === "preview" ? "Aperçu en génération…" : "Portrait HD en génération…");
      toast.success(baseMsg);
      void wasEdited;
      setBeneficiaries(prev => prev.map(b =>
        b.id === selected.id ? { ...b, avatar_status: "pending" } : b,
      ));
      // Filet de sécurité si le Realtime ne renvoie rien dans les 60s
      // (édition + auto-clean peut prendre un peu plus de temps que le preview seul)
      setTimeout(() => {
        if (busyRef.current === mode) {
          refresh();
          setBusy(null);
        }
      }, 60000);
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "échec"));
      setBusy(null);
    }
  };


  // Idempotent : remplace l'arrière-plan de l'avatar existant par du blanc pur
  // pour que les fonds importés (bucket avatar-backgrounds) puissent passer
  // derrière la silhouette en CSS.
  const cleanBackground = async (id?: string) => {
    const targetId = id || selected?.id;
    if (!targetId) return;
    setBusy("clean");
    try {
      const { data, error } = await supabase.functions.invoke("clean-avatar-background", {
        body: { beneficiary_id: targetId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Fond nettoyé — votre fond importé est désormais visible.");
      await refresh();
    } catch (e: any) {
      toast.error("Nettoyage impossible : " + (e?.message || "erreur inconnue"));
    } finally {
      setBusy(null);
    }
  };



  // ===== Batch : Pré-remplir + Générer =====
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({ done: 0, total: 0, failed: 0, running: false });
  const batchAbortRef = useRef(false);

  const runBatchPrefillAndGenerate = async (opts: {
    scope: BatchScope; mode: "fill" | "force"; chunkSize: number; maxItems: number;
  }) => {
    const { eligible } = selectBatchPool(filtered, opts.scope);
    const targets = eligible.slice(0, opts.maxItems);
    if (targets.length === 0) {
      toast.info("Aucun bénéficiaire éligible.");
      return;
    }
    batchAbortRef.current = false;
    setBatchProgress({ done: 0, total: targets.length, failed: 0, running: true });
    toast.info(`Lot lancé sur ${targets.length} bénéficiaire(s).`);

    let done = 0;
    let failed = 0;

    for (const group of chunk(targets, opts.chunkSize)) {
      if (batchAbortRef.current) break;

      // 1) Pré-remplissage : UPDATE par bénéficiaire (uniquement si patch non vide)
      const updates = await Promise.all(group.map(async (b) => {
        try {
          const patchObj = computePrefillPatch(b, opts.mode);
          if (Object.keys(patchObj).length > 0) {
            const { error } = await supabase.from("beneficiaries").update(patchObj as any).eq("id", b.id);
            if (error) throw error;
            setBeneficiaries(prev => prev.map(x => x.id === b.id ? { ...x, ...patchObj } : x));
          }
          return { id: b.id, ok: true };
        } catch (e) {
          return { id: b.id, ok: false };
        }
      }));

      const okIds = updates.filter(u => u.ok).map(u => u.id);
      failed += updates.length - okIds.length;

      // 2) Marquer pending + déclencher la génération HD pour le paquet
      if (okIds.length > 0) {
        try {
          await supabase.from("beneficiaries").update({ avatar_status: "pending" } as any).in("id", okIds);
          setBeneficiaries(prev => prev.map(b => okIds.includes(b.id) ? { ...b, avatar_status: "pending" } : b));
          const { error } = await supabase.functions.invoke("generate-avatar-batch", {
            body: { beneficiary_ids: okIds, mode: "final" },
          });
          if (error) {
            failed += okIds.length;
          } else {
            done += okIds.length;
          }
        } catch {
          failed += okIds.length;
        }
      }

      setBatchProgress(p => ({ ...p, done: done, failed }));
      // léger délai pour soulager l'edge function
      await new Promise(r => setTimeout(r, 300));
    }

    setBatchProgress(p => ({ ...p, running: false }));
    if (batchAbortRef.current) {
      toast.warning(`Lot interrompu — ${done}/${targets.length} traité(s), ${failed} échec(s).`);
    } else {
      toast.success(`Lot terminé — ${done}/${targets.length} traité(s)${failed > 0 ? `, ${failed} échec(s)` : ""}.`);
    }
    refresh();
  };

  const stopBatch = () => {
    batchAbortRef.current = true;
    toast.info("Arrêt demandé — le paquet en cours va se terminer.");
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
    if (!confirm("Cette image va remplacer l'avatar actif sans contrôle qualité IA. Continuer ?")) {
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

  const toggleVersionSelect = (id: string) => {
    setSelectedVersionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteVersions = async (ids: string[]) => {
    if (!ids.length) return;
    const activeUrl = selected?.avatar_url;
    const targetsActive = versions.some(v => ids.includes(v.id) && v.image_url === activeUrl);
    const msg = ids.length === 1
      ? `Supprimer définitivement cette version ?${targetsActive ? "\n\n⚠ C'est la version actuellement active de l'avatar. L'image affichée restera inchangée mais ne sera plus archivée." : ""}`
      : `Supprimer définitivement ${ids.length} versions ?${targetsActive ? "\n\n⚠ La version actuellement active fait partie de la sélection." : ""}`;
    if (!confirm(msg)) return;
    const { error } = await supabase.from("avatar_versions" as any).delete().in("id", ids);
    if (error) {
      toast.error("Échec de la suppression : " + error.message);
      return;
    }
    setVersions(prev => prev.filter(v => !ids.includes(v.id)));
    setSelectedVersionIds(new Set());
    toast.success(ids.length === 1 ? "Version supprimée" : `${ids.length} versions supprimées`);
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

  // Scroll active beneficiary row into view (keyboard nav or external selection)
  useEffect(() => {
    if (!selectedId) return;
    const el = document.querySelector(`[data-beneficiary-row="${selectedId}"]`);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedId]);

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

            <div className="flex-1" />

            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={searchRef}
                placeholder="Recherche (/  pour focus)"
                aria-label="Rechercher un bénéficiaire"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-7 w-64 text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 border rounded-md p-0.5" role="group" aria-label="Filtrer par étape">
                {([
                  { key: "all", label: "Tous", count: beneficiaries.length },
                  { key: "todo", label: "À faire", count: stats.todo },
                  { key: "review", label: "À valider", count: stats.review },
                  { key: "done", label: "Validés", count: stats.done },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    aria-pressed={filter === f.key}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      filter === f.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {f.label} <span className="opacity-70 ml-0.5">{f.count}</span>
                  </button>
                ))}
              </div>
              {filter === "todo" && stats.failed > 0 && (
                <button
                  onClick={() => setShowFailedOnly(v => !v)}
                  aria-pressed={showFailedOnly}
                  className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                    showFailedOnly ? "bg-destructive/10 border-destructive/40 text-destructive" : "hover:bg-muted border-transparent"
                  }`}
                  title="Filtrer uniquement les échecs de génération"
                >
                  <AlertTriangle className="inline h-3 w-3 mr-0.5" />Échecs ({stats.failed})
                </button>
              )}
            </div>


            <BatchActionsBar
              pool={filtered}
              progress={batchProgress}
              onLaunch={runBatchPrefillAndGenerate}
              onStop={stopBatch}
            />

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

        {/* MAIN — 3 columns: list + Visuel + Attributs (always visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_320px_1fr] gap-3 h-[calc(100vh-120px)]">
          {/* LEFT — list (desktop only) */}
          <div className="hidden lg:flex flex-col min-h-0">
            <BeneficiaryListPanel
              filtered={filtered}
              loading={loading}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Mobile list drawer */}
          <Sheet open={listSheetOpen} onOpenChange={setListSheetOpen}>
            <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
              <SheetHeader className="p-3 border-b shrink-0">
                <SheetTitle className="text-sm">Bénéficiaires</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0">
                <BeneficiaryListPanel
                  filtered={filtered}
                  loading={loading}
                  selectedId={selectedId}
                  onSelect={(id) => { setSelectedId(id); setListSheetOpen(false); }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {!selected ? (
            <section className="lg:col-span-2 bg-card border rounded-xl flex items-center justify-center text-center text-muted-foreground text-sm p-6 min-h-0">
              <div>
                <Wand2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                Sélectionnez un bénéficiaire à gauche
                <div className="lg:hidden mt-3">
                  <Button size="sm" variant="outline" onClick={() => setListSheetOpen(true)}>
                    <PanelLeft className="h-3.5 w-3.5 mr-1" />Ouvrir la liste
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* ===== MIDDLE — VISUEL ===== */}
              <section className="bg-card border rounded-xl overflow-hidden flex flex-col min-h-0">
                {/* Sticky header — bénéficiaire + badges + fiche */}
                <div className="sticky top-0 z-10 px-3 py-2 border-b bg-card flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={() => setListSheetOpen(true)}
                    aria-label="Ouvrir la liste"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{selected.alias_first_name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {selected.region} · {selected.approx_age}a
                      {selected.children_count > 0 && ` · ${selected.children_count} enf.`}
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${WORKFLOW_COLOR[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}`}>
                    {WORKFLOW_LABEL[(selected.avatar_workflow_status || "draft") as WorkflowStatus]}
                  </Badge>
                  <a
                    href={`/donate/${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ouvre la fiche telle qu'elle apparaît dans le parcours donateur"
                  >
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* Image with overlays — remplit la colonne */}
                  <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden relative group">
                    {selected.avatar_url || selected.avatar_preview_url ? (
                      <img
                        src={selected.avatar_url || selected.avatar_preview_url}
                        alt={selected.alias_first_name}
                        className="w-full h-full object-cover cursor-zoom-in"
                        style={framingToTransform(readFramingFromRow(selected))}
                        onClick={() => setLightboxUrl(selected.avatar_url || selected.avatar_preview_url)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Eye className="h-10 w-10 opacity-40" />
                      </div>
                    )}

                    {/* Overlay: clean background */}
                    {selected.avatar_url && !busy && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => cleanBackground()}
                            size="icon"
                            variant="secondary"
                            disabled={!!busy || isLocked}
                            className="absolute top-2 right-2 h-8 w-8 shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            aria-label="Nettoyer le fond de l'avatar"
                          >
                            {busy === "clean" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Scissors className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[220px]">
                          Nettoyer le fond — détoure et remplace par blanc pur pour laisser passer votre fond importé.
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Debug badge as tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="absolute bottom-2 left-2 bg-background/80 backdrop-blur rounded-full h-6 w-6 inline-flex items-center justify-center text-[10px] cursor-help opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-[260px]">
                        Style : cartoon illustré storybook · fond contextuel flou
                        {selected.avatar_model_used ? <><br />Modèle : {selected.avatar_model_used.split("/")[1] || selected.avatar_model_used}</> : null}
                      </TooltipContent>
                    </Tooltip>

                    {busy && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-1" />
                          <div className="text-xs">{busy === "preview" ? "Aperçu…" : busy === "final" ? "HD…" : busy === "clean" ? "Nettoyage…" : "Import…"}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Failed banner */}
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

                  {/* Unified Generate split-button */}
                  <div className="flex gap-1.5 w-full">
                    <Button
                      onClick={() => generate(defaultGenMode)}
                      size="sm"
                      disabled={!!busy || isLocked || dignityBlocked}
                      className="flex-1 justify-start"
                      aria-label={defaultGenMode === "preview" ? "Générer un aperçu" : "Générer en HD"}
                    >
                      {defaultGenMode === "preview" ? <RefreshCw className="h-3.5 w-3.5 mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                      <span className="flex-1 text-left">
                        {defaultGenMode === "preview" ? "Générer un aperçu" : "Générer en HD"}
                      </span>
                      <kbd className="ml-2 text-[10px] opacity-70 bg-primary-foreground/10 px-1 rounded">
                        {defaultGenMode === "preview" ? "P" : "G"}
                      </kbd>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!!busy} aria-label="Choisir le mode de génération">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => {
                            setDefaultGenMode("preview");
                            try { localStorage.setItem("avatar-studio-default-mode", "preview"); } catch {}
                            generate("preview");
                          }}
                          disabled={isLocked || dignityBlocked}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-2" />
                          <div className="flex-1">
                            <div>Aperçu rapide</div>
                            <div className="text-[10px] text-muted-foreground">Nano Banana 2 · économique</div>
                          </div>
                          <kbd className="ml-2 text-[10px] opacity-60">P</kbd>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDefaultGenMode("final");
                            try { localStorage.setItem("avatar-studio-default-mode", "final"); } catch {}
                            generate("final");
                          }}
                          disabled={isLocked || dignityBlocked}
                          className="text-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-2" />
                          <div className="flex-1">
                            <div>Portrait HD</div>
                            <div className="text-[10px] text-muted-foreground">Nano Banana Pro · qualité finale</div>
                          </div>
                          <kbd className="ml-2 text-[10px] opacity-60">G</kbd>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => importInputRef.current?.click()}
                          disabled={isLocked}
                          className="text-xs"
                        >
                          <Upload className="h-3.5 w-3.5 mr-2" />
                          <div className="flex-1">
                            <div>Importer une image</div>
                            <div className="text-[10px] text-muted-foreground">PNG/JPG/WEBP — sans contrôle IA</div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  </div>

                  {/* Indicateur de mode : création complète vs édition contrôlée */}
                  <div
                    className={`text-[11px] rounded-md px-2 py-1.5 border ${
                      isEditCapable
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                    title={
                      isEditCapable
                        ? "L'avatar existant sert de référence. Pose, cadrage et fond sont préservés ; seuls les attributs modifiés depuis la dernière génération sont retouchés."
                        : "Aucune référence visuelle — création complète depuis les attributs."
                    }
                  >
                    {isEditCapable
                      ? "✏️ Édition contrôlée — basée sur l'avatar approuvé"
                      : "🎨 Création complète — première génération"}
                    <span className="block text-[10px] opacity-70 mt-0.5">
                      Le fond importé sera visible automatiquement après génération.
                    </span>
                  </div>



                  {(selected.avatar_url || selected.avatar_preview_url) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setFramingDialogOpen(true)}
                      disabled={isLocked}
                    >
                      <Crop className="h-3.5 w-3.5 mr-2" />
                      <span className="flex-1 text-left">Ajuster le cadrage</span>
                      {!isDefaultFraming(readFramingFromRow(selected)) && (
                        <span className="text-[10px] text-muted-foreground">modifié</span>
                      )}
                    </Button>
                  )}

                  {dignityBlocked && (
                    <div className="text-xs rounded-md border border-[hsl(var(--status-failed-border))] bg-[hsl(var(--status-failed-bg))] text-[hsl(var(--status-failed-fg))] px-2 py-1.5 flex items-start gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div>Dignité {selected.avatar_dignity_level}/5 — génération bloquée. Augmentez le niveau dans la section Social.</div>
                    </div>
                  )}

                  {/* Versions carousel */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <h3 className="text-xs font-medium flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                        <History className="h-3 w-3" />Versions ({versions.length})
                      </h3>
                      <div className="flex items-center gap-1">
                        {selectedVersionIds.size > 0 ? (
                          <>
                            <span className="text-xs text-muted-foreground">{selectedVersionIds.size} sél.</span>
                            <Button
                              size="sm" variant="ghost" className="h-6 text-xs"
                              onClick={() => setSelectedVersionIds(new Set())}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm" variant="destructive" className="h-6 text-xs"
                              onClick={() => deleteVersions(Array.from(selectedVersionIds))}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />Suppr.
                            </Button>
                          </>
                        ) : (
                          versions.length >= 2 && (
                            <Button
                              size="sm" variant="ghost" className="h-6 text-xs"
                              onClick={() => { setCompareIds([versions[0].id, versions[1].id]); setCompareOpen(true); }}
                            >
                              Comparer
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                    {versions.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-md">Aucune version archivée.</div>
                    ) : (
                      <div className="flex gap-1.5 overflow-x-auto pb-2 snap-x scroll-pl-1 -mx-1 px-1">
                        {versions.map(v => {
                          const isActive = selected.avatar_url === v.image_url;
                          const url = v.image_url || "";
                          const isPreview = url.includes("/preview-") || url.includes("/preview/");
                          const isHD = !isPreview && (!!v.qa_score || url.includes("/final-"));
                          const isChecked = selectedVersionIds.has(v.id);
                          const selectionMode = selectedVersionIds.size > 0;
                          return (
                            <div
                              key={v.id}
                              className={`relative w-20 aspect-square shrink-0 snap-start rounded overflow-hidden bg-muted group ${
                                isChecked ? "ring-2 ring-destructive" :
                                isActive ? "ring-2 ring-primary" : isHD ? "hover:ring-2 hover:ring-primary/50" : "hover:ring-2 hover:ring-amber-400/50"
                              }`}
                              title={`${isHD ? "HD" : "Aperçu"} · ${v.model_used?.split("/")[1] || ""} · QA ${v.qa_score ? Math.round(v.qa_score) : "—"}`}
                            >
                              <button
                                onClick={(e) => {
                                  if (selectionMode || e.shiftKey) {
                                    e.preventDefault();
                                    toggleVersionSelect(v.id);
                                  } else {
                                    setLightboxUrl(v.image_url);
                                  }
                                }}
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
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleVersionSelect(v.id); }}
                                className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-opacity ${
                                  isChecked
                                    ? "bg-destructive border-destructive text-destructive-foreground opacity-100"
                                    : "bg-background/80 border-background/80 text-foreground opacity-0 group-hover:opacity-100"
                                }`}
                                title={isChecked ? "Désélectionner" : "Sélectionner pour suppression"}
                                aria-label={isChecked ? "Désélectionner" : "Sélectionner"}
                              >
                                {isChecked && <Check className="h-3 w-3" />}
                              </button>
                              {!selectionMode && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteVersions([v.id]); }}
                                  className="absolute top-1 right-7 w-5 h-5 rounded bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Supprimer cette version"
                                  aria-label="Supprimer cette version"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                              {!isActive && !selectionMode && (
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky workflow footer */}
                {(() => {
                  const ws = (selected.avatar_workflow_status || "draft") as WorkflowStatus;
                  const hasImage = !!(selected.avatar_url || selected.avatar_preview_url);
                  type Cfg = { label: string; icon: LucideIcon; variant: "default" | "secondary" | "outline"; onClick: () => void; hint: string | null; shortcut?: string };
                  let main: Cfg;
                  if (ws === "approved") {
                    main = { label: "Verrouiller", icon: Lock, variant: "secondary", onClick: () => setWorkflow("locked"), hint: workflowHint("lock", ws, hasImage), shortcut: "L" };
                  } else if (ws === "locked") {
                    main = { label: "Déverrouiller", icon: Unlock, variant: "outline", onClick: () => setWorkflow("draft"), hint: workflowHint("unlock", ws, hasImage) };
                  } else {
                    main = { label: "Approuver", icon: ShieldCheck, variant: "default", onClick: () => setWorkflow("approved"), hint: workflowHint("approve", ws, hasImage), shortcut: "A" };
                  }
                  const showUndo = ws === "approved";
                  const MainIcon = main.icon;
                  const mainBtn = (
                    <Button
                      onClick={main.onClick}
                      size="sm"
                      variant={main.variant}
                      disabled={!!main.hint}
                      className="flex-1"
                    >
                      <MainIcon className="h-3.5 w-3.5 mr-1" />{main.label}
                      {main.shortcut && !main.hint && (
                        <kbd className="ml-2 text-[10px] opacity-70 bg-primary-foreground/10 px-1 rounded">{main.shortcut}</kbd>
                      )}
                    </Button>
                  );
                  return (
                    <div className="px-3 py-2 border-t bg-card/95 backdrop-blur shrink-0">
                      <div className="flex gap-1.5">
                        {main.hint ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="flex-1 inline-flex">{mainBtn}</span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">{main.hint}</TooltipContent>
                          </Tooltip>
                        ) : mainBtn}
                        {showUndo && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => setWorkflow("generated")}
                                size="sm"
                                variant="ghost"
                                aria-label="Revenir à l'état généré"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Retirer l'approbation</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </section>

              {/* ===== RIGHT — ATTRIBUTS ===== */}
              <section className="bg-card border rounded-xl overflow-hidden flex flex-col min-h-0">
                <div className="px-3 py-2 border-b flex items-center gap-1.5 bg-muted/20 shrink-0">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-auto flex items-center gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" />Attributs
                  </h2>
                  {selected.avatar_qa_score && (
                    <Badge variant="outline" className="h-6 text-[10px]">QA {Math.round(selected.avatar_qa_score)}</Badge>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" title="Contexte psychosocial">
                        <FileText className="h-3.5 w-3.5 mr-1" />Contexte
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[420px] p-0">
                      <ContextPanel
                        shortStory={selected.short_story ?? null}
                        emotionalSentence={selected.emotional_sentence ?? null}
                        privateNotes={(selected as any).avatar_private_notes ?? null}
                        disabled={isLocked}
                        onSave={async (p) => {
                          const { error } = await supabase.from("beneficiaries").update(p as any).eq("id", selected.id);
                          if (error) { toast.error("Échec : " + error.message); return; }
                          setBeneficiaries(prev => prev.map(b => b.id === selected.id ? { ...b, ...p } : b));
                          toast.success("Contexte enregistré");
                        }}
                        onReinferAndSave={async (p) => {
                          const { error } = await supabase.from("beneficiaries").update(p as any).eq("id", selected.id);
                          if (error) { toast.error("Échec : " + error.message); return; }
                          const updated = { ...selected, ...p };
                          setBeneficiaries(prev => prev.map(b => b.id === selected.id ? updated : b));
                          const { values, reasons } = inferStudioDefaultsWithReasons(updated as any);
                          setInferenceReasons(reasons);
                          await supabase.from("beneficiaries").update(values as any).eq("id", selected.id);
                          setBeneficiaries(prev => prev.map(b => b.id === selected.id ? { ...b, ...p, ...values } : b));
                          toast.success("Contexte enregistré et attributs re-déduits");
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  {Object.keys(inferenceReasons).length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary" title="Pourquoi ces choix ?">
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          {Object.keys(inferenceReasons).length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[360px] p-0">
                        <InferenceReasonsPanel reasons={inferenceReasons} />
                      </PopoverContent>
                    </Popover>
                  )}

                  <Button onClick={() => autoInfer("fill")} variant="outline" size="sm" disabled={isLocked} title="Pré-remplir les champs vides depuis le récit">
                    <Wand2 className="h-3.5 w-3.5 mr-1" />Pré-remplir
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLocked} title="Actions avancées" aria-label="Actions avancées">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => autoInfer("force")} className="text-xs">
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />Tout re-déduire (écrase manuel)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isLocked && (
                  <div className="mx-3 mt-3 p-2 rounded-md border bg-[hsl(var(--status-locked-bg))] text-[hsl(var(--status-locked-fg))] border-[hsl(var(--status-locked-border))] text-xs flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />Avatar verrouillé — déverrouillez pour modifier.
                  </div>
                )}

                {/* SECTIONS — accordion */}
                <div className="flex-1 overflow-y-auto">
                  {(() => {
                    const countFilled = (keys: string[]) =>
                      keys.filter(k => {
                        const v = (selected as any)[k];
                        return v !== null && v !== undefined && v !== "" && v !== "none";
                      }).length;

                    const faceKeys = [
                      "avatar_gender", "avatar_age_range", "avatar_face_shape",
                      "avatar_skin_tone", "avatar_body_type", "avatar_expression",
                      "avatar_eye_shape", "avatar_eye_color",
                    ];
                    const hairKeys = [
                      "avatar_hair_type", "avatar_hair_color", "avatar_hair_length",
                      "avatar_hair_volume", "avatar_hair_style",
                      ...(isMan ? ["avatar_beard", "avatar_moustache", "avatar_hair_recession"] : []),
                    ];
                    const clothingKeys = [
                      "avatar_clothing_style", "avatar_clothing_color_palette",
                      "avatar_posture", "avatar_mobility_aid",
                    ];

                    const isWoman = selected?.avatar_gender === "woman";
                    const culturalKeys = ["avatar_head_covering", ...(isWoman ? ["avatar_forehead_mark"] : []), "avatar_cultural_style_override"];
                    const socialKeys = ["avatar_parent_energy"];

                    const sections: SectionDef[] = [
                      {
                        id: "visage",
                        label: "Visage & regard",
                        icon: Smile,
                        filled: countFilled(faceKeys),
                        total: faceKeys.length,
                        errors: warnings.filter(w => (w.section === "face" || w.section === "eyes") && w.severity === "error").length,
                        warnings: warnings.filter(w => (w.section === "face" || w.section === "eyes") && w.severity === "warning").length,
                        content: (
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Visage</div>
                              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                <SelectField icon={FIELD_ICONS.avatar_gender} label={FIELD_LABELS.avatar_gender} value={selected.avatar_gender} options={AVATAR_VOCAB.gender} onChange={v => patch({ avatar_gender: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_gender} labelFor={labelFor("gender")} />
                                <SelectField icon={FIELD_ICONS.avatar_age_range} label={FIELD_LABELS.avatar_age_range} value={selected.avatar_age_range} options={AVATAR_VOCAB.age_range} onChange={v => patch({ avatar_age_range: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_age_range} labelFor={labelFor("age_range")} />
                                <SelectField icon={FIELD_ICONS.avatar_face_shape} label={FIELD_LABELS.avatar_face_shape} value={selected.avatar_face_shape} options={AVATAR_VOCAB.face_shape} onChange={v => patch({ avatar_face_shape: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_face_shape} labelFor={labelFor("face_shape")} />
                                <SelectField icon={FIELD_ICONS.avatar_nose} label={FIELD_LABELS.avatar_nose} value={(selected as any).avatar_nose} options={AVATAR_VOCAB.nose} onChange={v => patch({ avatar_nose: v } as any)} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_nose} labelFor={labelFor("nose")} />
                                <SelectField icon={FIELD_ICONS.avatar_skin_tone} label={FIELD_LABELS.avatar_skin_tone} value={selected.avatar_skin_tone} options={AVATAR_VOCAB.skin_tone} onChange={v => patch({ avatar_skin_tone: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_skin_tone} labelFor={labelFor("skin_tone")} />
                                <SelectField icon={FIELD_ICONS.avatar_body_type} label={FIELD_LABELS.avatar_body_type} value={(selected as any).avatar_body_type} options={AVATAR_VOCAB.body_type} onChange={v => patch({ avatar_body_type: v } as any)} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_body_type} labelFor={labelFor("body_type")} />
                                <SelectField icon={FIELD_ICONS.avatar_expression} label={FIELD_LABELS.avatar_expression} value={selected.avatar_expression} options={AVATAR_VOCAB.expression} onChange={v => patch({ avatar_expression: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_expression} labelFor={labelFor("expression")} />
                              </div>
                              <RuleList warnings={sectionWarnings("face")} onApply={applySuggestion} />
                            </div>

                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Yeux & regard</div>
                              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                <SelectField icon={FIELD_ICONS.avatar_eye_shape} label={FIELD_LABELS.avatar_eye_shape} value={selected.avatar_eye_shape} options={AVATAR_VOCAB.eye_shape} onChange={v => patch({ avatar_eye_shape: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_eye_shape} labelFor={labelFor("eye_shape")} />
                                <SelectField icon={FIELD_ICONS.avatar_eye_color} label={FIELD_LABELS.avatar_eye_color} value={selected.avatar_eye_color} options={AVATAR_VOCAB.eye_color} onChange={v => patch({ avatar_eye_color: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_eye_color} labelFor={labelFor("eye_color")} />
                                <SliderField icon={BatteryLow} label="Fatigue oculaire (0-5)" value={selected.avatar_tired_level ?? 0} onChange={v => patch({ avatar_tired_level: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_tired_level} />
                                <SliderField icon={Sun} label="Luminosité émotionnelle (0-5)" value={selected.avatar_emotional_brightness ?? 3} onChange={v => patch({ avatar_emotional_brightness: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_emotional_brightness} />
                              </div>
                              <RuleList warnings={sectionWarnings("eyes")} onApply={applySuggestion} />
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: "cheveux",
                        label: "Cheveux & pilosité",
                        icon: Scissors,
                        filled: countFilled(hairKeys),
                        total: hairKeys.length,
                        errors: warnings.filter(w => (w.section === "hair" || w.section === "male") && w.severity === "error").length,
                        warnings: warnings.filter(w => (w.section === "hair" || w.section === "male") && w.severity === "warning").length,
                        content: (
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Cheveux</div>
                              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                <SelectField icon={FIELD_ICONS.avatar_hair_type} label={FIELD_LABELS.avatar_hair_type} value={selected.avatar_hair_type} options={AVATAR_VOCAB.hair_type} onChange={v => patch({ avatar_hair_type: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_type} labelFor={labelFor("hair_type")} />
                                <SelectField icon={FIELD_ICONS.avatar_hair_color} label={FIELD_LABELS.avatar_hair_color} value={selected.avatar_hair_color} options={AVATAR_VOCAB.hair_color} onChange={v => patch({ avatar_hair_color: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_color} labelFor={labelFor("hair_color")} />
                                <SelectField icon={FIELD_ICONS.avatar_hair_length} label={FIELD_LABELS.avatar_hair_length} value={selected.avatar_hair_length} options={AVATAR_VOCAB.hair_length} onChange={v => patch({ avatar_hair_length: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_length} labelFor={labelFor("hair_length")} />
                                <SelectField icon={FIELD_ICONS.avatar_hair_volume} label={FIELD_LABELS.avatar_hair_volume} value={selected.avatar_hair_volume} options={AVATAR_VOCAB.hair_volume} onChange={v => patch({ avatar_hair_volume: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_volume} labelFor={labelFor("hair_volume")} />
                                <SelectField icon={FIELD_ICONS.avatar_hair_style} label={FIELD_LABELS.avatar_hair_style} value={selected.avatar_hair_style} options={AVATAR_VOCAB.hair_style} onChange={v => patch({ avatar_hair_style: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_style} labelFor={labelFor("hair_style")} />
                              </div>
                              <RuleList warnings={sectionWarnings("hair")} onApply={applySuggestion} />
                            </div>

                            {isMan && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Pilosité</div>
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                  <SelectField icon={FIELD_ICONS.avatar_beard} label={FIELD_LABELS.avatar_beard} value={selected.avatar_beard} options={AVATAR_VOCAB.beard} onChange={v => patch({ avatar_beard: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_beard} labelFor={labelFor("beard")} />
                                  <SelectField icon={FIELD_ICONS.avatar_moustache} label={FIELD_LABELS.avatar_moustache} value={selected.avatar_moustache} options={AVATAR_VOCAB.moustache} onChange={v => patch({ avatar_moustache: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_moustache} labelFor={labelFor("moustache")} />
                                  <SliderField icon={CircleDot} label="Calvitie (0-100%)" value={selected.avatar_bald_level ?? 0} min={0} max={100} step={5} onChange={v => patch({ avatar_bald_level: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_bald_level} />
                                  <SelectField icon={FIELD_ICONS.avatar_hair_recession} label={FIELD_LABELS.avatar_hair_recession} value={selected.avatar_hair_recession} options={AVATAR_VOCAB.hair_recession} onChange={v => patch({ avatar_hair_recession: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_hair_recession} labelFor={labelFor("hair_recession")} />
                                </div>
                                <RuleList warnings={sectionWarnings("male")} onApply={applySuggestion} />
                              </div>
                            )}
                          </div>
                        ),
                      },
                      ...(hasCulture ? [{
                        id: "culturel",
                        label: "Culturel",
                        icon: Globe,
                        filled: countFilled(culturalKeys),
                        total: culturalKeys.length,
                        errors: 0,
                        warnings: 0,
                        content: (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <SelectField icon={FIELD_ICONS.avatar_head_covering} label={FIELD_LABELS.avatar_head_covering} value={selected.avatar_head_covering ?? "none"} options={AVATAR_VOCAB.head_covering} onChange={v => patch({ avatar_head_covering: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_head_covering} labelFor={labelFor("head_covering")} />
                              {isWoman && (
                                <SelectField icon={FIELD_ICONS.avatar_forehead_mark} label={FIELD_LABELS.avatar_forehead_mark} value={(selected as any).avatar_forehead_mark ?? "none"} options={AVATAR_VOCAB.forehead_mark} onChange={v => patch({ avatar_forehead_mark: v } as any)} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_forehead_mark} labelFor={labelFor("forehead_mark")} />
                              )}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">{FIELD_LABELS.avatar_cultural_style_override}</Label>
                                <Input value={selected.avatar_cultural_style_override ?? ""} onChange={e => patch({ avatar_cultural_style_override: e.target.value })} disabled={isLocked} placeholder="ex. subtle_mediterranean" className="h-9" />
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tags : {(selected.culture_tags || []).join(", ") || "—"}
                            </div>
                          </div>
                        ),
                      } as SectionDef] : []),
                      {
                        id: "vetements",
                        label: "Vêtements & posture",
                        icon: Shirt,
                        filled: countFilled(clothingKeys),
                        total: clothingKeys.length,
                        errors: warnings.filter(w => (w.section === "clothing" || w.section === "posture") && w.severity === "error").length,
                        warnings: warnings.filter(w => (w.section === "clothing" || w.section === "posture") && w.severity === "warning").length,
                        content: (
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Vêtements</div>
                              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                <SelectField icon={FIELD_ICONS.avatar_clothing_style} label={FIELD_LABELS.avatar_clothing_style} value={selected.avatar_clothing_style} options={AVATAR_VOCAB.clothing_style} onChange={v => patch({ avatar_clothing_style: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_clothing_style} labelFor={labelFor("clothing_style")} />
                                <SelectField icon={FIELD_ICONS.avatar_clothing_color_palette} label={FIELD_LABELS.avatar_clothing_color_palette} value={selected.avatar_clothing_color_palette} options={AVATAR_VOCAB.clothing_color_palette} onChange={v => patch({ avatar_clothing_color_palette: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_clothing_color_palette} labelFor={labelFor("clothing_color_palette")} />
                              </div>
                              <RuleList warnings={sectionWarnings("clothing")} onApply={applySuggestion} />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Posture</div>
                              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                <SelectField icon={FIELD_ICONS.avatar_posture} label={FIELD_LABELS.avatar_posture} value={selected.avatar_posture} options={AVATAR_VOCAB.posture} onChange={v => patch({ avatar_posture: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_posture} labelFor={labelFor("posture")} />
                                <SelectField icon={FIELD_ICONS.avatar_mobility_aid} label={FIELD_LABELS.avatar_mobility_aid} value={selected.avatar_mobility_aid ?? "none"} options={AVATAR_VOCAB.mobility_aid} onChange={v => patch({ avatar_mobility_aid: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_mobility_aid} labelFor={labelFor("mobility_aid")} />

                                <SliderField icon={Sparkles} label="Résilience (0-5)" value={selected.avatar_resilience_level ?? 3} onChange={v => patch({ avatar_resilience_level: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_resilience_level} />
                              </div>
                              <RuleList warnings={sectionWarnings("posture")} onApply={applySuggestion} />
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: "social",
                        label: "Social & émotionnel",
                        icon: Baby,
                        filled: countFilled(socialKeys),
                        total: socialKeys.length,
                        errors: warnings.filter(w => w.section === "social" && w.severity === "error").length,
                        warnings: warnings.filter(w => w.section === "social" && w.severity === "warning").length,
                        content: (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                              <SelectField icon={FIELD_ICONS.avatar_parent_energy} label={FIELD_LABELS.avatar_parent_energy} value={selected.avatar_parent_energy} options={AVATAR_VOCAB.parent_energy} onChange={v => patch({ avatar_parent_energy: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_parent_energy} labelFor={labelFor("parent_energy")} />
                              <SliderField icon={BatteryLow} label="Fatigue (0-5)" value={selected.avatar_fatigue_level ?? 0} onChange={v => patch({ avatar_fatigue_level: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_fatigue_level} />
                              <SliderField icon={ShieldCheck} label="Dignité (0-5)" value={selected.avatar_dignity_level ?? 5} onChange={v => patch({ avatar_dignity_level: v })} disabled={isLocked} accentToken={FIELD_ACCENT.avatar_dignity_level} />
                            </div>
                            <RuleList warnings={sectionWarnings("social")} onApply={applySuggestion} />
                          </div>
                        ),
                      },
                    ];

                    return <SectionAccordion sections={sections} />;
                  })()}
                </div>
              </section>
            </>
          )}
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

      {selected && (selected.avatar_url || selected.avatar_preview_url) && (
        <AvatarFramingDialog
          open={framingDialogOpen}
          onOpenChange={setFramingDialogOpen}
          beneficiaryId={selected.id}
          imageUrl={selected.avatar_url || selected.avatar_preview_url}
          initialFraming={readFramingFromRow(selected)}
          onChange={(f) => {
            setBeneficiaries(prev => prev.map(b => b.id === selected.id ? { ...b, avatar_scale: f.scale, avatar_offset_x: f.offsetX, avatar_offset_y: f.offsetY } : b));
          }}
        />
      )}
    </Layout>
  );
};



export default AvatarStudio;
