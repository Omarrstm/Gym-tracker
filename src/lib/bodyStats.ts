export function calculateAge(dateOfBirth: Date, on: Date = new Date()): number {
  let age = on.getFullYear() - dateOfBirth.getFullYear();
  const hasHadBirthdayThisYear =
    on.getMonth() > dateOfBirth.getMonth() ||
    (on.getMonth() === dateOfBirth.getMonth() && on.getDate() >= dateOfBirth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Mifflin-St Jeor equation.
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "MALE" | "FEMALE"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "MALE" ? base + 5 : base - 161;
}
