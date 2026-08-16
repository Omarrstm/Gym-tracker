import Link from "next/link";
import { logout } from "@/app/actions";

const links = [
  { href: "/exercises", label: "Exercise Library" },
  { href: "/program", label: "Programs" },
  { href: "/stats", label: "Progress" },
  { href: "/coaches", label: "Coaching" },
];

export default function AppHeader({ userName }: { userName: string | null }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/70 py-5 lg:flex-row lg:items-center lg:justify-between">
      <Link href="/" prefetch={false} className="font-display text-[20px] tracking-[0.12em] text-text uppercase">
        Gym Tracker
      </Link>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/profile"
          prefetch={false}
          className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
        >
          {userName}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
          >
            Log Out
          </button>
        </form>
      </nav>
    </header>
  );
}
