import { Link } from "react-router-dom";

import { DeadlineRadar } from "../components/canvas/DeadlineRadar";
import { ActivityBars } from "../components/charts/ActivityBars";
import { StatusRing } from "../components/charts/StatusRing";
import { DeadlineChip, PriorityBars } from "../components/ui/Badges";
import { LinkButton } from "../components/ui/Button";
import { CountUp } from "../components/ui/CountUp";
import { DecodeText } from "../components/ui/DecodeText";
import { ArrowIcon, PlusIcon } from "../components/ui/Icons";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboard";
import { taskService } from "../services/tasks";
import { PRIORITY_LABEL, greeting } from "../utils/format";

export default function Dashboard() {
  const { user } = useAuth();
  // GET /dashboard/stats — barcha raqamlar backend'da, bazadagi haqiqiy ma'lumotdan hisoblanadi
  const stats = useAsync((signal) => dashboardService.stats(signal), []);
  // Radar uchun: bajarilmagan, muddatli vazifalar (GET /tasks/?status=…&sort=deadline)
  const radar = useAsync(async (signal) => {
    const [todo, doing] = await Promise.all([
      taskService.list({ status: "todo", sort: "deadline", size: 20 }, signal),
      taskService.list({ status: "in_progress", sort: "deadline", size: 20 }, signal),
    ]);
    return [...todo.items, ...doing.items].filter((t) => t.deadline);
  }, []);

  if (stats.loading && !stats.data) return <LoadingState />;
  if (stats.error || !stats.data) return <ErrorState message={stats.error ?? "Xatolik"} onRetry={stats.reload} />;
  const s = stats.data;

  const cards = [
    { label: "Jami vazifalar", value: s.total, accent: "text-ink", bar: "bg-ink", share: 1 },
    { label: "Bajarilmagan", value: s.todo, accent: "text-ink", bar: "bg-faint", share: s.total ? s.todo / s.total : 0 },
    { label: "Jarayonda", value: s.in_progress, accent: "text-violet", bar: "bg-violet", share: s.total ? s.in_progress / s.total : 0 },
    { label: "Bajarildi", value: s.done, accent: "text-accent", bar: "bg-accent", share: s.total ? s.done / s.total : 0 },
  ];
  const maxPriority = Math.max(1, ...Object.values(s.by_priority));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <DecodeText text="DASHBOARD" className="label text-violet" />
          <h1 className="text-4xl sm:text-5xl">
            <SplitText text={`${greeting()}, ${user?.username ?? ""}`} />
          </h1>
          <p className="text-muted">
            {s.overdue > 0 ? (
              <>
                <span className="text-coral">{s.overdue} ta vazifa kechikmoqda</span> · {s.due_soon} tasining muddati shu hafta
              </>
            ) : s.due_soon > 0 ? (
              `Shu hafta ${s.due_soon} ta vazifa muddati tugaydi.`
            ) : (
              "Kechikkan vazifa yo'q — zo'r!"
            )}
          </p>
        </div>
        <LinkButton to="/tasks?new=1" icon={<PlusIcon width={18} height={18} />}>
          Yangi vazifa
        </LinkButton>
      </header>

      {s.total === 0 ? (
        <EmptyState
          title="Hali vazifa yo'q"
          text="Birinchi vazifani qo'shing — statistika va muddat radari shu zahoti jonlanadi."
          action={<LinkButton to="/tasks?new=1">Birinchi vazifani yaratish</LinkButton>}
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Asosiy ko'rsatkichlar">
            {cards.map((c, i) => (
              <div key={c.label} className="rise panel p-5 sm:p-6" style={{ ["--i" as string]: i }}>
                <p className="label">{c.label}</p>
                <CountUp value={c.value} className={`mt-3 block font-display text-4xl sm:text-5xl ${c.accent}`} />
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-panel-2">
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.round(c.share * 100)}%`, transition: "width 1.2s cubic-bezier(.2,.8,.2,1)" }} />
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div className="rise panel relative overflow-hidden p-6" style={{ ["--i" as string]: 4 }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl">Muddat radari</h2>
                  <p className="text-sm text-muted">Markaz — bugun. Nuqtani bosing — vazifa ochiladi.</p>
                </div>
                <div className="flex gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-coral" />yuqori/kechikkan</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet" />o'rta</span>
                </div>
              </div>
              <div className="mx-auto mt-4 aspect-square w-full max-w-[420px]">
                {radar.error ? <ErrorState message={radar.error} onRetry={radar.reload} /> : <DeadlineRadar tasks={radar.data ?? []} />}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rise panel p-6" style={{ ["--i" as string]: 5 }}>
                <h2 className="mb-5 text-2xl">Holatlar</h2>
                <StatusRing todo={s.todo} inProgress={s.in_progress} done={s.done} rate={s.completion_rate} />
              </div>
              <div className="rise panel p-6" style={{ ["--i" as string]: 6 }}>
                <h2 className="mb-4 text-2xl">Muhimlik</h2>
                <ul className="space-y-3">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <li key={p} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
                      <PriorityBars priority={p} />
                      <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                        <div
                          className={`h-full rounded-full ${p === "high" ? "bg-coral" : p === "medium" ? "bg-violet" : "bg-muted"}`}
                          style={{ width: `${(s.by_priority[p] / maxPriority) * 100}%`, transition: "width 1.2s cubic-bezier(.2,.8,.2,1)" }}
                          title={PRIORITY_LABEL[p]}
                        />
                      </div>
                      <span className="text-right font-mono tabular-nums">{s.by_priority[p]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rise panel p-6" style={{ ["--i" as string]: 7 }}>
              <h2 className="mb-5 text-2xl">So'nggi 7 kun</h2>
              <ActivityBars days={s.activity} />
            </div>
            <div className="rise panel p-6" style={{ ["--i" as string]: 8 }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Yaqin muddatlar</h2>
                <Link to="/tasks?sort=deadline" className="roll-host flex items-center gap-1 text-sm text-muted hover:text-ink">
                  <span className="roll">
                    <span>Barchasi</span>
                    <span aria-hidden="true">Barchasi</span>
                  </span>
                  <ArrowIcon width={16} height={16} />
                </Link>
              </div>
              {s.upcoming.length ? (
                <ul className="divide-y divide-line">
                  {s.upcoming.map((t) => (
                    <li key={t.id}>
                      <Link to={`/tasks/${t.id}`} className="flex items-center justify-between gap-4 py-3 transition hover:text-accent">
                        <span className="min-w-0">
                          <span className="block truncate">{t.title}</span>
                          <PriorityBars priority={t.priority} />
                        </span>
                        <DeadlineChip deadline={t.deadline} done={false} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted">Muddatli faol vazifa yo'q.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
