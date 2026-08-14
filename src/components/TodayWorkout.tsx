"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import { logWorkoutSet } from "@/app/actions";
import RestTimer from "@/components/RestTimer";

const REST_DURATION_SECONDS = 90;

type TodayItem = {
  id: string;
  exercise: { id: string; name: string; muscleGroup: MuscleGroup; imageUrl: string | null };
  targetWeight: number | null;
  targetSets: number | null;
  targetReps: number | null;
  loggedCount: number;
};

function BarbellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LogSetRow({ item, onSetLogged }: { item: TodayItem; onSetLogged: () => void }) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(item.targetWeight != null ? String(item.targetWeight) : "");
  const [sets, setSets] = useState(item.targetSets != null ? String(item.targetSets) : "");
  const [reps, setReps] = useState(item.targetReps != null ? String(item.targetReps) : "");
  const [error, setError] = useState<string | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [newPR, setNewPR] = useState(false);
  const [isPending, startTransition] = useTransition();

  const logged = item.loggedCount + (justLogged ? 1 : 0);

  function handleSubmit() {
    setError(null);
    const weightNum = Number(weight);
    const setsNum = Number(sets);
    const repsNum = Number(reps);

    startTransition(async () => {
      try {
        const result = await logWorkoutSet({
          exerciseId: item.exercise.id,
          weight: weightNum,
          sets: setsNum,
          reps: repsNum,
        });
        setJustLogged(true);
        setOpen(false);
        if (result.isNewPR) setNewPR(true);
        onSetLogged();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't log this set.");
      }
    });
  }

  return (
    <div className="card-shine card-pattern flex flex-col rounded-xl px-3.5 py-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left">
        <span className="relative z-10 flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-surface-2 text-accent">
          <BarbellIcon />
        </span>
        <span className="relative z-10 flex-1">
          <p className="text-[14.5px] font-semibold text-text">{item.exercise.name}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted">
            {muscleGroupLabels[item.exercise.muscleGroup]}
          </p>
        </span>
        <span className="relative z-10 flex items-center gap-2">
          {newPR && (
            <span className="rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
              New PR
            </span>
          )}
          <span className="text-[12.5px] text-muted">
            {item.targetWeight != null && item.targetSets != null && item.targetReps != null
              ? `${item.targetWeight} kg × ${item.targetSets} × ${item.targetReps}`
              : "No target set"}
          </span>
          {logged > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-bg">
              <CheckIcon />
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="relative z-10 mt-3 rounded-xl border border-border bg-surface-2 p-3.5">
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                Weight (kg)
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">Sets</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">Reps</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
              />
            </label>
          </div>

          {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isPending || !weight || !sets || !reps}
            className="mt-3 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
          >
            {isPending ? "Saving..." : logged > 0 ? "Log Another Set" : "Log Set"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TodayWorkout({
  items,
  hasProgram,
  dayNote,
}: {
  items: TodayItem[];
  hasProgram: boolean;
  dayNote?: string | null;
}) {
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);

  if (!hasProgram) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-[14px] text-muted">
          You don&rsquo;t have a program yet. Add exercises to a day from the exercise library to build one.
        </p>
        <Link
          href="/exercises"
          className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-bg uppercase"
        >
          Browse Exercises
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        {dayNote && (
          <p className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-accent">
            {dayNote}
          </p>
        )}
        <p className="text-[14px] text-muted">Rest day &mdash; nothing scheduled for today.</p>
        <Link
          href="/exercises"
          className="text-[13px] font-semibold text-accent underline-offset-2 hover:underline"
        >
          Log something anyway
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 pb-24">
      {dayNote && (
        <p className="rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-accent">
          {dayNote}
        </p>
      )}
      {items.map((item) => (
        <LogSetRow key={item.id} item={item} onSetLogged={() => setRestStartedAt(Date.now())} />
      ))}
      {restStartedAt !== null && (
        <RestTimer
          key={restStartedAt}
          duration={REST_DURATION_SECONDS}
          onDismiss={() => setRestStartedAt(null)}
        />
      )}
    </div>
  );
}
