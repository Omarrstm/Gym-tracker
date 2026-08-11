"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import type { DayOfWeek, MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import { dayLabels, dayOrder } from "@/lib/days";
import { addExerciseToProgram, deleteCustomExercise } from "@/app/exercises/actions";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  imageUrl: string | null;
  description: string | null;
};

function BarbellIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AddToProgramForm({ exerciseId }: { exerciseId: string }) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<DayOfWeek>("MONDAY");
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successDay, setSuccessDay] = useState<DayOfWeek | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    const weightNum = Number(weight);
    const setsNum = Number(sets);
    const repsNum = Number(reps);

    startTransition(async () => {
      try {
        await addExerciseToProgram({
          exerciseId,
          dayOfWeek: day,
          weight: weightNum,
          sets: setsNum,
          reps: repsNum,
        });
        setSuccessDay(day);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't add this exercise.");
      }
    });
  }

  if (successDay) {
    return (
      <div className="mt-3 rounded-xl border border-accent bg-accent-soft px-3.5 py-3 text-[13px] font-semibold text-accent">
        Added to {dayLabels[successDay]} &mdash; {weight} kg &times; {sets} sets &times; {reps} reps
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl bg-accent py-3 text-center text-[13px] font-bold tracking-wide text-bg uppercase"
      >
        + Add to Program
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3.5">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">Day</p>
      <div className="flex flex-wrap gap-1.5">
        {dayOrder.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
              day === d
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted"
            }`}
          >
            {dayLabels[d].slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
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
        {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function DeleteExerciseButton({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteCustomExercise(exerciseId);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't delete this exercise.");
        setConfirming(false);
      }
    });
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleDelete}
        onBlur={() => setConfirming(false)}
        disabled={isPending}
        className={`text-[12px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
          confirming ? "text-red-400" : "text-muted hover:text-red-400"
        }`}
      >
        {confirming ? "Confirm delete?" : "Delete custom exercise"}
      </button>
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

export default function ExerciseModal({
  exercise,
  prWeight = null,
  isOwner = false,
  onClose,
}: {
  exercise: Exercise;
  prWeight?: number | null;
  isOwner?: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-surface sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full bg-surface-2">
          {exercise.imageUrl ? (
            <Image
              src={exercise.imageUrl}
              alt={exercise.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
              <BarbellIcon />
              <p className="text-[12px]">No reference image yet</p>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg/80 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
              {muscleGroupLabels[exercise.muscleGroup]}
            </p>
            {prWeight !== null && (
              <p className="text-[12px] font-semibold text-muted">
                PR <span className="text-text">{prWeight} kg</span>
              </p>
            )}
          </div>
          <h2 className="font-display text-[24px] leading-tight tracking-wide text-text uppercase">
            {exercise.name}
          </h2>
          {exercise.description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{exercise.description}</p>
          )}
          <AddToProgramForm exerciseId={exercise.id} />
          {isOwner && <DeleteExerciseButton exerciseId={exercise.id} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
