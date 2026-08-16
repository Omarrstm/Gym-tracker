import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { getCoachProfile } from "@/lib/coachDal";
import { calculateAge, calculateBMI, calculateBMR, bmiCategory } from "@/lib/bodyStats";
import NameForm from "./NameForm";
import PasswordForm from "./PasswordForm";
import BodyStatsForm from "./BodyStatsForm";
import BodyWeightLogForm from "./BodyWeightLogForm";
import BodyWeightHistory from "./BodyWeightHistory";
import RestTimerForm from "./RestTimerForm";
import DeleteAccountSection from "./DeleteAccountSection";
import AppHeader from "@/components/AppHeader";
import { ActivityIcon, TrendingUpIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();
  const coachProfile = await getCoachProfile(user.id);

  const bodyWeightLogs = await prisma.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const hasBodyStats = user.heightCm != null && user.weightKg != null && user.dateOfBirth != null && user.sex != null;
  const bmi = hasBodyStats ? calculateBMI(user.weightKg!, user.heightCm!) : null;
  const bmr = hasBodyStats
    ? calculateBMR(user.weightKg!, user.heightCm!, calculateAge(user.dateOfBirth!), user.sex!)
    : null;

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
          {user.email}
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Profile
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Coaching
          </h2>
          <div className="relative z-10 flex flex-col gap-2">
            <Link
              href="/coaches"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              Find a Coach
            </Link>
            <Link
              href="/coaches/mine"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              My Coaches
            </Link>
            <Link
              href={coachProfile ? "/coach" : "/coach/profile"}
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              {coachProfile ? "Coach Dashboard" : "Become a Coach"}
            </Link>
          </div>
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Account
          </h2>
          <NameForm initialName={user.name ?? ""} />
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Password
          </h2>
          <PasswordForm />
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Body Stats
          </h2>

          {hasBodyStats && (
            <div className="relative z-10 mb-5 grid grid-cols-2 gap-3">
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                  <ActivityIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">BMI</p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {bmi!.toFixed(1)}
                </p>
                <p className="mt-1 text-[12px] text-accent">{bmiCategory(bmi!)}</p>
              </div>
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                  <TrendingUpIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">BMR</p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {Math.round(bmr!)}
                </p>
                <p className="mt-1 text-[12px] text-accent">kcal / day at rest</p>
              </div>
            </div>
          )}

          <BodyStatsForm
            initialHeightCm={user.heightCm}
            initialWeightKg={user.weightKg}
            initialDateOfBirth={user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null}
            initialSex={user.sex}
          />
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Rest Timer
          </h2>
          <RestTimerForm initialSeconds={user.restTimerSeconds} />
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Weight History
          </h2>
          <div className="relative z-10 flex flex-col gap-3">
            <BodyWeightHistory
              logs={bodyWeightLogs.map((l) => ({
                id: l.id,
                weightKg: l.weightKg,
                date: l.date.toISOString(),
              }))}
            />
            <BodyWeightLogForm />
          </div>
        </section>

        <section className="rounded-2xl border border-red-400/30 bg-surface p-6">
          <h2 className="mb-4 font-display text-[15px] tracking-wide text-red-400 uppercase">
            Danger Zone
          </h2>
          <DeleteAccountSection />
        </section>
      </div>
        </div>
      </div>
    </div>
  );
}
