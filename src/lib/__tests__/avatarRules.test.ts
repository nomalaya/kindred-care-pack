import { describe, it, expect } from "vitest";
import { evaluateAvatarRules } from "@/lib/avatarRules";

describe("evaluateAvatarRules", () => {
  it("suggère cheveux gris pour personne âgée", () => {
    const w = evaluateAvatarRules({ approx_age: 70, avatar_hair_color: "brown" });
    expect(w.some(x => x.id === "age_hair_gray")).toBe(true);
  });

  it("ne suggère pas si cheveux déjà gris", () => {
    const w = evaluateAvatarRules({ approx_age: 70, avatar_hair_color: "gray" });
    expect(w.some(x => x.id === "age_hair_gray")).toBe(false);
  });

  it("suggère calvitie partielle pour homme >60 ans", () => {
    const w = evaluateAvatarRules({
      approx_age: 65,
      avatar_gender: "man",
      avatar_bald_level: 0,
    });
    expect(w.some(x => x.id === "age_baldness")).toBe(true);
  });

  it("warning fatigue si 3+ enfants et fatigue faible", () => {
    const w = evaluateAvatarRules({ children_count: 4, avatar_fatigue_level: 0 });
    const f = w.find(x => x.id === "many_children_fatigue");
    expect(f?.severity).toBe("warning");
    expect(f?.suggestion).toEqual({ avatar_fatigue_level: 3 });
  });

  it("bloque (error) si dignité < 3", () => {
    const w = evaluateAvatarRules({ avatar_dignity_level: 2 });
    const d = w.find(x => x.id === "dignity_too_low");
    expect(d?.severity).toBe("error");
  });

  it("warning fauteuil + posture debout", () => {
    const w = evaluateAvatarRules({
      avatar_mobility_aid: "wheelchair_electric",
      avatar_posture: "upright_calm",
    });
    const m = w.find(x => x.id === "wheelchair_posture_mismatch");
    expect(m?.severity).toBe("warning");
    expect(m?.suggestion).toEqual({ avatar_posture: "seated_dignified" });
  });

  it("aucune alerte pour fauteuil + posture assise", () => {
    const w = evaluateAvatarRules({
      avatar_mobility_aid: "wheelchair_electric",
      avatar_posture: "seated_dignified",
    });
    expect(w.some(x => x.id === "wheelchair_posture_mismatch")).toBe(false);
  });

  it("suggère modest_warm pour couvre-chef requis + maghreb", () => {
    const w = evaluateAvatarRules({
      culture_tags: ["maghreb"],
      avatar_head_covering: "required",
      avatar_clothing_style: "casual_modest",
    });
    expect(w.some(x => x.id === "cultural_clothing_pairing")).toBe(true);
  });

  it("aucune alerte sur profil par défaut", () => {
    const w = evaluateAvatarRules({ approx_age: 30, avatar_gender: "woman" });
    expect(w).toHaveLength(0);
  });
});
