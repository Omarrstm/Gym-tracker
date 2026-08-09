"use client";

import { useActionState } from "react";
import { updateBodyStats } from "./actions";

export default function BodyStatsForm({
  initialHeightCm,
  initialWeightKg,
  initialDateOfBirth,
  initialSex,
}: {
  initialHeightCm: number | null;
  initialWeightKg: number | null;
  initialDateOfBirth: string | null;
  initialSex: "MALE" | "FEMALE" | null;
}) {
  const [state, formAction, pending] = useActionState(updateBodyStats, undefined);

  return (
    <form action={formAction} key={state?.success} className="relative z-10 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Height (cm)
          </span>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            min="50"
            max="272"
            required
            defaultValue={initialHeightCm ?? ""}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Weight (kg)
          </span>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min="20"
            max="400"
            required
            defaultValue={initialWeightKg ?? ""}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Date of Birth
          </span>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={initialDateOfBirth ?? ""}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Sex
          </span>
          <select
            name="sex"
            required
            defaultValue={initialSex ?? ""}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          >
            <option value="" disabled>
              Select
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </label>
      </div>

      {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}
      {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Body Stats"}
      </button>
    </form>
  );
}
