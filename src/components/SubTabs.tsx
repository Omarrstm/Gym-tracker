"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border/70 pb-4">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide ${
              active
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
