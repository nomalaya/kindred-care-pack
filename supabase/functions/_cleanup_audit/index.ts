import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const paths = [
    "audit-results/T1.png",
    "audit-results/T2.png",
    "audit-results/T1-nb2-body-heavy.png",
    "audit-results/T2-pro-body-heavy.png",
    "audit-results/T5-nb2-body-heavy.png",
    "audit-results/T6-nb2-hair-coily.png",
  ];
  const { data, error } = await supabase.storage.from("avatars").remove(paths);
  return new Response(JSON.stringify({ ok: !error, data, error: error?.message }), {
    headers: { "Content-Type": "application/json" },
  });
});
