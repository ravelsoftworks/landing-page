import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, mob] of [['desk', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(n + ': ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push(n + ': ' + m.text()));
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  const at = async (id, f) => p.evaluate(([id, f]) => { const s = document.getElementById(id); const top = s.getBoundingClientRect().top + scrollY; const travel = Math.max(s.offsetHeight - innerHeight, 0); scrollTo(0, top + travel * f); }, [id, f]);
  for (const f of [0, 0.3, 0.55, 0.8, 1]) { await at('problems', f); await p.waitForTimeout(600); await p.screenshot({ path: `lab/x-${n}-problems-${f}.png` }); }
  for (const f of [0.15, 0.35, 0.55, 0.75]) { await at('services', f); await p.waitForTimeout(700); await p.screenshot({ path: `lab/x-${n}-services-${f}.png` }); }
  for (const f of [0.1, 0.2, 0.45, 0.95]) { await at('automation', f); await p.waitForTimeout(500); await p.screenshot({ path: `lab/x-${n}-auto-${f}.png` }); }
  const state = await p.evaluate(() => ({ act: document.getElementById('automation').getAttribute('data-sc-act'), tab: document.querySelector('[role=tab][aria-selected=true]').textContent, done: document.querySelectorAll('#demo-steps li.is-done').length }));
  console.log(n, 'automation', JSON.stringify(state));
  if (!mob) {
    await at('automation', 0.05); await p.waitForTimeout(300);
    await p.click('#tab-leads'); await p.waitForTimeout(1500);
    console.log(n, 'after clicking Sales leads:', await p.evaluate(() => document.querySelector('[role=tab][aria-selected=true]').textContent));
  }
  await p.evaluate(() => document.querySelector('.tools').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
  const x1 = await p.evaluate(() => getComputedStyle(document.querySelector('.tools__list')).transform);
  await p.waitForTimeout(600);
  const x2 = await p.evaluate(() => getComputedStyle(document.querySelector('.tools__list')).transform);
  console.log(n, 'tools marquee moving:', x1 !== x2);
  console.log(n, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await ctx.close();
}
console.log('errors', errs);
await b.close();
