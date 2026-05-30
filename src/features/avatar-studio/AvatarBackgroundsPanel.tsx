import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import {
  backgroundPublicUrl,
  invalidateBackgroundsCache,
} from "@/lib/avatarBackground";

interface BgRow {
  id: string;
  filename: string;
  is_active: boolean;
}

const ACCEPT = "image/png,image/webp,image/jpeg";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB safety upper bound

const AvatarBackgroundsPanel = () => {
  const [rows, setRows] = useState<BgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("avatar_backgrounds")
      .select("id, filename, is_active")
      .order("filename", { ascending: true });
    if (error) toast.error("Chargement des fonds impossible");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading(true);
    setProgress({ done: 0, total: list.length });

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        if (!ACCEPT.split(",").includes(file.type)) {
          skipped++;
        } else if (file.size > MAX_SIZE) {
          skipped++;
        } else {
          // Normalise filename: keep extension, slugify base, ensure uniqueness with timestamp if needed.
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "webp";
          const base = file.name
            .replace(/\.[^.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "bg";
          const filename = `${base}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("avatar-backgrounds")
            .upload(filename, file, { upsert: true, contentType: file.type });

          if (upErr) {
            failed++;
          } else {
            const { error: dbErr } = await supabase
              .from("avatar_backgrounds")
              .upsert({ filename, is_active: true }, { onConflict: "filename" });
            if (dbErr) failed++;
            else success++;
          }
        }
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: list.length });
    }

    setUploading(false);
    setProgress(null);
    invalidateBackgroundsCache();
    if (fileInput.current) fileInput.current.value = "";
    toast.success(
      `Import terminé — ${success} ajouté(s)${skipped ? `, ${skipped} ignoré(s)` : ""}${failed ? `, ${failed} échec(s)` : ""}`,
    );
    load();
  };

  const toggleActive = async (row: BgRow) => {
    const { error } = await supabase
      .from("avatar_backgrounds")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) toast.error("Mise à jour impossible");
    else {
      invalidateBackgroundsCache();
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)));
    }
  };

  const remove = async (row: BgRow) => {
    if (!confirm(`Supprimer définitivement ${row.filename} ?`)) return;
    const { error: sErr } = await supabase.storage
      .from("avatar-backgrounds")
      .remove([row.filename]);
    const { error: dErr } = await supabase
      .from("avatar_backgrounds")
      .delete()
      .eq("id", row.id);
    if (sErr || dErr) toast.error("Suppression partielle — vérifiez le stockage");
    invalidateBackgroundsCache();
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast.success("Fond supprimé");
  };

  const activeCount = rows.filter((r) => r.is_active).length;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg">Fonds d'avatars</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length} fond(s) importé(s), dont <b>{activeCount}</b> actif(s).
              Carré 1024×1024 minimum, PNG ou WebP, centre clair, halos sur les bords.
            </p>
          </div>
          <Button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {progress ? `${progress.done}/${progress.total}` : "Import…"}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importer des fonds
              </>
            )}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {loading ? (
          <div className="animate-pulse bg-muted/40 rounded-xl h-48" />
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Aucun fond importé pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className={`relative rounded-xl overflow-hidden ring-1 ring-black/5 ${
                  row.is_active ? "" : "opacity-40"
                }`}
              >
                <img
                  src={backgroundPublicUrl(row.filename)}
                  alt={row.filename}
                  className="w-full aspect-square object-cover bg-white"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white truncate" title={row.filename}>
                    {row.filename}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={row.is_active}
                      onCheckedChange={() => toggleActive(row)}
                      aria-label="Actif"
                    />
                    <button
                      onClick={() => remove(row)}
                      className="text-white/80 hover:text-white p-1"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarBackgroundsPanel;
