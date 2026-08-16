"use client";

import { useMemo, useState } from "react";
import WeightTrendChart from "@/components/WeightTrendChart";
import { filterByRange, timeRangeOptions, type TimeRange } from "@/lib/dateRanges";

type Session = { date: string; weight: number; reps: number };

export default function ExerciseProgressChart({ sessions }: { sessions: Session[] }) {
  const [range, setRange] = useState<TimeRange>("3M");

  const peak = Math.max(...sessions.map((s) => s.weight));
  const current = sessions[sessions.length - 1]?.weight ?? 0;
  const previous = sessions.length >= 2 ? sessions[sessions.length - 2].weight : null;
  const change = previous !== null && previous > 0 ? current - previous : null;

  const chartData = useMemo(
    () => filterByRange(sessions, range).map((s) => ({ date: s.date, weight: s.weight })),
    [sessions, range]
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Peak Weight</p>
          <p className="font-display text-[20px] leading-none text-text tabular-nums">{peak} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Latest</p>
          <p className="font-display text-[20px] leading-none text-text tabular-nums">{current} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Vs Last Workout
          </p>
          <p
            className={`font-display text-[20px] leading-none tabular-nums ${
              change === null ? "text-muted" : change >= 0 ? "text-accent" : "text-red-400"
            }`}
          >
            {change === null ? "—" : `${change >= 0 ? "+" : ""}${change} kg`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto">
        {timeRangeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`flex-none rounded-full border px-3 py-1 text-[11px] font-semibold ${
              range === opt.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="card-shine mt-3 rounded-xl px-4 py-4">
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted">No sessions in this range.</p>
        ) : (
          <WeightTrendChart data={chartData} ariaLabel="Weight per workout" />
        )}
      </div>
    </div>
  );
}
