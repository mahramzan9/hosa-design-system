/**
 * 导出 Figma Tokens（Tokens Studio 格式）
 *
 * 用法: node tokens/build-figma-tokens.mjs
 * 输出: tokens/figma-tokens.json
 *
 * 在 Figma 中使用:
 *   1. 安装插件: Tokens Studio (for Figma)
 *   2. 插件设置 → 勾选 "Sync with JSON" / "Use file on disk"
 *   3. 把 tokens/figma-tokens.json 的内容粘贴到插件的 "Add new token set" → JSON 导入
 *   4. Figma 变量面板会出现全部色板，按 semantic 分组
 *
 * 注意: Tokens Studio 只同步颜色/数值，不同步组件。
 *      组件需在 Figma 中用这些变量手工搭建一次，之后建立 Variable → Component 的绑定。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'assets', 'tokens', 'source.json');
const OUT = path.join(__dirname, '..', 'assets', 'tokens', 'figma-tokens.json');

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const REF = /^\{([^}]+)\}$/;

function resolveRef(refPath, trail) {
  if (trail.includes(refPath)) throw new Error(`循环引用: ${refPath}`);
  const segs = refPath.split('.');
  let cur = raw;
  for (const s of segs) {
    if (cur == null || typeof cur !== 'object' || !(s in cur)) throw new Error(`引用不存在: {${refPath}}`);
    cur = cur[s];
  }
  if (typeof cur === 'string') {
    const m = cur.match(REF);
    if (m) return resolveRef(m[1], [...trail, refPath]);
    return cur;
  }
  throw new Error(`引用指向非字符串: {${refPath}}`);
}

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

const isColor = (v) => typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl'));

/** 把 "semantic.text.primary" 变成嵌套对象 { semantic: { text: { primary: {...} } } } */
function nest(key, value) {
  const parts = key.split('.');
  let node = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof node[p] !== 'object' || node[p] === null || node[p].value !== undefined) node[p] = {};
    node = node[p];
  }
  const last = parts[parts.length - 1];
  node[last] = value;
}

const out = {};

// ---- 颜色 ----
for (const [k, v] of Object.entries(flat)) {
  if (!isColor(v)) continue;
  const [group, ...rest] = k.split('.');
  if (group === 'primitive') continue; // primitive 不进 Figma，避免设计师直接用原始色阶
  nest(k, { value: v, type: 'color' });
}

// ---- 数值（间距/圆角/字号）----
for (const [k, v] of Object.entries(flat)) {
  if (typeof v !== 'string') continue;
  const m = v.match(/^(-?[\d.]+)px$/);
  if (!m) continue;
  const [group, ...rest] = k.split('.');
  if (!['space', 'radius', 'font'].includes(group)) continue;
  if (group === 'font' && !k.startsWith('font.size')) continue;
  nest(k, { value: Number(m[1]), type: 'spacing' });
}

// ---- 字体族 ----
for (const [k, v] of Object.entries(flat)) {
  if (!k.startsWith('font.family.')) continue;
  nest(k, { value: v, type: 'fontFamily' });
}

// ---- 阴影 ----
for (const [k, v] of Object.entries(flat)) {
  if (!k.startsWith('shadow.') || typeof v !== 'string') continue;
  nest(k, { value: v, type: 'boxShadow' });
}

// ---- 断点（转为数值，供 Figma 变量使用）----
for (const [k, v] of Object.entries(flat)) {
  if (!k.startsWith('breakpoint.')) continue;
  const m = v.match(/^(\d+)px$/);
  if (!m) continue;
  nest(k, { value: Number(m[1]), type: 'number' });
}

const doc = {
  $metadata: {
    tokenSetOrder: ['core'],
    name: '设计系统 · Design System',
    description:
      '语义层 Token，业务设计只使用 semantic 分组。primitive 分组刻意未导出——它不含语义，开放给设计师会导致用色失控。',
  },
  core: out,
};

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2), 'utf8');

const colorCount = Object.keys(out).filter(() => true).length;
console.log(`[figma] 已导出 ${OUT}`);
console.log(`[figma] 顶层分组: ${Object.keys(out).join(', ')}`);

// 统计
let n = 0;
const walk = (o) => {
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object' && v.value !== undefined) n++;
    else if (v && typeof v === 'object') walk(v);
  }
};
walk(out);
console.log(`[figma] 共 ${n} 个 Token`);
console.log('[figma] 提示: primitive.* 未导出，设计师只能看到 semantic / space / radius / font / shadow');
