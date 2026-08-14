"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";
import type { AuthFormState } from "@/app/signup/actions";

function safeNext(next: FormDataEntryValue | null): string | null {
  const value = String(next ?? "");
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export async function login(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password." };

  await createSession(user.id);
  redirect(next ?? "/");
}
