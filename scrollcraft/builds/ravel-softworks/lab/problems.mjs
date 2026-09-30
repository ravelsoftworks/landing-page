import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, mob] of [['desk', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  // section top at these fractions of the viewport height
  for (const f of [0.5, 0.3, 0.15, 0, -0.2]) {
    await p.evaluate(f => { const s = document.getElementById('problems'); scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * f); }, f);
    await p.waitForTimeout(500); await p.screenshot({ path: `lab/pr-${n}-${f}.png` });
  }
  await ctx.close();
}
console.log('errors', errs); await b.close();
