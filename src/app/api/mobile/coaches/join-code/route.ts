import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Enter a join code." }, { status: 400 });

  const profile = await prisma.coachProfile.findUnique({ where: { joinCode: code } });
  if (!profile) return NextResponse.json({ error: "No coach found with that code." }, { status: 404 });
  if (profile.userId === user.id) {
    return NextResponse.json({ error: "You can't join your own coach profile." }, { status: 400 });
  }

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId: profile.userId, athleteId: user.id } },
    update: { status: "ACCEPTED", source: "JOIN_CODE", respondedAt: new Date() },
    create: { coachId: profile.userId, athleteId: user.id, status: "ACCEPTED", source: "JOIN_CODE" },
  });

  return NextResponse.json({ ok: true });
}
