import { describe, it, expect } from "vitest";
import { remixAttributes, resolveGroup } from "@/lib/avatarRemix";
import { PHENOTYPE_RANGES } from "@/lib/phenotypeRanges";

const african = {
  id: "11111111-1111-1111-1111-111111111111",
  avatar_gender: "man",
  avatar_age_range: "35-45",
  real_first_name: "Kwame",
  short_story: "Sénégalais arrivé en France il y a dix ans.",
  emotional_sentence: "Il tient bon.",
  avatar_skin_tone: "deep",
  avatar_hair_type: "coily",
};

const veiled = {
  id: "22222222-2222-2222-2222-222222222222",
  avatar_gender: "woman",
  avatar_age_range: "35-45",
  real_first_name: "Fatima",
  short_story: "Mère de trois enfants, elle porte le voile.",
  emotional_sentence: "Elle garde le sourire.",
  avatar_head_covering: "headscarf",
  culture_tags: ["maghreb"],
};

const asian = {
  id: "33333333-3333-3333-3333-333333333333",
  avatar_gender: "woman",
  avatar_age_range: "25-35",
  real_first_name: "Yumi",
  avatar_private_notes: "japonaise",
  short_story: "Vit seule à Lyon.",
  emotional_sentence: "Elle reste digne.",
};

describe("remixAttributes", () => {
  it("garde le phénotype subsaharien crédible", () => {
    const { patch, group } = remixAttributes(african);
    expect(group).toBe("sub_saharan_africa");
    const merged = { ...african, ...patch } as any;
    expect(PHENOTYPE_RANGES.sub_saharan_africa.skin_tone).toContain(merged.avatar_skin_tone);
    expect(["dark_brown", "brown"]).toContain(merged.avatar_eye_color);
    expect(["coily", "curly"]).toContain(merged.avatar_hair_type);
    expect(["black", "dark_brown"]).toContain(merged.avatar_hair_color);
    expect(merged.avatar_hair_volume).not.toBe("fine");
    expect(["wide", "rounded", "flat_bridge"]).toContain(merged.avatar_nose);
    expect(merged.avatar_facial_features ?? []).not.toContain("light_freckles");
  });

  it("femme voilée : pas de peau claire, ni cheveux roux, ni yeux bleus", () => {
    const { patch } = remixAttributes(veiled);
    const merged = { ...veiled, ...patch } as any;
    expect(["fair", "light"]).not.toContain(merged.avatar_skin_tone);
    expect(["blonde", "red", "auburn", "light_brown"]).not.toContain(merged.avatar_hair_color);
    expect(["blue", "gray", "green"]).not.toContain(merged.avatar_eye_color);
    expect(merged.avatar_hair_length).not.toBe("long");
  });

  it("phénotype est-asiatique : cheveux noirs et raides uniquement", () => {
    const { patch, group } = remixAttributes(asian);
    expect(group).toBe("east_asian");
    const merged = { ...asian, ...patch } as any;
    expect(merged.avatar_hair_type).toBe("straight");
    expect(["black", "dark_brown"]).toContain(merged.avatar_hair_color);
    expect(["dark_brown", "brown"]).toContain(merged.avatar_eye_color);
  });

  it("ne touche jamais genre, tranche d'âge, couvre-chef ni culture_tags", () => {
    for (const b of [african, veiled, asian]) {
      const { patch } = remixAttributes(b);
      for (const k of ["avatar_gender", "avatar_age_range", "avatar_head_covering", "culture_tags"]) {
        expect(patch).not.toHaveProperty(k);
      }
    }
  });

  it("est déterministe pour un même bénéficiaire", () => {
    const a = remixAttributes(african).patch;
    const b = remixAttributes(african).patch;
    expect(a).toEqual(b);
  });

  it("produit des résultats différents entre bénéficiaires du même groupe", () => {
    const p1 = remixAttributes({ ...african, id: "aaaa" }).patch;
    const p2 = remixAttributes({ ...african, id: "bbbb" }).patch;
    expect(JSON.stringify(p1)).not.toEqual(JSON.stringify(p2));
  });

  it("respecte les signaux forts du récit (fauteuil roulant → posture protégée)", () => {
    const { patch } = remixAttributes({
      ...african,
      short_story: "Sénégalais en fauteuil roulant depuis un accident.",
    });
    expect(patch).not.toHaveProperty("avatar_posture");
    expect(patch).not.toHaveProperty("avatar_expression");
  });

  it("n'attribue pas de cheveux gris à une personne jeune", () => {
    const { patch } = remixAttributes({ ...african, avatar_age_range: "25-35" });
    expect(["gray", "white"]).not.toContain(patch.avatar_hair_color);
  });

  it("resolveGroup retombe sur les traits enregistrés sans récit", () => {
    expect(resolveGroup({ avatar_skin_tone: "deep" })).toBe("sub_saharan_africa");
    expect(resolveGroup({})).toBeNull();
  });
});
