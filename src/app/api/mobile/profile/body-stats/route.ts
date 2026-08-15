import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function PATCH(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const heightCm = Number(body?.heightCm);
  const weightKg = Number(body?.weightKg);
  const dateOfBirthRaw = String(body?.dateOfBirth ?? "");
  const sex = String(body?.sex ?? "");

  if (!Number.isFinite(heightCm) || heightCm < 50 || heightCm > 272) {
    return NextResponse.json({ error: "Enter a valid height in cm." }, { status: 400 });
  }
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
    return NextResponse.json({ error: "Enter a valid weight in kg." }, { status: 400 });
  }
  const dateOfBirth = new Date(dateOfBirthRaw);
  if (!dateOfBirthRaw || Number.isNaN(dateOfBirth.getTime())) {
    return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });
  }
  if (dateOfBirth > new Date()) {
    return NextResponse.json({ error: "Date of birth can't be in the future." }, { status: 400 });
  }
  if (sex !== "MALE" && sex !== "FEMALE") {
    return NextResponse.json({ error: "Select a biological sex." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { heightCm, weightKg, dateOfBirth, sex: sex as "MALE" | "FEMALE" },
    }),
    prisma.bodyWeightLog.create({ data: { userId: user.id, weightKg } }),
  ]);

  return NextResponse.json({ ok: true });
}
