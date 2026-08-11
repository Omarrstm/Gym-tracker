"use client";

import { useState, useTransition } from "react";
import type { DayOfWeek, MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import {
  addProgramExercise,
  moveProgramExercise,
  removeProgramExercise,
  updateProgramDayNotes,
  updateProgramExercise,
} from "@/app/program/actions";

type ProgramExerciseItem = {
  id: string;
  exercise: { id: string; name: string; muscleGroup: MuscleGroup };
  targetWeight: number;
  targetSets: number;
  targetReps: number;
};

type ExerciseOption = { id: string; name: string; muscleGroup: MuscleGroup };

function ExerciseRow({
  item,
  isFirst,
  isLast,
}: {
  item: ProgramExerciseItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(String(item.targetWeight));
  const [sets, setSets] = useState(String(item.targetSets));
  const [reps, setReps] = useState(String(item.targetReps));
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProgramExercise({
          programExerciseId: item.id,
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

  function handleRemove() {
    startTransition(async () => {
      await removeProgramExercise(item.id);
    });
  }

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      await moveProgramExercise(item.id, direction);
    });
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-3">
        <p className="text-[14px] font-semibold text-text">{item.exercise.name}</p>
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
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              Sets
            </span>
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
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              Reps
            </span>
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
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
      <div className="flex flex-col gap-0.5">
        <button
          onClick={() => handleMove("up")}
          disabled={isFirst || isPending}
          aria-label="Move up"
          className="text-[10px] leading-none text-muted hover:text-accent disabled:opacity-30"
        >
          &#9650;
        </button>
        <button
          onClick={() => handleMove("down")}
          disabled={isLast || isPending}
          aria-label="Move down"
          className="text-[10px] leading-none text-muted hover:text-accent disabled:opacity-30"
        >
          &#9660;
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-text">{item.exercise.name}</p>
        <p className="text-[12px] text-muted">
          {item.targetWeight} kg &times; {item.targetSets} &times; {item.targetReps}
        </p>
      </div>

      <button
        onClick={() => setEditing(true)}
        className="shrink-0 text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
      >
        Edit
      </button>
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="shrink-0 text-[12px] font-semibold text-muted underline-offset-2 hover:text-red-400 hover:underline disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}

function AddExerciseRow({
  programId,
  dayOfWeek,
  options,
}: {
  programId: string;
  dayOfWeek: DayOfWeek;
  options: ExerciseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [exerciseId, setExerciseId] = useState(options[0]?.id ?? "");
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        await addProgramExercise({
          programId,
          dayOfWeek,
          exerciseId,
          weight: Number(weight),
          sets: Number(sets),
          reps: Number(reps),
        });
        setWeight("");
        setSets("");
        setReps("");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't add this exercise.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border py-2.5 text-center text-[12px] font-semibold tracking-wide text-muted uppercase hover:border-accent hover:text-accent"
      >
        + Add Exercise
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} &middot; {muscleGroupLabels[o.muscleGroup]}
          </option>
        ))}
      </select>

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

      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={isPending || !weight || !sets || !reps}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-[12px] font-semibold text-muted hover:text-text"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DayNotes({
  programId,
  dayOfWeek,
  notes,
}: {
  programId: string;
  dayOfWeek: DayOfWeek;
  notes: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProgramDayNotes({ programId, dayOfWeek, notes: value });
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save this note.");
      }
    });
  }

  if (editing) {
    return (
      <div className="mb-3 rounded-xl border border-border bg-surface-2 p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Deload week — keep it light"
          rows={2}
          autoFocus
          className="w-full resize-none rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px] text-text outline-none focus-visible:border-accent"
        />
        {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setValue(notes ?? "");
            }}
            className="text-[12px] font-semibold text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (notes) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mb-3 w-full rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-left text-[13px] leading-relaxed text-accent"
      >
        {notes}
      </button>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="mb-3 text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
    >
      + Add Note
    </button>
  );
}

export default function ProgramDayCard({
  programId,
  dayOfWeek,
  dayLabel,
  notes,
  exercises,
  allExercises,
}: {
  programId: string;
  dayOfWeek: DayOfWeek;
  dayLabel: string;
  notes: string | null;
  exercises: ProgramExerciseItem[];
  allExercises: ExerciseOption[];
}) {
  return (
    <section className="card-shine rounded-2xl p-4">
      <h2 className="relative z-10 mb-3 font-display text-[15px] tracking-wide text-text uppercase">
        {dayLabel}
      </h2>
      <div className="relative z-10">
        <DayNotes programId={programId} dayOfWeek={dayOfWeek} notes={notes} />
      </div>
      <div className="relative z-10 flex flex-col gap-2">
        {exercises.length === 0 && (
          <p className="text-[12.5px] text-muted">Rest day &mdash; no exercises planned.</p>
        )}
        {exercises.map((item, i) => (
          <ExerciseRow
            key={item.id}
            item={item}
            isFirst={i === 0}
            isLast={i === exercises.length - 1}
          />
        ))}
        <AddExerciseRow programId={programId} dayOfWeek={dayOfWeek} options={allExercises} />
      </div>
    </section>
  );
}
