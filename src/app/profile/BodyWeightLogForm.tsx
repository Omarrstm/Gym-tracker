"use client";

import { useState, useTransition } from "react";
import { logBodyWeight } from "./actions";

export default function BodyWeightLogForm() {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await logBodyWeight(Number(weight));
        setWeight("");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't log this weight.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border py-2.5 text-center text-[12px] font-semibold tracking-wide text-muted uppercase hover:border-accent hover:text-accent"
      >
        + Log Weight
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Weight (kg)
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="20"
          max="400"
          step="0.1"
          autoFocus
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="rounded-lg border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !weight}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-bold text-bg uppercase disabled:opacity-50"
        >
          Save
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
