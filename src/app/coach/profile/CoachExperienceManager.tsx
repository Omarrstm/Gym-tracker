"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCoachExperience, deleteCoachExperience } from "../actions";

type Experience = {
  id: string;
  title: string;
  organization: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
};

function yearRange(startYear: number | null, endYear: number | null) {
  if (!startYear && !endYear) return null;
  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (startYear) return `${startYear}–Present`;
  return `${endYear}`;
}

function ExperienceRow({ experience }: { experience: Experience }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const range = yearRange(experience.startYear, experience.endYear);

  function handleDelete() {
    startTransition(async () => {
      await deleteCoachExperience(experience.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-text">{experience.title}</p>
          {experience.organization && (
            <p className="text-[12.5px] text-muted">{experience.organization}</p>
          )}
          {range && <p className="mt-0.5 text-[11px] text-accent">{range}</p>}
        </div>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="shrink-0 text-[11px] font-semibold text-muted underline-offset-2 hover:text-red-400 hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
      {experience.description && (
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{experience.description}</p>
      )}
    </div>
  );
}

export default function CoachExperienceManager({
  experiences,
}: {
  experiences: Experience[];
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addCoachExperience(undefined, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {experiences.length > 0 && (
        <div className="flex flex-col gap-2">
          {experiences.map((experience) => (
            <ExperienceRow key={experience.id} experience={experience} />
          ))}
        </div>
      )}

      {experiences.length === 0 && !adding && (
        <p className="text-[13px] text-muted">
          Add your coaching experience, certifications, or past clients to help athletes trust
          you.
        </p>
      )}

      {adding ? (
        <form action={handleAdd} className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              Title
            </span>
            <input
              name="title"
              type="text"
              required
              placeholder="Certified Strength Coach"
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13.5px] text-text outline-none focus-visible:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              Organization
            </span>
            <input
              name="organization"
              type="text"
              placeholder="NASM"
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13.5px] text-text outline-none focus-visible:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                Start Year
              </span>
              <input
                name="startYear"
                type="number"
                placeholder="2020"
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13.5px] text-text outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                End Year
              </span>
              <input
                name="endYear"
                type="number"
                placeholder="Leave blank if current"
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13.5px] text-text outline-none focus-visible:border-accent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              Description
            </span>
            <textarea
              name="description"
              rows={3}
              placeholder="What you did, who you coached, results you delivered."
              className="resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13.5px] text-text outline-none focus-visible:border-accent"
            />
          </label>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-accent py-2 text-center text-[12px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
            >
              {pending ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAdding(false);
              }}
              className="rounded-xl border border-border px-4 py-2 text-[12px] font-semibold tracking-wide text-muted uppercase"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-xl border border-dashed border-border px-4 py-2.5 text-center text-[12px] font-semibold tracking-wide text-accent uppercase"
        >
          + Add Experience
        </button>
      )}
    </div>
  );
}
