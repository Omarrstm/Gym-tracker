import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coachUserId: string }> }
) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { coachUserId } = await params;
  const profile = await prisma.coachProfile.findUnique({
    where: { userId: coachUserId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      experiences: { orderBy: { order: "asc" } },
    },
  });
  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Coach not found." }, { status: 404 });
  }

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: user.id } },
  });

  return NextResponse.json({
    coach: {
      userId: profile.userId,
      name: profile.user.name ?? "Coach",
      bio: profile.bio,
      specialties: profile.specialties,
      experiences: profile.experiences,
    },
    linkStatus: link?.status ?? "NONE",
    isSelf: coachUserId === user.id,
  });
}
