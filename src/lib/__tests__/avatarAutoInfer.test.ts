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
});
