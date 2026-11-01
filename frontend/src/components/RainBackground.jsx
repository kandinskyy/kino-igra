import { useEffect, useRef } from "react";
export default function RainBackground({ isAllVoted = false }) {
  const ref = useRef(null),
    ready = useRef(isAllVoted);
  useEffect(() => {
    ready.current = isAllVoted;
  }, [isAllVoted]);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas?.getContext("2d");
    if (!ctx) return;
    let width,
      height,
      drops = [],
      frame,
      last = 0,
      readyMix = ready.current ? 1 : 0;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    function resize() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from(
        { length: Math.min(160, Math.floor(width / 7)) },
        () => {
          const z = Math.random();
          return {
            x: Math.random() * width,
            y: Math.random() * height,
            z,
            len: 10 + z * 34,
            speed: 200 + z * 430,
          };
        },
      );
    }
    function render(t) {
      const dt = Math.min((t - last) / 1000, 0.035) || 0.016;
      last = t;
      readyMix += ((ready.current ? 1 : 0) - readyMix) * Math.min(1, dt * 3);
      ctx.clearRect(0, 0, width, height);
      for (const d of drops) {
        d.y += d.speed * dt;
        d.x -= (25 + d.z * 45) * dt;
        if (d.y > height + 40) {
          d.y = -40;
          d.x = Math.random() * (width + 50);
        }
        if (d.x < -40) d.x = width + 30;
        ctx.lineWidth = 0.45 + d.z * 0.7;
        ctx.strokeStyle = `rgba(${Math.round(106 - readyMix * 6)},${Math.round(191 + readyMix * 39)},${Math.round(246 - readyMix * 50)},${0.065 + readyMix * .015 + d.z * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2 - d.z * 3, d.y + d.len);
        ctx.stroke();
      }
      frame = requestAnimationFrame(render);
    }
    function start() {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
      if (!document.hidden && !media.matches) {
        last = 0;
        frame = requestAnimationFrame(render);
      }
    }
    resize();
    start();
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", start);
    media.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
      media.removeEventListener("change", start);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
