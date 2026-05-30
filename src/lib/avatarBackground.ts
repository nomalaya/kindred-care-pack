import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Public bucket name. Files are served at:
// {SUPABASE_URL}/storage/v1/object/public/avatar-backgrounds/{filename}
const BUCKET = "avatar-backgrounds";

const PUBLIC_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

export function backgroundPublicUrl(filename: string): string {
  return `${PUBLIC_BASE}/${filename}`;
}

// FNV-1a hash → deterministic index from a string seed.
function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// Module-level cache shared across all <BeneficiaryAvatar /> instances.
let cachedFilenames: string[] | null = null;
let inflight: Promise<string[]> | null = null;
const subscribers = new Set<(files: string[]) => void>();

async function fetchActiveBackgrounds(): Promise<string[]> {
  if (cachedFilenames) return cachedFilenames;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data, error } = await supabase
      .from("avatar_backgrounds")
      .select("filename")
      .eq("is_active", true)
      .order("filename", { ascending: true });
    if (error) {
      console.warn("[avatarBackground] fetch failed", error);
      cachedFilenames = [];
    } else {
      cachedFilenames = (data ?? []).map((r) => r.filename);
    }
    subscribers.forEach((cb) => cb(cachedFilenames!));
    inflight = null;
    return cachedFilenames;
  })();
  return inflight;
}

export function invalidateBackgroundsCache() {
  cachedFilenames = null;
  inflight = null;
  // Trigger refetch for all subscribers.
  fetchActiveBackgrounds();
}

/**
 * React hook returning the deterministic background URL for a given seed.
 * Returns `null` while loading or if no backgrounds are configured.
 */
export function useAvatarBackground(seed: string | number | null | undefined): string | null {
  const [files, setFiles] = useState<string[] | null>(cachedFilenames);

  useEffect(() => {
    let mounted = true;
    if (!cachedFilenames) {
      fetchActiveBackgrounds().then((f) => {
        if (mounted) setFiles(f);
      });
    } else {
      setFiles(cachedFilenames);
    }
    const cb = (f: string[]) => {
      if (mounted) setFiles(f);
    };
    subscribers.add(cb);
    return () => {
      mounted = false;
      subscribers.delete(cb);
    };
  }, []);

  if (!files || files.length === 0) return null;
  const seedStr = seed == null ? "default" : String(seed);
  const idx = hashSeed(seedStr) % files.length;
  return backgroundPublicUrl(files[idx]);
}
