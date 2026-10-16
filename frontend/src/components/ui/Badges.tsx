import type { TaskPriority, TaskStatus } from "../../types";
import { PRIORITY_LABEL, STATUS_SHORT, deadlineLabel } from "../../utils/format";
import { CalendarIcon } from "./Icons";

const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "border-line-strong text-muted",
  in_progress: "border-violet/40 bg-violet/10 text-violet",
  done: "border-accent/40 bg-accent/10 text-accent",
};
const STATUS_DOT: Record<TaskStatus, string> = { todo: "bg-faint", in_progress: "bg-violet live-dot", done: "bg-accent" };

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_SHORT[status]}
    </span>
  );
}

/** Muhimlik — signal ustunchalari: 1/2/3 ta. Faqat "yuqori" qizil (coral), qolganlari neytral. */
export function PriorityBars({ priority, withLabel = true }: { priority: TaskPriority; withLabel?: boolean }) {
  const level = { low: 1, medium: 2, high: 3 }[priority];
  const on = priority === "high" ? "bg-coral" : priority === "medium" ? "bg-violet" : "bg-muted";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted" title={`Muhimlik: ${PRIORITY_LABEL[priority]}`}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-1 rounded-sm ${n <= level ? on : "bg-line-strong"}`} style={{ height: 4 + n * 3 }} />
        ))}
      </span>
      {withLabel && <span>{PRIORITY_LABEL[priority]}</span>}
    </span>
  );
}

export function DeadlineChip({ deadline, done }: { deadline: string | null; done: boolean }) {
  const { text, tone } = deadlineLabel(deadline, done);
  const style = {
    muted: "text-faint",
    ok: "text-muted line-through decoration-faint/60",
    soon: "text-ink",
    late: "text-coral",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${style}`}>
      <CalendarIcon width={14} height={14} />
      {text}
    </span>
  );
}
