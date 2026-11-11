#!/usr/bin/env node
/**
 * 一键安装设计系统到目标项目
 *
 * 用法:
 *   node scripts/install.mjs --target ./my-project                 # 复制样式 + Token
 *   node scripts/install.mjs --target ./my-project --react         # 额外复制 React 组件
 *   node scripts/install.mjs --target ./my-project --react --link  # 用软链代替复制（开发用）
 *   node scripts/install.mjs --target ./my-project --figma         # 只导出 Figma Token
 *   node scripts/install.mjs --target ./my-project --dry-run       # 只看会做什么
 *
 * 安装位置:
 *   <target>/src/design-system/
 *     ├── styles/       base.css components.css dashboard.css mascot.css
 *     ├── tokens/       tokens.css tokens.scss tokens.ts
 *     ├── components/   *.tsx（仅 --react）
 *     ├── mascot/       后鲨素材（仅 --react）
 *     └── index.ts      统一导出（仅 --react）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

// ---------- 参数 ----------
const args = process.argv.slice(2);
function hasFlag(name) {
  return args.includes(name);
}
function getArg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const targetArg = getArg('--target', '.');
const useReact = hasFlag('--react');
const useLink = hasFlag('--link');
const onlyFigma = hasFlag('--figma');
const dryRun = hasFlag('--dry-run');

const TARGET = path.resolve(process.cwd(), targetArg);
const DEST = path.join(TARGET, 'src', 'design-system');

const c = {
  reset: '[0m', dim: '[2m', bold: '[1m',
  green: '[32m', yellow: '[33m', cyan: '[36m', red: '[31m',
};

function log(msg) { console.log(msg); }
function step(msg) { log(`${c.cyan}▸${c.reset} ${msg}`); }
function ok(msg) { log(`${c.green}✓${c.reset} ${msg}`); }
function warn(msg) { log(`${c.yellow}!${c.reset} ${msg}`); }
function fail(msg) { log(`${c.red}✗${c.reset} ${msg}`); }

// ---------- 检查 ----------
if (!fs.existsSync(TARGET)) {
  fail(`目标目录不存在: ${TARGET}`);
  process.exit(1);
}

log('');
log(`${c.bold}后鲨设计系统 · 安装程序${c.reset}`);
log(`${c.dim}来源: ${ROOT}${c.reset}`);
log(`${c.dim}目标: ${TARGET}${c.reset}`);
log('');

const items = [];
function plan(from, to, label) {
  items.push({ from, to, label });
}

// 样式
for (const f of ['base.css', 'components.css', 'dashboard.css', 'mascot.css']) {
  plan(path.join(ASSETS, 'styles', f), path.join(DEST, 'styles', f), `样式 ${f}`);
}
// Token
for (const f of ['tokens.css', 'tokens.scss', 'tokens.ts']) {
  plan(path.join(ASSETS, 'tokens', f), path.join(DEST, 'tokens', f), `Token ${f}`);
}

if (onlyFigma) {
  log(`${c.yellow}--figma 模式：只处理 Figma Token，不安装代码文件${c.reset}`);
  items.length = 0;
}

// React 组件
if (useReact) {
  for (const f of fs.readdirSync(path.join(ASSETS, 'components'))) {
    plan(path.join(ASSETS, 'components', f), path.join(DEST, 'components', f), `组件 ${f}`);
  }
  // 吉祥物素材
  const mascotSrc = path.join(ASSETS, 'mascot');
  for (const f of fs.readdirSync(mascotSrc)) {
    plan(path.join(mascotSrc, f), path.join(DEST, 'mascot', f), `素材 ${f}`);
  }
}

// ---------- 执行 ----------
let copied = 0;
let linked = 0;

function copyOne(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) fs.rmSync(to, { force: true });
  fs.copyFileSync(from, to);
  copied++;
}

function linkOne(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) fs.rmSync(to, { force: true });
  try {
    fs.symlinkSync(path.relative(path.dirname(to), from), to, 'junction');
    linked++;
  } catch {
    copyOne(from, to);
  }
}

for (const it of items) {
  if (!fs.existsSync(it.from)) {
    warn(`跳过（源不存在）: ${it.label}`);
    continue;
  }
  if (dryRun) {
    log(`  ${c.dim}would ${useLink ? 'link' : 'copy'}${c.reset} ${it.from.replace(ROOT, '<ds>')} → ${it.to.replace(TARGET, '<target>')}`);
    continue;
  }
  if (useLink) linkOne(it.from, it.to);
  else copyOne(it.from, it.to);
}

if (dryRun) {
  log('');
  ok(`dry-run 完成，共 ${items.length} 项待操作`);
  log('');
  process.exit(0);
}

// ---------- React 入口文件 ----------
if (useReact && !dryRun) {
  const indexContent = `/**
 * 后鲨设计系统 · 统一导出
 * 由 scripts/install.mjs 生成，可按需修改
 */
