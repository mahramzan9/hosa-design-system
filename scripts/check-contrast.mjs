/**
 * 无障碍对比度校验
 * 校验 source.json 中所有 semantic 层前景/背景组合是否满足 WCAG 2.1 AA
 *
 * 规则:
 *  - 正文文字 (normal text): >= 4.5:1
 *  - 大字 (>=18.66px bold / >=24px, large text): >= 3:1
 *  - 非文字 UI 元素 (边框/图标/图形): >= 3:1
 *
 * 输出: tokens/contrast-report.md + 进程退出码 (0 = 全通过)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'source.json'), 'utf8'));
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

function hexToRgb(hex) {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function relLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(fg, bg) {
  const l1 = relLuminance(fg);
  const l2 = relLuminance(bg);
  if (l1 == null || l2 == null) return null;
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * 校验组合表: [前景 token, 背景 token, 判定类型]
 *   text     正文文字, 需 >= 4.5:1
 *   ui       承载信息的非文字元素（控件边界/图表序列/状态描边）, 需 >= 3:1
 *   decor    纯装饰元素（分隔线/网格线）, 不设硬性阈值, 仅记录
 */
const PAIRS = [
  // 正文
  ['semantic.text.primary', 'semantic.bg.surface', 'text'],
  ['semantic.text.primary', 'semantic.bg.canvas', 'text'],
  ['semantic.text.primary', 'semantic.bg.surface-subtle', 'text'],
  ['semantic.text.secondary', 'semantic.bg.surface', 'text'],
  ['semantic.text.secondary', 'semantic.bg.canvas', 'text'],
  ['semantic.text.tertiary', 'semantic.bg.surface', 'text'],
  ['semantic.text.link', 'semantic.bg.surface', 'text'],
  ['semantic.text.link-hover', 'semantic.bg.surface', 'text'],
  ['semantic.text.inverse', 'semantic.bg.surface-inverse', 'text'],
  ['semantic.text.inverse-secondary', 'semantic.bg.surface-inverse', 'text'],
  // 按钮
  ['semantic.action.primary-fg', 'semantic.action.primary-bg', 'text'],
  ['semantic.action.primary-fg', 'semantic.action.primary-bg-hover', 'text'],
  ['semantic.action.secondary-fg', 'semantic.action.secondary-bg', 'text'],
  ['semantic.action.secondary-fg', 'semantic.action.secondary-bg-hover', 'text'],
  ['semantic.action.tertiary-fg', 'semantic.action.secondary-bg', 'text'],
  ['semantic.action.ghost-fg', 'semantic.bg.surface', 'text'],
  ['semantic.action.ghost-fg-hover', 'semantic.bg.surface', 'text'],
  ['semantic.action.danger-fg', 'semantic.action.danger-bg', 'text'],
  // 反馈容器
  ['semantic.feedback.success-fg', 'semantic.feedback.success-bg', 'text'],
  ['semantic.feedback.warning-fg', 'semantic.feedback.warning-bg', 'text'],
  ['semantic.feedback.danger-fg', 'semantic.feedback.danger-bg', 'text'],
  ['semantic.feedback.info-fg', 'semantic.feedback.info-bg', 'text'],
  // 趋势 / 图表
  ['semantic.trend.positive', 'semantic.bg.surface', 'text'],
  ['semantic.trend.negative', 'semantic.bg.surface', 'text'],
  ['semantic.trend.flat', 'semantic.bg.surface', 'text'],
  ['semantic.chart.axis-label', 'semantic.bg.surface', 'text'],
  ['semantic.chart.tooltip-fg', 'semantic.chart.tooltip-bg', 'text'],
  // 吉祥物层
  ['semantic.mascot.ink', 'semantic.mascot.surface', 'text'],
  ['semantic.mascot.bubble-fg', 'semantic.mascot.bubble-bg', 'text'],
  // 承载信息的非文字元素
  ['semantic.border.strong', 'semantic.bg.surface', 'ui'],
  ['semantic.border.input', 'semantic.bg.surface', 'ui'],
  ['semantic.icon.secondary', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.axis', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-1', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-2', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-3', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-4', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-5', 'semantic.bg.surface', 'ui'],
  ['semantic.chart.series-6', 'semantic.bg.surface', 'ui'],
  ['semantic.feedback.success-border', 'semantic.feedback.success-bg', 'ui'],
  ['semantic.feedback.warning-border', 'semantic.feedback.warning-bg', 'ui'],
  ['semantic.feedback.danger-border', 'semantic.feedback.danger-bg', 'ui'],
  ['semantic.feedback.info-border', 'semantic.feedback.info-bg', 'ui'],
  ['semantic.mascot.ink', 'semantic.mascot.surface', 'ui'],
  // 装饰元素（不设硬性阈值）
  ['semantic.border.default', 'semantic.bg.surface', 'decor'],
  ['semantic.border.subtle', 'semantic.bg.surface', 'decor'],
  ['semantic.chart.grid', 'semantic.bg.surface', 'decor'],
  ['semantic.text.disabled', 'semantic.bg.surface', 'decor'],
  // 吉祥物主体填色：可感知边界由 ink 描边承担（已单独校验 ≥3:1），填色本身仅作装饰备案
  ['semantic.mascot.fill', 'semantic.mascot.surface', 'decor', '吉祥物轮廓由 mascot.ink 描边承担，填色不单独承担可感知性要求'],
];

