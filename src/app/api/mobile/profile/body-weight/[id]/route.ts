import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const log = await prisma.bodyWeightLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

  await prisma.bodyWeightLog.delete({ where: { id } });

  const latest = await prisma.bodyWeightLog.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { weightKg: latest?.weightKg ?? null },
  });

  return NextResponse.json({ ok: true });
}
