---
name: hosa-design-system
description: |
  后鲨（HOSA）公司设计规范系统 —— Token 单一数据源 + 双层组件库（通用规范层 / 看板专项层）
  + 吉祥物层 + Figma Token 导出 + AI UI 生成指南。
  适用场景：做 UI 设计、写前端页面、搭数据看板、做设计评审、走查视觉规范、
  生成 Figma 变量、导出设计 Token、给 AI 下达 UI 设计指令。
  触发词：设计规范、设计系统、design system、设计 token、UI 设计、做界面、
  画页面、写页面、做看板、数据看板、指标卡、图表、表格规范、配色方案、
  主题色、间距规范、组件库、无障碍、响应式、Figma、figma 变量、设计走查、
  后鲨、HOSA、吉祥物。
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# 后鲨设计规范系统

一套 Token 驱动的设计系统，同时服务三个场景：**工程实现**、**AI 生成 UI**、**Figma 设计**。

三者共用同一份数据源 `assets/tokens/source.json`，所以颜色和间距永远不会打架。

---

## 0. 先做这一步

**读 `references/10-how-to-use.md`**（约 5 分钟），里面有三件最重要的事：

1. Figma 怎么接
2. 代码怎么接
3. 看板页模板在哪

再按需展开其他 reference。**不要一次性读完所有文档**——按需加载。

---

## 1. 三条工作流

### 1.1 工程侧：写代码

```bash
# 一次性装进目标项目
node scripts/install.mjs --target ./your-project --react
```

装完后：

```tsx
import { Button, Card, MetricCard, ChartFrame, DataTable, Grid } from '@/design-system';
import '@/design-system/styles/base.css';
```

组件清单与规格 → `references/04-components-core.md`（通用）、`references/05-components-dashboard.md`（看板）

### 1.2 AI 生成 UI：给 AI 下指令

如果你自己就是 AI，或要指挥另一个 AI 做设计，读 **`references/ai-ui-design.md`**。

它包含：配色决策树、间距规则、组件选型表、图表规范、禁止事项、以及可直接复制的 HTML/React 骨架。

核心约束（AI 最容易违反的）：

| 规则 | 说明 |
| --- | --- |
| 只用 `semantic.*` | 禁止直接写 `#7C3AED` 或 `primitive.*` |
| 数值与单位分离 | `<MetricCard value="286,430" unit="元" />`，不拼字符串 |
| 趋势色是业务方向 | 绿=正向、红=负向，**不随证券「红涨绿跌」反转** |
| 深海军蓝是后鲨专属 | 通用组件里禁用 |
| 数值用等宽数字 | `tabular-nums`，表格数值列右对齐 |
| Y 轴从 0 开始 | 图表硬规则 |
| 序列色按固定顺序 | `series-1..6`，不按语义挑 |

### 1.3 Figma 侧：做设计

```bash
node scripts/build-figma-tokens.mjs   # → assets/tokens/figma-tokens.json
```

Figma 安装 **Tokens Studio** 插件 → 导入该 JSON → 得到 127 个变量。

**关键**：`primitive.*` 组刻意没导出。原始色阶无语义，开放给设计师会导致用色失控。Figma 里只能拿到 `semantic.action.primary-bg` 这类有明确职责的变量。

详见 `references/10-how-to-use.md` §1。

---

## 2. 目录地图

```
hosa-design-system/
├── SKILL.md                      ← 你在读的这份
├── assets/
│   ├── tokens/
│   │   ├── source.json           ★ 唯一数据源（改这里）
│   │   ├── tokens.css            生成物：CSS 变量
│   │   ├── tokens.scss           生成物：SCSS 变量
│   │   ├── tokens.ts             生成物：TS 常量
│   │   ├── figma-tokens.json     生成物：Figma Tokens Studio 格式
│   │   └── contrast-report.md    生成物：对比度校验报告
│   ├── components/               React + TypeScript 组件（38 个导出）
│   ├── styles/                   四层样式（base / components / dashboard / mascot）
│   ├── mascot/                   后鲨素材（主形象 + 三姿态 + 多尺寸）
│   ├── boards/                   7 张设计图板 PNG
│   └── templates/DashboardPage.tsx   可直接复制的看板页
├── references/                   ← 规范文档，按需加载
└── scripts/                      构建与校验脚本
```

---

## 3. 规范文档索引

| 文件 | 内容 | 什么时候读 |
| --- | --- | --- |
| `10-how-to-use.md` | 实操手册 | **先读这份** |
| `ai-ui-design.md` | AI 生成 UI 的执行指南 | 让 AI 做设计时 |
| `01-color.md` | 色彩分层、语义色、图表色板、后鲨色域隔离 | 选色、改色时 |
| `02-typography.md` | 字体栈、字阶、行高、数字排版 | 定字号时 |
| `03-spacing-layout.md` | 4px 基准、间距阶梯、栅格、密度 | 布局时 |
| `04-components-core.md` | 20 个通用组件规格 | 用通用组件时 |
| `05-components-dashboard.md` | 12 个看板组件 + 图表规范 | 做看板时 |
| `06-mascot.md` | 后鲨：角色设定、4 形态、配色隔离、素材管线 | 用吉祥物时 |
| `07-accessibility.md` | 对比度、键盘可达性、读屏、动效降级 | 无障碍要求时 |
| `08-responsive.md` | 断点、栅格降级、移动端适配 | 做响应式时 |
| `09-handoff.md` | 研发交付流程、设计走查清单、版本管理 | 评审/走查时 |
| `mascot-assets.md` | 素材管线脚本说明 | 换吉祥物素材时 |

