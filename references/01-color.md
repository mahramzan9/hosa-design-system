# 色彩系统 · Color System

## 1. 架构

色彩分三层，业务代码只能引用 `semantic` 层。

| 层 | 前缀 | 是否可被业务引用 | 说明 |
| --- | --- | --- | --- |
| primitive | `--ds-primitive-*` | ❌ | 原始色阶，不含任何业务语义 |
| semantic | `--ds-semantic-*` | ✅ | 唯一入口，每个 Token 有明确单一职责 |
| component | `--ds-component-*` | ❌ | 组件内部尺寸与外观，业务不得引用 |

**为什么强制分层**：一旦允许业务直接用 `#4F46E5`，就会出现「投放页是靛蓝、报表页是另一个蓝」的局面。分层后，改品牌色只需改 `primitive.brand.*` 一处。

---

## 2. 中性色阶 · primitive.gray

14 级灰阶，暖调极轻（略带冷灰），用于背景、描边、文字三级层次。

| Token | 值 | 典型用途 |
| --- | --- | --- |
| `gray-0` | `#FFFFFF` | 卡片面、弹层面 |
| `gray-25` | `#FCFCFD` | 悬浮态面 |
| `gray-50` | `#F7F8FA` | 页面画布 `bg.canvas` |
| `gray-100` | `#F1F3F6` | 次级面 `bg.surface-subtle` |
| `gray-150` | `#E8EBF0` | 弱面 `bg.surface-muted`、弱分隔线 |
| `gray-200` | `#E0E4EA` | 默认分隔线 `border.default` |
| `gray-300` | `#CFD4DC` | 表格表头分隔（早期版本已上调） |
| `gray-400` | `#A9B1BE` | 禁用文字 `text.disabled`、占位符 |
| `gray-500` | `#828B9B` | 控件边界 `border.input`、图表轴线 |
| `gray-600` | `#616A7B` | 三级文字 `text.tertiary`、强分隔 `border.strong` |
| `gray-700` | `#454D5D` | 二级文字 `text.secondary` |
| `gray-800` | `#2C323E` | 深色面、反色按钮文字 |
| `gray-900` | `#1B2028` | 主文字 `text.primary`、反色面、图表 tooltip 底 |
| `gray-950` | `#11151C` | 最深面 |

**关键约束**：
- `border.input`（表单控件边界）必须 ≥ 3:1 → 用 `gray-500`，不能用 `gray-200`
- `border.default`（装饰分隔线）是 WCAG 1.4.11 豁免项，不设阈值，用 `gray-200`
- 两者不可互换：把装饰线提亮到 3:1 会让表格显得网格过重

---

## 3. 品牌主色 · primitive.brand

紫罗兰 10 级。**通用规范层的主色**，用于按钮、链接、选中态、图表主序列。

> **为什么是紫罗兰而不是蓝色**：后鲨（HOSA）吉祥物的品牌色是深海军蓝（`#034285`，色相 211）。若通用主色也用蓝色系，两者色相仅差 30° 左右，同屏时无法区分谁是谁的品牌标志。因此通用层主色改为紫罗兰（色相 271），与后鲨的 CIEDE2000 色差 **ΔE00 = 22.3**（> 25 为显著不同，此处已接近显著可辨的下限），且明度差达 2.4 倍。
>
> 这条决策写进 token 注释，替换主色前必须重新核算 ΔE00。

| 档位 | Token | 值 |
| --- | --- | --- |
| 50 | `brand-50` | `#F5F1FF` |
| 100 | `brand-100` | `#EDE6FE` |
| 200 | `brand-200` | `#DDD2FE` |
| 300 | `brand-300` | `#C4B0FB` |
| 400 | `brand-400` | `#A684F8` |
| 500 | `brand-500` | `#8B5CF6` |
| 600 | `brand-600` | `#7C3AED` |
| 700 | `brand-700` | `#6D28D9` |
| 800 | `brand-800` | `#5B21B6` |
| 900 | `brand-900` | `#4C1D95` |

**档位分工**（不要跨档混用）：

| 场景 | 档位 |
| --- | --- |
| 主按钮底色 / hover / active | 600 / 700 / 800 |
| 链接文字 / hover | 600 / 700 |
| 焦点环 | 500（焦点环有 3px 外扩阴影，需留出视觉余量） |
| 品牌徽标浅底 | 50 |
| 品牌徽标文字 | 700（浅底上 600 只有 4.0:1，700 才达 6.3:1） |

---

## 4. 辅助强调色 · primitive.accent

青绿 7 级。用于**次要数据系列**与图表第二序列，不用于按钮。

| 档位 | 值 |
| --- | --- |
| 50 | `#E6FBF8` |
| 100 | `#C3F5EF` |
| 200 | `#8AE9DE` |
| 300 | `#4FD8C8` |
| 400 | `#22BFAE` |
| 500 | `#0FA396` |
| 600 | `#0B8379` |
| 700 | `#0A6A62` |

图表第二序列用 `accent-600`（4.6:1），不用 500（3.2:1）—— 图表序列色属于承载信息的非文字元素，阈值 3:1。

