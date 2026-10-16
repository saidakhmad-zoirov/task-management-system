import type { TaskPriority, TaskStatus } from "../types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Bajarilishi kerak",
  in_progress: "Jarayonda",
  done: "Bajarildi",
};
export const STATUS_SHORT: Record<TaskStatus, string> = { todo: "To do", in_progress: "Jarayonda", done: "Bajarildi" };
export const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Past", medium: "O'rta", high: "Yuqori" };
export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = { todo: "in_progress", in_progress: "done", done: "todo" };

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

/** "YYYY-MM-DD" ni mahalliy sana sifatida o'qiydi (UTC siljishsiz). */
export function parseDay(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Bugundan necha kun qolgan (manfiy — o'tib ketgan). */
export function daysUntil(deadline: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseDay(deadline).getTime() - today.getTime()) / 86_400_000);
}

export function formatDay(value: string): string {
  const d = parseDay(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function deadlineLabel(deadline: string | null, done: boolean): { text: string; tone: "muted" | "soon" | "late" | "ok" } {
  if (!deadline) return { text: "Muddatsiz", tone: "muted" };
  const days = daysUntil(deadline);
  if (done) return { text: formatDay(deadline), tone: "ok" };
  if (days < 0) return { text: `${-days} kun kechikdi`, tone: "late" };
  if (days === 0) return { text: "Bugun", tone: "soon" };
  if (days === 1) return { text: "Ertaga", tone: "soon" };
  if (days <= 7) return { text: `${days} kun qoldi`, tone: "soon" };
  return { text: formatDay(deadline), tone: "muted" };
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}
