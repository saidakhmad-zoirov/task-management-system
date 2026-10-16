import { useMemo } from "react";

import { RGB, useCanvasLoop } from "./useCanvas";

/** Kirish/ro'yxatdan o'tish foni: accent yadro atrofida vazifa-nuqtalar orbitada aylanadi. */
export function OrbitCanvas() {
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        ring: i % 3,
        a: Math.random() * Math.PI * 2,
        speed: (0.00018 + Math.random() * 0.0002) * (i % 2 ? 1 : -1),
        kind: i % 3, // 0 todo, 1 jarayonda, 2 bajarildi
      })),
    [],
  );

  const ref = useCanvasLoop(({ ctx, width, height, time, dt }) => {
    ctx.clearRect(0, 0, width, height);
    const cx = width * 0.5;
    const cy = height * 0.5;
    const base = Math.min(width, height);
    const radii = [base * 0.18, base * 0.3, base * 0.42];

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
    g.addColorStop(0, `rgba(${RGB.accent},0.18)`);
    g.addColorStop(0.35, `rgba(${RGB.violet},0.06)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    radii.forEach((r, i) => {
      ctx.strokeStyle = `rgba(${RGB.line},${1 - i * 0.2})`;
      ctx.setLineDash(i === 1 ? [2, 6] : []);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.42, -0.35, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const pulse = 1 + 0.08 * Math.sin(time * 0.003);
    ctx.fillStyle = `rgba(${RGB.accent},1)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 9 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const cos = Math.cos(-0.35);
    const sin = Math.sin(-0.35);
    for (const d of dots) {
      d.a += d.speed * dt;
      const r = radii[d.ring]!;
      const ex = Math.cos(d.a) * r;
      const ey = Math.sin(d.a) * r * 0.42;
      const x = cx + ex * cos - ey * sin;
      const y = cy + ex * sin + ey * cos;
      const front = Math.sin(d.a) > 0;
      const rgb = d.kind === 2 ? RGB.accent : d.kind === 1 ? RGB.violet : RGB.muted;
      ctx.fillStyle = `rgba(${rgb},${front ? 0.95 : 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, front ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
