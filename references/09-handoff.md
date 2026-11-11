# 研发交付与设计走查 · Handoff & QA

---

## 1. 交付物清单

### 1.1 代码

| 文件 | 内容 | 维护方式 |
| --- | --- | --- |
| `tokens/source.json` | **唯一数据源** | ✅ 手工维护 |
| `tokens/tokens.css` | CSS 变量 | ❌ 生成 |
| `tokens/tokens.scss` | SCSS 变量 | ❌ 生成 |
| `tokens/tokens.ts` | TS 常量 | ❌ 生成 |
| `tokens/tokens.resolved.json` | 扁平化解析结果 | ❌ 生成 |
| `src/styles/base.css` | Reset + 排版基元 + 焦点规范 | ✅ 手工维护 |
| `src/styles/components.css` | 通用规范层样式 | ✅ 手工维护 |
| `src/styles/dashboard.css` | 看板专项层样式 | ✅ 手工维护 |
| `src/styles/mascot.css` | 吉祥物层样式 | ✅ 手工维护 |
| `src/components/*.tsx` | React 组件 | ✅ 手工维护 |
| `mascot/assets/processed/*` | 去底素材 | ❌ 脚本生成 |

### 1.2 文档

`docs/` 下 9 份：色彩、排版、间距布局、通用组件、看板组件、吉祥物、无障碍、响应式、交付 QA。

### 1.3 图板

`boards/out/` 下 7 张 PNG，与文档配套，用于评审与对齐。

---

## 2. 接入步骤

### 2.1 引入样式

```ts
// 入口
import './styles/base.css';       // 内含 tokens.css
import './styles/components.css';
import './styles/dashboard.css';
import './styles/mascot.css';    // 仅在用到吉祥物时引入
```

### 2.2 引入组件

```tsx
import { Button, Card, CardHeader, Badge, Field, Input } from '@/design-system/components';
import { MetricCard, TrendValue, ChartFrame, Grid } from '@/design-system/components';
import { MascotMark, MascotBadge, MascotState, HOSA_ASSETS } from '@/design-system/components';
```

### 2.3 素材部署

把 `mascot/assets/processed/` 下的 PNG 放到静态资源目录，并更新 `HOSA_ASSETS` 常量里的路径。

```ts
export const HOSA_ASSETS = {
  main: '/static/mascot/hosa-main-transparent.png',
  excited: '/static/mascot/pose-1.png',
  serious: '/static/mascot/pose-2.png',
  relaxed: '/static/mascot/pose-3.png',
  avatar: '/static/mascot/hosa-128.png',
} as const;
```

---

## 3. 改动流程

### 3.1 改一个颜色值

```
1. 编辑 tokens/source.json
2. npm run tokens          → 重新生成 CSS/SCSS/TS
3. npm run tokens:check    → 对比度校验（不通过则退出码 1）
4. npm run boards          → 重新生成图板
```

**不要直接改 `tokens.css`**——下次构建会被覆盖。

### 3.2 改通用主色

额外一步：重算与后鲨的 CIEDE2000 色差。

```
通用主色（当前紫罗兰 #7C3AED，色相 271）与后鲨海军蓝（#034285，色相 211）
  → ΔE00 = 22.3
```

判定标准：

| ΔE00 | 结论 |
| --- | --- |
| < 2 | 视觉等同，绝对不能同时使用 |
| 2–10 | 难以分辨，不可用于同屏 |
| 10–15 | 勉强可辨，有风险 |
| > 15 | 可辨，**当前 22.3** |
| > 25 | 显著不同 |

**若 ΔE00 降到 15 以下**，说明通用主色侵入了后鲨的深海军蓝色域（205–225 且明度 < 30%），需要换通用主色色相。

### 3.3 加一个新组件

```
1. 确认通用层是否已有同类组件 —— 优先扩展，不新建
2. 样式写进 src/styles/components.css（通用）或 dashboard.css（看板）
3. 组件写进 src/components/core.tsx 或 dashboard.tsx
4. 在对应 docs 文档补规格：变体 / 尺寸 / 状态 / Token / 无障碍
5. npm run typecheck
```

### 3.4 加一个吉祥物形态

