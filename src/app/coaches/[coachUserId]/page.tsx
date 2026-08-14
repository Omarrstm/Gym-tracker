import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import RequestCoachButton from "./RequestCoachButton";

export const dynamic = "force-dynamic";

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ coachUserId: string }>;
}) {
  const { coachUserId } = await params;
  const { userId } = await verifySession();

  const profile = await prisma.coachProfile.findUnique({
    where: { userId: coachUserId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!profile || !profile.isPublic) notFound();

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: userId } },
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/coaches"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Back
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Coach
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          {profile.user.name ?? "Coach"}
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <section className="card-shine rounded-2xl p-6">
          {profile.bio && (
            <p className="relative z-10 mb-4 text-[14px] leading-relaxed text-text">{profile.bio}</p>
          )}
          {profile.specialties.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-1.5">
              {profile.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {coachUserId !== userId && (
          <RequestCoachButton coachUserId={coachUserId} linkStatus={link?.status ?? "NONE"} />
        )}
      </div>
    </div>
  );
}