const rows = [];
for (const pair of PAIRS) {
  const [fgKey, bgKey, kind, note] = pair;
  const fg = flat[fgKey];
  const bg = flat[bgKey];
  if (!fg || !bg) {
    rows.push({ fgKey, bgKey, kind, ratio: null, need: null, pass: false, note: note || 'token 缺失' });
    continue;
  }
  const ratio = contrast(fg, bg);
  const need = kind === 'text' ? 4.5 : kind === 'ui' ? 3.0 : null;
  rows.push({
    fgKey,
    bgKey,
    kind,
    fg,
    bg,
    ratio: ratio == null ? null : Math.round(ratio * 100) / 100,
    need,
    pass: need == null ? true : ratio != null && ratio >= need,
    note: note || (need == null ? '装饰性, 记录备案' : ''),
  });
}

const failed = rows.filter((r) => !r.pass);
const lines = [];
lines.push('# 无障碍对比度校验报告');
lines.push('');
lines.push('- 生成命令: `npm run tokens:check`');
lines.push('- 校验标准: WCAG 2.1 AA');
lines.push('  - 正文文字（text）: ≥ 4.5:1');
lines.push('  - 承载信息的非文字元素（ui）: ≥ 3:1');
lines.push('  - 纯装饰元素（decor）: 不设硬性阈值，仅记录备案');
lines.push(`- 校验组合总数: ${rows.length}　必须通过: ${rows.filter((r) => r.need != null).length}　未通过: ${failed.length}`);
lines.push('');
lines.push('| 前景 Token | 背景 Token | 前景色 | 背景色 | 类型 | 对比度 | 要求 | 结果 | 备注 |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  const type = r.kind === 'text' ? '正文' : r.kind === 'ui' ? '非文字' : '装饰';
  lines.push(
    `| \`${r.fgKey}\` | \`${r.bgKey}\` | ${r.fg || '-'} | ${r.bg || '-'} | ${type} | ${r.ratio ?? '-'} | ${r.need ? r.need + ':1' : '—'} | ${r.pass ? '通过' : '**未通过**'} | ${r.note || ''} |`
  );
}
lines.push('');

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'tokens', 'contrast-report.md'), lines.join('\n'), 'utf8');
console.log(`[contrast] ${rows.length - failed.length}/${rows.length} 通过`);
if (failed.length) {
  for (const r of failed) console.log(`  FAIL ${r.fgKey} on ${r.bgKey} = ${r.ratio} (need ${r.need})`);
  process.exitCode = 1;
} else {
  console.log('[contrast] 全部通过 WCAG AA');
}
