import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, touch] of [['desk', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(() => { Element.prototype.requestPointerLock = () => {}; Element.prototype.setPointerCapture = () => {}; });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(n + ': ' + e.message));
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  const travel = await p.evaluate(() => { const s = document.getElementById('top'); return s.offsetHeight - innerHeight; });
  for (const f of [0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.38, 1]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(travel * f)); await p.waitForTimeout(450);
    await p.screenshot({ path: `lab/s-${n}-${f}.png` });
  }
  if (!touch) {
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.mouse.move(1000, 450); await p.waitForTimeout(200);
    await p.mouse.move(700, 250, { steps: 10 }); await p.waitForTimeout(1500); await p.screenshot({ path: 'lab/s-desk-mouseL.png' });
    await p.mouse.move(1420, 850, { steps: 10 }); await p.waitForTimeout(1500); await p.screenshot({ path: 'lab/s-desk-mouseR.png' });
  }
  await ctx.close();
}
console.log('errors', errs);
await b.close();
