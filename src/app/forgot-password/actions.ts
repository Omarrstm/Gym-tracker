"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export type ForgotPasswordFormState = { error?: string; success?: string } | undefined;

const TOKEN_DURATION_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_DURATION_MS);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("Failed to send password reset email:", e);
    }
  }

  return { success: "If an account exists for that email, we've sent a reset link." };
}