```
1. 素材放入 mascot/assets/
2. node mascot/split-poses.mjs（或手工裁切）
3. 在 src/components/mascot.tsx 的 HOSA_ASSETS 与 MOOD_SRC 中登记
4. 更新 docs/06-mascot.md 的形态表
```

---

## 4. 设计走查清单

### 4.1 通用层

- [ ] 按钮主次明确，视口内 `primary` 不超过 1 个
- [ ] 表单有 label，不是 placeholder 代替
- [ ] 错误提示有文案，不只标红
- [ ] 表格数值列右对齐且等宽
- [ ] 空状态有下一步指引
- [ ] 加载态保留原宽高，不跳动
- [ ] 弹窗有 `role="dialog"` + ESC 关闭 + 焦点陷阱

### 4.2 看板层

- [ ] Y 轴从 0 开始（除非明确标注截断）
- [ ] 图表标题带维度说明
- [ ] 序列色按固定顺序，不同期报表颜色一致
- [ ] 序列数 ≤ 6
- [ ] 图例有色块 + 文字
- [ ] 趋势用 `TrendValue`，符号与颜色同时出现
- [ ] 空数据补 0 —— 确认没有
- [ ] 数值与单位分开渲染

### 4.3 吉祥物层

- [ ] 吉祥物没有用在通用组件的配色上
- [ ] 深海军蓝没有出现在通用层
- [ ] 吉祥物不是唯一信息载体，旁边有文本
- [ ] 吉祥物没有占据栅格列
- [ ] 纯图标按钮有 `aria-label`

### 4.4 无障碍

- [ ] `npm run tokens:check` 通过
- [ ] 全键盘可走通
- [ ] 焦点环始终可见
- [ ] 缩放 200% 不破版
- [ ] 色弱模式（DevTools）下信息仍可辨
- [ ] `prefers-reduced-motion` 已处理

### 4.5 响应式

- [ ] 375px 单列正常
- [ ] 768px 两列正常
- [ ] 1280px 完整布局
- [ ] 表格横向滚动可用
- [ ] 触摸目标 ≥ 44px

---

## 5. 版本管理

| 项 | 规则 |
| --- | --- |
| Token 变更 | 语义层改值 = minor；新增 token = minor；删除/重命名 = major |
| 组件变更 | 新增变体 = minor；破坏性 props 变更 = major |
| 样式类名 | `ds-` 前缀，遵循 BEM |
| CSS 变量 | `--ds-` 前缀，不加业务前缀（业务覆盖用语义层，不改变量名） |

### 5.1 变更日志模板

```markdown
## v1.1.0 (2026-11-XX)

### 新增
- token: semantic.bg.surface-raised
- 组件: SegmentedControl

### 变更
- token: semantic.action.primary-bg #4F46E5 → #7C3AED
  - 原因: 与后鲨深海军蓝 ΔE00 仅 6.9，改为紫罗兰后 ΔE00 = 22.3
  - 影响: 全站主色变更，需回归所有主按钮
```

**主色变更属于破坏性变更**——它影响每一个界面元素，必须在 changelog 里写明原因与影响面。

---

## 6. 已知待办

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 暗色主题 | 未实现 | Token 架构已预留，只需覆盖 `semantic.*` 层取值 |
| Modal 焦点陷阱 | 部分实现 | ESC 关闭已完成，焦点移入/循环/归还待补 |
| 产品专属组件 | 未包含 | 当前规范只含通用层与看板层 |
| 芯片形态 | 接口预留 | 视觉稿到位后补 `mascot.chip-*` Token（见 `docs/06-mascot.md` §6） |
| CI 集成 | 未接入 | `npm run tokens:check` 退出码为 1，可直接接入流水线 |
| ESLint 规则 | 未配置 | 可加规则禁止业务代码引用 `--ds-primitive-*` 与 `--ds-component-*` |

---

## 7. 常用命令速查

```bash
npm run tokens          # 重建 token 产物
npm run tokens:check    # 对比度校验（CI 阻断）
npm run typecheck       # 类型检查
npm run boards          # 重新生成 7 张图板

npm run mascot:palette  # 吉祥物素材取色
npm run mascot:process  # 去底 + 多尺寸
npm run mascot:split    # 姿态切分
```
