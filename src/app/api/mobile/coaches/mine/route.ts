import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.coachAthlete.findMany({
    where: { athleteId: user.id, status: { in: ["ACCEPTED", "PENDING"] } },
    include: { coach: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const accepted = links.filter((l) => l.status === "ACCEPTED");

  const assignedPrograms =
    accepted.length > 0
      ? await prisma.program.findMany({
          where: { userId: user.id, assignedByCoachId: { in: accepted.map((l) => l.coachId) } },
          select: { id: true, name: true, isActive: true, assignedByCoachId: true },
        })
      : [];

  return NextResponse.json({
    accepted: accepted.map((l) => ({
      coachId: l.coachId,
      name: l.coach.name,
      email: l.coach.email,
      programs: assignedPrograms
        .filter((p) => p.assignedByCoachId === l.coachId)
        .map((p) => ({ id: p.id, name: p.name, isActive: p.isActive })),
    })),
    pending: links
      .filter((l) => l.status === "PENDING")
      .map((l) => ({ coachId: l.coachId, name: l.coach.name, email: l.coach.email })),
  });
}
