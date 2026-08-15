import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { generateUniqueJoinCode } from "@/lib/joinCode";
import { computeTrialEndsAt } from "@/lib/billing";

function parseSpecialties(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bio = String(body?.bio ?? "").trim();
  const specialties = parseSpecialties(String(body?.specialties ?? ""));
  const isPublic = Boolean(body?.isPublic);

  const existing = await prisma.coachProfile.findUnique({ where: { userId: user.id } });

  if (existing) {
    await prisma.coachProfile.update({
      where: { userId: user.id },
      data: { bio: bio || null, specialties, isPublic },
    });
  } else {
    const joinCode = await generateUniqueJoinCode();
    await prisma.coachProfile.create({
      data: {
        userId: user.id,
        bio: bio || null,
        specialties,
        isPublic,
        joinCode,
        trialEndsAt: computeTrialEndsAt(),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
