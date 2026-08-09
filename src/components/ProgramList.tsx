"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProgram, deleteProgram, renameProgram, setActiveProgram } from "@/app/program/actions";

type ProgramSummary = {
  id: string;
  name: string;
  isActive: boolean;
  dayCount: number;
  exerciseCount: number;
};

function ProgramRow({ program }: { program: ProgramSummary }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(program.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleRename() {
    setError(null);
    startTransition(async () => {
      try {
        await renameProgram(program.id, name);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't rename this program.");
      }
    });
  }

  function handleSetActive() {
    setError(null);
    startTransition(async () => {
      try {
        await setActiveProgram(program.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't set this program active.");
      }
    });
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteProgram(program.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't delete this program.");
      }
    });
  }

  return (
    <div className="card-shine rounded-xl px-4 py-3.5">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[14px] text-text outline-none focus-visible:border-accent"
              />
              <button
                onClick={handleRename}
                disabled={isPending}
                className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(program.name);
                }}
                className="shrink-0 text-[12px] font-semibold text-muted hover:text-text"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Link href={`/program/${program.id}`} className="block">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold text-text">{program.name}</p>
                {program.isActive && (
                  <span className="shrink-0 rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-muted">
                {program.dayCount} {program.dayCount === 1 ? "day" : "days"} &middot;{" "}
                {program.exerciseCount} {program.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </Link>
          )}
        </div>
      </div>

      {!editing && (
        <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {!program.isActive && (
            <button
              onClick={handleSetActive}
              disabled={isPending}
              className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline disabled:opacity-50"
            >
              Set Active
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            onBlur={() => setConfirmingDelete(false)}
            className={`text-[12px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
              confirmingDelete ? "text-red-400" : "text-muted hover:text-red-400"
            }`}
          >
            {confirmingDelete ? "Confirm Delete?" : "Delete"}
          </button>
        </div>
      )}

      {error && <p className="relative z-10 mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

function CreateProgramForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await createProgram(name);
        setName("");
        router.push(`/program/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create this program.");
      }
    });
  }

  return (
    <div className="card-shine rounded-xl px-4 py-3.5">
      <p className="relative z-10 mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
        New Program
      </p>
      <div className="relative z-10 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Pull Legs"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        />
        <button
          onClick={handleCreate}
          disabled={isPending || name.trim().length < 2}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[12px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
        >
          Create
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

export default function ProgramList({ programs }: { programs: ProgramSummary[] }) {
  return (
    <div className="flex flex-col gap-3">
      {programs.map((program) => (
        <ProgramRow key={program.id} program={program} />
      ))}
      <CreateProgramForm />
    </div>
  );
}
