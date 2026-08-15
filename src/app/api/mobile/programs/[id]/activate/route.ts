import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const program = await prisma.program.findFirst({ where: { id, userId: user.id } });
  if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.program.updateMany({
      where: { userId: user.id, id: { not: id } },
      data: { isActive: false },
    }),
    prisma.program.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
