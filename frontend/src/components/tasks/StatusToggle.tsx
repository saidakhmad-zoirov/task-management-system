import { useState } from "react";

import type { TaskStatus } from "../../types";
import { NEXT_STATUS, STATUS_LABEL } from "../../utils/format";
import { Spinner } from "../ui/Spinner";

interface Props {
  status: TaskStatus;
  onChange: (next: TaskStatus) => Promise<void>;
}

/** Doira tugma: bosilganda status keyingisiga o'tadi (to do → jarayonda → bajarildi → to do). */
export function StatusToggle({ status, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(0);
  const next = NEXT_STATUS[status];

  const click = async () => {
    setBusy(true);
    try {
      await onChange(next);
      if (next === "done") setPopped((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  const style = {
    todo: "border-line-strong hover:border-violet",
    in_progress: "border-violet bg-violet/15 hover:border-accent",
    done: "border-accent bg-accent text-on-accent",
  }[status];

  return (
    <button
      type="button"
      onClick={click}
      disabled={busy}
      aria-label={`Holat: ${STATUS_LABEL[status]}. Bosing — "${STATUS_LABEL[next]}"`}
      title={`→ ${STATUS_LABEL[next]}`}
      key={popped}
      className={`grid size-9 shrink-0 place-items-center rounded-full border-2 transition duration-300 ${style} ${popped ? "pop-ring" : ""}`}
    >
      {busy ? (
        <Spinner size={14} />
      ) : status === "done" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      ) : status === "in_progress" ? (
        <span className="live-dot size-2.5 rounded-full bg-violet" />
      ) : null}
    </button>
  );
}
