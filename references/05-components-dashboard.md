# 看板专项层组件 · Dashboard Components

本层组件**仅用于数据看板场景**。它们建立在通用层之上（共用 `Card`、`Button`、`Table`、间距与字阶），只做加法。

---

## 1. MetricCard 指标卡

```tsx
<MetricCard
  label="总消耗"
  value="286,430"
  unit="元"
  trend={{ value: '12.4%', direction: 'positive', comparison: '较上周期' }}
  spark={[12, 18, 15, 22, 19, 26, 31]}
/>
```

### 结构

| 位置 | 内容 | 规格 |
| --- | --- | --- |
| 顶部 | `label` 指标名 | 13px / 500 / `text.secondary` |
| 中部 | `value` + `unit` | 28px / 600 / tabular-nums + 单位 14px / `text.tertiary` |
| 可选 | `spark` 迷你趋势 | 高 32px，趋势色 |
| 底部 | `trend` 或 `footnote` | 12–13px |

### 规则

- **单位必须独立 prop**，不拼进 value 字符串
- **value 与 unit 不写死格式**，格式化在业务层做完再传入（组件不做千分位处理）
- 最小宽度 200px，栅格 `--4` 时自动等分
- 趋势用 `TrendValue` 组件，不要手写箭头+颜色

---

## 2. TrendValue 趋势值

```tsx
<TrendValue value="12.4%" direction="positive" comparison="较上周期" />
```

| direction | 颜色 | 箭头 |
| --- | --- | --- |
| `positive` | `trend.positive`（绿） | ▲ |
| `negative` | `trend.negative`（红） | ▼ |
| `flat` | `trend.flat`（灰） | — |

**符号与颜色同时出现**，色弱用户靠符号识别方向。

**语义方向 ≠ 市场惯例**：positive 表示业务方向正向（消耗涨、CTR 涨），不随证券「红涨绿跌」反转。详见 [README §3.3](../README.md)。

---

## 3. Sparkline 迷你趋势

```tsx
<Sparkline data={[12, 18, 15, 22, 19, 26, 31]} direction="positive" />
```

- 内部做 min/max 归一化，只关心形状不关心绝对值
- viewBox `0 0 120 32`，`preserveAspectRatio="none"` 适应容器宽度
- 端点不做圆点标记（尺寸太小，画出来是噪点）
- 有 `ariaLabel` 时角色为 `img`，否则 `presentation`

**不要用 Sparkline 表达精确数值**——它只能表达形状。需要读数就用完整图表或直接给数字。

---

## 4. ChartFrame 图表容器

```tsx
<ChartFrame
  title="消耗趋势"
  subtitle="按日 · 近 30 天"
  height="md"
  legend={[
    { label: '巨量千川', color: 'var(--ds-semantic-chart-series-1)' },
    { label: 'Meta', color: 'var(--ds-semantic-chart-series-2)' },
  ]}
  actions={<SegmentedControl options={rangeOptions} value={range} onChange={setRange} />}
/>
```

| 参数 | 说明 |
| --- | --- |
| `title` | 图表标题，图表是什么 |
| `subtitle` | 维度与范围说明（按日 · 近 30 天） |
| `height` | `xs` 120px / `sm` 180px / `md` 260px / `lg` 360px |
| `legend` | 图例，色值必须用 `chart.series-*` 变量 |
| `loading` | 加载遮罩 |
| `emptyText` | 空态文案，默认「暂无数据」 |

**图表标题必须带维度**。「消耗趋势」不够，「消耗趋势 · 按日 · 近 30 天」才完整——脱离上下文看图会产生歧义。

---

## 5. 图表绘制规范

### 5.1 坐标轴

| 元素 | Token | 要求 |
| --- | --- | --- |
| 轴线 | `chart.axis` | 3:1 |
| 轴标签 | `chart.axis-label` | 4.5:1，12px |
| 网格线 | `chart.grid` | 装饰性，可弱化 |

- **Y 轴必须从 0 开始**（除非明确标注截断）
- 网格线只画横向，不画纵向（纵向网格会干扰读数）
- 轴标签不要旋转，需要空间时改用短标签或 tooltip

### 5.2 序列色

固定顺序，不按语义挑选：

```
series-1  brand-600    #4F46E5
series-2  accent-600  #0B8379
series-3  info-600    #0086C9
series-4  warning-600 #DC6803
series-5  danger-600  #D92D20
series-6  success-600 #039855
```

同一份报表在不同时间渲染必须颜色一致，读者才能跨期对比。新增维度时从 series-6 循环。

**相邻序列色相差不得小于 30°**，避免两条线难以分辨。超过 6 个序列时改用分组图表，不要继续加色。

### 5.3 Tooltip

- 底色 `chart.tooltip-bg`（`gray-900`），文字 `chart.tooltip-fg`
- 内容顺序：维度名 → 各系列名称与数值
- 数值 tabular-nums，系列名带色块
- 不遮挡被指向的数据点