---

## 5. 状态色 · primitive.status

四态，每态 6 档（50/100/300/500/600/700）。

| 状态 | 浅底 | 描边（≥3:1） | 文字（≥4.5:1） |
| --- | --- | --- | --- |
| success | `success-50` `#ECFDF3` | `success-600` `#039855` | `success-700` `#027A48` |
| warning | `warning-50` `#FFFAEB` | `warning-600` `#DC6803` | `warning-700` `#B54708` |
| danger | `danger-50` `#FEF3F2` | `danger-600` `#D92D20` | `danger-700` `#B42318` |
| info | `info-50` `#EFF8FF` | `info-600` `#0086C9` | `info-700` `#026AA2` |

**档位规则**：容器底用 50 档，容器描边用 600 档，容器内文字用 700 档。这三档是硬性搭配，不允许用 300 档做描边——浅色描边在浅底上只有 1.4–1.8:1，视觉上会「糊掉」。

---

## 6. 语义层 Token 清单

### 6.1 背景 `bg`

| Token | 值 | 用途 |
| --- | --- | --- |
| `bg.canvas` | `gray-50` | 页面最底层 |
| `bg.surface` | `gray-0` | 卡片、面板、弹层 |
| `bg.surface-subtle` | `gray-100` | 表头、输入框禁用底、条纹 |
| `bg.surface-muted` | `gray-150` | 弱容器、菜单项 hover |
| `bg.surface-inverse` | `gray-900` | 反色容器 |
| `bg.overlay` | `rgba(16,20,28,.56)` | 模态遮罩 |

**层级规则**：画布 → 卡片面 → 次级面，三层关系不可颠倒。卡片面不能比画布更暗。

### 6.2 文字 `text`

| Token | 值 | 对比度（白底） |
| --- | --- | --- |
| `text.primary` | `gray-900` | 15.8:1 |
| `text.secondary` | `gray-700` | 8.6:1 |
| `text.tertiary` | `gray-600` | 5.5:1 |
| `text.disabled` | `gray-400` | 2.2:1（豁免：WCAG 1.4.3 排除禁用控件） |
| `text.inverse` | `gray-0` | 反色面 15.8:1 |
| `text.inverse-secondary` | `gray-300` | 深底 8.0:1 |
| `text.link` | `brand-600` | 6.3:1 |

`text.secondary` 与 `text.tertiary` 都达 4.5:1，区别是**层级**不是合规性：secondary 用于正文中的次要信息，tertiary 用于辅助说明与占位。两者不可互换。

### 6.3 操作态 `action`

| Token | 值 |
| --- | --- |
| `action.primary-bg` / `-hover` / `-active` | `brand-600` / `brand-700` / `brand-800` |
| `action.primary-fg` | `gray-0` |
| `action.secondary-bg` / `-hover` | `gray-0` / `gray-100` |
| `action.secondary-fg` | `gray-800` |
| `action.tertiary-bg-hover` | `gray-100` |
| `action.tertiary-fg` | `gray-700` |
| `action.ghost-fg` / `-hover` | `gray-600` / `gray-900` |
| `action.danger-bg` / `-hover` / `-fg` | `danger-600` / `danger-700` / `gray-0` |
| `action.disabled-bg` / `-fg` | `gray-100` / `gray-400` |

### 6.4 趋势方向 `trend`

| Token | 值 | 含义 |
| --- | --- | --- |
| `trend.positive` | `success-700` | 业务方向正向 |
| `trend.positive-bg` | `success-50` | 正向标签底 |
| `trend.negative` | `danger-700` | 业务方向负向 |
| `trend.negative-bg` | `danger-50` | 负向标签底 |
| `trend.flat` | `gray-600` | 无显著变化 |

**语义定义见 README §3.3**。`trend` 与 `feedback` 是两套独立语义：`feedback` 表达状态（成功/失败），`trend` 表达方向（涨/跌）。同一个绿色在两处含义不同，但色值一致——这是刻意的，减少色彩总量。

### 6.5 图表 `chart`

| Token | 值 |
| --- | --- |
| `chart.series-1..6` | `brand-600` / `accent-600` / `info-600` / `warning-600` / `danger-600` / `success-600` |
| `chart.axis` | `gray-500` |
| `chart.axis-label` | `gray-600` |
| `chart.grid` | `gray-150` |
| `chart.tooltip-bg` | `gray-900` |
| `chart.tooltip-fg` | `gray-0` |

**序列色固定顺序**，不按数据含义挑选——同一份报表在不同时间渲染必须颜色一致，读者才能跨期对比。新增维度时从序列 6 循环使用。

---

## 7. 吉祥物配色隔离

吉祥物拥有独立的 `semantic.mascot.*` 组，与通用主色**不共享任何 Token**。

### 7.1 后鲨（HOSA）色板

数值由 `mascot/assets/hosa-main.png` **像素级提取**得出，不是人工指定。

