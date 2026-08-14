import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import CoachProfileForm from "./CoachProfileForm";
import JoinCodeCard from "./JoinCodeCard";

export const dynamic = "force-dynamic";

export default async function CoachProfilePage() {
  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/profile"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Back
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Coaching
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Coach Profile
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        {profile && (
          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
              Join Code
            </h2>
            <JoinCodeCard joinCode={profile.joinCode} />
          </section>
        )}

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            {profile ? "Edit Profile" : "Become a Coach"}
          </h2>
          <CoachProfileForm
            initialBio={profile?.bio ?? ""}
            initialSpecialties={profile?.specialties ?? []}
            initialIsPublic={profile?.isPublic ?? true}
          />
        </section>

        {profile && (
          <Link
            href="/coach"
            className="card-shine rounded-2xl p-6 text-center font-display text-[14px] tracking-wide text-accent uppercase"
          >
            Go to Coach Dashboard &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
