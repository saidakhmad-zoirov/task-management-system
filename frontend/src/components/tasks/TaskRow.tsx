import { Link } from "react-router-dom";

import type { Task, TaskStatus } from "../../types";
import { DeadlineChip, PriorityBars, StatusBadge } from "../ui/Badges";
import { ConfirmButton } from "../ui/ConfirmButton";
import { EditIcon, TrashIcon } from "../ui/Icons";
import { StatusToggle } from "./StatusToggle";

interface Props {
  task: Task;
  index: number;
  onStatus: (task: Task, status: TaskStatus) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
}

export function TaskRow({ task, index, onStatus, onEdit, onDelete }: Props) {
  const done = task.status === "done";
  return (
    <li
      className={`rise group/row panel flex flex-wrap items-center gap-4 p-4 transition duration-300 hover:border-line-strong sm:flex-nowrap sm:p-5 ${task.is_overdue ? "border-coral/30" : ""}`}
      style={{ ["--i" as string]: index }}
    >
      <StatusToggle status={task.status} onChange={(s) => onStatus(task, s)} />
      <div className="min-w-0 flex-1">
        <Link to={`/tasks/${task.id}`} className={`block truncate text-base font-medium transition hover:text-accent ${done ? "text-muted line-through decoration-faint" : ""}`}>
          {task.title}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <StatusBadge status={task.status} />
          <PriorityBars priority={task.priority} />
          <DeadlineChip deadline={task.deadline} done={done} />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:opacity-60 sm:transition sm:group-hover/row:opacity-100">
        <button type="button" onClick={() => onEdit(task)} aria-label={`"${task.title}" — tahrirlash`} className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-panel-2 hover:text-ink">
          <EditIcon width={18} height={18} />
        </button>
        <ConfirmButton label="" ariaLabel={`"${task.title}" — o'chirish`} question="O'chirilsinmi?" onConfirm={() => onDelete(task)} icon={<TrashIcon width={16} height={16} />} />
      </div>
    </li>
  );
}
