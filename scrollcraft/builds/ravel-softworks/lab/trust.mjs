import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const site = fs.readFileSync(new URL('../../../../assets/site.js', import.meta.url), 'utf8');

async function page(opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const log = { errors: [], posts: [], ga: 0 };
  p.on('pageerror', e => log.errors.push(e.message));
  p.on('console', m => m.type() === 'error' && log.errors.push(m.text()));
  await p.route(u => u.hostname.endsWith('googletagmanager.com'), r => { log.ga++; r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }); });
  if (opts.ga) await p.route('**/assets/site.js', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: site.replace("var GA_ID = '';", "var GA_ID = 'G-TEST123';") }));
  await p.route('http://localhost:4500/', r => { if (r.request().method() === 'POST') { log.posts.push(r.request().postData()); return r.fulfill({ status: 200, body: 'ok' }); } r.continue(); });
  await p.goto('http://localhost:4500/', { waitUntil: 'networkidle' });
  return { ctx, p, log };
}

// 1. photos + SEO basics, no GA id
{
  const { ctx, p, log } = await page();
  const r = await p.evaluate(() => ({
    photos: [...document.querySelectorAll('img.photo')].map(i => i.complete && i.naturalWidth > 0).filter(Boolean).length,
    imgsMissingAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
    h1: document.querySelectorAll('h1').length,
    title: document.title.length, desc: document.querySelector('meta[name=description]').content.length,
    jsonld: (() => { try { JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent); return 'valid'; } catch (e) { return 'INVALID'; } })(),
    bannerVisible: !document.getElementById('consent').hidden,
    cookieBtnVisible: !document.querySelector('.js-cookie-settings').hidden
  }));
  // lazy images load as they come into view
  await p.evaluate(async () => { for (const i of document.querySelectorAll('img.photo')) { i.scrollIntoView(); await new Promise(r => setTimeout(r, 150)); } });
  await p.waitForTimeout(800);
  r.photosLoaded = await p.evaluate(() => [...document.querySelectorAll('img.photo')].filter(i => i.complete && i.naturalWidth > 0).length);
  console.log('no GA id:', JSON.stringify(r), 'GA requests:', log.ga, 'errors:', log.errors);
  await ctx.close();
}
// 2. GA id set: banner, accept, decline
for (const choice of ['granted', 'denied']) {
  const { ctx, p, log } = await page({ ga: true });
  const before = { banner: await p.isVisible('#consent'), ga: log.ga };
  if (choice === 'granted') await p.screenshot({ path: 'lab/consent.png' });
  await p.click(`[data-consent="${choice}"]`); await p.waitForTimeout(500);
  const after = { banner: await p.isVisible('#consent'), ga: log.ga, stored: await p.evaluate(() => localStorage.getItem('ravel_consent')) };
  await p.reload({ waitUntil: 'networkidle' });
  const reload = { banner: await p.isVisible('#consent'), gaTotal: log.ga };
  console.log(choice, 'before', JSON.stringify(before), 'after click', JSON.stringify(after), 'after reload', JSON.stringify(reload), log.errors);
  await ctx.close();
}
// 3. spam traps
for (const mode of ['fast', 'honeypot', 'human']) {
  const { ctx, p, log } = await page();
  if (mode !== 'fast') await p.waitForTimeout(3200);
  await p.evaluate(() => document.getElementById('start').scrollIntoView());
  await p.fill('#f-name', 'Test'); await p.fill('#f-email', 't@example.com'); await p.fill('#f-message', 'hello');
  if (mode === 'honeypot') await p.evaluate(() => { document.querySelector('input[name=bot-field]').value = 'spam'; });
  await p.click('#brief-form button[type=submit]'); await p.waitForTimeout(700);
  const thanked = await p.isVisible('.brief-form--done');
  console.log('spam test', mode, '| thank-you shown:', thanked, '| sent to Netlify:', log.posts.length);
  await ctx.close();
}
await b.close();
