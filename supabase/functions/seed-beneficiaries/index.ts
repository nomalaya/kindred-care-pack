import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITUATIONS = [
  { id: "b1000000-0000-0000-0000-000000000001", title: "Mère célibataire sans soutien familial", cause: "Aider un enfant en aidant sa famille", profileType: "Mère isolée avec enfants" },
  { id: "b1000000-0000-0000-0000-000000000002", title: "Famille avec un enfant handicapé", cause: "Aider un enfant en aidant sa famille", profileType: "Mère isolée avec enfants" },
  { id: "b1000000-0000-0000-0000-000000000003", title: "Famille réfugiée avec jeunes enfants", cause: "Aider un enfant en aidant sa famille", profileType: "Mère isolée avec enfants" },
  { id: "b1000000-0000-0000-0000-000000000004", title: "Famille frappée par une perte d'emploi", cause: "Aider un enfant en aidant sa famille", profileType: "Mère isolée avec enfants" },
  { id: "b1000000-0000-0000-0000-000000000005", title: "Femme fuyant les violences conjugales", cause: "Aider une femme à se reconstruire", profileType: "Femme en reconstruction" },
  { id: "b1000000-0000-0000-0000-000000000006", title: "Jeune mère sans logement", cause: "Aider une femme à se reconstruire", profileType: "Femme en reconstruction" },
  { id: "b1000000-0000-0000-0000-000000000007", title: "Femme en convalescence", cause: "Aider une femme à se reconstruire", profileType: "Femme en reconstruction" },
  { id: "b1000000-0000-0000-0000-000000000008", title: "Femme seule sans revenus", cause: "Aider une femme à se reconstruire", profileType: "Femme en reconstruction" },
  { id: "b1000000-0000-0000-0000-000000000009", title: "Étudiant travaillant pour financer ses études", cause: "Donner sa chance à un étudiant", profileType: "Étudiant précaire" },
  { id: "b1000000-0000-0000-0000-000000000010", title: "Étudiant orphelin sans soutien", cause: "Donner sa chance à un étudiant", profileType: "Étudiant précaire" },
  { id: "b1000000-0000-0000-0000-000000000011", title: "Étudiant rural en ville", cause: "Donner sa chance à un étudiant", profileType: "Étudiant précaire" },
  { id: "b1000000-0000-0000-0000-000000000012", title: "Étudiant avec problèmes de santé chroniques", cause: "Donner sa chance à un étudiant", profileType: "Étudiant précaire" },
  { id: "b1000000-0000-0000-0000-000000000013", title: "Personne âgée vivant seule", cause: "Soutenir une personne âgée", profileType: "Personne âgée isolée" },
  { id: "b1000000-0000-0000-0000-000000000014", title: "Couple âgé avec problèmes de santé", cause: "Soutenir une personne âgée", profileType: "Personne âgée isolée" },
  { id: "b1000000-0000-0000-0000-000000000015", title: "Personne âgée en établissement", cause: "Soutenir une personne âgée", profileType: "Personne âgée isolée" },
  { id: "b1000000-0000-0000-0000-000000000016", title: "Retraité sans pension", cause: "Soutenir une personne âgée", profileType: "Personne âgée isolée" },
  { id: "b1000000-0000-0000-0000-000000000017", title: "Travailleur au SMIC avec famille", cause: "Aider un travailleur en difficulté", profileType: "Travailleur pauvre" },
  { id: "b1000000-0000-0000-0000-000000000018", title: "Travailleur précaire sans protection", cause: "Aider un travailleur en difficulté", profileType: "Travailleur pauvre" },
  { id: "b1000000-0000-0000-0000-000000000019", title: "Temps partiel subi", cause: "Aider un travailleur en difficulté", profileType: "Travailleur pauvre" },
  { id: "b1000000-0000-0000-0000-000000000020", title: "Indépendant en crise", cause: "Aider un travailleur en difficulté", profileType: "Travailleur pauvre" },
  { id: "b1000000-0000-0000-0000-000000000021", title: "Personne atteinte de maladie chronique", cause: "Soutenir face à la maladie", profileType: "Situation santé / handicap" },
  { id: "b1000000-0000-0000-0000-000000000022", title: "Personne en convalescence post-opération", cause: "Soutenir face à la maladie", profileType: "Situation santé / handicap" },
  { id: "b1000000-0000-0000-0000-000000000023", title: "Personne avec troubles psychiques", cause: "Soutenir face à la maladie", profileType: "Situation santé / handicap" },
  { id: "b1000000-0000-0000-0000-000000000024", title: "Personne en situation de handicap", cause: "Soutenir face à la maladie", profileType: "Situation santé / handicap" },
];

