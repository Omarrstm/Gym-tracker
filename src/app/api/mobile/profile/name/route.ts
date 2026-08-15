import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function PATCH(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  return NextResponse.json({ ok: true });
}
