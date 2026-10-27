// Full-page screenshots of every page in every direction, desktop and mobile.
// Uses playwright-core with the locally installed Google Chrome, so no browser download.
// Usage: npm run shots [-- outDir]   default outDir: spad/after
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { startServer } from './serve.mjs';
import { loadContent } from './build.mjs';

const outDir = process.argv[2] ?? 'spad/after';
const pages = ['index', 'imprint', 'gutachten-anfragen'];
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 402, height: 844 } };
const { site } = await loadContent();
const directions = site.directions.map(d => d.id);

await mkdir(outDir, { recursive: true });
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const p of pages) {
      for (const v of directions) {
        await page.goto(`${base}/${p}.html?v=${v}&shots`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const file = `${outDir}/${p}-${v}-${name}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(file);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
