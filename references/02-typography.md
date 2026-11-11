# 排版系统 · Typography

## 1. 字体栈

### 正文与界面

```css
--ds-font-family-sans:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
```

系统字体栈，不引入 webfont。原因：中文 webfont 单文件 2–5 MB，对数据看板这类首屏密集文本的场景是明确的性能损失。

### 数字与等宽

```css
--ds-font-family-mono:
  'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Consolas,
  'Liberation Mono', monospace;
```

用于代码、ID、投放计划编号等需要等宽对齐的内容。

### 品牌展示

```css
--ds-font-family-display:
  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  'PingFang SC', 'Microsoft YaHei', sans-serif;
```

仅用于 Logo 锁定区与页面大标题。若项目不引入 Inter，会自动回落到系统栈，不影响布局。

---

## 2. 字阶

13 级，覆盖从辅助标签到展示大标题。

| Token | 值 | 字重 | 典型用途 |
| --- | --- | --- | --- |
| `font-size-micro` | 11px | 500 | 全大写标签、徽标、吉祥物旁挂标签 |
| `font-size-caption` | 12px | 400 | 辅助说明、表格次要信息、图表轴标签 |
| `font-size-small` | 13px | 400 | 表单辅助文字、卡片副标题、图表图例 |
| `font-size-body` | 14px | 400 | **正文默认**、表格内容、表单输入 |
| `font-size-body-lg` | 16px | 400 | 页面描述、引导文案 |
| `font-size-title-sm` | 16px | 600 | 卡片标题、指标卡标签 |
| `font-size-title` | 18px | 600 | 弹窗标题 |
| `font-size-title-lg` | 20px | 600 | 区块标题 |
| `font-size-heading` | 24px | 600 | 页面主标题 |
| `font-size-heading-lg` | 30px | 600 | 大区块标题 |
| `font-size-display` | 36px | 700 | 展示数字 |
| `font-size-display-lg` | 48px | 700 | 首页大数字 |
| `font-size-14`（alias） | — | — | — |

### 配套工具类

```html
<span class="ds-text-heading">页面标题</span>
<span class="ds-text-body ds-text-secondary">次要说明</span>
<span class="ds-text-caption ds-text-tertiary">辅助信息</span>
<span class="ds-text-micro">LABEL</span>
```

---

## 3. 字重

| Token | 值 | 用途 |
| --- | --- | --- |
| `font-weight-regular` | 400 | 正文 |
| `font-weight-medium` | 500 | 按钮、表格头、强调正文 |
| `font-weight-semibold` | 600 | 标题、指标数值 |
| `font-weight-bold` | 700 | 展示数字、Logo |

中文环境下不要用 300 及以下字重：多数中文字体在该字重下笔画会糊掉，横竖笔画粗细失衡。

---

## 4. 行高

| Token | 值 | 用途 |
| --- | --- | --- |
| `font-line-height-tight` | 1.25 | 大标题、展示数字 |
| `font-line-height-snug` | 1.4 | 中小标题、徽标 |
| `font-line-height-normal` | 1.6 | **正文默认** |
| `font-line-height-relaxed` | 1.75 | 长段落、阅读型内容 |

**中文字号与行高的关系**：同样的 px 值下，中文比拉丁字符占的横向空间更大，需要更宽的行高才不显拥挤。正文 14px 配 1.6 行高（实际 22.4px）比英文常见配置的 1.5 更宽松，这是中文排版的必要调整。

---

## 5. 数字排版

数据看板里数字是主角，排版规则比普通界面更严格。

### 5.1 等宽数字

所有数值型内容必须加 `font-variant-numeric: tabular-nums`：

```css
.ds-text-num { font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
```

原因：默认的比例数字（`1` 窄、`8` 宽）在列对齐时会造成视觉抖动。表格里的消耗、CPA、CTR 必须右对齐且等宽。

### 5.2 数字与单位分离

`MetricCard` 的 `value` 和 `unit` 是两个独立 prop，不做字符串拼接：

```tsx
<MetricCard label="总消耗" value="286,430" unit="元" />
```

原因：单位字号更小、颜色更浅，拼接成字符串后无法单独控制样式；且「286,430元」在千分位后紧跟中文字符的排版效果不稳定。

### 5.3 千分位与小数

| 数据类型 | 格式 | 示例 |
| --- | --- | --- |
| 金额（≥万） | 千分位 + 1 位小数 + 单位 | `286,430.5` 元 / `1.28 万` 元 |
| 金额（<万） | 千分位 + 2 位小数 | `8,420.00` 元 |
| 比率 | 2 位小数 + `%` | `3.42%` |
| 变化率 | 1 位小数 + `%` + 正负号 | `+12.4%` |
| 百分点变化 | 数值 + `个百分点` | `0.3 个百分点` |
| 计数 | 千分位 | `1,284` 次 |

变化率的正负号与颜色同时出现——色弱用户靠符号识别，不依赖颜色。

### 5.4 空值

不显示 `0`，显示 `—`：

```
消耗 —        ← 无数据
消耗 0        ← 确实为零
```

0 和「无数据」在投放业务上不等价（可能没投，也可能回传失败）。

---

## 6. 中文排版注意

| 场景 | 规则 |
| --- | --- |
| 中英文混排 | 中英文之间留 1/4 空格：`投放 Meta 广告` |
| 数字与单位 | 数字与中文单位之间加空格：`消耗 286,430 元` |
| 标点 | 中文段落用全角标点（，。）；界面标签可用半角 |
| 省略 | 中文不用 `...`，用 `…`（单字符），且不与文字间加空格 |
| 换行 | 中文段落不手动断行，用 `word-break: break-word` 兜底 |
| 对齐 | 中文正文左对齐，不用两端对齐（justify），会在标点处产生异常空隙 |

---

## 7. 层级示例

一个看板卡片的标准排版组合：

```
总消耗                              ← 13px / 500 / text.secondary
286,430 元                          ← 28px / 600 / text.primary / tabular-nums
▲ 12.4%  较上周期                   ← 13px / 600 / trend.positive / tabular-nums
```

三层信息各自有明确的字号、字重、颜色职责，不允许「一个大标题下面全用 14px」这种无层级排版。

---

## 8. 可访问性要求

| 要求 | 说明 |
| --- | --- |
| 最小正文 14px | 低于 13px 在中文字形下可读性显著下降；辅助信息最低 12px |
| 文本缩放 200% | 布局需在浏览器缩放 200% 时不丢失内容、不横向滚动 |
| 行高不小于 1.4 | 保证长文本可读 |
| 对比度 ≥ 4.5:1 | 见 [01-color.md §8](01-color.md) |
| 不用纯颜色传达信息 | 趋势需配合符号（▲/▼），状态需配合图标或文字 |
