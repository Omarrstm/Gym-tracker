import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { getStreakAndWeekVolume } from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "You don't have a coach profile." }, { status: 404 });

  const [roster, pendingRequests, sentInvites] = await Promise.all([
    prisma.coachAthlete.findMany({
      where: { coachId: profile.userId, status: "ACCEPTED" },
      include: { athlete: { select: { id: true, name: true, email: true } } },
      orderBy: { respondedAt: "desc" },
    }),
    prisma.coachAthlete.findMany({
      where: { coachId: profile.userId, status: "PENDING", source: "DIRECTORY_REQUEST" },
      include: { athlete: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coachInvite.findMany({
      where: { coachId: profile.userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const streaks = await Promise.all(
    roster.map((link) => getStreakAndWeekVolume(link.athleteId, now))
  );

  return NextResponse.json({
    profile,
    roster: roster.map((link, i) => ({
      athleteId: link.athleteId,
      name: link.athlete.name,
      email: link.athlete.email,
      streak: streaks[i].streak,
    })),
    pendingRequests: pendingRequests.map((r) => ({
      athleteId: r.athleteId,
      name: r.athlete.name,
    })),
    sentInvites: sentInvites.map((i) => ({ id: i.id, email: i.email })),
  });
}
