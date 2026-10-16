import { useEffect, useRef, type RefObject } from "react";

import { prefersReducedMotion, useInView } from "../../hooks/useInView";

export interface FrameInfo {
  ctx: CanvasRenderingContext2D;
  width: number; // CSS piksel
  height: number;
  time: number; // ms
  dt: number;
}

/** Loyiha palitrasi canvas uchun ("r,g,b"). index.css dagi ranglar bilan bir xil. */
export const RGB = {
  ink: "245,245,247",
  muted: "167,167,179",
  accent: "47,211,154",
  violet: "157,144,255",
  coral: "255,107,91",
  panel: "19,19,26",
  line: "44,44,56",
} as const;

/**
 * Canvas uchun umumiy sikl: devicePixelRatio bo'yicha aniq (crisp) chizish,
 * o'lcham o'zgarishini kuzatish, ekrandan tashqarida va yashirin tabda pauza.
 */
export function useCanvasLoop(draw: (frame: FrameInfo) => void, options: { always?: boolean } = {}): RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const inView = useInView(ref, "50px");
  const active = options.always || inView;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!document.hidden) drawRef.current({ ctx, width, height, time: now, dt });
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return ref;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
