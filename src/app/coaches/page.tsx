import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import CoachDirectory from "./CoachDirectory";
import JoinCodeForm from "./JoinCodeForm";
import AppHeader from "@/components/AppHeader";
import SubTabs from "@/components/SubTabs";

export const dynamic = "force-dynamic";

const coachingTabs = [
  { href: "/coaches", label: "Find a Coach" },
  { href: "/coaches/mine", label: "My Coach" },
  { href: "/coach/profile", label: "Become a Coach" },
];

export default async function CoachesPage() {
  const user = await getUser();

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
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
          <header className="mb-5">
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Coaching
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Find a Coach
            </h1>
          </header>

          <div className="mb-5">
            <SubTabs tabs={coachingTabs} />
          </div>

          <div className="flex flex-col gap-4">
            <section className="card-shine rounded-2xl p-6">
              <JoinCodeForm />
            </section>

            <CoachDirectory coaches={coaches} />
          </div>
        </div>
      </div>
    </div>
  );
}
