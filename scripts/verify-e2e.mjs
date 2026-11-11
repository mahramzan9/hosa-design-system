/**
 * 端到端验证：安装到临时项目 → 真实渲染 → 检查样式与素材
 *
 * 用法: node scripts/verify-e2e.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, '.tmp-e2e');
const CONSUMER = path.join(TMP, 'consumer');

// puppeteer 可能装在本仓库也可能装在开发目录 —— 依次尝试
let puppeteer = null;
for (const base of [ROOT, path.resolve(ROOT, '..', 'design-system')]) {
  for (const rel of ['node_modules/puppeteer/lib/puppeteer/puppeteer.js']) {
    try {
      const mod = await import(pathToFileURL(path.join(base, rel)).href);
      puppeteer = mod.default ?? mod;
      break;
    } catch { /* 继续尝试 */ }
  }
  if (puppeteer) break;
}
if (!puppeteer) {
  console.error('[e2e] 未找到 puppeteer，请先 npm install');
  process.exit(1);
}

const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(CONSUMER, { recursive: true });

const errors = [];
let ok = true;
function check(cond, msg) {
  if (cond) console.log(`  [ok] ${msg}`);
  else { console.log(`  [FAIL] ${msg}`); ok = false; }
}

try {
  // 1. 安装
  console.log('[e2e] 1. 安装到临时项目');
  execFileSync(process.execPath, [path.join(__dirname, 'install.mjs'), '--target', CONSUMER, '--react'], { stdio: 'pipe' });
  const dsDir = path.join(CONSUMER, 'src', 'design-system');
  check(fs.existsSync(path.join(dsDir, 'styles', 'index.css')), 'styles/index.css 已安装');
  check(fs.existsSync(path.join(dsDir, 'index.ts')), 'index.ts 已安装');
  check(fs.existsSync(path.join(dsDir, 'components', 'core.tsx')), 'components/core.tsx 已安装');
  check(fs.existsSync(path.join(dsDir, 'mascot', 'hosa-main-transparent.png')), '吉祥物素材已安装');

  // 2. 检查 base.css 的 @import 路径能解析到实际文件
  console.log('[e2e] 2. 检查样式 @import 链');
  const baseCss = fs.readFileSync(path.join(dsDir, 'styles', 'base.css'), 'utf8');
  const importMatch = baseCss.match(/@import\s+['"]([^'"]+)['"]/);
  check(!!importMatch, 'base.css 含 @import');
  if (importMatch) {
    const resolved = path.resolve(path.join(dsDir, 'styles'), importMatch[1]);
    check(fs.existsSync(resolved), `@import 路径可解析: ${importMatch[1]}`);
  }

  // 3. 写一个真实页面并渲染
  console.log('[e2e] 3. 渲染页面');
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<link rel="stylesheet" href="src/design-system/styles/index.css">
</head><body>
<div class="ds-page">
  <header class="ds-page__header">
    <div><h1 class="ds-page__title">安装产物验证</h1>
    <p class="ds-page__desc">直接加载安装后的样式文件</p></div>
    <div><button class="ds-btn ds-btn--primary ds-btn--md">主要操作</button></div>
  </header>
  <div class="ds-grid ds-grid--4">
    <div class="ds-metric"><div class="ds-metric__label">总消耗</div>
      <div class="ds-metric__value"><span>286,430</span><span class="ds-metric__unit">元</span></div>
      <span class="ds-trend ds-trend--positive"><span class="ds-trend__arrow">▲</span><span>12.4%</span></span></div>
    <div class="ds-metric"><div class="ds-metric__label">转化成本</div>
      <div class="ds-metric__value"><span>3.82</span><span class="ds-metric__unit">元</span></div>
      <span class="ds-trend ds-trend--negative"><span class="ds-trend__arrow">▼</span><span>4.6%</span></span></div>
  </div>
  <div class="ds-chart" style="margin-top:16px">
    <div class="ds-chart__header"><div><div class="ds-chart__title">消耗趋势</div>
      <div class="ds-chart__subtitle">按日 · 近 30 天</div></div></div>
    <div class="ds-chart__body ds-chart__body--md">
      <svg viewBox="0 0 640 200" style="width:100%;height:100%">
        <line class="ds-chart__grid-line" x1="40" y1="40" x2="620" y2="40"/>
        <path class="ds-chart__series" d="M45,160 L95,140 L145,152 L195,118 L245,128 L295,96" stroke="var(--ds-semantic-chart-series-1)"/>
      </svg>
    </div>
  </div>
  <div class="ds-mascot-state" style="margin-top:16px">
    <div class="ds-mascot-state__figure">
      <img src="src/design-system/mascot/hosa-main-transparent.png" width="96" style="object-fit:contain" alt=""></div>
    <div class="ds-mascot-state__title">还没有投放数据</div>
    <div class="ds-mascot-state__desc">完成账户授权后即可看到</div>
  </div>
</div>
</body></html>`;
  fs.writeFileSync(path.join(CONSUMER, 'index.html'), html, 'utf8');

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`资源失败: ${r.url()}`));

  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(CONSUMER, 'index.html')).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const r = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const g = (n) => cs.getPropertyValue(n).trim();
    const primaryBtn = document.querySelector('.ds-btn--primary');
    const metric = document.querySelector('.ds-metric__value span');
    const mascotImg = document.querySelector('.ds-mascot-state__figure img');
    return {
      brand: g('--ds-semantic-action-primary-bg'),
      mascot: g('--ds-semantic-mascot-fill'),
      space4: g('--ds-space-4'),
      radius: g('--ds-radius-md'),
      primaryBg: primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : '',
      metricFont: metric ? getComputedStyle(metric).fontVariantNumeric : '',
      metricText: metric?.textContent ?? '',
      seriesStroke: getComputedStyle(document.querySelector('.ds-chart__series')).stroke,
      gridStroke: getComputedStyle(document.querySelector('.ds-chart__grid-line')).stroke,
      mascotLoaded: mascotImg ? mascotImg.naturalWidth > 0 : false,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });

  await page.screenshot({ path: path.join(ROOT, 'assets', 'boards', '08-install-verified.png'), fullPage: true });
  await browser.close();

  console.log('[e2e] 4. 校验渲染结果');
  check(r.brand === '#7C3AED', `主色变量生效: ${r.brand}`);
  check(r.mascot === '#034285', `后鲨色变量生效: ${r.mascot}`);
  check(r.space4 === '16px', `间距变量生效: ${r.space4}`);
  check(r.primaryBg === 'rgb(124, 58, 237)', `主按钮底色正确: ${r.primaryBg}`);
  check(r.metricFont.includes('tabular-nums'), `数值等宽字体生效: ${r.metricFont}`);
  check(r.metricText === '286,430', `指标数值正确: ${r.metricText}`);
  check(r.seriesStroke === 'rgb(124, 58, 237)', `图表序列色取自 Token: ${r.seriesStroke}`);
  check(r.gridStroke !== 'none', `网格线可见: ${r.gridStroke}`);
  check(r.mascotLoaded, '吉祥物图片加载成功');
  check(r.bodyBg === 'rgb(247, 248, 250)', `画布底色正确: ${r.bodyBg}`);
  check(errors.length === 0, errors.length ? `控制台/资源错误: ${errors.join(' | ')}` : '无控制台与资源错误');

  console.log('');
  console.log(ok ? '[e2e] ✅ 端到端验证全部通过' : '[e2e] ❌ 存在问题');
  process.exitCode = ok ? 0 : 1;
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}
