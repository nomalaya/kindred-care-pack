import { describe, it, expect } from "vitest";
import { mapApproxAgeToVocab } from "@/lib/avatarAgeRange";
import { inferGenderFromName } from "@/lib/genderFromName";
import { inferStudioDefaultsWithReasons } from "@/lib/avatarAutoInfer";

describe("mapApproxAgeToVocab", () => {
  it("mappe les bornes", () => {
    expect(mapApproxAgeToVocab(24)).toBe("18-25");
    expect(mapApproxAgeToVocab(25)).toBe("25-35");
    expect(mapApproxAgeToVocab(34)).toBe("25-35");
    expect(mapApproxAgeToVocab(45)).toBe("45-55");
    expect(mapApproxAgeToVocab(80)).toBe("75-85");
  });
  it("renvoie null pour valeur manquante", () => {
    expect(mapApproxAgeToVocab(null)).toBeNull();
    expect(mapApproxAgeToVocab(undefined)).toBeNull();
  });
});

describe("inferGenderFromName", () => {
  it("prénom féminin connu", () => {
    expect(inferGenderFromName("Fatima").gender).toBe("woman");
    expect(inferGenderFromName("Aïcha").gender).toBe("woman");
    expect(inferGenderFromName("Marie").gender).toBe("woman");
  });
  it("prénom masculin connu", () => {
    expect(inferGenderFromName("Mohamed").gender).toBe("man");
    expect(inferGenderFromName("Karim").gender).toBe("man");
    expect(inferGenderFromName("Jean").gender).toBe("man");
  });
  it("prénom ambigu → woman", () => {
    expect(inferGenderFromName("Camille").gender).toBe("woman");
    expect(inferGenderFromName("Dominique").gender).toBe("woman");
  });
  it("fallback heuristique terminaison", () => {
    expect(inferGenderFromName("Yasmina").gender).toBe("woman");
  });
  it("prénom inconnu → person", () => {
    expect(inferGenderFromName("Xyzqw").gender).toBe("person");
  });
  it("aucun prénom → null", () => {
    expect(inferGenderFromName(null, undefined, "").gender).toBeNull();
  });
  it("priorité au real_first_name", () => {
    const r = inferGenderFromName("Karim", "Anonyme42");
    expect(r.gender).toBe("man");
    expect(r.matchedName).toBe("karim");
  });
  it("compose ignore les espaces et tirets", () => {
    expect(inferGenderFromName("Jean-Pierre").gender).toBe("man");
    expect(inferGenderFromName("Marie Claire").gender).toBe("woman");
  });
});

describe("inferStudioDefaultsWithReasons (genre + âge)", () => {
  it("pré-remplit genre depuis prénom et tranche d'âge depuis approx_age", () => {
    const r = inferStudioDefaultsWithReasons({
      real_first_name: "Karim",
      approx_age: 42,
    });
    expect(r.values.avatar_gender).toBe("man");
    expect(r.values.avatar_age_range).toBe("35-45");
    expect(r.reasons.avatar_gender?.[0].signal).toBe("name_known");
    expect(r.reasons.avatar_age_range?.[0].signal).toBe("age_known");
  });
  it("applique attributs masculins quand genre déduit = man", () => {
    const r = inferStudioDefaultsWithReasons({
      real_first_name: "Mohamed",
      approx_age: 65,
    });
    expect(r.values.avatar_beard).toBe("light");
    expect(r.values.avatar_bald_level).toBe(35);
  });
  it("aucun prénom → pas de gender mais age_range OK si âge fourni", () => {
    const r = inferStudioDefaultsWithReasons({ approx_age: 30 });
    expect(r.values.avatar_age_range).toBe("25-35");
    expect(r.values.avatar_gender).toBeUndefined();
  });
});
