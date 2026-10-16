import { useEffect, useState } from "react";

import { CountUp } from "../ui/CountUp";

interface Props {
  todo: number;
  inProgress: number;
  done: number;
  rate: number;
}

const SEGMENTS = [
  { key: "done", color: "var(--accent)", label: "Bajarildi" },
  { key: "inProgress", color: "var(--violet)", label: "Jarayonda" },
  { key: "todo", color: "var(--line-strong)", label: "To do" },
] as const;

/** Holatlar halqasi: segmentlar sahifa ochilganda aylanib to'ladi. Markazda — bajarilish foizi. */
export function StatusRing({ todo, inProgress, done, rate }: Props) {
  const values = { todo, inProgress, done };
  const total = todo + inProgress + done;
  const R = 70;
  const C = 2 * Math.PI * R;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`Bajarilgan: ${rate}%`}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--panel-2)" strokeWidth="14" />
          {total > 0 &&
            SEGMENTS.map((s) => {
              const len = (values[s.key] / total) * C;
              const el = (
                <circle
                  key={s.key}
                  cx="90"
                  cy="90"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeLinecap={len > 8 ? "round" : "butt"}
                  strokeDasharray={`${Math.max(0, len - (len > 8 ? 6 : 0))} ${C}`}
                  strokeDashoffset={drawn ? -offset : C}
                  style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)" }}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="font-display text-4xl text-accent">
            <CountUp value={rate} />%
          </span>
          <span className="label mt-1">bajarildi</span>
        </div>
      </div>
      <ul className="w-full space-y-3 text-sm">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-mono tabular-nums">{values[s.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
