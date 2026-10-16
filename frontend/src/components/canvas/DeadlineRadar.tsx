import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { Task } from "../../types";
import { daysUntil } from "../../utils/format";
import { RGB, roundRect, useCanvasLoop } from "./useCanvas";

const MAX_DAYS = 14;
const RINGS = [
  { days: 1, label: "ertaga" },
  { days: 3, label: "3 kun" },
  { days: 7, label: "7 kun" },
  { days: 14, label: "14+ kun" },
];

interface Blip {
  task: Task;
  days: number;
  angle: number;
  x: number;
  y: number;
  glow: number;
}

/** Vazifa ID'sidan barqaror burchak (har yangilanishda joyi o'zgarmasin) */
function angleFor(id: number): number {
  const x = Math.sin(id * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * Math.PI * 2;
}

/**
 * Muddat radari: markaz — bugun. Nuqta markazga qanchalik yaqin bo'lsa, muddat shunchalik yaqin.
 * Muddati o'tganlar markazda qizil yonib-o'chadi. Aylanayotgan nur nuqtalarni "yoritadi".
 * Ma'lumot — haqiqiy API'dan (bajarilmagan, muddatli vazifalar). Nuqtani bosish — vazifa sahifasi.
 */
export function DeadlineRadar({ tasks }: { tasks: Task[] }) {
  const navigate = useNavigate();
  const hover = useRef<Blip | null>(null);
  const blips = useRef<Blip[]>([]);
  const key = useRef("");

  const sig = tasks.map((t) => `${t.id}:${t.deadline}:${t.status}`).join("|");
  if (sig !== key.current) {
    key.current = sig;
    blips.current = tasks
      .filter((t) => t.deadline && t.status !== "done")
      .map((t) => ({ task: t, days: daysUntil(t.deadline!), angle: angleFor(t.id), x: 0, y: 0, glow: 0 }));
  }

  const ref = useCanvasLoop(({ ctx, width, height, time }) => {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) / 2 - 18;
    const radiusFor = (days: number) => (days < 0 ? R * 0.08 : R * (0.16 + 0.84 * Math.min(days, MAX_DAYS) / MAX_DAYS));

    // halqalar
    ctx.lineWidth = 1;
    RINGS.forEach((ring) => {
      const r = radiusFor(ring.days);
      ctx.strokeStyle = `rgba(${RGB.line},1)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '400 10px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(${RGB.muted},0.8)`;
      ctx.fillText(ring.label, cx + 6, cy - r - 4);
    });
    ctx.strokeStyle = `rgba(${RGB.line},0.7)`;
    ctx.beginPath();
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.stroke();

    // aylanuvchi nur
    const sweep = (time * 0.0009) % (Math.PI * 2);
    const grad = ctx.createConicGradient(sweep - 0.9, cx, cy);
    grad.addColorStop(0, `rgba(${RGB.accent},0)`);
    grad.addColorStop(0.14, `rgba(${RGB.accent},0.16)`);
    grad.addColorStop(0.145, `rgba(${RGB.accent},0)`);
    grad.addColorStop(1, `rgba(${RGB.accent},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${RGB.accent},0.55)`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
    ctx.stroke();

    // markaz — bugun
    ctx.fillStyle = `rgba(${RGB.accent},1)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    if (!blips.current.length) {
      ctx.font = '500 13px "Instrument Sans", system-ui, sans-serif';
      ctx.fillStyle = `rgba(${RGB.muted},1)`;
      ctx.textAlign = "center";
      ctx.fillText("Muddatli faol vazifa yo'q", cx, cy + R * 0.55);
      ctx.textAlign = "left";
      return;
    }

    for (const b of blips.current) {
      const r = radiusFor(b.days);
      const a = b.days < 0 ? b.angle + time * 0.0006 : b.angle;
      b.x = cx + Math.cos(a) * r;
      b.y = cy + Math.sin(a) * r;
      // nur o'tganda yonadi, keyin asta so'nadi
      const diff = (((sweep - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (diff < 0.08) b.glow = 1;
      b.glow = Math.max(0.35, b.glow * 0.985);
      const rgb = b.days < 0 || b.task.priority === "high" ? RGB.coral : b.task.priority === "medium" ? RGB.violet : RGB.ink;
      const pulse = b.days < 0 ? 0.5 + 0.5 * Math.sin(time * 0.006) : 0;
      const isHover = hover.current === b;
      ctx.fillStyle = `rgba(${rgb},${0.12 * b.glow + pulse * 0.15})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 10 + 6 * b.glow + pulse * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${rgb},${0.55 + 0.45 * b.glow})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, isHover ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // yorliq — canvas'da aniq matn
    const h = hover.current;
    if (h) {
      const title = h.task.title.length > 30 ? `${h.task.title.slice(0, 29)}…` : h.task.title;
      const sub = h.days < 0 ? `${-h.days} kun kechikdi` : h.days === 0 ? "bugun" : `${h.days} kun qoldi`;
      ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
      const w = Math.max(ctx.measureText(title).width, 90) + 26;
      const bx = Math.min(Math.max(6, h.x - w / 2), width - w - 6);
      const by = h.y - 62 < 4 ? h.y + 16 : h.y - 62;
      ctx.fillStyle = "rgba(19,19,26,0.96)";
      ctx.strokeStyle = `rgba(${RGB.line},1)`;
      roundRect(ctx, bx, by, w, 48, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(${RGB.ink},1)`;
      ctx.fillText(title, bx + 13, by + 20);
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = h.days < 0 ? `rgba(${RGB.coral},1)` : `rgba(${RGB.accent},1)`;
      ctx.fillText(sub, bx + 13, by + 37);
    }
  });

  const pick = (clientX: number, clientY: number, el: HTMLCanvasElement) => {
    const r = el.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    let best: Blip | null = null;
    let bestD = 14;
    for (const b of blips.current) {
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < bestD) {
        best = b;
        bestD = d;
      }
    }
    return best;
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Muddat radari: ${blips.current.length} ta faol muddatli vazifa`}
      className="h-full w-full"
      onPointerMove={(e) => {
        hover.current = pick(e.clientX, e.clientY, e.currentTarget);
        e.currentTarget.style.cursor = hover.current ? "pointer" : "default";
      }}
      onPointerLeave={() => {
        hover.current = null;
      }}
      onClick={(e) => {
        const b = pick(e.clientX, e.clientY, e.currentTarget);
        if (b) navigate(`/tasks/${b.task.id}`);
      }}
    />
  );
}
