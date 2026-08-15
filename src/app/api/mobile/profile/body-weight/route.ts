import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const weightKg = Number(body?.weightKg);

  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
    return NextResponse.json({ error: "Enter a valid weight in kg." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { weightKg } }),
    prisma.bodyWeightLog.create({ data: { userId: user.id, weightKg } }),
  ]);

  return NextResponse.json({ ok: true });
}
