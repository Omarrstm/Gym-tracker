"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import { deleteWorkoutLog, updateWorkoutLog } from "@/app/actions";

type Log = {
  id: string;
  weight: number;
  sets: number;
  reps: number;
  exercise: { id: string; name: string; muscleGroup: MuscleGroup };
};

export default function HistoryLogRow({ log }: { log: Log }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [weight, setWeight] = useState(String(log.weight));
  const [sets, setSets] = useState(String(log.sets));
  const [reps, setReps] = useState(String(log.reps));
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateWorkoutLog({
          logId: log.id,
          weight: Number(weight),
          sets: Number(sets),
          reps: Number(reps),
        });
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save changes.");
      }
    });
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteWorkoutLog(log.id);
    });
  }

  if (editing) {
    return (
      <div className="card-shine rounded-xl px-3.5 py-3">
        <p className="relative z-10 text-[14.5px] font-semibold text-text">{log.exercise.name}</p>
        <div className="relative z-10 mt-2 grid grid-cols-3 gap-2">
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
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
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
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
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
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
            />
          </label>
        </div>
        {error && <p className="relative z-10 mt-2 text-[12px] text-red-400">{error}</p>}
        <div className="relative z-10 mt-2.5 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[12px] font-semibold text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-shine flex items-center justify-between gap-3 rounded-xl px-3.5 py-3">
      <Link href={`/history/${log.exercise.id}`} className="relative z-10 min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-semibold text-text">{log.exercise.name}</p>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          {muscleGroupLabels[log.exercise.muscleGroup]}
        </p>
      </Link>
      <div className="relative z-10 flex shrink-0 items-center gap-3">
        <span className="text-[13px] text-muted">
          {log.weight} kg &times; {log.sets} &times; {log.reps}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
          disabled={isPending}
          className={`text-[12px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
            confirmingDelete ? "text-red-400" : "text-muted hover:text-red-400"
          }`}
        >
          {confirmingDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}
