"use client";

import { useMemo, useState } from "react";
import WeightTrendChart from "@/components/WeightTrendChart";
import { estimateOneRepMax } from "@/lib/oneRepMax";
import { filterByRange, timeRangeOptions, type TimeRange } from "@/lib/dateRanges";

type Log = { date: string; weight: number; reps: number };

export default function Exercise1RMChart({ logs }: { logs: Log[] }) {
  const [range, setRange] = useState<TimeRange>("3M");

  const oneRMSeries = useMemo(
    () => logs.map((l) => ({ date: l.date, oneRM: Math.round(estimateOneRepMax(l.weight, l.reps)) })),
    [logs]
  );

  const peak = Math.max(...oneRMSeries.map((l) => l.oneRM));
  const current = oneRMSeries[oneRMSeries.length - 1]?.oneRM ?? 0;
  const previous = oneRMSeries.length >= 2 ? oneRMSeries[oneRMSeries.length - 2].oneRM : null;
  const change = previous !== null && previous > 0 ? ((current - previous) / previous) * 100 : null;

  const chartData = useMemo(
    () => filterByRange(oneRMSeries, range).map((l) => ({ date: l.date, weight: l.oneRM })),
    [oneRMSeries, range]
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Peak 1RM</p>
          <p className="font-display text-[20px] leading-none text-text tabular-nums">{peak} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Current 1RM
          </p>
          <p className="font-display text-[20px] leading-none text-text tabular-nums">
            {current} kg
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Change</p>
          <p
            className={`font-display text-[20px] leading-none tabular-nums ${
              change === null ? "text-muted" : change >= 0 ? "text-accent" : "text-red-400"
            }`}
          >
            {change === null ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
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
          <WeightTrendChart data={chartData} ariaLabel="Estimated one-rep max trend" />
        )}
      </div>
    </div>
  );
}
