import { useRef } from "react";

import { RGB, roundRect, useCanvasLoop } from "./useCanvas";

type Prio = "low" | "medium" | "high";

interface Card {
  id: number;
  title: string;
  prio: Prio;
  lane: 0 | 1 | 2;
  x: number;
  y: number;
  alpha: number;
  flash: number; // "bajarildi" chaqnashi 1 → 0
  leaving: boolean;
}

// Landing illyustratsiyasi: mahsulot qanday ishlashini ko'rsatadigan namunaviy kartochkalar
const POOL: [string, Prio][] = [
  ["Dizayn maketini tayyorlash", "high"],
  ["API endpointlarni yozish", "high"],
  ["Testlarni yozish", "medium"],
  ["Haftalik hisobot", "low"],
  ["Kod review", "medium"],
  ["Bazani migratsiya qilish", "medium"],
  ["Mijoz bilan uchrashuv", "low"],
  ["Deploy qilish", "high"],
  ["README yangilash", "low"],
  ["Xatolarni tuzatish", "medium"],
];
const LANES = ["TO DO", "JARAYONDA", "BAJARILDI"] as const;
const LANE_RGB = [RGB.muted, RGB.violet, RGB.accent];

/**
 * Landing hero: vazifa kartochkalari "To do → Jarayonda → Bajarildi" yo'laklari bo'ylab oqadi.
 * Bajarilganda accent chaqnaydi; sichqoncha tomon yengil og'adi.
 */
