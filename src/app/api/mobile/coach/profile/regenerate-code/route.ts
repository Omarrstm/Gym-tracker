import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { generateUniqueJoinCode } from "@/lib/joinCode";

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "You don't have a coach profile yet." }, { status: 404 });

  const joinCode = await generateUniqueJoinCode();
  await prisma.coachProfile.update({ where: { userId: user.id }, data: { joinCode } });

  return NextResponse.json({ joinCode });
}
