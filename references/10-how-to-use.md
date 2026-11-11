# 实操手册 · 怎么用这套东西

> 三条路线：① 在 Figma 里做设计 → ② 在代码里做看板 → ③ 评审与走查。
> 看完这一篇就能开工，不用读其他文档。

---

## 0. 先搞清一件事：这套东西分两层

| | Figma 里看到的 | 代码里看到的 |
| --- | --- | --- |
| **颜色 / 间距 / 字号** | ✅ `tokens/figma-tokens.json` 导入 Tokens Studio | ✅ `tokens/tokens.css` |
| **组件** | ❌ Figma 里要手工搭一次（见 §1.3） | ✅ `src/components/*.tsx` 直接 import |

**关键**：Figma 和代码用的是**同一份 Token 源**（`tokens/source.json`），所以两边颜色永远不会打架。改色只需改一处 → 重新生成 → 两边同步。

---

## 1. 在 Figma 里做 UI 设计

### 1.1 一次性接入（10 分钟）

1. Figma 安装插件 **Tokens Studio**
2. 打开插件 → `Settings` → 勾选 `Sync with JSON`
3. 把 `tokens/figma-tokens.json` 的内容粘贴进插件的 `Add new token set` → JSON 导入
4. 完成后 Figma 变量面板会出现全部色板

### 1.2 你在 Figma 里能看到什么

| 分组 | 内容 | 用法 |
| --- | --- | --- |
| `semantic` | 背景/描边/文字/操作/趋势/反馈/图表/吉祥物 | **日常只用这一组** |
| `space` | 4–96px 间距阶梯 | 间距一律取这里的值 |
| `radius` | 2–24px 圆角 | 卡片 12、按钮 6、胶囊 999 |
| `font` | 字号与字体族 | 正文 14、标题 16/600 |
| `shadow` | 阴影 | 卡片用 `xs`，弹窗用 `xl` |
| `breakpoint` | 480 / 768 / 1024 / 1280 / 1536 | 画响应式稿时用 |

### 1.3 ⚠️ `primitive` 组刻意没导出

原始色阶（`primitive.gray.500`、`primitive.brand.600` 等）**不进 Figma**。

原因：它们不含语义。设计师一旦能直接挑 `primitive.brand.300`，就会出现「这个按钮比那个浅一点」的随意选择，规范就失效了。Figma 里只能拿到 `semantic.action.primary-bg` 这种有明确职责的变量。

> 如果确实需要调整某个色阶，改 `tokens/source.json` → `npm run tokens` → 重新导出，而不是在 Figma 里手改。

### 1.4 在 Figma 里搭组件

Tokens 只管颜色和数值，组件要在 Figma 里搭一次：

| 做法 | 说明 |
| --- | --- |
| **变量绑定（推荐）** | 组件的颜色属性绑定到 `semantic.*` 变量。以后改 Token，Figma 里所有组件自动跟着变 |
| **手工色值** | ❌ 会和 Token 脱节，改 Token 时不会更新 |

搭完的组件记得设成 **Component + Variant**（按钮 = variant: primary/secondary/danger × size: sm/md/lg），这样和代码里的 props 一一对应。

### 1.5 Figma ↔ 代码的对齐表

| Figma Variant | 代码 prop |
| --- | --- |
| Button / variant=primary | `<Button variant="primary">` |
| Button / size=md | `<Button size="md">` |
| Input / state=default\|error | `<Input invalid={...}>` |
| Badge / tone=success | `<Badge tone="success">` |
| Alert / tone=danger | `<Alert tone="danger">` |
| MetricCard | `<MetricCard label value unit trend spark />` |
| DataTable | `<DataTable columns rows rowKey />` |

对照 `docs/04-components-core.md` 与 `docs/05-components-dashboard.md` 的规格表，每个组件的变体/尺寸/状态都是一一对应的。

---

## 2. 在代码里做看板

### 2.1 接入（一次性）

```bash
# 方式一：复制到项目里
cp -r design-system/src design-system/tokens your-project/src/

# 方式二：作为内部包
npm install file:../design-system
```

样式入口：

```ts
// main.tsx 或 app.tsx
import './styles/base.css';       // 内含 tokens.css，自动引入
import './styles/components.css';
import './styles/dashboard.css';
import './styles/mascot.css';    // 用到吉祥物时才引
```

