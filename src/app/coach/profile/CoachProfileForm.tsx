"use client";

import { useActionState } from "react";
import { upsertCoachProfile } from "../actions";

export default function CoachProfileForm({
  initialBio,
  initialSpecialties,
  initialIsPublic,
}: {
  initialBio: string;
  initialSpecialties: string[];
  initialIsPublic: boolean;
}) {
  const [state, formAction, pending] = useActionState(upsertCoachProfile, undefined);

  return (
    <form action={formAction} className="relative z-10 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">Bio</span>
        <textarea
          name="bio"
          rows={4}
          defaultValue={initialBio}
          placeholder="Tell athletes about your coaching style and experience."
          className="resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Specialties (comma-separated)
        </span>
        <input
          name="specialties"
          type="text"
          defaultValue={initialSpecialties.join(", ")}
          placeholder="Powerlifting, Nutrition, Injury Recovery"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          name="isPublic"
          type="checkbox"
          defaultChecked={initialIsPublic}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        <span className="text-[13px] text-text">Show my profile in the coach directory</span>
      </label>

      {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}
      {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Coach Profile"}
      </button>
    </form>
  );
}
