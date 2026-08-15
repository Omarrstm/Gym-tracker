import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ counterpartUserId: string }> }
) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { counterpartUserId } = await params;

  const link = await prisma.coachAthlete.findFirst({
    where: {
      OR: [
        { coachId: user.id, athleteId: counterpartUserId },
        { coachId: counterpartUserId, athleteId: user.id },
      ],
    },
  });
  if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.coachAthlete.update({
      where: { id: link.id },
      data: { status: "REVOKED", respondedAt: new Date() },
    }),
    prisma.program.updateMany({
      where: { userId: link.athleteId, assignedByCoachId: link.coachId },
      data: { assignedByCoachId: null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
