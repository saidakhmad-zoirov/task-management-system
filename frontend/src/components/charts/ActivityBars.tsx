import { useEffect, useState } from "react";

import type { DayActivity } from "../../types";
import { parseDay } from "../../utils/format";

const WEEKDAYS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

/** Oxirgi 7 kun: yaratilgan (binafsha) va bajarilgan (accent) vazifalar. Ustunlar pastdan o'sib chiqadi. */
export function ActivityBars({ days }: { days: DayActivity[] }) {
  const max = Math.max(1, ...days.flatMap((d) => [d.created, d.completed]));
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      <div className="flex h-40 items-end justify-between gap-2" role="img" aria-label="Oxirgi 7 kundagi faollik">
        {days.map((d, i) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              {(["created", "completed"] as const).map((k) => (
                <div key={k} className="relative flex w-full max-w-4 flex-col items-center justify-end" title={`${k === "created" ? "Yaratildi" : "Bajarildi"}: ${d[k]}`}>
                  {d[k] > 0 && <span className="mb-1 font-mono text-[10px] text-muted">{d[k]}</span>}
                  <div
                    className={`w-full rounded-t-md ${k === "created" ? "bg-violet/70" : "bg-accent"}`}
                    style={{
                      height: grown ? `${Math.max(d[k] ? 6 : 2, (d[k] / max) * 100)}px` : "0px",
                      transition: `height 0.9s cubic-bezier(.2,.8,.2,1) ${i * 60}ms`,
                      opacity: d[k] ? 1 : 0.25,
                    }}
                  />
                </div>
              ))}
            </div>
            <span className="font-mono text-[11px] text-faint">{WEEKDAYS[parseDay(d.date).getDay()]}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-violet/70" />Yaratildi</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-accent" />Bajarildi</span>
      </div>
    </div>
  );
}
