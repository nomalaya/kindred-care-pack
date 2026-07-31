// sync
// Retroactive, deterministic framing normalization.
// ONE anchor: the eye line (measured once per image, cached on the row) is
// placed at 38 % of the canvas height; the zoom is the smallest that fills the
// bottom edge with the garment. No head-size target => no deformed morphology.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeAvatarFraming } from "../_shared/avatarNormalize.ts";
import { measureEyeLine, toDataUrl } from "../_shared/avatarEyeLine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ids: string[] | undefined = Array.isArray(body.beneficiary_ids) ? body.beneficiary_ids : undefined;
    const limit: number = typeof body.limit === "number" ? body.limit : 50;
    const dryRun: boolean = body.dry_run === true;
    // When true, always renormalize the CURRENTLY PUBLISHED avatar instead of the
    // archived original (useful when the archive predates the current art style).
    const useCurrent: boolean = body.use_current === true;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let query = supabase
      .from("beneficiaries")
      .select("id, alias_first_name, avatar_url")
      .not("avatar_url", "is", null);
    if (ids?.length) query = query.in("id", ids);
    const { data: rows, error } = await query.limit(limit);
    if (error) throw error;

    const results: any[] = [];

    for (const b of rows ?? []) {
      try {
        // Always renormalize from the archived ORIGINAL when it exists, so
        // repeated runs never stack crops on top of each other.
        const archivePath = `pre-normalize/${b.id}.png`;
        const { data: archived } = supabase.storage.from("avatars").getPublicUrl(archivePath);
        let raw: Uint8Array | null = null;
        let fromArchive = false;

        const archResp = useCurrent ? null : await fetch(`${archived.publicUrl}?t=${Date.now()}`);
        if (archResp?.ok) {
          raw = new Uint8Array(await archResp.arrayBuffer());
          fromArchive = true;
        } else {
          const sourceUrl = (b.avatar_url as string).split("?")[0];
          const resp = await fetch(`${sourceUrl}?t=${Date.now()}`);
          if (!resp.ok) throw new Error(`fetch ${resp.status}`);
          raw = new Uint8Array(await resp.arrayBuffer());
        }

        const { bytes, report } = await normalizeAvatarFraming(raw);

        if (dryRun || !report.changed) {
          results.push({
            id: b.id,
            name: b.alias_first_name,
            changed: false,
            dry_run: dryRun,
            from_archive: fromArchive,
            mode: report.mode,
            landmarks: report.landmarks,
            output: report.output,
            needs_regeneration: report.needsRegeneration === true,
            regeneration_reason: report.regenerationReason,
            source_margins: report.sourceMargins,
            scale: report.scale,
          });

          continue;
        }

        // 1) Archive the original once (never overwritten).
        if (!fromArchive) {
          await supabase.storage
            .from("avatars")
            .upload(archivePath, raw, { contentType: "image/png", upsert: false });
        }


        // 2) Upload the normalized render.
        const fileName = `normalized/${b.id}.png`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(fileName, bytes, { contentType: "image/png", upsert: true });
        if (upErr) throw upErr;

        const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
        const newUrl = `${u.publicUrl}?t=${Date.now()}`;

        await supabase
          .from("beneficiaries")
          .update({
            avatar_url: newUrl,
            // Framing overrides are now baked into the pixels — reset display transform.
            avatar_scale: 1,
            avatar_offset_x: 0,
            avatar_offset_y: 0,
          })
          .eq("id", b.id);

        await supabase.from("avatar_versions").insert({
          beneficiary_id: b.id,
          image_url: u.publicUrl,
          model_used: "normalize-framing/deterministic",
          prompt: `framing=${report.mode} scale=${report.scale} landmarks=${JSON.stringify(report.landmarks)}`,
        });

        results.push({
          id: b.id,
          name: b.alias_first_name,
          changed: true,
          from_archive: fromArchive,
          mode: report.mode,
          landmarks: report.landmarks,
          output: report.output,
          needs_regeneration: report.needsRegeneration === true,
          regeneration_reason: report.regenerationReason,
          source_margins: report.sourceMargins,
          scale: report.scale,
          transparent: report.transparent,
          newUrl,
        });


      } catch (e: any) {
        results.push({ id: b.id, name: b.alias_first_name, error: e.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, dry_run: dryRun, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("normalize-avatar-framing error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
