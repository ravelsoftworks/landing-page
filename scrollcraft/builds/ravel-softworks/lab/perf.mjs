import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => new Promise(res => { let n = 0, t0 = performance.now(), worst = 0, last = t0;
  function f(t) { worst = Math.max(worst, t - last); last = t; if (++n < 120) requestAnimationFrame(f); else res({ fps: Math.round(n / ((t - t0) / 1000)), worstFrameMs: Math.round(worst) }); }
  requestAnimationFrame(f); }));
console.log('idle cube cloud at 2x DPR:', JSON.stringify(r));
await b.close();
