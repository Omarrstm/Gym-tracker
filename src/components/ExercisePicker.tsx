"use client";

import { useMemo, useState } from "react";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels, muscleGroupOrder } from "@/lib/muscleGroups";
import ExerciseModal from "@/components/ExerciseModal";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  imageUrl: string | null;
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

export default function ExercisePicker({ exercises }: { exercises: Exercise[] }) {
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
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:border-accent/60"
            >
              <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-surface-2 text-accent">
                <BarbellIcon />
              </span>
              <span>
                <p className="text-[14.5px] font-semibold text-text">{exercise.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {muscleGroupLabels[exercise.muscleGroup]}
                </p>
              </span>
            </button>
          ))
        )}
      </div>

      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