| Token | 角色 | 值 | 来源 |
| --- | --- | --- | --- |
| `mascot.fill` | 形象主体填充（深海军蓝） | `#034285` | 素材像素占比 12.3% |
| `mascot.accent` | 形象点缀（腹部金黄） | `#EAC46D` | 素材像素占比 15.7% |
| `mascot.support` | 强调细节（红眼） | `#AE2129` | 素材像素占比 0.7% |
| `mascot.ink` | 描边、气泡文字（最深蓝） | `#142D4F` | 素材像素占比 1.5% |
| `mascot.surface` | 插画底色、品牌带底色 | `#EEF3FA` | 主色派生 |
| `mascot.surface-strong` | 描边、次级底 | `#D8E5F4` | 主色派生 |
| `mascot.bubble-bg` | 气泡背景 | `#F5F9FD` | 主色派生 |
| `mascot.bubble-fg` | 气泡文字 | `#142D4F` | 同 ink |

### 7.2 色域隔离规则

**深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，通用规范层禁止使用。**

这条规则不靠人眼把关，靠三个可验证的量化指标：

| 指标 | 判定标准 | 当前值 |
| --- | --- | --- |
| CIEDE2000 色差 ΔE00 | > 15 才算可辨 | 22.3（通用紫罗兰 ↔ 后鲨海军蓝） |
| 明度差 | > 20%（相对） | 58% vs 27% |
| 饱和度差 | > 15% | 96% vs 81% |

ΔE00 的计算脚本见 `tokens/scripts/check-contrast.mjs` 同级目录下的色差探针逻辑，替换主色时必须重算。

### 7.3 为什么必须隔离

1. **角色辨识**：看板里出现蓝色，用户第一反应是「这是后鲨」，不会误以为是某个数据系列或按钮。
2. **语义分离**：深海军蓝 = 品牌 / 引导 / 吉祥物；紫罗兰 = 系统界面 / 数据。同屏出现时不需要图例。
3. **避免稀释**：如果后鲨色进了通用组件，按钮、表格、图表会失去统一的系统感，品牌反而被淹没。

### 7.4 对比度要求

| 组合 | 要求 | 实际值 |
| --- | --- | --- |
| `mascot.ink` on `mascot.surface` | ≥ 4.5:1 | 13.6:1 |
| `mascot.bubble-fg` on `mascot.bubble-bg` | ≥ 4.5:1 | 14.4:1 |
| `mascot.support` on `mascot.bubble-bg` | ≥ 4.5:1 | 6.5:1 |
| `mascot.fill` on `mascot.surface` | ≥ 3:1（形象轮廓） | 8.9:1 |
| `mascot.accent` on `mascot.bubble-bg` | 装饰（不可做文字） | 1.6:1 |

后鲨素材本身自带深色描边，在任意底色上都可辨识；`mascot.ink` 的存在是为了气泡文字与旁挂标签描边。

### 禁止事项

- ❌ 用 `mascot.fill` 做按钮底色
- ❌ 用 `mascot.accent` 做文字（1.6:1，远低于阈值）
- ❌ 把吉祥物色加入 `chart.series-*`
- ❌ 用吉祥物色表达涨跌（那是 `trend` 的职责）
- ❌ 让吉祥物成为纯图标按钮的唯一标识（无障碍要求可点击目标有文本）
- ❌ 在通用层任何位置使用深海军蓝（后鲨专属色域）

---

## 8. 对比度校验

校验由 `npm run tokens:check` 自动执行，覆盖 49 组前景/背景配对，输出到 `tokens/contrast-report.md`。

| 判定类型 | 阈值 | 说明 |
| --- | --- | --- |
| `text` | ≥ 4.5:1 | 正文文字 |
| `ui` | ≥ 3:1 | 承载信息的非文字元素（控件边界、图表序列、状态描边） |
| `decor` | 无硬性阈值 | 纯装饰（分隔线、网格线、禁用文字），仅记录备案 |

**校验不通过时命令退出码为 1**，可直接接入 CI 阻断合并。

装饰类元素之所以不设阈值：WCAG 1.4.11 只要求「承载识别 UI 组件或状态所需的信息」的元素达 3:1。表格装饰分隔线不承担状态识别功能，强行提到 3:1 只会让表格视觉噪声过大。这条边界已写入校验脚本注释，避免后续被误当成漏洞。

---

## 9. 暗色主题

当前版本未提供暗色主题，但架构已预留：暗色只需覆盖 `semantic.*` 层的取值，`primitive.*` 与 `component.*` 不用动。

推荐的暗色取值方向：

| 语义组 | 暗色取值方向 |
| --- | --- |
| `bg.canvas` | `gray-950` |
| `bg.surface` | `gray-900` |
| `bg.surface-subtle` | `gray-800` |
| `text.primary` | `gray-50` |
| `text.secondary` | `gray-300` |
| `text.tertiary` | `gray-400`（需重新校验对比度） |
| `action.primary-bg` | `brand-400`（暗底上需提亮） |

实现方式建议为 `[data-theme='dark']` 选择器覆盖，而不是引入第二套变量名——同一份组件代码在两种主题下复用。
