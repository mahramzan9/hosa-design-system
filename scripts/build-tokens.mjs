/**
 * Token 构建器
 * 输入: tokens/source.json (单一数据源)
 * 输出: tokens/tokens.css, tokens/tokens.scss, tokens/tokens.ts, tokens/tokens.resolved.json
 *
 * 规则:
 *  - "{a.b.c}" 形式的字符串是引用, 递归解析, 最多 10 层
 *  - 以 "$" 开头的 key 是说明性注释, 不产出变量
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'assets', 'tokens', 'source.json');

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const REF = /^\{([^}]+)\}$/;

function resolveRef(refPath, trail) {
  if (trail.includes(refPath)) throw new Error(`循环引用: ${[...trail, refPath].join(' -> ')}`);
  const segs = refPath.split('.');
  let cur = raw;
  for (const s of segs) {
    if (cur == null || typeof cur !== 'object' || !(s in cur)) {
      throw new Error(`引用不存在: {${refPath}}`);
    }
    cur = cur[s];
  }
  if (typeof cur === 'string') {
    const m = cur.match(REF);
    if (m) return resolveRef(m[1], [...trail, refPath]);
    return cur;
  }
  throw new Error(`引用指向非字符串: {${refPath}}`);
}

/** 展平为 { "primitive.gray.50": "#FFFFFF" } */
function flatten(node, prefix, out) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else if (typeof v === 'string') {
      const m = v.match(REF);
      out[key] = m ? resolveRef(m[1], [key]) : v;
    } else out[key] = v;
  }
  return out;
}

const flat = flatten(raw, '', {});

// 变量名映射: semantic -> --ds-xxx
const VAR_PREFIX = 'ds';
function toVarName(key) {
  return `--${VAR_PREFIX}-${key.replace(/\./g, '-')}`;
}

function isColor(v) {
  return typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl'));
}

// ---------- CSS ----------
const cssVars = [];
const groups = new Map();
for (const [k, v] of Object.entries(flat)) {
  if (!isColor(v) && !/^(space|font|radius|shadow|motion|z-index|breakpoint)\./.test(k)) continue;
  const g = k.split('.')[0];
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push([k, v]);
}

const cssParts = [];
cssParts.push('/* ===========================================================');
cssParts.push(' * Design System - CSS Custom Properties');
cssParts.push(' * 由 tokens/source.json 自动生成, 请勿手工修改');
cssParts.push(' * 生成命令: npm run tokens');
cssParts.push(' * =========================================================== */');
cssParts.push('');
cssParts.push(':root {');
for (const [g, items] of groups) {
  cssParts.push(`  /* ---- ${g} ---- */`);
  for (const [k, v] of items) {
    cssParts.push(`  ${toVarName(k)}: ${v};`);
  }
  cssParts.push('');
}
cssParts.push('}');
cssParts.push('');
cssParts.push('/* ===========================================================');
cssParts.push(' * 吉祥物主题层 (Mascot Theme Layer)');
cssParts.push(' * 用途: 吉祥物形象本身 / 吉祥物徽章 / 吉祥物气泡 / 吉祥物状态插画');
cssParts.push(' * 禁止: 用作通用按钮底色、表格斑马纹、图表序列色');
cssParts.push(' * 覆盖方式: .theme-mascot 或 [data-mascot="on"]');
cssParts.push(' * =========================================================== */');
cssParts.push('.theme-mascot,');
cssParts.push('[data-mascot="on"] {');
const mascotKeys = Object.keys(flat).filter((k) => k.startsWith('primitive.mascot.'));
for (const k of mascotKeys) {
  const short = k.replace('primitive.mascot.', '');
  cssParts.push(`  ${toVarName('mascot.' + short)}: ${flat[k]};`);
}
cssParts.push('}');
cssParts.push('');

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'tokens.css'), cssParts.join('\n'), 'utf8');

// ---------- SCSS ----------
const scssParts = [];
scssParts.push('// Design System - SCSS Variables');
scssParts.push('// 由 tokens/source.json 自动生成, 请勿手工修改');
scssParts.push('');
for (const [k, v] of Object.entries(flat)) {
  if (v == null) continue;
  if (typeof v === 'object') continue;
  scssParts.push(`$${k.replace(/\./g, '-')}: ${v};`);
}
scssParts.push('');
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'tokens.scss'), scssParts.join('\n'), 'utf8');

// ---------- TS ----------
const tsParts = [];
tsParts.push('/* Design System - TypeScript Tokens');
tsParts.push(' * 由 tokens/source.json 自动生成, 请勿手工修改 */');
tsParts.push('');
tsParts.push('export const tokens = {');
for (const [k, v] of Object.entries(flat)) {
  if (v == null || typeof v === 'object') continue;
  tsParts.push(`  '${k}': ${JSON.stringify(v)},`);
}
tsParts.push('} as const;');
tsParts.push('');
tsParts.push('export type TokenKey = keyof typeof tokens;');
tsParts.push('');
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'tokens.ts'), tsParts.join('\n'), 'utf8');

// ---------- resolved json ----------
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'tokens.resolved.json'), JSON.stringify(flat, null, 2), 'utf8');

console.log(`[tokens] resolved ${Object.keys(flat).length} tokens`);
console.log(`[tokens] css: ${path.join(__dirname, '..', 'assets', 'tokens', 'tokens.css')}`);
console.log(`[tokens] scss: ${path.join(__dirname, '..', 'assets', 'tokens', 'tokens.scss')}`);
console.log(`[tokens] ts:   ${path.join(__dirname, '..', 'assets', 'tokens', 'tokens.ts')}`);