组件导入：

```tsx
import {
  Button, Card, CardHeader, Badge, Field, Input, Select, Alert, Tabs, Modal,
  MetricCard, TrendValue, ChartFrame, Grid, DataTable, FilterBar,
  SegmentedControl, ThresholdBar, InsightList,
  MascotMark, MascotBadge, MascotState, MascotBubble, HOSA_ASSETS,
} from '@/design-system/components';
```

### 2.2 搭一个看板页的标准骨架

```tsx
import { Grid, MetricCard, ChartFrame, DataTable, FilterBar, SegmentedControl, InsightList, Card, CardHeader } from '@/design-system/components';

export default function DashboardPage() {
  return (
    <div className="ds-page">
      <header className="ds-page__header">
        <div>
          <h1 className="ds-page__title">投放总览</h1>
          <p className="ds-page__desc">近 7 天 · 4 个广告账户</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-space-3)' }}>
          <Button variant="secondary">导出</Button>
          <Button variant="primary">新建计划</Button>
        </div>
      </header>

      {/* 1. 筛选栏 —— 全局筛选，放在指标卡上方 */}
      <FilterBar actions={<Button size="sm">重置</Button>}>
        <span className="ds-filterbar__label">时间范围</span>
        <SegmentedControl
          options={[{ value: '7d', label: '近 7 天' }, { value: '30d', label: '近 30 天' }]}
          value={range}
          onChange={setRange}
        />
      </FilterBar>

      {/* 2. 指标卡区 */}
      <Grid span="4">
        <MetricCard label="总消耗" value="286,430" unit="元"
          trend={{ value: '12.4%', direction: 'positive', comparison: '较上周期' }}
          spark={[12, 18, 15, 22, 19, 26, 31]} />
        {/* …其余三张 */}
      </Grid>

      {/* 3. 主图表 + 侧栏洞察 */}
      <Grid span="3-2">
        <ChartFrame title="消耗趋势" subtitle="按日 · 近 30 天" height="md"
          legend={[{ label: '巨量千川', color: 'var(--ds-semantic-chart-series-1)' }]}>
          <MyChart />
        </ChartFrame>
        <Card>
          <CardHeader title="自动洞察" />
          <InsightList items={insights} />
        </Card>
      </Grid>

      {/* 4. 明细数据表 */}
      <DataTable
        title="渠道投放表现"
        columns={[
          { key: 'name', header: '渠道 / 计划' },
          { key: 'spend', header: '消耗', numeric: true },
          { key: 'ctr', header: 'CTR', numeric: true },
          { key: 'status', header: '状态', render: (r) => <Badge tone={r.tone}>{r.label}</Badge> },
        ]}
        rows={rows}
        rowKey={(r) => r.id}
        renderName={(r) => <CellTitle title={r.name} subtitle={r.subtitle} />}
        page={page} total={total} onPageChange={setPage}
      />
    </div>
  );
}
```

### 2.3 图表本体自己画

`ChartFrame` 只负责容器（标题/图例/加载/空态），图形区域留给你：

```tsx
<svg viewBox="0 0 640 220" style={{ width: '100%', height: '100%' }}>
  <line className="ds-chart__grid-line" x1="40" y1="40" x2="620" y2="40" />
  <text className="ds-chart__axis-label" x="4" y="44">60k</text>
  <path className="ds-chart__series" d="M45,160 L95,140 …"
        stroke="var(--ds-semantic-chart-series-1)" />
</svg>
```

现成的 class：

| class | 用途 |
| --- | --- |
| `ds-chart__grid-line` | 网格线（只画横向） |
| `ds-chart__axis-line` | 轴线 |
| `ds-chart__axis-label` | 轴标签（12px，4.5:1） |
| `ds-chart__series` | 折线（2px 圆头） |
| `ds-chart__bar` | 柱状（圆角 2px） |

图表三条硬规则（详见 `docs/05-components-dashboard.md` §5）：
1. Y 轴从 0 开始
2. 序列色按固定顺序 `series-1..6`，不按语义挑
3. 图表标题必须带维度

---

## 3. 日常开发中的常见动作

### 3.1 要改一个颜色

