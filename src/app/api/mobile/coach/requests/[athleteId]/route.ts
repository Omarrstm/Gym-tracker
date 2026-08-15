import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { athleteId } = await params;
  const body = await request.json().catch(() => null);
  const accept = Boolean(body?.accept);

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: user.id, athleteId } },
  });
  if (!link || link.status !== "PENDING") {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  await prisma.coachAthlete.update({
    where: { id: link.id },
    data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
