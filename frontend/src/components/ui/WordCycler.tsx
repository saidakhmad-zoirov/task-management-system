import { useEffect, useState } from "react";

import { prefersReducedMotion } from "../../hooks/useInView";

/** So'zlar navbat bilan almashadi; har bir harf 3D aylanib chiqadi. */
export function WordCycler({ words, interval = 2400, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion() || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  const word = words[index] ?? "";
  return (
    <span className={`inline-block whitespace-nowrap ${className}`} aria-live="polite" aria-label={word}>
      <span key={word} aria-hidden="true">
        {Array.from(word).map((ch, i) => (
          <span key={i} className="flip-char" style={{ ["--i" as string]: i }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
