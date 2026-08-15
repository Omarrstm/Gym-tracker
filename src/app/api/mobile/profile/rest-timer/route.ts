import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function PATCH(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const restTimerSeconds = Number(body?.restTimerSeconds);

  if (!Number.isInteger(restTimerSeconds) || restTimerSeconds < 15 || restTimerSeconds > 600) {
    return NextResponse.json(
      { error: "Enter a rest time between 15 and 600 seconds." },
      { status: 400 }
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { restTimerSeconds } });
  return NextResponse.json({ ok: true });
}
