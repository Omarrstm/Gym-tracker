import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await prisma.coachProfile.findMany({
    where: { isPublic: true },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const coaches = profiles.map((p) => ({
    userId: p.userId,
    name: p.user.name ?? "Coach",
    bio: p.bio,
    specialties: p.specialties,
  }));

  return NextResponse.json({ coaches });
}
