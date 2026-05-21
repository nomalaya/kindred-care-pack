// Mappe approx_age vers la valeur exacte du vocabulaire AVATAR_VOCAB.age_range.
// Distinct de getAgeRange() qui renvoie un libellé d'affichage avec « ans ».
export function mapApproxAgeToVocab(age: number | null | undefined): string | null {
  if (age == null || !Number.isFinite(age)) return null;
  if (age < 25) return "18-25";
  if (age < 35) return "25-35";
  if (age < 45) return "35-45";
  if (age < 55) return "45-55";
  if (age < 65) return "55-65";
  if (age < 75) return "65-75";
  return "75-85";
}
