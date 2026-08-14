import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import CoachDirectory from "./CoachDirectory";
import JoinCodeForm from "./JoinCodeForm";

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  await verifySession();

  const profiles = await prisma.coachProfile.findMany({
    where: { isPublic: true },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const coaches = profiles.map((p) => ({
    userId: p.userId,
    name: p.user.name ?? "Coach",
    bio: p.bio,
    specialties: p.specialties,
  }));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Home
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Coaching
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Find a Coach
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <section className="card-shine rounded-2xl p-6">
          <JoinCodeForm />
        </section>

        <CoachDirectory coaches={coaches} />
      </div>
    </div>
  );
}
