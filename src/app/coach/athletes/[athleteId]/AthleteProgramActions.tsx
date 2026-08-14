"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProgramForAthlete, assignProgramTemplate, unassignProgram } from "@/app/coach/programActions";

type Template = { id: string; name: string };

export function CreateOrAssignForm({
  athleteId,
  templates,
}: {
  athleteId: string;
  templates: Template[];
}) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        await createProgramForAthlete(athleteId, name);
        setName("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create this program.");
      }
    });
  }

  function handleAssignTemplate() {
    if (!templateId) return;
    setError(null);
    startTransition(async () => {
      try {
        await assignProgramTemplate(templateId, athleteId);
        setTemplateId("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't assign that template.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Pull Legs"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        />
        <button
          onClick={handleCreate}
          disabled={pending || name.trim().length < 2}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[12px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
        >
          Create
        </button>
      </div>

      {templates.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
          >
            <option value="">Assign from your templates&hellip;</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignTemplate}
            disabled={pending || !templateId}
            className="shrink-0 rounded-lg border border-border px-4 py-2 text-[12px] font-bold tracking-wide text-text uppercase disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      )}

      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

export function UnassignButton({ programId }: { programId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleUnassign() {
    setError(null);
    startTransition(async () => {
      try {
        await unassignProgram(programId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't unassign this program.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col">
      <button
        onClick={handleUnassign}
        disabled={pending}
        className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline disabled:opacity-50"
      >
        Unassign
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </span>
  );
}
