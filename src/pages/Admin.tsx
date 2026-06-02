import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DELIVERY_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { readFramingFromRow } from "@/lib/avatarFraming";
import { AlertTriangle, Loader2, Sparkles, CheckCircle2, RefreshCw, Wand2, ShieldCheck, Eye } from "lucide-react";
import { AVATAR_VOCAB, STATUS_LABEL, STATUS_COLOR, AvatarStatus } from "@/lib/avatarTraits";
import AvatarBackgroundsPanel from "@/features/avatar-studio/AvatarBackgroundsPanel";

const TARGET_MODEL = "google/gemini-3-pro-image-preview";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Record<string, string | null>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  // Batch state
  const [batchSize, setBatchSize] = useState(10);
  const [batchFilter, setBatchFilter] = useState<"not_migrated" | "failed" | "low_score" | "all">("not_migrated");
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchIds, setBatchIds] = useState<string[]>([]);

  const refreshBeneficiaries = async () => {
    const { data } = await supabase.from("beneficiaries").select("*").order("created_at", { ascending: false });
    setBeneficiaries(data || []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("donations").select("*, beneficiaries(alias_first_name, region)").order("created_at", { ascending: false }),
      supabase.from("beneficiaries").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("tier").order("name"),
    ]).then(([dRes, bRes, pRes]) => {
      setDonations(dRes.data || []);
      setBeneficiaries(bRes.data || []);
      setProducts(pRes.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  // Poll while batch is running
  useEffect(() => {
    if (!batchRunning || batchIds.length === 0) return;
    const t = setInterval(refreshBeneficiaries, 5000);
    return () => clearInterval(t);
  }, [batchRunning, batchIds]);

  // Stop polling if all batch items resolved
  useEffect(() => {
    if (!batchRunning) return;
    const pending = beneficiaries.filter(b =>
      batchIds.includes(b.id) && (b.avatar_status === "pending" || !b.avatar_status)
    );
    if (pending.length === 0) {
      setBatchRunning(false);
      toast.success("Batch terminé");
    }
  }, [beneficiaries, batchRunning, batchIds]);

  const updateDeliveryStatus = async (donationId: string, status: string) => {
    const { error } = await supabase.from("donations").update({ delivery_status: status } as any).eq("id", donationId);
    if (error) toast.error("Échec de la mise à jour du statut");
    else {
      toast.success("Statut mis à jour");
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, delivery_status: status } : d));
    }
  };

  const updateStock = async (productId: string, quantity: number) => {
    const { error } = await supabase.from("products").update({ stock_quantity: quantity } as any).eq("id", productId);
    if (error) toast.error("Échec de la mise à jour du stock");
    else { toast.success("Stock mis à jour"); setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: quantity } : p)); }
  };

  const updateUrgencyLevel = async (beneficiaryId: string, level: string) => {
    const { error } = await supabase.from("beneficiaries").update({ urgency_level: parseInt(level) } as any).eq("id", beneficiaryId);
    if (error) toast.error("Échec de la mise à jour");
    else { toast.success("Mis à jour"); setBeneficiaries(prev => prev.map(b => b.id === beneficiaryId ? { ...b, urgency_level: parseInt(level) } : b)); }
  };

  const callAvatar = async (id: string, mode: "preview" | "final", force = false, label = "") => {
    setBusy(p => ({ ...p, [id]: mode }));
    try {
      const { error } = await supabase.functions.invoke("generate-avatar", { body: { beneficiary_id: id, mode, force } });
      if (error) throw error;
      toast.success(label || `Génération ${mode} lancée`);
      // Mark pending locally and refresh shortly after
      setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, avatar_status: "pending" } : b));
      setTimeout(refreshBeneficiaries, 4000);
      setTimeout(refreshBeneficiaries, 10000);
      setTimeout(refreshBeneficiaries, 20000);
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "échec"));
    } finally {
      setBusy(p => ({ ...p, [id]: null }));
    }
  };

  const updateAttr = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("beneficiaries").update(patch as any).eq("id", id);
    if (error) toast.error("Échec mise à jour attributs");
    else {
      setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    }
  };

  const candidateIds = useMemo(() => {
    let pool = beneficiaries;
    if (batchFilter === "not_migrated") pool = pool.filter(b => b.avatar_model_used !== TARGET_MODEL);
    else if (batchFilter === "failed") pool = pool.filter(b => b.avatar_status === "failed");
    else if (batchFilter === "low_score") pool = pool.filter(b => (b.avatar_qa_score ?? 0) > 0 && (b.avatar_qa_score ?? 0) < 80);
    return pool.map(b => b.id);
  }, [beneficiaries, batchFilter]);

  const migratedCount = beneficiaries.filter(b => b.avatar_model_used === TARGET_MODEL).length;

  const launchBatch = async () => {
    const ids = candidateIds.slice(0, batchSize);
    if (ids.length === 0) { toast.info("Aucun bénéficiaire éligible"); return; }
    setBatchRunning(true);
    setBatchIds(ids);
    // Pre-mark pending so polling has a clear signal
    await supabase.from("beneficiaries").update({ avatar_status: "pending" } as any).in("id", ids);
    setBeneficiaries(prev => prev.map(b => ids.includes(b.id) ? { ...b, avatar_status: "pending" } : b));
    const { error } = await supabase.functions.invoke("generate-avatar-batch", { body: { beneficiary_ids: ids, mode: "final" } });
    if (error) { toast.error("Erreur batch : " + error.message); setBatchRunning(false); }
    else toast.success(`Batch lancé sur ${ids.length} bénéficiaires`);
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès refusé</h1>
          <p className="text-muted-foreground">Vous devez avoir les droits administrateur pour accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord admin</h1>
        <p className="text-muted-foreground mb-8">Gérez les bénéficiaires, produits et statuts de livraison.</p>

        <Tabs defaultValue="donations">
          <TabsList className="mb-6">
            <TabsTrigger value="donations">Dons ({donations.length})</TabsTrigger>
            <TabsTrigger value="beneficiaries">Bénéficiaires ({beneficiaries.length})</TabsTrigger>
            <TabsTrigger value="portraits">Portraits v2</TabsTrigger>
            <TabsTrigger value="backgrounds">Fonds</TabsTrigger>
            <TabsTrigger value="products">Produits ({products.length})</TabsTrigger>
          </TabsList>


          <TabsContent value="donations">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {donations.map(d => (
                  <div key={d.id} className="bg-card rounded-xl p-4 border flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{d.beneficiaries?.alias_first_name} – {d.beneficiaries?.region}</p>
                      <p className="text-sm text-muted-foreground">{d.amount}€ · {new Date(d.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Select value={d.delivery_status} onValueChange={(v) => updateDeliveryStatus(d.id, v)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_STATUSES.map(s => (<SelectItem key={s.key} value={s.key}>{s.icon} {s.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="beneficiaries">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {beneficiaries.map(b => {
                  const status = (b.avatar_status as AvatarStatus) || "pending";
                  const isOpen = expanded === b.id;
                  return (
                    <div key={b.id} className="bg-card rounded-xl border">
                      <div className="p-4 flex items-center gap-4">
                        <BeneficiaryAvatar name={b.alias_first_name} avatarUrl={b.avatar_url} previewUrl={b.avatar_preview_url} backgroundSeed={b.id} framing={readFramingFromRow(b as any)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground truncate">{b.alias_first_name} ({b.real_first_name} {b.real_last_name})</p>
                            {b.urgency_level === 2 && (
                              <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />Urgent
                              </Badge>
                            )}
                            <Badge variant="outline" className={`text-xs ${STATUS_COLOR[status]}`}>
                              {STATUS_LABEL[status]}{b.avatar_qa_score ? ` · ${Math.round(b.avatar_qa_score)}` : ""}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{b.region} · {b.approx_age} ans · {b.total_donations_received || 0} dons</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={String(b.urgency_level || 0)} onValueChange={(v) => updateUrgencyLevel(b.id, v)}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Normal</SelectItem>
                              <SelectItem value="1">Prioritaire</SelectItem>
                              <SelectItem value="2">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => setExpanded(isOpen ? null : b.id)}>
                            <Sparkles className="h-4 w-4 mr-1" />Portrait
                          </Button>
                        </div>
                      </div>
                      {isOpen && <PortraitPanel b={b} busy={busy[b.id]} onCall={callAvatar} onUpdate={updateAttr} />}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portraits">
            <div className="bg-card border rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Migration vers le moteur de portraits v2</h2>
                  <p className="text-sm text-muted-foreground">
                    Régénère les portraits HD via {TARGET_MODEL.split("/")[1]} avec scoring qualité automatique.
                  </p>
                </div>
                <a href="/avatar-studio">
                  <Button variant="default" size="sm">
                    <Sparkles className="h-4 w-4 mr-1" />Ouvrir Avatar Studio
                  </Button>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Migrés v2</p>
                  <p className="text-2xl font-semibold">{migratedCount} / {beneficiaries.length}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Éligibles (filtre)</p>
                  <p className="text-2xl font-semibold">{candidateIds.length}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Échecs QA</p>
                  <p className="text-2xl font-semibold">{beneficiaries.filter(b => b.avatar_status === "failed").length}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label className="text-xs">Source</Label>
                  <Select value={batchFilter} onValueChange={(v: any) => setBatchFilter(v)}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_migrated">Non migrés</SelectItem>
                      <SelectItem value="failed">Échecs QA</SelectItem>
                      <SelectItem value="low_score">Score &lt; 80</SelectItem>
                      <SelectItem value="all">Tous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Taille du batch</Label>
                  <Select value={String(batchSize)} onValueChange={(v) => setBatchSize(parseInt(v))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={launchBatch} disabled={batchRunning || candidateIds.length === 0}>
                  {batchRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Lancer un batch
                </Button>
                <Button variant="outline" onClick={refreshBeneficiaries}>
                  <RefreshCw className="h-4 w-4 mr-2" />Actualiser
                </Button>
              </div>

              {batchRunning && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  Batch en cours sur {batchIds.length} bénéficiaires —{" "}
                  {batchIds.filter(id => {
                    const b = beneficiaries.find(x => x.id === id);
                    return b && b.avatar_status !== "pending";
                  }).length} / {batchIds.length} traités.
                </div>
              )}

              <div className="rounded-xl border divide-y">
                {beneficiaries
                  .filter(b => b.avatar_status === "failed" || (b.avatar_qa_score ?? 0) > 0)
                  .slice(0, 40)
                  .map(b => (
                    <div key={b.id} className="p-3 flex items-center gap-3 text-sm">
                      <BeneficiaryAvatar name={b.alias_first_name} avatarUrl={b.avatar_url} previewUrl={b.avatar_preview_url} backgroundSeed={b.id} framing={readFramingFromRow(b as any)} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium">{b.alias_first_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Score {b.avatar_qa_score ? Math.round(b.avatar_qa_score) : "—"} · {STATUS_LABEL[(b.avatar_status as AvatarStatus) || "pending"]}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => callAvatar(b.id, "final", true, "Régénération HD lancée")}>
                        <RefreshCw className="h-3 w-3 mr-1" />Retry
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backgrounds">
            <AvatarBackgroundsPanel />
          </TabsContent>

          <TabsContent value="products">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="bg-card rounded-xl p-4 border flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{p.display_name || p.name}</p>
                      <p className="text-sm text-muted-foreground">Palier {p.tier} · {p.category} · {p.price}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Stock :</Label>
                      <Input type="number" className="w-20" value={p.stock_quantity}
                        onChange={e => { const val = parseInt(e.target.value) || 0; setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, stock_quantity: val } : pr)); }}
                        onBlur={() => updateStock(p.id, p.stock_quantity)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// ---- Portrait Panel (per-beneficiary) ----
function PortraitPanel({
  b,
  busy,
  onCall,
  onUpdate,
}: {
  b: any;
  busy?: string | null;
  onCall: (id: string, mode: "preview" | "final", force?: boolean, label?: string) => void;
  onUpdate: (id: string, patch: Record<string, any>) => void;
}) {
  const fields: Array<{ key: string; label: string; opts: readonly string[] }> = [
    { key: "avatar_expression", label: "Expression", opts: AVATAR_VOCAB.expression },
    { key: "avatar_posture", label: "Posture", opts: AVATAR_VOCAB.posture },
    { key: "avatar_parent_energy", label: "Énergie parentale", opts: AVATAR_VOCAB.parent_energy },
    { key: "avatar_clothing_style", label: "Vêtement", opts: AVATAR_VOCAB.clothing_style },
    { key: "avatar_clothing_color_palette", label: "Palette", opts: AVATAR_VOCAB.clothing_color_palette },
    { key: "avatar_skin_tone", label: "Peau", opts: AVATAR_VOCAB.skin_tone },
    { key: "avatar_hair_color", label: "Couleur cheveux", opts: AVATAR_VOCAB.hair_color },
    { key: "avatar_hair_type", label: "Type cheveux", opts: AVATAR_VOCAB.hair_type },
    { key: "avatar_hair_length", label: "Longueur", opts: AVATAR_VOCAB.hair_length },
    { key: "avatar_hair_style", label: "Coiffure", opts: AVATAR_VOCAB.hair_style },
    { key: "avatar_eye_color", label: "Yeux", opts: AVATAR_VOCAB.eye_color },
    { key: "avatar_face_shape", label: "Visage", opts: AVATAR_VOCAB.face_shape },
  ];

  return (
    <div className="border-t bg-muted/20 p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onCall(b.id, "preview", false, "Aperçu lancé")} disabled={!!busy}>
          {busy === "preview" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
          Générer aperçu (Flash)
        </Button>
        <Button size="sm" onClick={() => onCall(b.id, "final", false, "Génération HD lancée")} disabled={!!busy}>
          {busy === "final" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
          Valider & générer HD
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCall(b.id, "final", true, "Régénération HD lancée")} disabled={!!busy}>
          <RefreshCw className="h-4 w-4 mr-1" />Régénérer HD
        </Button>
        {b.avatar_status === "failed" && b.avatar_preview_url && (
          <Button size="sm" variant="ghost" onClick={() => onUpdate(b.id, { avatar_url: b.avatar_preview_url, avatar_status: "validated" })}>
            <CheckCircle2 className="h-4 w-4 mr-1" />Forcer publication
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Select value={b[f.key] ?? ""} onValueChange={(v) => onUpdate(b.id, { [f.key]: v })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {f.opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {b.avatar_qa_report && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">Rapport QA (score {b.avatar_qa_score ? Math.round(b.avatar_qa_score) : "—"})</summary>
          <pre className="mt-2 p-3 bg-background rounded-lg overflow-x-auto text-[11px]">{JSON.stringify(b.avatar_qa_report, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

export default Admin;
