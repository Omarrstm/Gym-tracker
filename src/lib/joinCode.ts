import "server-only";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const LENGTH = 8;

function randomCode(): string {
  let code = "";
  const bytes = crypto.randomBytes(LENGTH);
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

export async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await prisma.coachProfile.findUnique({ where: { joinCode: code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique join code, try again.");
}
