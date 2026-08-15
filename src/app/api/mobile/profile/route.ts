import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { calculateAge, calculateBMI, calculateBMR, bmiCategory } from "@/lib/bodyStats";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const full = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      heightCm: true,
      weightKg: true,
      dateOfBirth: true,
      sex: true,
      restTimerSeconds: true,
    },
  });

  const bodyWeightLogs = await prisma.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const hasBodyStats =
    full.heightCm != null && full.weightKg != null && full.dateOfBirth != null && full.sex != null;
  const bmi = hasBodyStats ? calculateBMI(full.weightKg!, full.heightCm!) : null;
  const bmr = hasBodyStats
    ? calculateBMR(full.weightKg!, full.heightCm!, calculateAge(full.dateOfBirth!), full.sex!)
    : null;

  return NextResponse.json({
    user: full,
    bmi,
    bmiCategory: bmi != null ? bmiCategory(bmi) : null,
    bmr,
    bodyWeightLogs,
  });
}
