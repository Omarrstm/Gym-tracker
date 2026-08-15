import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ coachUserId: string }> }
) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { coachUserId } = await params;
  if (coachUserId === user.id) {
    return NextResponse.json({ error: "You can't request yourself as a coach." }, { status: 400 });
  }

  const profile = await prisma.coachProfile.findUnique({ where: { userId: coachUserId } });
  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Coach not found." }, { status: 404 });
  }

  const existing = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: user.id } },
  });
  if (existing?.status === "ACCEPTED") {
    return NextResponse.json({ error: "You're already linked with this coach." }, { status: 409 });
  }
  if (existing?.status === "PENDING") {
    return NextResponse.json({ error: "You already have a pending request." }, { status: 409 });
  }

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: user.id } },
    update: { status: "PENDING", source: "DIRECTORY_REQUEST", respondedAt: null },
    create: { coachId: coachUserId, athleteId: user.id, status: "PENDING", source: "DIRECTORY_REQUEST" },
  });

  return NextResponse.json({ ok: true });
}
