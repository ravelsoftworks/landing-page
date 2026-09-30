import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto('http://localhost:4500/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById('process'); scrollTo(0, s.getBoundingClientRect().top + scrollY + 50); }); await p.waitForTimeout(500);
  console.log(vp.width + 'x' + vp.height, JSON.stringify(await p.evaluate(() => {
    const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
    return { lead: r(document.querySelector('.rail__lead')), card: r(document.querySelector('.stage')), bar: r(document.querySelector('.process__bar')), stack: r(document.querySelector('.process__stack')), nav: r(document.querySelector('.nav')) };
  })));
  await p.close();
}
await b.close();
