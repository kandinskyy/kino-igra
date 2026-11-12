// All geometry is registered to the 1536 × 1024 entrance plate. Transform the
// canvas together with the plate; viewport coordinates never enter the weather.
const WIDTH = 1536, HEIGHT = 1024, GROUND = 812;
const LAMPS = [300, 475, 625, 768, 910, 1065, 1220];
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function groundLight(x) {
  if (x < 210 || x > 1380) return 0;
  let light = 0;
  for (const lamp of LAMPS) light += Math.exp(-(((x - lamp) / 31) ** 2));
  return Math.min(1, light) * Math.min(1, (x - 210) / 65, (1380 - x) / 65);
}

function behindFacade(x, y) {
  return (x > 160 && x < 1380 && y > 180 && y < GROUND) ||
    (x > 550 && x < 995 && y > 78 && y < 180);
}

/** A bounded, dependency-free weather layer. Intensity 1 means 650 raindrops. */
export function createEntranceWeather(canvas, {onStats, intensity: initialIntensity = 1, mobile = false} = {}) {
  const ctx = canvas.getContext('2d', {alpha: true});
  if (!ctx) throw new Error('Canvas 2D is unavailable for entrance weather.');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let intensity = clamp(Number(initialIntensity) || 0, 0, 1.4), manuallyPaused = false, disposed = false;
  let raf = 0, lastTime = 0, elapsed = 0, weatherFrame = 0, statsAt = -1, dpr = 1;
  let width = mobile ? Math.max(1, canvas.clientWidth) : WIDTH;
  let height = mobile ? Math.max(1, canvas.clientHeight) : HEIGHT;
  const drops = [], ripples = [], splashes = [];

  function spawnDrop(initial = false) {
    // Most drops sit well behind the sparse, larger foreground layer.
    const random = Math.random(), depth = random < .52 ? Math.random() * .34 : random < .88 ? .34 + Math.random() * .39 : .73 + Math.random() * .27;
    const landing = mobile ? height + 35 : GROUND + 4 + depth * depth * (HEIGHT - GROUND - 8);
    const scale = mobile ? .68 : 1;
    return {x: Math.random() * (width + 160) - 80, y: initial ? Math.random() * landing : -30 - Math.random() * 140, depth, landing, speed: (390 + depth * 650 + Math.random() * 110) * scale, length: (7 + depth * 21 + Math.random() * 5) * scale, alpha: .055 + depth * .18, wind: (-17 - depth * 25 - Math.random() * 8) * scale};
  }
  function setDensity() {
    const target = Math.round((mobile ? Math.max(100, width * height / 1900) : 650) * intensity);
    while (drops.length < target) drops.push(spawnDrop(true));
    drops.length = target;
    canvas.dataset.rainDensity = String(target);
  }
  function clear() {
    ctx.clearRect(0, 0, width, height);
  }
  function resize() {
    if (mobile) {
      width = Math.max(1, canvas.clientWidth); height = Math.max(1, canvas.clientHeight);
      drops.forEach(drop => Object.assign(drop, spawnDrop(true)));
      setDensity();
    }
    const nextDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    if (canvas.width === Math.round(width * nextDpr) && canvas.height === Math.round(height * nextDpr) && dpr === nextDpr) return;
    dpr = nextDpr; canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function paused() { return manuallyPaused || document.hidden || motion.matches || intensity === 0; }
  function report(force = false) {
    if (!force && elapsed < statsAt) return;
    statsAt = elapsed + .5;
    canvas.dataset.rippleCount = String(ripples.length);
    canvas.dataset.weatherFrame = String(weatherFrame);
    canvas.dataset.weatherPaused = String(paused());
    onStats?.({rainDensity: drops.length, rippleCount: ripples.length, weatherFrame, paused: paused()});
  }
  function mist(x, y, rx, ry, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, .04, 0, 0, 1);
    gradient.addColorStop(0, `rgba(99,116,131,${alpha})`);
    gradient.addColorStop(.48, `rgba(84,101,118,${alpha * .45})`);
    gradient.addColorStop(1, 'rgba(70,91,112,0)');
    ctx.fillStyle = gradient; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  function drawMist() {
    // Scattering stays in the open air beside the building and on the ground.
    const amount = Math.min(intensity, 1.15);
    mist(112 + Math.sin(elapsed * .07) * 48, 603 + Math.sin(elapsed * .05) * 26, 240, 380, .14 * amount);
    mist(1430 + Math.sin(elapsed * .06 + 2) * 48, 625, 245, 360, .13 * amount);
    mist(410 + Math.sin(elapsed * .05) * 130, 858 + Math.sin(elapsed * .06) * 14, 570, 66, .09 * amount);
    mist(1130 + Math.sin(elapsed * .055 + 1) * 150, 889, 600, 72, .075 * amount);
    // A thin veil moves around the roofline without obscuring its ornament.
    mist(790 + Math.sin(elapsed * .035) * 200, 142, 700, 170, .025 * amount);
  }
  function impact(drop) {
    if (drop.x < -10 || drop.x > WIDTH + 10) return;
    // A drop only makes a ripple on reaching its own ground-plane depth.
    if (Math.random() < .36 && ripples.length < 180) {
      const light = groundLight(drop.x), depth = (drop.landing - GROUND) / (HEIGHT - GROUND);
      ripples.push({x: drop.x, y: drop.landing, age: 0, life: .42 + Math.random() * .57, depth, light, maxRadius: 4 + depth * 17 + Math.random() * 6, strength: .13 + depth * .11 + light * .045});
    }
    if (drop.depth > .45 && splashes.length < 65 && Math.random() < .32) {
      splashes.push({x: drop.x, y: drop.landing, age: 0, life: .16 + Math.random() * .13, height: 2 + drop.depth * 7, light: groundLight(drop.x), spread: 1.5 + Math.random() * 3});
    }
  }
  function drawRain(dt) {
    ctx.lineCap = 'round';
    for (const drop of drops) {
      drop.y += drop.speed * dt; drop.x += drop.wind * dt;
      if (drop.y >= drop.landing) {
        if (!mobile) impact(drop);
        const fresh = spawnDrop(); Object.assign(drop, fresh);
      }
      if (!mobile && drop.depth < .34 && behindFacade(drop.x, drop.y)) continue;
      const belowLedge = !mobile && drop.y > 780;
      const light = belowLedge ? groundLight(drop.x) : 0;
      const alpha = drop.alpha * (belowLedge ? .86 : 1);
      ctx.strokeStyle = light > .08 ? `rgba(${Math.round(165 + light * 53)},${Math.round(186 - light * 20)},${Math.round(205 - light * 85)},${alpha})` : `rgba(160,185,207,${alpha})`;
      ctx.lineWidth = .4 + drop.depth * .75;
      ctx.beginPath(); ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.wind / drop.speed * drop.length, drop.y - drop.length); ctx.stroke();
    }
  }
  function drawRipples(dt) {
    ctx.lineWidth = .75;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i]; ripple.age += dt;
      if (ripple.age > ripple.life) { ripples.splice(i, 1); continue; }
      const p = ripple.age / ripple.life, radius = 1.3 + ripple.maxRadius * p;
      const alpha = (1 - p) * ripple.strength, flatten = .16 + ripple.depth * .075;
      ctx.strokeStyle = ripple.light > .09 ? `rgba(${Math.round(166 + ripple.light * 65)},${Math.round(178 - ripple.light * 17)},${Math.round(192 - ripple.light * 95)},${alpha})` : `rgba(143,166,187,${alpha})`;
      ctx.beginPath(); ctx.ellipse(ripple.x, ripple.y, radius, radius * flatten, 0, 0, Math.PI * 2); ctx.stroke();
      if (p > .15 && p < .74) {
        ctx.globalAlpha = .38;
        ctx.beginPath(); ctx.ellipse(ripple.x, ripple.y, radius * .62, radius * flatten * .62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const splash = splashes[i]; splash.age += dt;
      if (splash.age > splash.life) { splashes.splice(i, 1); continue; }
      const p = splash.age / splash.life, rise = Math.sin(p * Math.PI) * splash.height;
      ctx.strokeStyle = splash.light > .1 ? `rgba(218,181,126,${(1 - p) * .33})` : `rgba(172,196,214,${(1 - p) * .30})`;
      ctx.lineWidth = .7;
      for (const side of [-1, 1]) {
        const x = splash.x + side * splash.spread * (p + .2);
        ctx.beginPath(); ctx.moveTo(x, splash.y - rise); ctx.lineTo(x + side * .6, splash.y - rise + 1.2); ctx.stroke();
      }
    }
  }
  function tick(now) {
    raf = 0;
    if (disposed || paused()) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .04) : 0;
    lastTime = now; elapsed += dt; weatherFrame++;
    clear(); if (!mobile) drawMist(); drawRain(dt); if (!mobile) drawRipples(dt); report();
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (disposed) return;
    cancelAnimationFrame(raf); raf = 0; lastTime = 0;
    if (paused()) clear(); else raf = requestAnimationFrame(tick);
    report(true);
  }
  setDensity(); resize();
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  window.addEventListener('resize', resize);
  sync();
  return {
    setPaused(value) { manuallyPaused = Boolean(value); sync(); },
    setIntensity(value) {
      const next = Number(value); if (!Number.isFinite(next)) return;
      intensity = clamp(next, 0, 1.4); setDensity();
      if (!intensity) { ripples.length = 0; splashes.length = 0; }
      sync();
    },
    dispose() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync); window.removeEventListener('resize', resize);
      drops.length = 0; ripples.length = 0; splashes.length = 0; clear();
      canvas.dataset.weatherPaused = 'true'; canvas.dataset.rippleCount = '0';
    },
  };
}

export default createEntranceWeather;
