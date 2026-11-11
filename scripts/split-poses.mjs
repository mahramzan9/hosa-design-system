/**
 * 从 hosa-poses-transparent.png 切分出单个姿态（按水平空白列自动分列）
 * 产出: mascot/assets/processed/pose-1.png / pose-2.png / pose-3.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets', 'mascot');
const SRC = path.join(ASSETS, 'hosa-poses-transparent.png');
const OUT = path.join(ASSETS);

const { default: puppeteer } = await import('puppeteer');
const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
const browser = await puppeteer.launch(launchOpts);
const page = await browser.newPage();

try {
  const b64 = fs.readFileSync(SRC).toString('base64');
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
  await page.waitForFunction('document.getElementById("i").complete');

  const results = await page.evaluate(() => {
    const img = document.getElementById('i');
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data;

    // 逐列统计可见像素
    const colCount = new Array(W).fill(0);
    let minX = W, maxX = -1, minY = H, maxY = -1;
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if (d[(y * W + x) * 4 + 3] > 12) {
          colCount[x]++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 列密度谷值检测：两个角色可能只隔几像素透明带，但密度会明显下探
    const span = maxX - minX + 1;
    const peak = Math.max(...colCount);
    const VALLEY = Math.max(2, Math.floor(peak * 0.02)); // 谷值阈值
    const MIN_SEG = Math.floor(span * 0.12);              // 每段最小宽度

    const cuts = [];
    let inValley = false;
    let valleyStart = 0;
    for (let x = minX; x <= maxX; x++) {
      const low = colCount[x] <= VALLEY;
      if (low && !inValley) { inValley = true; valleyStart = x; }
      if (!low && inValley) {
        const w = x - valleyStart;
        if (w >= 3) cuts.push([valleyStart, x]);
        inValley = false;
      }
    }
    if (inValley) cuts.push([valleyStart, maxX + 1]);

    // 由切分点划段
    const bounds = [];
    let segStart = minX;
    for (const [cs, ce] of cuts) {
      if (cs - segStart >= MIN_SEG) {
        bounds.push([segStart, cs]);
        segStart = ce;
      }
    }
    if (maxX - segStart >= MIN_SEG) bounds.push([segStart, maxX + 1]);

    const out = [];
    for (const [bx0, bx1] of bounds) {
      // 该段内再算一次纵向包围盒
      let y0 = H, y1 = -1;
      for (let x = bx0; x < bx1; x++) {
        for (let y = 0; y < H; y++) {
          if (d[(y * W + x) * 4 + 3] > 12) {
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (y1 < 0) continue;
      const pad = 4;
      y0 = Math.max(0, y0 - pad);
      y1 = Math.min(H - 1, y1 + pad);
      const cw = bx1 - bx0, ch = y1 - y0 + 1;

      const oc = document.createElement('canvas');
      oc.width = cw; oc.height = ch;
      const octx = oc.getContext('2d');
      octx.drawImage(c, bx0, y0, cw, ch, 0, 0, cw, ch);
      out.push({ url: oc.toDataURL('image/png'), w: cw, h: ch });
    }
    return out;
  });

  const names = ['pose-1', 'pose-2', 'pose-3'];
  results.forEach((r, i) => {
    const name = names[i] ?? `pose-${i + 1}`;
    const buf = Buffer.from(r.url.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, `${name}.png`), buf);
    console.log(`[pose] ${name}.png  ${r.w}×${r.h}  ${(buf.length / 1024).toFixed(0)} KB`);
  });
  console.log(`[pose] 共切分出 ${results.length} 个独立姿态`);
} finally {
  await browser.close();
}
