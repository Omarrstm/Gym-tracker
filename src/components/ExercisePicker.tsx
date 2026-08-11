"use client";

import { useMemo, useState, useTransition } from "react";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels, muscleGroupOrder } from "@/lib/muscleGroups";
import ExerciseModal from "@/components/ExerciseModal";
import { createCustomExercise } from "@/app/exercises/actions";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  imageUrl: string | null;
  description: string | null;
  createdByUserId: string | null;
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

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CreateExerciseForm({ defaultMuscleGroup }: { defaultMuscleGroup: MuscleGroup }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(defaultMuscleGroup);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        await createCustomExercise({ name, muscleGroup, description });
        setName("");
        setDescription("");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create this exercise.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border py-3 text-center text-[12px] font-semibold tracking-wide text-muted uppercase hover:border-accent hover:text-accent"
      >
        + Add Custom Exercise
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      <label className="mt-2 flex flex-col gap-1">
        <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Muscle Group
        </span>
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
          className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        >
          {muscleGroupOrder.map((group) => (
            <option key={group} value={group}>
              {muscleGroupLabels[group]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 flex flex-col gap-1">
        <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Description (optional)
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="resize-none rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={handleCreate}
          disabled={isPending || name.trim().length < 2}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Exercise"}
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

export default function ExercisePicker({
  exercises,
  prByExercise = {},
  currentUserId,
}: {
  exercises: Exercise[];
  prByExercise?: Record<string, number>;
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<MuscleGroup | "ALL">("ALL");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesGroup = activeGroup === "ALL" || exercise.muscleGroup === activeGroup;
      const matchesQuery = q === "" || exercise.name.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [exercises, query, activeGroup]);

  return (
    <div className="flex flex-col">
      <div className="mx-4 mt-4 flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-muted">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="w-full bg-transparent text-[13px] text-text placeholder:text-muted outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pt-3.5 pb-1">
        <button
          onClick={() => setActiveGroup("ALL")}
          className={`flex-none rounded-full border px-3.5 py-1.5 text-[12px] font-semibold tracking-wide ${
            activeGroup === "ALL"
              ? "border-accent bg-accent-soft text-accent"
              : "border-border bg-surface text-muted"
          }`}
        >
          All
        </button>
        {muscleGroupOrder.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`flex-none rounded-full border px-3.5 py-1.5 text-[12px] font-semibold tracking-wide ${
              activeGroup === group
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted"
            }`}
          >
            {muscleGroupLabels[group]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-2 pb-6">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted">
            No exercises match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelected(exercise)}
              className="card-shine card-pattern flex items-center gap-3 rounded-xl px-3.5 py-3 text-left"
            >
              <span className="relative z-10 flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-surface-2 text-accent">
                <BarbellIcon />
              </span>
              <span className="relative z-10 min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-text">{exercise.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {muscleGroupLabels[exercise.muscleGroup]}
                  {exercise.createdByUserId && " · Custom"}
                </p>
              </span>
              {prByExercise[exercise.id] !== undefined && (
                <span className="relative z-10 shrink-0 text-[12px] text-muted">
                  PR {prByExercise[exercise.id]} kg
                </span>
              )}
            </button>
          ))
        )}

        <CreateExerciseForm
          defaultMuscleGroup={activeGroup === "ALL" ? muscleGroupOrder[0] : activeGroup}
        />
      </div>

      {selected && (
        <ExerciseModal
          exercise={selected}
          prWeight={prByExercise[selected.id] ?? null}
          isOwner={selected.createdByUserId === currentUserId}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