const REGIONS = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie",
  "Hauts-de-France", "Provence-Alpes-Côte d'Azur", "Grand Est", "Pays de la Loire",
  "Bretagne", "Normandie", "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Process in batches of 4 situations at a time
    const results: { situation: string; count: number; error?: string }[] = [];
    
    // Delete existing beneficiaries first
    const { error: delError } = await supabase.from("beneficiaries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (delError) console.error("Delete error:", delError);

    for (let i = 0; i < SITUATIONS.length; i++) {
      const sit = SITUATIONS[i];
      console.log(`Processing ${i + 1}/${SITUATIONS.length}: ${sit.title}`);

      const prompt = `Génère exactement 8 bénéficiaires fictifs ultra-réalistes pour une association caritative française.

Situation: "${sit.title}"
Cause: "${sit.cause}"

RÈGLES STRICTES:
- Tout en FRANÇAIS
- Prénoms diversifiés (origines: française, maghrébine, subsaharienne, asiatique, européenne de l'Est, portugaise)
- Régions parmi: ${REGIONS.join(", ")}
- short_story: 2 phrases émouvantes décrivant la situation concrète (max 200 caractères)
- emotional_sentence: 1 phrase à la 1ère personne, intime et touchante (max 120 caractères)
- Diversité obligatoire dans les 8 profils: au moins 1 famille, 1 individuel, 1 jeune adulte, 1 senior ou adulte mature
- urgency_level: répartir entre 0 (normal), 1 (prioritaire), 2 (urgent) — max 2 profils en urgence 2
- diet_tags possibles: ["halal"], ["vegetarien"], ["sans_porc"], ["kasher"], [] (vide = aucune restriction)
- culture_tags possibles: ["maghreb"], ["afrique_sub"], ["asie"], ["europe_est"], ["france"], ["portugal"]
- beneficiary_category: "famille", "individuel", "jeune", "senior"
- avatar_gender: "man" ou "woman"
- avatar_skin_tone: "light", "medium", "dark"
- avatar_hair_type: "straight", "wavy", "curly", "coily", "short", "bald", "covered"
- avatar_age_range doit correspondre à approx_age (ex: "20-30", "30-40", "50-60", "70-80")
- children_count: 0 pour individuel/jeune, 1-4 pour familles

Retourne un JSON array de 8 objets avec ces champs exactement:
alias_first_name, approx_age, region, short_story, emotional_sentence, avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, urgency_level, children_count, beneficiary_category, diet_tags, culture_tags`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Tu es un expert en données sociales françaises. Tu génères des profils fictifs réalistes pour une association. Réponds UNIQUEMENT avec un JSON array valide, sans markdown, sans commentaire." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const t = await aiResponse.text();
          results.push({ situation: sit.title, count: 0, error: `AI error ${aiResponse.status}: ${t}` });
          continue;
        }

        const aiData = await aiResponse.json();
        let content = aiData.choices?.[0]?.message?.content || "";
        
        // Clean markdown code blocks if present
        content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        let beneficiaries;
        try {
          beneficiaries = JSON.parse(content);
        } catch (parseErr) {
          results.push({ situation: sit.title, count: 0, error: `Parse error: ${content.substring(0, 200)}` });
          continue;
        }

        if (!Array.isArray(beneficiaries)) {
          results.push({ situation: sit.title, count: 0, error: "Not an array" });
          continue;
        }

        // Insert beneficiaries
        const rows = beneficiaries.map((b: any) => ({
          situation_id: sit.id,
          alias_first_name: b.alias_first_name,
          approx_age: b.approx_age,
          region: b.region,
          short_story: b.short_story,
          emotional_sentence: b.emotional_sentence,
          avatar_gender: b.avatar_gender,
          avatar_age_range: b.avatar_age_range,
          avatar_hair_type: b.avatar_hair_type,
          avatar_skin_tone: b.avatar_skin_tone,
          urgency_level: b.urgency_level || 0,
          children_count: b.children_count || 0,
          beneficiary_category: b.beneficiary_category || "individuel",
          profile_type: sit.profileType,
          diet_tags: b.diet_tags || [],
          culture_tags: b.culture_tags || [],
          emotional_score: Math.floor(Math.random() * 30) + 70, // 70-100
          is_active: true,
        }));

        const { error: insertError } = await supabase.from("beneficiaries").insert(rows);
        if (insertError) {
          results.push({ situation: sit.title, count: 0, error: `Insert error: ${insertError.message}` });
        } else {
          results.push({ situation: sit.title, count: rows.length });
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1500));

      } catch (err) {
        results.push({ situation: sit.title, count: 0, error: String(err) });
      }
    }

    const totalInserted = results.reduce((s, r) => s + r.count, 0);
    const errors = results.filter(r => r.error);

    return new Response(JSON.stringify({
      success: true,
      total_inserted: totalInserted,
      total_situations: SITUATIONS.length,
      results,
      errors_count: errors.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-beneficiaries error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
