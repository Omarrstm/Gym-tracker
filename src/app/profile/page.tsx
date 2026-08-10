import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { calculateAge, calculateBMI, calculateBMR, bmiCategory } from "@/lib/bodyStats";
import NameForm from "./NameForm";
import PasswordForm from "./PasswordForm";
import BodyStatsForm from "./BodyStatsForm";
import BodyWeightLogForm from "./BodyWeightLogForm";
import BodyWeightHistory from "./BodyWeightHistory";
import DeleteAccountSection from "./DeleteAccountSection";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();

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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Back
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          {user.email}
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Profile
        </h1>
      </header>

      <div className="flex flex-col gap-4">
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
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">BMI</p>
                <p className="font-display text-[26px] leading-none text-text tabular-nums">
                  {bmi!.toFixed(1)}
                </p>
                <p className="mt-1 text-[12px] text-accent">{bmiCategory(bmi!)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">BMR</p>
                <p className="font-display text-[26px] leading-none text-text tabular-nums">
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
  );
}
