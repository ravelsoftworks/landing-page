import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 900, height: 320 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:4500/404.html'); await p.setContent(`<body style="margin:0;display:flex;gap:40px;align-items:center;padding:20px;background:#F3F1EB">
<img src="http://localhost:4500/assets/ravel-mark.svg" style="height:260px">
<img src="http://localhost:4500/assets/ravel-mark.svg" style="height:30px">
<img src="http://localhost:4500/assets/ravel-mark.svg" style="height:16px">
<div style="background:#0C1B36;padding:20px"><img src="http://localhost:4500/assets/ravel-mark.svg" style="height:120px"></div>
<img src="http://localhost:4500/logo-mark.png" style="height:260px"></body>`);
await p.waitForTimeout(500); await p.screenshot({ path: 'lab/mark.png' }); await b.close();
