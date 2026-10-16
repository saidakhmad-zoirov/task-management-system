import { useEffect, useState } from "react";

import { FlowHero } from "../components/canvas/FlowHero";
import { LinkButton } from "../components/ui/Button";
import { DecodeText } from "../components/ui/DecodeText";
import { ArrowIcon, BoltIcon, CalendarIcon, GridIcon, ListIcon } from "../components/ui/Icons";
import { SplitText } from "../components/ui/SplitText";
import { WordCycler } from "../components/ui/WordCycler";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboard";

const FEATURES = [
  { icon: ListIcon, title: "Vazifalar", text: "Yaratish, tahrirlash, o'chirish. Qidiruv, holat va muhimlik bo'yicha filter, muddat bo'yicha saralash." },
  { icon: CalendarIcon, title: "Muddatlar", text: "Har bir vazifaga muddat. Kechikkanlar qizil, yaqinlashganlar alohida ko'rinadi." },
  { icon: GridIcon, title: "Dashboard", text: "Holatlar halqasi, 7 kunlik faollik va muddat radari — hammasi bazadagi haqiqiy ma'lumotlardan." },
  { icon: BoltIcon, title: "Xavfsizlik", text: "Argon2 bilan xeshlangan parollar, JWT tokenlar. Har kim faqat o'z vazifalarini ko'radi." },
];

const STEPS = [
  { tag: "TO DO", color: "bg-faint", title: "Rejalashtiring", text: "Vazifa qo'shing, muhimligi va muddatini belgilang." },
  { tag: "JARAYONDA", color: "bg-violet", title: "Bajaring", text: "Bir bosishda holatni o'zgartiring — ish qayerda ekani doim ko'rinadi." },
  { tag: "BAJARILDI", color: "bg-accent", title: "Yakunlang", text: "Bajarilganlar statistikaga tushadi, dashboard o'sishni ko'rsatadi." },
];

export default function Landing() {
  const { user } = useAuth();
  const [online, setOnline] = useState<boolean | null>(null);

  // Haqiqiy API holati: GET /api/v1/health
  useEffect(() => {
    dashboardService
      .health()
      .then(setOnline)
      .catch(() => setOnline(false));
  }, []);

  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-panel/60 px-4 py-2 backdrop-blur">
            <span className={`size-2 rounded-full ${online === false ? "bg-coral" : "live-dot bg-accent"}`} />
            <DecodeText
              text={online === null ? "API TEKSHIRILMOQDA" : online ? "API ONLINE · FASTAPI" : "API OFFLINE — BACKENDNI ISHGA TUSHIRING"}
              className="font-mono text-[11px] tracking-[0.18em] text-muted"
            />
          </div>
          <h1 className="text-[clamp(2.8rem,7.5vw,6rem)] leading-[0.98]">
            <SplitText text="Vazifalarni" className="block" />
            <WordCycler words={["rejalashtiring.", "bajaring.", "yakunlang."]} className="text-accent" />
          </h1>
          <p className="max-w-lg text-lg text-muted">
            TaskPulse — vazifalar, muddatlar va statistika bir joyda. Har bir o'zgarish darhol dashboardda aks etadi.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <LinkButton to="/dashboard" size="lg" icon={<ArrowIcon width={18} height={18} />}>
                Dashboardga o'tish
              </LinkButton>
            ) : (
              <>
                <LinkButton to="/register" size="lg" icon={<ArrowIcon width={18} height={18} />}>
                  Bepul boshlash
                </LinkButton>
                <LinkButton to="/login" size="lg" variant="outline">
                  Kirish
                </LinkButton>
              </>
            )}
          </div>
        </div>
        <div className="relative h-[360px] sm:h-[440px]">
          <div className="pointer-events-none absolute inset-6 rounded-full bg-violet/15 blur-[90px]" />
          <FlowHero />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="label text-violet">Qanday ishlaydi</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">Uch holat — bitta oqim</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.tag} className="rise panel relative overflow-hidden p-6" style={{ ["--i" as string]: i }}>
              <span className="label flex items-center gap-2">
                <span className={`size-2 rounded-full ${s.color}`} />
                {s.tag}
              </span>
              <h3 className="mt-6 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="rise group panel p-6 transition duration-500 hover:-translate-y-1 hover:border-line-strong" style={{ ["--i" as string]: i }}>
              <span className="grid size-11 place-items-center rounded-2xl bg-panel-2 text-accent transition group-hover:bg-accent group-hover:text-on-accent">
                <Icon />
              </span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
