"use client";

import { useMemo, useState } from "react";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels, muscleGroupOrder } from "@/lib/muscleGroups";

type ExerciseOption = { id: string; name: string; muscleGroup: MuscleGroup };

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

export default function ExerciseCombobox({
  options,
  value,
  onChange,
}: {
  options: ExerciseOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byQuery = q === "" ? options : options.filter((o) => o.name.toLowerCase().includes(q));
    const byMuscle = muscleFilter ? byQuery.filter((o) => o.muscleGroup === muscleFilter) : byQuery;
    return byMuscle.slice(0, 40);
  }, [options, query, muscleFilter]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-muted focus-within:border-accent">
        <SearchIcon />
        <input
          type="text"
          value={open ? query : (selected?.name ?? "")}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          placeholder="Search exercises"
          className="w-full min-w-0 bg-transparent text-[14px] text-text placeholder:text-muted outline-none"
        />
        {open && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            aria-label="Close search"
            className="shrink-0 text-[11px] font-semibold text-muted hover:text-text"
          >
            Close
          </button>
        )}
      </div>

      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setMuscleFilter(null);
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
              muscleFilter === null
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-muted hover:text-text"
            }`}
          >
            All
          </button>
          {muscleGroupOrder.map((mg) => (
            <button
              key={mg}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setMuscleFilter((current) => (current === mg ? null : mg));
              }}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                muscleFilter === mg
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:text-text"
              }`}
            >
              {muscleGroupLabels[mg]}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-surface">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-[13px] text-muted">No exercises match.</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(o.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-[13px] hover:bg-surface-2 ${
                  o.id === value ? "text-accent" : "text-text"
                }`}
              >
                {o.name}{" "}
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  &middot; {muscleGroupLabels[o.muscleGroup]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
