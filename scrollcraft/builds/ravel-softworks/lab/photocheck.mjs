import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => ({ photos: [...document.querySelectorAll('img.photo')].map(i => i.src.split('/').pop()), drawings: document.querySelectorAll('svg[data-illo]').length, whySvg: !!document.getElementById('why-svg') })), errs);
await b.close();
