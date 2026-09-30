import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const choice of ['granted', 'denied']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = []; const ga = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route(u => u.hostname.endsWith('googletagmanager.com') || u.hostname.endsWith('google-analytics.com'), r => { ga.push(r.request().url().split('?')[0] + '?' + (new URL(r.request().url()).searchParams.get('id') || '')); r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }); });
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  const beforeBanner = await p.isVisible('#consent'), beforeGA = ga.length;
  await p.click(`[data-consent="${choice}"]`); await p.waitForTimeout(600);
  const tagId = await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'config').map(a => a[1]));
  console.log(choice, '| banner shown first:', beforeBanner, '| GA before click:', beforeGA, '| GA after click:', ga, '| configured id:', JSON.stringify(tagId), errs);
  await ctx.close();
}
await b.close();
