import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const w of [360, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 740 } });
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => ({ brandH: document.querySelector('.nav__brand').getBoundingClientRect().height, over: document.documentElement.scrollWidth - innerWidth, wa: getComputedStyle(document.querySelector('.nav .js-wa')).display }));
  console.log(w, JSON.stringify(r));
  await p.screenshot({ path: `lab/nav-${w}.png`, clip: { x: 0, y: 0, width: w, height: 400 } });
}
await b.close();