---

## 4. 三条硬规则

违反这三条的设计不通过评审：

### 4.1 单一数据源

改颜色只改 `assets/tokens/source.json`，然后：

```bash
node scripts/build-tokens.mjs        # 重新生成 CSS / SCSS / TS
node scripts/check-contrast.mjs      # 对比度校验（不通过退出码 1）
node scripts/build-figma-tokens.mjs  # 重新导出 Figma Token
```

**永远不要直接改 `tokens.css`** —— 下次构建会覆盖。

### 4.2 语义层唯一入口

```
primitive  原始色阶，不含语义      ❌ 业务代码禁用
   ↓
semantic   语义层                ✅ 业务代码唯一入口
   ↓
component  组件层                ❌ 仅组件内部引用
```

### 4.3 后鲨色域隔离

**深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，通用规范层禁止使用。**

通用层主色因此定为紫罗兰 `#7C3AED`（色相 271），与后鲨 `#034285`（色相 211）的 CIEDE2000 色差 **ΔE00 = 22.3**。

替换主色前必须重算 ΔE00，低于 15 视为失效。详见 `references/01-color.md` §7.2。

---

## 5. 常用命令

```bash
node scripts/build-tokens.mjs        # 重建 token 产物
node scripts/check-contrast.mjs      # 对比度校验（49 组，WCAG AA）
node scripts/build-figma-tokens.mjs  # 导出 Figma Token
node scripts/install.mjs --target .  # 装进当前项目
```

素材相关（换后鲨形象时）：

```bash
node scripts/extract-palette.mjs assets/mascot/hosa-main.png   # 像素级取色
node scripts/process-assets.mjs                              # 去底
node scripts/split-poses.mjs                                 # 切分姿态
```

---

## 6. 常见任务速查

| 用户说 | 你该做什么 |
| --- | --- |
| 「帮我做个数据看板」 | 读 `references/ai-ui-design.md` + `05-components-dashboard.md`，抄 `assets/templates/DashboardPage.tsx` |
| 「这个界面配色不专业」 | 读 `references/01-color.md`，检查是否用了 `primitive.*`、是否违反后鲨色域隔离 |
| 「设计一套 Figma 变量」 | 跑 `build-figma-tokens.mjs`，给 Tokens Studio 导入步骤 |
| 「帮我做个落地页」 | 读 `references/ai-ui-design.md`，用 `semantic.*` + 4px 间距阶梯 |
| 「评审一下这个页面」 | 用 `references/09-handoff.md` §4 走查清单 |
| 「组件怎么用」 | 读 `references/04-components-core.md` 或 `05-components-dashboard.md` |
| 「加个新的图表类型」 | 读 `references/05-components-dashboard.md` §5 图表规范 |
| 「换成公司新吉祥物」 | 读 `references/mascot-assets.md`，走三步管线 |
| 「改一下主色」 | 读 `references/01-color.md` §3 + §7.2，**必须重算 ΔE00** |
| 「检查无障碍」 | 跑 `check-contrast.mjs`，再对 `references/07-accessibility.md` |

---

## 7. 组件速查

**通用层**（`assets/components/core.tsx`）：
`Button` `Field` `Input` `Textarea` `Select` `Checkbox` `Radio` `Switch` `Card` `CardHeader` `Badge` `Tag` `Avatar` `Tabs` `Alert` `EmptyState` `Skeleton` `Pagination` `Modal` `ToastRegion`

**看板层**（`dashboard.tsx` + `datatable.tsx`）：
`TrendValue` `Sparkline` `MetricCard` `ChartFrame` `SegmentedControl` `FilterBar` `DateRangePicker` `ThresholdBar` `InsightList` `Grid` `DataTable` `StatusCell` `RowActions` `CellTitle`

**吉祥物层**（`mascot.tsx`）：
`MascotAsset` `MascotMark` `MascotBadge` `MascotBubble` `MascotState` `MascotBand` `MascotIcon` `HOSA_ASSETS`

后鲨 4 种形态：`happy`（挥手）`excited`（冲浪）`serious`（专注）`relaxed`（休息）

---

## 8. 交付物

| 文件 | 用途 |
| --- | --- |
| `assets/boards/*.png` | 7 张设计图板，评审和对齐用 |
| `assets/templates/DashboardPage.tsx` | 完整看板页模板 |
| `assets/mascot/*.png` | 后鲨素材（主形象 + 三姿态 + 64/128/256） |
| `assets/tokens/figma-tokens.json` | Figma 变量源 |
