# 后鲨设计系统 · HOSA Design System

一套 Token 驱动的设计系统，同时服务三个场景：**工程实现**、**AI 生成 UI**、**Figma 设计**。

三者共用同一份数据源，所以颜色和间距永远不会打架。

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  工程实现      │   │  AI 生成 UI   │   │  Figma 设计   │
│  React + CSS  │   │  指令 + 规范  │   │  Tokens Studio │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────┬───┴──────────────────┘
                      │
              source.json  ← 唯一数据源
              （改这里 → 三端同步）
```

---

## 快速开始

### 作为 Agent Skill 使用

把本仓库放到你的 skill 目录：

```bash
git clone <repo-url> ~/.workbuddy/skills/hosa-design-system
```

或直接在会话里说「用 hosa-design-system 做……」，Agent 会自动加载 `SKILL.md`。

### 装进前端项目

```bash
# 复制样式 + Token
node scripts/install.mjs --target ./my-project

# 额外复制 React 组件（38 个导出）
node scripts/install.mjs --target ./my-project --react
```

装完后：

```tsx
import { Button, MetricCard, ChartFrame, DataTable } from './src/design-system';
import './src/design-system/styles/index.css';
```

### 同步到 Figma

```bash
node scripts/build-figma-tokens.mjs
```

Figma 安装 **Tokens Studio** 插件 → 导入 `assets/tokens/figma-tokens.json` → 得到 127 个变量。

---

## 三层规范

| 层 | 适用范围 | 组件数 |
| --- | --- | --- |
| **通用规范层** | 所有产品界面 | 20 |
| **看板专项层** | 仅数据看板 | 12 |
| **吉祥物层** | 品牌标识 / 引导 / 状态插画 | 6 |

三层共用同一套地基（间距、字阶、卡片、表格），只做加法不做平行建设。

---

## Token 架构

```
primitive  原始色阶，不含语义      ❌ 业务代码禁用
   ↓
semantic   语义层                ✅ 业务代码唯一入口
   ↓
component  组件层                ❌ 仅组件内部引用
```

270 个 Token，单一数据源 `assets/tokens/source.json`，自动生成 CSS / SCSS / TS / Figma 四端产物。

**改一个颜色值**：

```bash
node scripts/build-tokens.mjs        # 重新生成
node scripts/check-contrast.mjs      # 对比度校验（不通过退出码 1）
node scripts/build-figma-tokens.mjs  # 重新导出 Figma
```

---

## 后鲨（HOSA）

公司 AI 机器人吉祥物「后鲨（HOSA）」——戴鲨鱼头套的 AI 机器人，星座摩羯座，爱冲浪、游泳、研发。

以鲨鱼为原型，「鲨」取「沙」之音，谐音而得「后鲨」之名。鲨鱼是历经演化留存至今的海中霸主，以此寓意企业未来能够稳健强盛地发展。

### 色域隔离

**深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，通用规范层禁止使用。**

通用层主色因此定为紫罗兰 `#7C3AED`，与后鲨 `#034285` 的 CIEDE2000 色差 **ΔE00 = 22.3**。替换主色前必须重算，低于 15 视为失效。

### 4 种形态

| mood | 形象 | 用在 |
| --- | --- | --- |
| `happy` | 挥手欢呼 | Logo、加载、成功提示 |
| `excited` | 冲浪划水 | 引导、空状态、激活动态 |
| `serious` | 站立专注 | 异常提示、需用户处理 |
| `relaxed` | 坐姿休息 | 暂无更多内容、稍后提醒 |

---

## 无障碍

WCAG 2.1 AA，**由脚本校验而非人工目测**：

- 49 组前后景配对自动校验，正文 ≥4.5:1、非文字 ≥3:1
- 不通过时 `check-contrast.mjs` 退出码为 1，可直接接入 CI 阻断合并

---

## 目录结构

```
hosa-design-system/
├── SKILL.md                      Agent Skill 入口
├── assets/
│   ├── tokens/                   Token 数据源 + 四端产物
│   ├── components/               React + TypeScript 组件
│   ├── styles/                   四层样式
│   ├── mascot/                   后鲨素材
│   ├── boards/                   7 张设计图板
│   └── templates/                看板页模板
├── references/                   11 份规范文档
└── scripts/                      构建与校验脚本
```

---

## 文档

| 文件 | 内容 |
| --- | --- |
| [references/10-how-to-use.md](references/10-how-to-use.md) | **实操手册** —— Figma / 代码接入、改色流程 |
| [references/ai-ui-design.md](references/ai-ui-design.md) | **AI 生成 UI 执行指南** |
| [references/01-color.md](references/01-color.md) | 色彩分层、后鲨色域隔离 |
| [references/02-typography.md](references/02-typography.md) | 排版系统 |
| [references/03-spacing-layout.md](references/03-spacing-layout.md) | 间距与布局 |
| [references/04-components-core.md](references/04-components-core.md) | 通用层组件规格 |
| [references/05-components-dashboard.md](references/05-components-dashboard.md) | 看板层组件 + 图表规范 |
| [references/06-mascot.md](references/06-mascot.md) | 后鲨完整规范 |
| [references/07-accessibility.md](references/07-accessibility.md) | 无障碍 |
| [references/08-responsive.md](references/08-responsive.md) | 响应式 |
| [references/09-handoff.md](references/09-handoff.md) | 研发交付与走查清单 |
| [references/mascot-assets.md](references/mascot-assets.md) | 素材管线 |

---

## 许可

见 [LICENSE](LICENSE)。吉祥物形象（`assets/mascot/`）为公司资产，使用需遵循公司品牌规范。
