/**
 * 从 PNG 素材提取精确调色板
 * 用法: node mascot/extract-palette.mjs <png路径> [更多路径...]
 * 依赖: puppeteer（通过 canvas 解码像素）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
if (!files.length) {
  console.error('用法: node mascot/extract-palette.mjs <png...>');
  process.exit(1);
}

const { default: puppeteer } = await import('puppeteer');
const launchOpts = {
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
};
if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
const browser = await puppeteer.launch(launchOpts);

try {
  for (const f of files) {
    const abs = path.resolve(process.cwd(), f);
    const b64 = fs.readFileSync(abs).toString('base64');
    const page = await browser.newPage();
    await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
    await page.waitForFunction('document.getElementById("i").complete');
    const data = await page.evaluate(() => {
      const img = document.getElementById('i');
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const buckets = new Map();
      let total = 0;
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
        if (a < 200) continue;
        // 近白像素视为背景，忽略
        if (r > 242 && g > 242 && b > 242) continue;
        total++;
        const key = `${Math.round(r / 12) * 12},${Math.round(g / 12) * 12},${Math.round(b / 12) * 12}`;
        const cur = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
        cur.n++; cur.r += r; cur.g += g; cur.b += b;
        buckets.set(key, cur);
      }
      const list = [...buckets.entries()]
        .map(([k, v]) => {
          const [r, g, b] = k.split(',').map(Number);
          const ar = Math.round(v.r / v.n), ag = Math.round(v.g / v.n), ab = Math.round(v.b / v.n);
          const max = Math.max(ar, ag, ab), min = Math.min(ar, ag, ab);
          const l = (max + min) / 2 / 255;
          const s = max === min ? 0 : (max - min) / 255 / (1 - Math.abs(2 * l - 1));
          let h = 0;
          if (max !== min) {
            const dd = max - min;
            if (max === ar) h = ((ag - ab) / dd + (ag < ab ? 6 : 0)) * 60;
            else if (max === ag) h = ((ab - ar) / dd + 2) * 60;
            else h = ((ar - ag) / dd + 4) * 60;
          }
          return {
            hex: '#' + [ar, ag, ab].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase(),
            exact: '#' + [ar, ag, ab].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase(),
            n: v.n,
            pct: +((v.n / total) * 100).toFixed(2),
            h: Math.round(h),
            s: +s.toFixed(2),
            l: +l.toFixed(2),
            avg: [ar, ag, ab],
          };
        })
        .sort((a, b) => b.n - a.n)
        .slice(0, 28);
      return { width: img.naturalWidth, height: img.naturalHeight, total, list };
    });
    await page.close();

    console.log(`\n=== ${path.basename(abs)}  ${data.width}×${data.height}  有效像素 ${data.total} ===`);
    console.log('占比%   HEX       H    S    L');
    for (const c of data.list) {
      console.log(
        `${String(c.pct).padStart(6)}  ${c.exact}  ${String(c.h).padStart(4)} ${String(c.s).padStart(4)} ${String(c.l).padStart(4)}`
      );
    }
  }
} finally {
  await browser.close();
}
