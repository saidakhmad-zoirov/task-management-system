import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { TaskForm } from "../components/tasks/TaskForm";
import { DeadlineChip, PriorityBars } from "../components/ui/Badges";
import { Button, LinkButton } from "../components/ui/Button";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { EditIcon, TrashIcon } from "../components/ui/Icons";
import { Modal } from "../components/ui/Modal";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { taskService } from "../services/tasks";
import type { TaskInput, TaskStatus } from "../types";
import { PRIORITY_LABEL, STATUS_LABEL, formatDateTime, formatDay } from "../utils/format";

const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];

export default function TaskDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<TaskStatus | null>(null);
  // GET /tasks/{id}
  const task = useAsync((signal) => taskService.get(id, signal), [id]);
  const t = task.data;

  if (task.loading && !t) return <LoadingState />;
  if (task.notFound)
    return <EmptyState title="Vazifa topilmadi" text="U o'chirilgan yoki sizga tegishli emas." action={<LinkButton to="/tasks">Vazifalarga qaytish</LinkButton>} />;
  if (task.error || !t) return <ErrorState message={task.error ?? "Xatolik"} onRetry={task.reload} />;

  const setStatus = async (status: TaskStatus) => {
    if (status === t.status) return;
    setBusy(status);
    try {
      task.setData(await taskService.update(t.id, { status })); // PATCH /tasks/{id}
      if (status === "done") notify("Bajarildi 🎉");
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  };

  const save = async (input: TaskInput) => {
    task.setData(await taskService.update(t.id, input));
    setEditing(false);
    notify("Saqlandi");
  };

  const remove = async () => {
    try {
      await taskService.remove(t.id); // DELETE /tasks/{id}
      notify("Vazifa o'chirildi", "info");
      navigate("/tasks", { replace: true });
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  const tone = { todo: "bg-faint", in_progress: "bg-violet", done: "bg-accent" };

  return (
    <div className="space-y-8">
      <Link to="/tasks" className="text-sm text-muted transition hover:text-ink">
        ← Barcha vazifalar
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          {t.is_overdue && <span className="inline-block rounded-full bg-coral/15 px-3 py-1 text-xs font-medium text-coral">Muddati o'tgan</span>}
          <h1 className={`break-words text-4xl sm:text-5xl ${t.status === "done" ? "text-muted line-through decoration-faint/60" : ""}`}>
            <SplitText key={t.title} text={t.title} />
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<EditIcon width={16} height={16} />} onClick={() => setEditing(true)}>
            Tahrirlash
          </Button>
          <ConfirmButton label="O'chirish" question="O'chirilsinmi?" onConfirm={remove} icon={<TrashIcon width={16} height={16} />} />
        </div>
      </header>

      <div className="panel grid grid-cols-3 gap-2 p-2" role="group" aria-label="Holat">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            disabled={busy !== null}
            aria-pressed={t.status === s}
            className={`flex items-center justify-center gap-2 rounded-2xl px-2 py-3 text-sm transition ${
              t.status === s ? (s === "done" ? "bg-accent text-on-accent" : s === "in_progress" ? "bg-violet text-bg" : "bg-ink text-bg") : "text-muted hover:bg-panel-2 hover:text-ink"
            }`}
          >
            <span className={`size-2 rounded-full ${t.status === s ? "bg-current" : tone[s]}`} />
            {busy === s ? "…" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel p-6">
          <h2 className="label mb-3">Tavsif</h2>
          <p className="whitespace-pre-line break-words leading-relaxed text-muted">{t.description || "Tavsif qo'shilmagan."}</p>
        </section>
        <aside className="panel space-y-5 p-6">
          <div>
            <p className="label">Muhimlik</p>
            <div className="mt-2">
              <PriorityBars priority={t.priority} />
            </div>
            <p className="sr-only">{PRIORITY_LABEL[t.priority]}</p>
          </div>
          <div>
            <p className="label">Muddat</p>
            <div className="mt-2 space-y-1">
              <DeadlineChip deadline={t.deadline} done={t.status === "done"} />
              {t.deadline && <p className="text-sm text-muted">{formatDay(t.deadline)}</p>}
            </div>
          </div>
          <div className="border-t border-line pt-4 text-sm text-muted">
            <p>Yaratilgan: {formatDateTime(t.created_at)}</p>
            <p>Yangilangan: {formatDateTime(t.updated_at)}</p>
          </div>
        </aside>
      </div>

      <Modal open={editing} title="Vazifani tahrirlash" onClose={() => setEditing(false)}>
        {editing && <TaskForm initial={t} onSubmit={save} onCancel={() => setEditing(false)} />}
      </Modal>
    </div>
  );
}
