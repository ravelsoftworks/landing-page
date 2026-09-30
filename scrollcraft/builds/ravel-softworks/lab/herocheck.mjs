import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, rm] of [['desk', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, false], ['reduced', { width: 1440, height: 900 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, reducedMotion: rm ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(n + ': ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push(n + ': ' + m.text()));
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  for (const f of (rm ? [0] : [0, 0.2, 0.36, 0.45, 0.75])) {
    await p.evaluate(f => scrollTo(0, innerHeight * f), f); await p.waitForTimeout(500);
    await p.screenshot({ path: `lab/h-${n}-${f}.png` });
  }
  if (n === 'desk') { await p.evaluate(() => document.querySelector('#why').scrollIntoView()); await p.waitForTimeout(1500); await p.screenshot({ path: 'lab/h-why.png' }); }
  await ctx.close();
}
console.log('errors', errs);
await b.close();
