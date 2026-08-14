"use client";

import { useState, useTransition } from "react";
import { deleteWorkoutLog, updateWorkoutLog } from "@/app/actions";

type Log = {
  id: string;
  weight: number;
  sets: number;
  reps: number;
  rir?: number | null;
  notes?: string | null;
  date: string;
};

export default function SessionRow({ log, isPR = false }: { log: Log; isPR?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [weight, setWeight] = useState(String(log.weight));
  const [sets, setSets] = useState(String(log.sets));
  const [reps, setReps] = useState(String(log.reps));
  const [rir, setRir] = useState(log.rir != null ? String(log.rir) : "");
  const [notes, setNotes] = useState(log.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const dateLabel = new Date(log.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateWorkoutLog({
          logId: log.id,
          weight: Number(weight),
          sets: Number(sets),
          reps: Number(reps),
          rir: rir === "" ? null : Number(rir),
          notes: notes.trim() === "" ? null : notes.trim(),
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
      <div className="rounded-xl border border-border bg-surface-2 px-3.5 py-3">
        <p className="text-[13px] text-muted">{dateLabel}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
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
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              RIR
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={rir}
              onChange={(e) => setRir(e.target.value)}
              placeholder="—"
              className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              Notes
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
            />
          </label>
        </div>
        {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
        <div className="mt-2.5 flex items-center gap-2">
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
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted">{dateLabel}</span>
        <div className="flex items-center gap-3">
          {isPR && (
            <span className="rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
              PR
            </span>
          )}
          <span className="text-[13.5px] font-semibold text-text">
            {log.weight} kg &times; {log.sets} &times; {log.reps}
          </span>
          {log.rir != null && (
            <span className="text-[11px] font-semibold text-muted">RIR {log.rir}</span>
          )}
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
      {log.notes && <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{log.notes}</p>}
    </div>
  );
}
