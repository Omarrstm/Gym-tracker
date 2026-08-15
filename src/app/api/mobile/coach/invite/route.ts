import { NextResponse } from "next/server";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { sendCoachInviteEmail } from "@/lib/email";

const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const profile = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "You need a coach profile first." }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);

  await prisma.coachInvite.create({
    data: { coachId: user.id, email, tokenHash, expiresAt },
  });

  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const inviteUrl = `${protocol}://${host}/coach-invite/${token}`;

  try {
    await sendCoachInviteEmail(email, user.name ?? "A coach", inviteUrl);
  } catch (e) {
    console.error("Failed to send coach invite email:", e);
    return NextResponse.json({ error: "Couldn't send the invite email. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
