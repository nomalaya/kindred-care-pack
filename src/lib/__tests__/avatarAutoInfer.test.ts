import { describe, it, expect } from "vitest";
import { inferStudioDefaultsWithReasons } from "@/lib/avatarAutoInfer";

describe("inferStudioDefaultsWithReasons", () => {
  it("Fatima — femme maghrébine atteinte de sclérose en plaques", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 42,
      avatar_gender: "woman",
      culture_tags: ["maghreb"],
      short_story:
        "Fatima vit avec une sclérose en plaques avancée et utilise un fauteuil roulant au quotidien.",
      emotional_sentence: "Elle garde le sourire pour ses enfants.",
      children_count: 2,
      beneficiary_category: "famille_enfants",
    });
    expect(r.values.avatar_mobility_aid).toBe("wheelchair_electric");
    expect(r.values.avatar_posture).toBe("seated_dignified");
    expect(r.values.avatar_head_covering).toBe("optional");
    expect(r.reasons.avatar_mobility_aid?.[0].signal).toBe("mobility_severe");
    expect(r.values.avatar_parent_energy).toMatch(/parent/);
  });

  it("Vétéran SDF — précarité logement + isolement", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 58,
      avatar_gender: "man",
      short_story:
        "Ancien militaire devenu SDF, il vit dans la rue depuis deux ans, isolé de sa famille.",
      emotional_sentence: "Personne ne lui rend visite.",
      children_count: 0,
    });
    expect(r.values.avatar_clothing_style).toBe("practical_warm");
    expect(Number(r.values.avatar_fatigue_level)).toBeGreaterThanOrEqual(3);
    expect(r.values.avatar_expression).toBe("pensive");
    expect(r.reasons.avatar_clothing_style?.some(x => x.signal === "precarity_housing")).toBe(true);
  });

  it("Mère enceinte isolée", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 28,
      avatar_gender: "woman",
      short_story: "Enceinte de 7 mois, elle est seule depuis le départ de son compagnon.",
      emotional_sentence: "Elle attend un bébé sans soutien.",
      children_count: 0,
    });
    expect(r.values.avatar_clothing_style).toBe("practical_warm");
    expect(r.values.avatar_expression).toBe("hopeful");
    expect(r.reasons.avatar_expression?.some(x => x.signal === "pregnant")).toBe(true);
  });

  it("Enfant orphelin — deuil détecté", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 9,
      avatar_gender: "child",
      short_story: "Orphelin depuis le décès de ses parents l'an dernier.",
      emotional_sentence: "Il garde courage malgré le deuil.",
      children_count: 0,
    });
    expect(["serious_soft", "tired_but_warm"]).toContain(r.values.avatar_expression);
    expect(Number(r.values.avatar_emotional_brightness)).toBeLessThanOrEqual(2);
    expect(r.reasons.avatar_expression?.some(x => x.signal === "grief")).toBe(true);
  });

  it("ne renvoie aucune raison quand le récit est vide", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 30,
      avatar_gender: "woman",
      short_story: "",
      emotional_sentence: "",
    });
    // age_known est toujours déduit dès qu'approx_age est connu — on l'exclut
    const psychosocialReasons = Object.keys(r.reasons).filter(
      k => k !== "avatar_age_range" && k !== "avatar_gender",
    );
    expect(psychosocialReasons).toHaveLength(0);
    expect(r.values.avatar_mobility_aid).toBe("none");
  });

  // --- Phénotype par pays / gentilé ---
  it("Mehdi marocain — phénotype MENA masculin", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 35,
      avatar_gender: "man",
      real_first_name: "Mehdi",
      short_story: "Père de famille.",
      emotional_sentence: "Il garde espoir.",
      avatar_private_notes: "marocain",
    });
    expect(r.values.avatar_skin_tone).toBe("olive");
    expect(r.values.avatar_hair_type).toBe("wavy");
    expect(r.values.avatar_hair_color).toBe("black");
    expect(r.values.avatar_eye_color).toBe("dark_brown");
    expect(r.values.avatar_head_covering).toBe("optional");
    expect(r.values.avatar_beard).toBe("full");
    expect(r.values.culture_tags).toContain("maghreb");
    expect(r.reasons.avatar_skin_tone?.[0].signal).toBe("country_phenotype");
  });

  it("Yumi japonaise — phénotype Est-asiatique féminin", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 30,
      avatar_gender: "woman",
      real_first_name: "Yumi",
      short_story: "Vit seule à Lyon.",
      emotional_sentence: "Elle reste digne.",
      avatar_private_notes: "asiatique, japonaise, légère corpulence",
    });
    expect(r.values.avatar_eye_shape).toBe("narrow");
    expect(r.values.avatar_hair_type).toBe("straight");
    expect(r.values.avatar_hair_color).toBe("black");
    expect(r.values.avatar_head_covering).toBe("none");
    expect(r.values.culture_tags).toContain("est_asie");
  });

  it("Aïcha sénégalaise — phénotype subsaharien féminin", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 40,
      avatar_gender: "woman",
      real_first_name: "Aicha",
      short_story: "Mère courageuse.",
      emotional_sentence: "Elle ne lâche rien.",
      avatar_private_notes: "senegalaise",
    });
    expect(r.values.avatar_skin_tone).toBe("deep");
    expect(r.values.avatar_hair_type).toBe("coily");
    expect(r.values.culture_tags).toContain("afrique_subsaharienne");
  });

  it("Override explicite — sénégalais aux yeux verts", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 32,
      avatar_gender: "man",
      real_first_name: "Amadou",
      short_story: "Sénégalais aux yeux verts.",
      emotional_sentence: "Il tient bon.",
    });
    expect(r.values.avatar_skin_tone).toBe("deep");
    expect(r.values.avatar_eye_color).toBe("green");
    expect(r.reasons.avatar_eye_color?.[0].signal).toBe("private_note");
  });

  it("Valeur manuelle conservée — bénéficiaire avec skin_tone déjà saisi", () => {
    const r = inferStudioDefaultsWithReasons({
      approx_age: 28,
      avatar_gender: "woman",
      real_first_name: "Leila",
      short_story: "Issue d'une famille marocaine.",
      emotional_sentence: "Elle avance.",
      avatar_skin_tone: "fair",
    } as any);
    expect(r.values.avatar_skin_tone).toBeUndefined();
    expect(r.values.avatar_hair_color).toBe("black");
  });
});

