import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const consentCalls = () => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'consent').map(a => a[1] + ':' + a[2].analytics_storage);
for (const choice of ['granted', 'denied']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = []; let tagLoaded = false;
  p.on('pageerror', e => errs.push(e.message));
  p.on('response', r => { if (r.url().includes('googletagmanager.com/gtag/js')) tagLoaded = r.status(); });
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const gaCookieBefore = (await ctx.cookies()).some(c => c.name.startsWith('_ga'));
  await p.click(`[data-consent="${choice}"]`); await p.waitForTimeout(2500);
  const gaCookieAfter = (await ctx.cookies()).some(c => c.name.startsWith('_ga'));
  console.log(choice, '| tag loaded on first visit:', tagLoaded, '| _ga cookie before choice:', gaCookieBefore, '| after:', gaCookieAfter, '| consent calls:', JSON.stringify(await p.evaluate(consentCalls)), errs);
  await p.reload({ waitUntil: 'networkidle' });
  console.log('   after reload default:', JSON.stringify(await p.evaluate(consentCalls)), '| banner shown again:', await p.isVisible('#consent'));
  for (const page of ['thanks.html', 'privacy.html']) {
    await p.goto('http://localhost:4500/' + page, { waitUntil: 'networkidle' });
    console.log('   ', page, 'has tag:', await p.evaluate(() => !!document.querySelector('script[src*="gtag/js?id=G-DLK9LW97V6"]')), '| default:', JSON.stringify(await p.evaluate(consentCalls)));
  }
  await ctx.close();
}
await b.close();
