import { useLayoutEffect, useState } from "react";
export function useMatchScores(g) {
  const [frame, setFrame] = useState(null);
  useLayoutEffect(() => {
    if (g.state !== "reveal" || !g.revealedAt) return;
    const key = `ov-score-${g.id}-${g.revealedAt}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const started = performance.now();
    const tick = () => {
      const elapsed = performance.now() - started;
      setFrame({ stamp: g.revealedAt, elapsed });
      if (elapsed < 3300) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [g.id, g.state, g.revealedAt]);
  const elapsed =
    frame && frame.stamp === g.revealedAt ? frame.elapsed : Infinity;
  const t = Math.max(0, Math.min(1, (elapsed - 2100) / 1100)),
    eased = 1 - (1 - t) ** 3;
  return {
    scores: Object.fromEntries(
      g.players.map((p) => [
        p.id,
        p.vp === null
          ? null
          : Math.round(p.vp - (g.roundPoints?.[p.id] || 0) * (1 - eased)),
      ]),
    ),
    showBonus: elapsed < 2100,
    merging: elapsed >= 1600,
    complete: t === 1,
  };
}