export * from './components/core';
export * from './components/dashboard';
export * from './components/datatable';
export * from './components/mascot';
`;
  const indexPath = path.join(DEST, 'index.ts');
  fs.writeFileSync(indexPath, indexContent, 'utf8');

  const stylesIndex = `/* 后鲨设计系统 · 样式入口
 * 引入顺序不要调整：base 必须在最前（它内部已 @import tokens/tokens.css） */
@import './base.css';
@import './components.css';
@import './dashboard.css';
@import './mascot.css';
`;
  fs.writeFileSync(path.join(DEST, 'styles', 'index.css'), stylesIndex, 'utf8');
}

// ---------- Figma Token ----------
if (onlyFigma || hasFlag('--figma')) {
  step('生成 Figma Token…');
  const { execFileSync } = await import('node:child_process');
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'build-figma-tokens.mjs')], { stdio: 'inherit' });
    ok(`Figma Token: ${path.join(ASSETS, 'tokens', 'figma-tokens.json')}`);
  } catch (e) {
    warn('Figma Token 生成失败，可手动运行: node scripts/build-figma-tokens.mjs');
  }
}

// ---------- 结果 ----------
log('');
if (copied) ok(`已复制 ${copied} 个文件`);
if (linked) ok(`已创建 ${linked} 个软链`);
if (!copied && !linked) warn('没有文件被安装');

log('');
log(`${c.bold}下一步${c.reset}`);
log('');

if (useReact) {
  log(`  ${c.bold}React 项目${c.reset}`);
  log('');
  log(`  ${c.dim}1. 引入样式（在入口文件，通常是 main.tsx）${c.reset}`);
  log(`     import './src/design-system/styles/index.css';`);
  log('');
  log(`  ${c.dim}2. 引入组件${c.reset}`);
  log(`     import { Button, MetricCard, ChartFrame } from './src/design-system';`);
  log('');
  log(`  ${c.dim}3. 吉祥物素材路径（改 src/design-system/components/mascot.tsx 里的 HOSA_ASSETS）${c.reset}`);
  log(`     main: '/src/design-system/mascot/hosa-main-transparent.png'`);
  log('');
} else {
  log(`  ${c.bold}非 React 项目（纯 CSS / HTML）${c.reset}`);
  log('');
  log(`  ${c.dim}1. 引入样式${c.reset}`);
  log(`     <link rel="stylesheet" href="src/design-system/styles/index.css">`);
  log('');
  log(`  ${c.dim}2. 复制 components.css / dashboard.css 里的 class 即可${c.reset}`);
  log('');
}

log(`  ${c.bold}查文档${c.reset}`);
log(`  ${c.dim}规范: <ds>/references/     看板模板: <ds>/assets/templates/DashboardPage.tsx${c.reset}`);
log(`  ${c.dim}图板: <ds>/assets/boards/    Figma Token: <ds>/assets/tokens/figma-tokens.json${c.reset}`);
log('');
