export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
];

const RANGE_DAYS: Record<Exclude<TimeRange, "ALL">, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

export function filterByRange<T extends { date: string }>(items: T[], range: TimeRange): T[] {
  if (range === "ALL") return items;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range]);
  return items.filter((item) => new Date(item.date) >= cutoff);
}
