// Renders README.md roughly the way GitHub lays out a profile README
// (an ~880px column) in both themes and screenshots it.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');

const blocks = readFileSync(join(root, 'README.md'), 'utf8').split(/\n\s*\n/).map(b => b.trim().startsWith('<p>') ? b : `<p>${b}</p>`).join('\n');
const html = `<!doctype html><meta charset="utf-8"><base href="../"><style>
body{margin:0;background:#fff;font:16px -apple-system,Segoe UI,sans-serif}
@media (prefers-color-scheme:dark){body{background:#0d1117}}
main{width:min(880px,calc(100vw - 32px));box-sizing:border-box;margin:32px auto;padding:24px;border:1px solid #d0d7de;border-radius:6px}
@media (prefers-color-scheme:dark){main{border-color:#30363d}}
@media (max-width:767px){main{padding:0;border:0;margin:16px auto}}
p{margin:0 0 16px}img{max-width:100%;vertical-align:middle}
</style><main>${blocks}</main>`;
writeFileSync(join(root, 'build', 'preview.html'), html);

const out = process.argv[2] || join(root, 'build');
const browser = await chromium.launch();
const VW = +(process.argv[3] || 1000), tag = process.argv[4] || '';
for (const scheme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: VW, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(root, 'build', 'preview.html')).href);
  await page.waitForTimeout(2500);
  // images only animate while on screen, so walk the page like a visitor would
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(1600); }
  await page.waitForTimeout(2000);
  await page.setViewportSize({ width: VW, height: h });
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(3000);
  await page.screenshot({ path: join(out, `preview${tag}-${scheme}.png`), fullPage: true });
  await page.setViewportSize({ width: VW, height: 900 });
  // the first viewport, mid-animation, to check the entrance
  await page.reload(); await page.waitForTimeout(450);
  await page.screenshot({ path: join(out, `preview${tag}-${scheme}-t450.png`) });
  await page.close();
}
await browser.close();
console.log('done');
