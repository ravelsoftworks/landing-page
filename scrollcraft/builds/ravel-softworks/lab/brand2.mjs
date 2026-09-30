import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, mob] of [['desk', { width: 1440, height: 900 }, false], ['short', { width: 1280, height: 720 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('ravel_consent', 'denied'); } catch (e) {} });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(n + ': ' + e.message));
  await p.route(u => /googletagmanager|google-analytics/.test(u.hostname), r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await p.goto('http://localhost:4500/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200);
  if (n !== 'short') {
    await p.evaluate(() => document.querySelector('.trust').scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    await p.locator('.trust').screenshot({ path: `lab/c-${n}-trust.png` });
    await p.evaluate(() => { const s = document.getElementById('problems'); scrollTo(0, s.getBoundingClientRect().top + scrollY + 100); }); await p.waitForTimeout(1200);
    await p.locator('.pains').screenshot({ path: `lab/c-${n}-pains.png` });
    await p.evaluate(() => document.querySelector('.faq__list').scrollIntoView({ block: 'center' }));
    await p.evaluate(() => document.querySelectorAll('.faq__list details')[1].open = true); await p.waitForTimeout(500);
    await p.locator('.faq__list').screenshot({ path: `lab/c-${n}-faq.png` });
  }
  for (const f of [0.1, 0.95]) {
    await p.evaluate(f => { const s = document.getElementById('process'); scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f); }, f); await p.waitForTimeout(800);
    await p.screenshot({ path: `lab/c-${n}-process-${f}.png` });
  }
  const ov = await p.evaluate(() => { const a = document.querySelector('.process__stack').getBoundingClientRect(); return [...document.querySelectorAll('.stage')].some(c => { const b = c.getBoundingClientRect(); return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }) ; });
  console.log(n, 'stack overlaps a card:', ov, '| stack visible:', await p.evaluate(() => getComputedStyle(document.querySelector('.process__stack')).display !== 'none'));
  await ctx.close();
}
console.log('errors', errs); await b.close();
