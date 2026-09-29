import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const mode of ['ok', 'reject', 'hang']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let body = '';
  await p.route('http://localhost:4500/', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    body = route.request().postData();
    if (mode === 'ok') return route.fulfill({ status: 200, body: 'ok' });
    if (mode === 'reject') return route.fulfill({ status: 404, body: 'nope' });
    /* hang: never answer */
  });
  await p.goto('http://localhost:4500/#start', { waitUntil: 'networkidle' });
  await p.fill('#f-name', 'Asha Rao'); await p.fill('#f-email', 'asha@example.com'); await p.fill('#f-message', 'Test brief');
  await p.check('input[name=services][value="AI automation"]');
  await p.click('#brief-form button[type=submit]');
  await p.waitForTimeout(300);
  const during = await p.evaluate(() => { const b = document.querySelector('#brief-form button'); return b ? b.textContent + ' disabled=' + b.disabled : 'form gone'; });
  await p.waitForTimeout(mode === 'hang' ? 20500 : 800);
  const after = await p.evaluate(() => {
    const d = document.querySelector('.brief-form--done'); if (d) return 'DONE: ' + d.innerText.replace(/\n+/g, ' | ');
    const b = document.querySelector('#brief-form button'); return 'button="' + b.textContent + '" disabled=' + b.disabled + ' cursor=' + getComputedStyle(b).cursor + ' status="' + document.getElementById('form-status').textContent + '"';
  });
  console.log(mode.padEnd(6), '| during:', during, '| after:', after, errs.length ? errs : '');
  if (mode === 'ok') { console.log('       posted:', body); await p.screenshot({ path: 'lab/form-ok.png' }); }
  await p.close();
}
await b.close();