### 5.4 空态与异常

- 无数据：图表区居中显示「暂无数据」，不显示空坐标系（空网格线比空白更让人困惑）
- 加载中：显示遮罩 + spinner，不显示半成品图表
- 部分数据缺失：图例标注缺失部分，不用 0 补齐（0 和缺失含义不同）

---

## 6. DataTable 数据表

```tsx
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
  page={page}
  total={total}
  onPageChange={setPage}
/>
```

### 列定义

| 字段 | 说明 |
| --- | --- |
| `key` | 字段名，同时也是默认取值路径 |
| `header` | 表头文案 |
| `numeric` | 数值列：右对齐 + tabular-nums |
| `width` | 列宽 |
| `render` | 自定义单元格渲染 |

**第一列固定为名称列**，提供 `renderName` 后由 `renderName` 负责该列内容，其余列从第 2 列开始。

### 表格规范

| 项 | 规则 |
| --- | --- |
| 行高 | 默认 48px，紧凑 36px |
| 数值列 | 右对齐 + 等宽数字 |
| 表头 | `bg.surface-subtle` 底 + `border.strong` 下边框 |
| 排序 | 表头可点击排序，当前排序列用箭头标记，`aria-sort` 标注 |
| 行悬浮 | `bg.surface-subtle` 底色 |
| 横向滚动 | 容器 `overflow-x: auto`，不压缩列宽 |
| 斑马纹 | ❌ 不使用。斑马纹 + 悬浮高亮会互相干扰 |
| 操作列 | 固定右侧，操作按钮用 `ghost` 变体 |

---

## 7. FilterBar 筛选栏

```tsx
<FilterBar actions={<Button size="sm">重置</Button>}>
  <span class="ds-filterbar__label">时间范围</span>
  <DateRangePicker start={start} end={end} onChange={setRange} presetLabel="近 7 天" />
  <SegmentedControl options={statusOptions} value={status} onChange={setStatus} />
</FilterBar>
```

- 筛选控件左对齐，标签在控件左侧（不是上方）
- 「重置」等次要操作放右侧
- 选中条件用 Tag 汇总展示，便于用户一次清除

---

## 8. SegmentedControl 分段控件

2–5 个互斥选项的切换。超过 5 个改用 Select。

- 容器底 `bg.surface-muted`，选中项白底 + `shadow-xs`
- 用 `aria-pressed` 表达状态

---

## 9. DateRangePicker 日期范围

- 用原生 `<input type="date">`，保证移动端能调用系统选择器
- 预设范围（近 7 天）与自定义日期区**分开展示**，预设用文字 chip，自定义用日期输入
- 预设范围处于激活态时显示 chip 的名称，让用户知道当前不是自定义

---

## 10. ThresholdBar 阈值进度条

```tsx
<ThresholdBar name="CPA 超标" value={142} max={100} displayValue="142 / 100" state="warning" />
```

| state | 颜色 | 含义 |
| --- | --- | --- |
| `normal` | `chart.series-1` | 正常范围 |
| `warning` | `feedback.warning-fg` | 接近阈值 |
| `danger` | `feedback.danger-fg` | 超出阈值 |

- 超限时进度条填满并用 danger 色，但**数值仍显示实际值**（142/100），不截断到 100%
- 用 `role="progressbar"` + `aria-valuenow/min/max`

---

## 11. InsightList 洞察列表

按优先级排序的自动洞察。每条包含标题与说明，序号用 `ds-insight__index` 圆形序号。

序号从 1 开始，表示优先级顺序，不是排名分数。

---

## 12. 看板布局模式

### 12.1 标准布局

```
指标卡区（ds-grid--4）
    ↓
主图表 + 侧栏洞察（ds-grid--3-2）
    ↓
明细数据表（ds-dtable）
```

### 12.2 侧栏宽度

`--3-2` / `--2-1` 栅格在 1280px 以下自动降为单列，侧栏内容移到主图表下方。

### 12.3 筛选与数据的层级

筛选栏固定在指标卡上方，不要放进指标卡内部——筛选是全局的，指标是结果。

---

## 13. 看板禁忌

| ❌ 禁止 | 原因 |
| --- | --- |
| Y 轴不从 0 开始且不标注 | 视觉夸大差异 |
| 一个图表放超过 6 个序列 | 难以分辨 |
| 用吉祥物色做图表序列 | 破坏系列色固定顺序，且吉祥物色只有 3:1 |
| 指标数值用趋势色 | 数值本身无方向，方向由 TrendValue 单独表达 |
| 表格用斑马纹 | 与悬浮高亮冲突 |
| 空数据补 0 | 0 与缺失语义不同 |
| 图表标题不带维度 | 脱离上下文产生歧义 |
| 数值拼接单位字符串 | 无法分别控制字号与颜色 |
