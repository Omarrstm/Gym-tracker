"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type AuthFormState = { error?: string } | undefined;

function safeNext(next: FormDataEntryValue | null): string | null {
  const value = String(next ?? "");
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export async function signup(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (name.length < 2) return { error: "Enter your name." };
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  await createSession(user.id);
  redirect(next ?? "/");
}
