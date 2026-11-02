import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ContextBadge = { id: string; label: string; description: string | null; is_active: boolean; sort_order: number };
type Assignment = { beneficiary_id: string; badge_id: string };
type Person = { id: string; alias_first_name: string | null; context_badge?: string | null };

export default function BeneficiaryBadgesAdmin({ beneficiaries }: { beneficiaries: Person[] }) {
  const [catalog, setCatalog] = useState<ContextBadge[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    const [c, a] = await Promise.all([
      supabase.from("context_badges" as any).select("*").order("sort_order").order("label"),
      supabase.from("beneficiary_context_badges" as any).select("beneficiary_id,badge_id"),
    ]);
    if (c.error || a.error) {
      setReady(false);
      return;
    }
    setCatalog((c.data || []) as unknown as ContextBadge[]);
    setAssignments((a.data || []) as unknown as Assignment[]);
    setReady(true);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const person = beneficiaries.find(b => b.id === selected);
  const assigned = useMemo(() => new Set(assignments.filter(a => a.beneficiary_id === selected).map(a => a.badge_id)), [assignments, selected]);
  const change = async (work: () => PromiseLike<{ error: any }>, action: string, badgeId: string, beneficiaryId?: string) => {
    setBusy(true);
    try {
      const result = await work();
      if (result.error) throw result.error;
      const { data: userData } = await supabase.auth.getUser();
      const audit = await supabase.from("context_badge_audit" as any).insert({
        actor_id: userData.user?.id, action, badge_id: badgeId, beneficiary_id: beneficiaryId || null,
      } as any);
      if (audit.error) toast.warning("Modification enregistrée, mais journalisation échouée");
      else toast.success("Modification enregistrée");
      await load();
    } catch (e: any) { toast.error(e.message || "Modification impossible"); }
    finally { setBusy(false); }
  };
  const create = async () => {
    const label = name.trim();
    if (label.length < 2) return;
    setBusy(true);
    const { error } = await supabase.from("context_badges" as any).insert({ label } as any);
    setBusy(false);
    if (error) toast.error(error.message);
    else { setName(""); toast.success("Badge créé"); await load(); }
  };
  const rename = async (badge: ContextBadge) => {
    const label = window.prompt("Nouveau nom du badge", badge.label)?.trim();
    if (!label || label === badge.label) return;
    await change(() => supabase.from("context_badges" as any).update({ label } as any).eq("id", badge.id), "rename", badge.id);
  };
  const toggleAssignment = async (badge: ContextBadge) => {
    if (!selected) return;
    if (assigned.has(badge.id)) {
      await change(() => supabase.from("beneficiary_context_badges" as any).delete().eq("beneficiary_id", selected).eq("badge_id", badge.id), "unassign", badge.id, selected);
    } else {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return toast.error("Connexion requise");
      await change(() => supabase.from("beneficiary_context_badges" as any).insert({ beneficiary_id: selected, badge_id: badge.id, assigned_by: data.user.id } as any), "assign", badge.id, selected);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gestion des badges contextuels</h2>
        <p className="text-sm text-muted-foreground">Plusieurs badges par bénéficiaire. La publication des badges multiples reste désactivée jusqu'à validation.</p>
      </div>
      {!ready && <div role="status" className="rounded-lg border p-4 text-sm">Catalogue non disponible : appliquer et vérifier la migration sur un environnement de test avant d'utiliser cette interface. Aucun profil public n'est modifié.</div>}
      <div className="flex gap-2">
        <Input aria-label="Nouveau badge" placeholder="Nouveau badge" value={name} onChange={e => setName(e.target.value)} disabled={!ready || busy} />
        <Button onClick={create} disabled={!ready || busy || name.trim().length < 2}>Créer</Button>
      </div>
      <div className="space-y-2">
        {catalog.map(b => (
          <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <Badge variant={b.is_active ? "secondary" : "outline"}>{b.label}</Badge>
            {!b.is_active && <span className="text-xs text-muted-foreground">Désactivé</span>}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => rename(b)}>Renommer</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => change(() => supabase.from("context_badges" as any).update({ is_active: !b.is_active } as any).eq("id", b.id), b.is_active ? "disable" : "enable", b.id)}>{b.is_active ? "Désactiver" : "Activer"}</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border p-4">
        <h3 className="font-semibold">Attribution aux bénéficiaires</h3>
        <Input aria-label="Rechercher un bénéficiaire" placeholder="Rechercher un bénéficiaire" value={search} onChange={e => setSearch(e.target.value)} />
        <select aria-label="Bénéficiaire" className="w-full rounded-md border bg-background p-2" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Choisir un bénéficiaire</option>
          {beneficiaries.filter(b => (b.alias_first_name || "").toLowerCase().includes(search.toLowerCase())).map(b => <option key={b.id} value={b.id}>{b.alias_first_name || b.id}</option>)}
        </select>
        {person && <>
          <p className="text-sm text-muted-foreground">Badge historique : {person.context_badge || "Aucun"} (conservé jusqu'à la migration publique)</p>
          <div className="flex flex-wrap gap-2">
            {catalog.filter(b => b.is_active || assigned.has(b.id)).map(b => (
              <Button key={b.id} size="sm" variant={assigned.has(b.id) ? "default" : "outline"} disabled={busy || !ready} onClick={() => toggleAssignment(b)} aria-pressed={assigned.has(b.id)}>{assigned.has(b.id) ? "✓ " : "+ "}{b.label}</Button>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}
