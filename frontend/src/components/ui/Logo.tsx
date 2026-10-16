import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="TaskPulse">
      <span className="relative grid size-9 place-items-center rounded-xl bg-accent text-on-accent transition duration-500 group-hover:rotate-[-8deg]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
        <span className="live-dot absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-bg bg-violet" />
      </span>
      <span className="font-display text-xl tracking-wide">
        task<span className="text-accent">pulse</span>
      </span>
    </Link>
  );
}
