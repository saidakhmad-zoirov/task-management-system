import { useState, type FormEvent } from "react";

import { getErrorMessage, getFieldErrors } from "../../services/errors";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "../../types";
import { PRIORITY_LABEL, STATUS_LABEL } from "../../utils/format";
import { Button } from "../ui/Button";
import { Field, TextArea } from "../ui/Field";

interface Props {
  initial?: Task | null;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
}

/** Yaratish va tahrirlash uchun bitta forma. Backend xatolari maydonlar ostida ko'rsatiladi. */
export function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<TaskInput>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "todo",
    priority: initial?.priority ?? "medium",
    deadline: initial?.deadline ?? null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneral(null);
    if (!form.title.trim()) {
      setErrors({ title: "Sarlavha bo'sh bo'lmasligi kerak." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, title: form.title.trim(), deadline: form.deadline || null });
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setGeneral(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="task-title" label="Sarlavha" name="title" maxLength={200} required autoFocus value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Masalan: Haftalik hisobotni tayyorlash" />
      <TextArea id="task-description" label="Tavsif" name="description" maxLength={5000} value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Batafsil (ixtiyoriy)" />

      <div className="space-y-2">
        <span className="label">Holat</span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
            <button key={s} type="button" aria-pressed={form.status === s} onClick={() => setForm({ ...form, status: s })} className="chip justify-center px-2 text-xs sm:text-sm">
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2" htmlFor="task-priority">
          <span className="label">Muhimlik</span>
          <select id="task-priority" className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <Field id="task-deadline" label="Muddat" name="deadline" type="date" value={form.deadline ?? ""} error={errors.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value || null })} />
      </div>

      {general && (
        <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
          {general}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </form>
  );
}
