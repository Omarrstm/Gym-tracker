import prisma from "@/lib/prisma";

// Temporary stand-in until real accounts land (step 6). Every Program and
// WorkoutLog is attached to this single placeholder user for now.
const DEV_USER_EMAIL = "dev@gymtracker.local";

export async function getDevUserId() {
  const user = await prisma.user.upsert({
    where: { email: DEV_USER_EMAIL },
    update: {},
    create: { email: DEV_USER_EMAIL, name: "Dev User" },
  });
  return user.id;
}
