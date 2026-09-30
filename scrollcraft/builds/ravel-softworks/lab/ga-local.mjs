import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const ctx = await b.newContext(); const p = await ctx.newPage(); const hits = []; const errs = [];
p.on('request', r => { if (r.url().includes('google-analytics.com/g/collect')) hits.push(r.url()); });
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
await p.click('[data-consent="granted"]'); await p.waitForTimeout(2500);
console.log('tag present:', await p.evaluate(() => !!document.querySelector('script[src*="G-DLK9LW97V6"]')), '| hits sent from localhost:', hits.length, '| errors:', errs);
await b.close();
