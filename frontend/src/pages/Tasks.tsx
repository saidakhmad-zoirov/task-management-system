import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Pagination } from "../components/tasks/Pagination";
import { TaskForm } from "../components/tasks/TaskForm";
import { TaskRow } from "../components/tasks/TaskRow";
import { Button } from "../components/ui/Button";
import { DecodeText } from "../components/ui/DecodeText";
import { CloseIcon, PlusIcon, SearchIcon } from "../components/ui/Icons";
import { Modal } from "../components/ui/Modal";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, ListSkeleton } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { taskService } from "../services/tasks";
import type { Task, TaskInput, TaskPriority, TaskSort, TaskStatus } from "../types";
import { PRIORITY_LABEL, STATUS_LABEL } from "../utils/format";

const PAGE_SIZE = 8;
const SORTS: { value: TaskSort; label: string }[] = [
  { value: "-created_at", label: "Eng yangi" },
  { value: "deadline", label: "Muddat: yaqinidan" },
  { value: "-deadline", label: "Muddat: uzog'idan" },
  { value: "priority", label: "Muhimlik" },
  { value: "title", label: "Nomi: A–Z" },
  { value: "created_at", label: "Eng eski" },
];
const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];
const PRIORITIES = Object.keys(PRIORITY_LABEL) as TaskPriority[];

export default function Tasks() {
  const [params, setParams] = useSearchParams();
  const { notify } = useToast();

  // URL — filtrlar uchun yagona manba (havolani ulashsa ham shu ko'rinish ochiladi)
  const search = params.get("search") ?? "";
  const status = STATUSES.find((s) => s === params.get("status"));
  const priority = PRIORITIES.find((p) => p === params.get("priority"));
  const sort = SORTS.find((s) => s.value === params.get("sort"))?.value ?? "-created_at";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  };

  const [term, setTerm] = useState(search);
  const debounced = useDebounce(term, 350);
  useEffect(() => setTerm(search), [search]);
  useEffect(() => {
    if (debounced.trim() !== search) update({ search: debounced.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // GET /tasks/?search=&status=&priority=&sort=&page=&size=
  const list = useAsync(
    (signal) => taskService.list({ search: search || undefined, status, priority, sort, page, size: PAGE_SIZE }, signal),
    [search, status, priority, sort, page],
  );

  // Oxirgi elementni o'chirgach bo'sh sahifada qolib ketmaslik
  useEffect(() => {
    if (list.data && page > list.data.pages) update({ page: list.data.pages > 1 ? String(list.data.pages) : null }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data?.pages]);

  // Modal: yaratish (?new=1) yoki tahrirlash
  const [editing, setEditing] = useState<Task | null>(null);
  const creating = params.get("new") === "1";
  const modalOpen = creating || editing !== null;
  const closeModal = () => {
    setEditing(null);
    if (creating) update({ new: null }, false);
  };

  const save = async (input: TaskInput) => {
    if (editing) {
      await taskService.update(editing.id, input); // PATCH /tasks/{id}
      notify("Vazifa saqlandi");
    } else {
      await taskService.create(input); // POST /tasks/
      notify("Vazifa yaratildi");
    }
    closeModal();
    list.reload();
  };

  const changeStatus = async (task: Task, next: TaskStatus) => {
    try {
      const updated = await taskService.update(task.id, { status: next });
      if (list.data) list.setData({ ...list.data, items: list.data.items.map((t) => (t.id === task.id ? updated : t)) });
      if (next === "done") notify(`"${task.title}" bajarildi 🎉`);
      if (status && status !== next) list.reload(); // filtrdan chiqib ketdi
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  const remove = async (task: Task) => {
    try {
      await taskService.remove(task.id); // DELETE /tasks/{id}
      notify("Vazifa o'chirildi", "info");
      list.reload();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  const hasFilters = Boolean(search || status || priority);
  const data = list.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <DecodeText text="VAZIFALAR" className="label text-violet" />
          <h1 className="text-4xl sm:text-5xl">
            <SplitText text="Mening vazifalarim" />
          </h1>
          <p className="text-muted">{data ? `${data.total} ta vazifa${hasFilters ? " topildi" : ""}` : "Yuklanmoqda…"}</p>
        </div>
        <Button icon={<PlusIcon width={18} height={18} />} onClick={() => update({ new: "1" }, false)}>
          Yangi vazifa
        </Button>
      </header>

      <div className="panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-faint" />
            <input id="task-search" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Sarlavha yoki tavsif bo'yicha qidirish…" aria-label="Qidirish" className="field h-12 rounded-full pl-12" />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select id="task-priority-filter" aria-label="Muhimlik" className="field h-12 w-full rounded-full sm:w-52" value={priority ?? ""} onChange={(e) => update({ priority: e.target.value || null })}>
              <option value="">Har qanday muhimlik</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
            <select id="task-sort" aria-label="Saralash" className="field h-12 w-full rounded-full sm:w-52" value={sort} onChange={(e) => update({ sort: e.target.value === "-created_at" ? null : e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="chip" aria-pressed={!status} onClick={() => update({ status: null })}>
            Hammasi
          </button>
          {STATUSES.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => update({ status: s })}>
              <span className={`size-2 rounded-full ${s === "done" ? "bg-accent" : s === "in_progress" ? "bg-violet" : "bg-faint"}`} />
              {STATUS_LABEL[s]}
            </button>
          ))}
          {hasFilters && (
            <button type="button" className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink" onClick={() => setParams(sort === "-created_at" ? {} : { sort })}>
              <CloseIcon width={14} height={14} /> Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${list.loading && data ? "opacity-50" : ""}`}>
        {list.loading && !data ? (
          <ListSkeleton />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : data && data.items.length ? (
          <div className="space-y-8">
            <ul className="space-y-3">
              {data.items.map((t, i) => (
                <TaskRow key={t.id} task={t} index={i} onStatus={changeStatus} onEdit={setEditing} onDelete={remove} />
              ))}
            </ul>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => update({ page: p > 1 ? String(p) : null }, false)} />
          </div>
        ) : (
          <EmptyState
            title={hasFilters ? "Hech narsa topilmadi" : "Vazifalar ro'yxati bo'sh"}
            text={hasFilters ? "Filtrlarni o'zgartirib yoki tozalab ko'ring." : "Birinchi vazifangizni qo'shing."}
            action={!hasFilters && <Button onClick={() => update({ new: "1" }, false)}>Vazifa yaratish</Button>}
          />
        )}
      </div>

      <Modal open={modalOpen} title={editing ? "Vazifani tahrirlash" : "Yangi vazifa"} onClose={closeModal}>
        {modalOpen && <TaskForm key={editing?.id ?? "new"} initial={editing} onSubmit={save} onCancel={closeModal} />}
      </Modal>
    </div>
  );
}
