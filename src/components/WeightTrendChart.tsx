"use client";

import { useMemo, useState } from "react";

type Point = { date: string; weight: number };

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;

function niceMax(value: number) {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const step = magnitude / 2;
  return Math.ceil((value * 1.15) / step) * step;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WeightTrendChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const yMax = useMemo(() => niceMax(Math.max(...data.map((d) => d.weight), 0)), [data]);
  const yTicks = [0, yMax / 2, yMax];

  const xFor = (i: number) =>
    data.length <= 1 ? PAD_LEFT + plotWidth / 2 : PAD_LEFT + (i / (data.length - 1)) * plotWidth;
  const yFor = (weight: number) => PAD_TOP + plotHeight - (weight / yMax) * plotHeight;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.weight)}`).join(" ");

  const last = data[data.length - 1];
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, px / rect.width));
    const targetX = PAD_LEFT + ratio * plotWidth;
    let nearest = 0;
    let nearestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - targetX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Weight trend, latest ${last.weight} kg`}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 8}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted text-[10px]"
            >
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {data.length >= 2 && (
          <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const isHovered = i === hoverIndex;
          if (!isLast && !isHovered) return null;
          return (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(d.weight)}
              r={isHovered ? 5.5 : 5}
              fill="var(--color-accent)"
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
          );
        })}

        <text
          x={xFor(data.length - 1)}
          y={yFor(last.weight) - 12}
          textAnchor="end"
          className="fill-text text-[12px] font-semibold"
        >
          {last.weight} kg
        </text>

        <text x={PAD_LEFT} y={HEIGHT - 6} className="fill-muted text-[10px]">
          {formatDate(data[0].date)}
        </text>
        <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 6} textAnchor="end" className="fill-muted text-[10px]">
          {formatDate(data[data.length - 1].date)}
        </text>

        {hovered && (
          <line
            x1={xFor(hoverIndex!)}
            x2={xFor(hoverIndex!)}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="var(--color-muted)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        )}

        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] shadow-lg"
          style={{
            left: `${(xFor(hoverIndex!) / WIDTH) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-semibold text-text">{hovered.weight} kg</p>
          <p className="text-muted">{formatDate(hovered.date)}</p>
        </div>
      )}
    </div>
  );
}