```
1. 编辑 tokens/source.json
2. npm run tokens        → 重新生成 CSS/SCSS/TS
3. npm run tokens:check  → 对比度校验，不通过则退出码 1
4. npm run figma:tokens  → 重新导出 Figma Token
5. npm run boards        → 重新生成图板（评审用）
```

**永远不要直接改 `tokens/tokens.css`**——下次构建会覆盖。

### 3.2 要改通用主色

⚠️ 主色影响每一个界面元素，属于破坏性变更。

```
1. 改 tokens/source.json 的 primitive.brand.*
2. 重算与后鲨的色差 ΔE00（必须 ≥ 15）
3. 走完 3.1 的全部步骤
4. 在 changelog 写明「原因 + 影响面」
```

第 2 步的判定标准见 `docs/01-color.md` §7.2。当前值：紫罗兰 `#7C3AED` ↔ 后鲨 `#034285` = ΔE00 22.3。

### 3.3 要加一个新组件

```
1. 先查通用层有没有能扩展的 —— 优先扩展，不新建
   Button 加个 variant  >  新建一个 Button2 组件
2. 样式写进 src/styles/components.css（通用）或 dashboard.css（看板）
3. 组件写进 src/components/core.tsx 或 dashboard.tsx
4. 在 docs 对应文件补规格：变体 / 尺寸 / 状态 / Token / 无障碍
5. npm run typecheck
6. Figma 里同步建同名组件的 variant
```

### 3.4 要加一个后鲨形态

```
1. 素材放到 mascot/assets/
2. node mascot/split-poses.mjs（或手工裁切）
3. 在 src/components/mascot.tsx 的 HOSA_ASSETS 与 MOOD_SRC 登记
4. 更新 docs/06-mascot.md 的形态表
```

---

## 4. 评审与走查

### 4.1 评审时给什么

| 场景 | 给什么 |
| --- | --- |
| 看整体风格 | `boards/out/*.png` 7 张图板 |
| 看具体组件 | `preview/index.html`（可直接打开交互） |
| 看规则 | `docs/` 对应文档 |

### 4.2 走查清单

`docs/09-handoff.md` §4 有完整清单，分通用层/看板层/吉祥物层/无障碍/响应式五组。

### 4.3 提需求时怎么写

直接引用组件名和变体，不要描述「一个紫色的圆角按钮」：

```
✅ 用 ds-btn--primary / ds-btn--md，配 loading 态
❌ 用一个紫色的圆角按钮
```

这样评审时不用讨论视觉细节，直接对规格。

---

## 5. 命令速查

```bash
npm run tokens          # 重建 token 产物
npm run tokens:check    # 对比度校验（CI 阻断）
npm run figma:tokens    # 导出 Figma Token
npm run typecheck       # 类型检查
npm run boards          # 重新生成 7 张图板

npm run mascot:palette  # 吉祥物素材取色
npm run mascot:process  # 去底 + 多尺寸
npm run mascot:split    # 姿态切分

npm run preview:verify       # 预览页验证（HTML 层）
npm run preview:components   # React 组件实跑验证（组件层）
```

### 两个验证脚本的区别

| 脚本 | 验证什么 | 覆盖 |
| --- | --- | --- |
| `preview:verify` | 静态预览页 | HTML + CSS 渲染、资源加载、控制台错误 |
| `preview:components` | **React 组件本体** | 47 个元素渲染、弹窗开关、Tab 切换、分页、吉祥物图片 |

`preview:components` 用 esbuild 把组件打包后真实挂载到浏览器，所以它能证明「组件在真实 React 环境下可用」，而不只是「样式写对了」。改完组件跑一次，比人工点一遍快。

---

## 6. 一句话总结

| 你要做的事 | 去哪 |
| --- | --- |
| 定颜色、间距、字号 | `tokens/source.json` 改 → `npm run tokens` |
| Figma 里画界面 | Tokens Studio 导入 `tokens/figma-tokens.json` |
| 代码里搭页面 | `import { ... } from '@/design-system/components'` |
| **抄一个看板页模板** | `templates/DashboardPage.tsx` |
| 查组件怎么用 | `docs/04` / `docs/05` |
| 改吉祥物形象 | `mascot/` 管线三步 |
| 评审 | `boards/out/` + `preview/index.html` |
| 走查 | `docs/09-handoff.md` §4 |
| 改完组件验一下 | `npm run preview:components` |
