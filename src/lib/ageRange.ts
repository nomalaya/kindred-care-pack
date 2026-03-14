export function getAgeRange(age: number): string {
  if (age < 25) return "18-25 ans";
  if (age < 35) return "25-35 ans";
  if (age < 45) return "35-45 ans";
  if (age < 55) return "45-55 ans";
  if (age < 65) return "55-65 ans";
  if (age < 75) return "65-75 ans";
  return "75+ ans";
}
