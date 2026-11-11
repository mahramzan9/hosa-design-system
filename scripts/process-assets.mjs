/**
 * 吉祥物素材处理：去白底 → 透明 PNG + 多种尺寸裁切
 *
 * 用法: node mascot/process-assets.mjs
 * 依赖: puppeteer（canvas 解码/编码 PNG）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets', 'mascot');
const OUT = path.join(ASSETS);

const { default: puppeteer } = await import('puppeteer');
const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
const browser = await puppeteer.launch(launchOpts);

const page = await browser.newPage();

/** 把近白背景转透明，并对边缘做 alpha 羽化 */
async function knockOut(inputPath, outPath, { threshold = 236, feather = 12, pad = 0 } = {}) {
  const b64 = fs.readFileSync(inputPath).toString('base64');
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
  await page.waitForFunction('document.getElementById("i").complete');
  const dataUrl = await page.evaluate(
    (threshold, feather, pad) => {
      const img = document.getElementById('i');
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const src = ctx.getImageData(0, 0, W, H);
      const d = src.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const mx = Math.max(r, g, b);
        const mn = Math.min(r, g, b);
        const sat = mx === 0 ? 0 : (mx - mn) / mx;
        // 近白且低饱和 → 视为背景
        if (mx >= threshold && sat < 0.08) {
          d[i + 3] = 0;
          continue;
        }
        // 边缘羽化：亮度越接近白，alpha 越低
        if (mx >= threshold - feather * 4 && sat < 0.18) {
          const t = (mx - (threshold - feather * 4)) / (feather * 4);
          d[i + 3] = Math.round(255 * Math.max(0, Math.min(1, t)));
        }
      }
      ctx.putImageData(src, 0, 0);

      // 计算可见区域包围盒并裁切
      let minX = W, minY = H, maxX = -1, maxY = -1;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (d[(y * W + x) * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) return null;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(W - 1, maxX + pad);
      maxY = Math.min(H - 1, maxY + pad);
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;

      const out = document.createElement('canvas');
      out.width = cw;
      out.height = ch;
      const octx = out.getContext('2d');
      octx.drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
      return { url: out.toDataURL('image/png'), w: cw, h: ch, box: [minX, minY, cw, ch] };
    },
    threshold,
    feather,
    pad
  );
  if (!dataUrl) return null;
  const buf = Buffer.from(dataUrl.url.split(',')[1], 'base64');
  fs.writeFileSync(outPath, buf);
  return { w: dataUrl.w, h: dataUrl.h, size: buf.length };
}

/** 按比例缩放输出 */
async function resize(inputPath, outPath, width) {
  const b64 = fs.readFileSync(inputPath).toString('base64');
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
  await page.waitForFunction('document.getElementById("i").complete');
  const dataUrl = await page.evaluate((w) => {
    const img = document.getElementById('i');
    const scale = w / img.naturalWidth;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = Math.round(img.naturalHeight * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }, width);
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(outPath, buf);
  return buf.length;
}

fs.mkdirSync(OUT, { recursive: true });

try {
  const main = path.join(ASSETS, 'hosa-main.png');
  const poses = path.join(ASSETS, 'hosa-poses.png');

  // 1. 主形象去底
  const r1 = await knockOut(main, path.join(OUT, 'hosa-main-transparent.png'), { threshold: 238, feather: 14, pad: 6 });
  console.log(`[asset] hosa-main-transparent.png  ${r1.w}×${r1.h}  ${(r1.size / 1024).toFixed(0)} KB`);

  // 2. 三姿态去底
  const r2 = await knockOut(poses, path.join(OUT, 'hosa-poses-transparent.png'), { threshold: 238, feather: 14, pad: 6 });
  console.log(`[asset] hosa-poses-transparent.png  ${r2.w}×${r2.h}  ${(r2.size / 1024).toFixed(0)} KB`);

  // 3. 输出常用尺寸
  const sizes = [64, 128, 256];
  for (const w of sizes) {
    const s = await resize(path.join(OUT, 'hosa-main-transparent.png'), path.join(OUT, `hosa-${w}.png`), w);
    console.log(`[asset] hosa-${w}.png  ${(s / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
}
