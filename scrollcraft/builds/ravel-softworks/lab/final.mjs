import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const errs = [];
for (const [n, vp] of [['desk', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp });
  p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('failed ' + r.url()));
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  console.log(n, await p.evaluate(() => [...document.querySelectorAll('img.photo')].length), 'photos');
  await p.evaluate(() => document.querySelector('#services .cards').scrollIntoView()); await p.waitForTimeout(900);
  await p.screenshot({ path: `lab/f-${n}-services.png` });
  await p.evaluate(() => document.querySelector('#why').scrollIntoView()); await p.waitForTimeout(1200);
  await p.screenshot({ path: `lab/f-${n}-why.png` });
  await p.goto('http://localhost:4500/thanks.html'); await p.screenshot({ path: `lab/f-${n}-thanks.png` });
}
console.log('errors', errs);
await b.close();
