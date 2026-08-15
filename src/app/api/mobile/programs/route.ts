import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const programs = await prisma.program.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { days: { include: { _count: { select: { exercises: true } } } } },
  });

  const summaries = programs.map((p) => ({
    id: p.id,
    name: p.name,
    isActive: p.isActive,
    dayCount: p.days.length,
    exerciseCount: p.days.reduce((sum, d) => sum + d._count.exercises, 0),
  }));

  return NextResponse.json({ programs: summaries });
}

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter a program name." }, { status: 400 });
  }

  const existingCount = await prisma.program.count({ where: { userId: user.id } });
  const program = await prisma.program.create({
    data: { userId: user.id, name, isActive: existingCount === 0 },
  });

  return NextResponse.json({ id: program.id });
}
