"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CoachListing = {
  userId: string;
  name: string;
  bio: string | null;
  specialties: string[];
};

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function CoachDirectory({ coaches }: { coaches: CoachListing[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.bio?.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [coaches, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-muted">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coaches or specialties"
          className="w-full bg-transparent text-[13px] text-text placeholder:text-muted outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted">No coaches match your search.</p>
      ) : (
        filtered.map((coach) => (
          <Link
            key={coach.userId}
            href={`/coaches/${coach.userId}`}
            className="card-shine card-pattern flex flex-col gap-1.5 rounded-xl px-4 py-3.5"
          >
            <p className="relative z-10 text-[14.5px] font-semibold text-text">{coach.name}</p>
            {coach.bio && (
              <p className="relative z-10 line-clamp-2 text-[12.5px] text-muted">{coach.bio}</p>
            )}
            {coach.specialties.length > 0 && (
              <div className="relative z-10 mt-1 flex flex-wrap gap-1.5">
                {coach.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted uppercase"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))
      )}
    </div>
  );
}
