import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
await p.addStyleTag({ content: '.nav,.trust,main>section:not(.hero),footer,.hero__actions,.near{display:none!important}.hero__stage{padding-top:2.2rem!important}' });
await p.evaluate(() => scrollTo(0, innerHeight * 0.7)); await p.waitForTimeout(600);
await p.screenshot({ path: '../../../og-image.png' });
await b.close();
