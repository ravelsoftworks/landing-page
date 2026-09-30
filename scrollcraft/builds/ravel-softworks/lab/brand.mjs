import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp, mob] of [['desk', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('ravel_consent', 'denied'); } catch (e) {} });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(n + ': ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push(n + ': ' + m.text()));
  await p.route(u => /googletagmanager|google-analytics/.test(u.hostname), r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await p.goto('http://localhost:4500/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200);
  const shot = async (sel, name, block = 'center') => { await p.evaluate(([s, bl]) => document.querySelector(s).scrollIntoView({ block: bl }), [sel, block]); await p.waitForTimeout(900); await p.screenshot({ path: `lab/b-${n}-${name}.png` }); };
  await p.screenshot({ path: `lab/b-${n}-nav.png`, clip: { x: 0, y: 0, width: vp.width, height: 80 } });
  await shot('.trust', 'trust');
  await p.evaluate(() => { const s = document.getElementById('problems'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 120); }); await p.waitForTimeout(1500); await p.screenshot({ path: `lab/b-${n}-problems.png` });
  for (const f of [0.05, 0.3, 0.55, 0.9]) {
    await p.evaluate(f => { const s = document.getElementById('process'); scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f); }, f); await p.waitForTimeout(700);
    await p.screenshot({ path: `lab/b-${n}-process-${f}.png` });
  }
  await p.evaluate(() => { const s = document.getElementById('process'); scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.5); }); await p.waitForTimeout(700); await p.screenshot({ path: `lab/b-${n}-edge.png` });
  await shot('.why__list', 'why');
  await p.evaluate(() => document.querySelector('.faq__list details').open = true);
  await shot('.faq__list', 'faq');
  await p.evaluate(() => document.getElementById('start').scrollIntoView()); await p.waitForTimeout(3300);
  await p.fill('#f-name', 'Asha'); await p.fill('#f-email', 'a@example.com'); await p.fill('#f-message', 'Test');
  await p.route('http://localhost:4500/', r => r.request().method() === 'POST' ? r.fulfill({ status: 200, body: 'ok' }) : r.continue());
  await p.click('#brief-form button[type=submit]'); await p.waitForTimeout(1400);
  await p.screenshot({ path: `lab/b-${n}-success.png` });
  console.log(n, 'icons drawn:', await p.evaluate(() => document.querySelectorAll('[data-bicon] svg polygon').length), '| overflow:', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await ctx.close();
}
console.log('errors', errs); await b.close();
