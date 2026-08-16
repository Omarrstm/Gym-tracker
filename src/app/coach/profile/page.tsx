import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import CoachProfileForm from "./CoachProfileForm";
import JoinCodeCard from "./JoinCodeCard";
import CoachExperienceManager from "./CoachExperienceManager";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function CoachProfilePage() {
  const user = await getUser();
  const userId = user.id;
  const profile = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { experiences: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
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
          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-1 font-display text-[15px] tracking-wide text-text uppercase">
              Experience
            </h2>
            <p className="relative z-10 mb-4 text-[12.5px] text-muted">
              Shown on your public profile to help athletes decide to work with you.
            </p>
            <div className="relative z-10">
              <CoachExperienceManager experiences={profile.experiences} />
            </div>
          </section>
        )}

        {profile && (
          <Link
            href="/"
            className="card-shine rounded-2xl p-6 text-center font-display text-[14px] tracking-wide text-accent uppercase"
          >
            Go to Coach Dashboard &rarr;
          </Link>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