export function FlowHero() {
  const cards = useRef<Card[]>([]);
  const nextId = useRef(0);
  const poolIdx = useRef(0);
  const lastTick = useRef(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  if (!cards.current.length) {
    const init: [number, 0 | 1 | 2][] = [[0, 0], [1, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 2]];
    cards.current = init.map(([p, lane]) => {
      const [title, prio] = POOL[p]!;
      return { id: nextId.current++, title, prio, lane, x: 0, y: 0, alpha: 0, flash: 0, leaving: false };
    });
    poolIdx.current = init.length;
  }

  const spawn = () => {
    const [title, prio] = POOL[poolIdx.current % POOL.length]!;
    poolIdx.current++;
    cards.current.push({ id: nextId.current++, title, prio, lane: 0, x: -1, y: -1, alpha: 0, flash: 0, leaving: false });
  };

  const step = () => {
    const live = cards.current.filter((c) => !c.leaving);
    const lane = (n: number) => live.filter((c) => c.lane === n);
    const doing = lane(1);
    const todo = lane(0);
    const moveToEnd = (c: Card) => {
      cards.current = [...cards.current.filter((x) => x !== c), c]; // yangi yo'lakda pastga tushadi
    };
    if (doing.length && (Math.random() < 0.55 || !todo.length)) {
      const c = doing[0]!;
      c.lane = 2;
      c.flash = 1;
      moveToEnd(c);
    } else if (todo.length) {
      todo[0]!.lane = 1;
      moveToEnd(todo[0]!);
    }
    if (lane(2).length > 3) lane(2)[0]!.leaving = true; // eng eski bajarilgan chiqib ketadi
    if (lane(0).length < 3) spawn();
  };

  const ref = useCanvasLoop(({ ctx, width, height, time, dt }) => {
    ctx.clearRect(0, 0, width, height);
    if (time - lastTick.current > 1500) {
      lastTick.current = time;
      step();
    }
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;

    const gap = width < 520 ? 8 : 14;
    const laneW = (width - gap * 2) / 3;
    const cardH = width < 520 ? 40 : 50;
    const top = 52;
    const small = width < 520;

    // yo'laklar
    LANES.forEach((label, i) => {
      const lx = i * (laneW + gap) + m.x * (i - 1) * 6;
      const ly = m.y * (i - 1) * 4;
      ctx.fillStyle = `rgba(${RGB.panel},0.72)`;
      roundRect(ctx, lx, ly, laneW, height - ly - 4, 18);
      ctx.fill();
      ctx.strokeStyle = `rgba(${RGB.line},1)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = `rgba(${LANE_RGB[i]},1)`;
      ctx.beginPath();
      ctx.arc(lx + 18, ly + 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `500 ${small ? 9 : 11}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(${RGB.muted},1)`;
      ctx.fillText(label, lx + 30, ly + 30);
      const count = cards.current.filter((c) => c.lane === i && !c.leaving).length;
      ctx.fillStyle = `rgba(${RGB.ink},0.9)`;
      ctx.textAlign = "right";
      ctx.fillText(String(count), lx + laneW - 16, ly + 30);
      ctx.textAlign = "left";
    });

    // kartochkalar: har biri o'z yo'lagidagi joyiga silliq suriladi
    const slots = [0, 0, 0];
    for (const c of cards.current) {
      const i = c.lane;
      const slot = c.leaving ? slots[i]! : slots[i]!++;
      const lx = i * (laneW + gap) + m.x * (i - 1) * 6;
      const tx = lx + 10;
      const ty = top + slot * (cardH + 10) + m.y * (i - 1) * 4;
      if (c.x < 0 || (c.x === 0 && c.y === 0)) {
        c.x = tx;
        c.y = ty + 30;
      }
      c.x += (tx - c.x) * 0.09;
      c.y += (ty - c.y) * 0.09;
      c.alpha += ((c.leaving ? 0 : 1) - c.alpha) * 0.08;
      c.flash = Math.max(0, c.flash - dt / 900);
      const w = laneW - 20;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, c.alpha));
      if (c.flash > 0) {
        ctx.shadowColor = `rgba(${RGB.accent},${c.flash * 0.8})`;
        ctx.shadowBlur = 28 * c.flash;
      }
      ctx.fillStyle = i === 2 ? `rgba(${RGB.accent},${0.1 + c.flash * 0.35})` : "rgba(25,25,33,1)";
      roundRect(ctx, c.x, c.y, w, cardH, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = i === 2 ? `rgba(${RGB.accent},0.35)` : i === 1 ? `rgba(${RGB.violet},0.35)` : `rgba(${RGB.line},1)`;
      ctx.stroke();

      // muhimlik ustunchalari
      const level = { low: 1, medium: 2, high: 3 }[c.prio];
      const prioRgb = c.prio === "high" ? RGB.coral : c.prio === "medium" ? RGB.violet : RGB.muted;
      for (let b = 1; b <= 3; b++) {
        ctx.fillStyle = b <= level ? `rgba(${prioRgb},1)` : `rgba(${RGB.line},1)`;
        const bh = 3 + b * 3;
        ctx.fillRect(c.x + 12 + (b - 1) * 5, c.y + cardH / 2 + 6 - bh, 3, bh);
      }

      // sarlavha (sig'masa qisqartiriladi)
      ctx.font = `500 ${small ? 10 : 13}px "Instrument Sans", system-ui, sans-serif`;
      ctx.fillStyle = i === 2 ? `rgba(${RGB.ink},0.75)` : `rgba(${RGB.ink},1)`;
      const maxW = w - (i === 2 ? 58 : 40);
      let title = c.title;
      while (title.length > 3 && ctx.measureText(title).width > maxW) title = title.slice(0, -2);
      if (title !== c.title) title = title.trimEnd() + "…";
      const textX = c.x + 32;
      const textY = c.y + cardH / 2 + 4;
      ctx.fillText(title, textX, textY);
      if (i === 2) {
        const tw = ctx.measureText(title).width;
        ctx.strokeStyle = `rgba(${RGB.ink},0.45)`;
        ctx.beginPath();
        ctx.moveTo(textX, textY - 4);
        ctx.lineTo(textX + tw, textY - 4);
        ctx.stroke();
        // belgi
        ctx.fillStyle = `rgba(${RGB.accent},1)`;
        ctx.beginPath();
        ctx.arc(c.x + w - 18, c.y + cardH / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(11,11,16,1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x + w - 22, c.y + cardH / 2);
        ctx.lineTo(c.x + w - 19, c.y + cardH / 2 + 3);
        ctx.lineTo(c.x + w - 14, c.y + cardH / 2 - 3);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      ctx.restore();
    }
    cards.current = cards.current.filter((c) => !(c.leaving && c.alpha < 0.02));
  });

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Vazifalar To do, Jarayonda va Bajarildi ustunlari bo'ylab harakatlanadi"
      className="h-full w-full"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouse.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }}
      onPointerLeave={() => {
        mouse.current.tx = 0;
        mouse.current.ty = 0;
      }}
    />
  );
}
