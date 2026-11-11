# 响应式 · Responsive

---

## 1. 断点

| Token | 值 | 设备区间 | 典型设备 |
| --- | --- | --- | --- |
| `breakpoint-xs` | 480px | 超小屏 | 手机竖屏（最窄） |
| `breakpoint-sm` | 768px | 平板竖屏 / 手机横屏 | iPad 竖屏 |
| `breakpoint-md` | 1024px | 平板横屏 / 小笔记本 | iPad 横屏 |
| `breakpoint-lg` | 1280px | 桌面 | 主流笔记本 |
| `breakpoint-xl` | 1536px | 大屏桌面 | 显示器 |

**移动优先**：基础样式针对移动端，向上叠加断点。

---

## 2. 栅格降级

| 栅格 | ≥1280px | 1024–1279px | 768–1023px | <768px |
| --- | --- | --- | --- | --- |
| `ds-grid--4` | 4 列 | 2 列 | 2 列 | 1 列 |
| `ds-grid--3` | 3 列 | 2 列 | 2 列 | 1 列 |
| `ds-grid--2` | 2 列 | 2 列 | 2 列 | 1 列 |
| `ds-grid--2-1` | 2fr 1fr | 1 列 | 1 列 | 1 列 |
| `ds-grid--1-2` | 1fr 2fr | 1 列 | 1 列 | 1 列 |
| `ds-grid--3-2` | 3fr 2fr | 1 列 | 1 列 | 1 列 |

### 关键规则

**降级只改列数，不改间距。** 列间距恒定 16px，避免切换断点时视觉密度突变。

侧栏型布局（`--2-1` / `--1-2` / `--3-2`）在 1280px 以下直接降为单列，侧栏内容移到主内容下方——不做「侧栏变窄」，因为窄侧栏放不下看板的洞察列表。

---

## 3. 容器宽度

```css
.ds-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 32px 64px;
}

@media (max-width: 768px) {
  .ds-page { padding: 20px 16px 48px; }
}
```

**为什么是 1440px**：超过 1600px 后，表格行的左右扫视距离过长，阅读效率显著下降。看板内容密度高，比内容型页面更早触发这个限制。

---

## 4. 页面留白

| 断点 | 左右留白 | 标题与内容间距 |
| --- | --- | --- |
| ≥1280px | 32px | 32px |
| 768–1279px | 32px | 32px |
| <768px | 16px | 20px |

---

## 5. 组件响应式行为

| 组件 | 移动端处理 |
| --- | --- |
| 页面头（标题 + 操作） | 操作区换行到标题下方，操作按钮从 `lg` 降到 `md` |
| 指标卡 | 栅格降为 1 列，卡片宽度撑满 |
| 数据表 | 容器 `overflow-x: auto`，**不压缩列宽**；关键列固定左侧 |
| 筛选栏 | 控件换行排列，标签保持左对齐 |
| Modal | 宽度 `min(520px, 100vw - 32px)`，最大高度 `calc(100vh - 48px)`，内容可滚动 |
| Drawer | 宽度 `min(480px, 100vw)`，移动端占满全屏 |
| 图表 | 高度降一档（`md` → `sm`），图例换行 |
| Toast | 移动端贴底显示，左右各 16px，全宽 |
| 分页 | 页码折叠，只保留当前页前后各 1 页 |
| 空状态 | 内边距从 48px 降到 32px |

---

## 6. 表格的移动端策略

数据表在移动端有三种处理方式，按场景选：

| 策略 | 适用 | 做法 |
| --- | --- | --- |
| 横向滚动 | 列多且都需要 | 容器滚动，首列 `position: sticky` |
| 列隐藏 | 次要列可丢 | 低于 768px 隐藏次要列，用 `.ds-hide-mobile` |
| 卡片化 | 每行信息量少 | 低于 768px 渲染成卡片列表 |

**默认用横向滚动**——隐藏列会让用户以为数据不存在。

---

## 7. 断点写法

```css
/* 移动优先：基础样式面向小屏 */
.ds-grid--4 {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .ds-grid--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1280px) {
  .ds-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

用 `min-width`（向上查询）而非 `max-width`（向下查询），避免「基础样式 + 多个覆盖」的维护负担。

---

## 8. 触摸适配

| 项 | 要求 |
| --- | --- |
| 点击区 | ≥ 44 × 44 px |
| 间距 | 相邻可点击元素间距 ≥ 8px，避免误触 |
| 悬停效果 | `@media (hover: hover)` 内才启用 |
| 输入框字号 | ≥ 16px（iOS Safari 小于 16px 会自动放大页面） |
| 弹层 | 避免依赖 hover 才出现 |

```css
@media (hover: hover) {
  .ds-btn:hover { /* 仅桌面启用 */ }
}
```

iOS Safari 对 `hover` 的处理是「首次点击才触发」，不隔离会导致移动端出现粘滞高亮。

---

## 9. 打印

看板类页面常需打印或导出 PDF：

```css
@media print {
  .ds-sidebar, .ds-toolbar, .ds-pagination { display: none; }
  .ds-page { max-width: none; padding: 0; }
  .ds-card { break-inside: avoid; box-shadow: none; border: 1px solid #ddd; }
}
```

- 隐藏交互性元素，只留内容
- 卡片不跨页断开
- 去掉阴影（打印时阴影会变成脏边）

---

## 10. 测试矩阵

| 视口宽度 | 目标设备 | 必测内容 |
| --- | --- | --- |
| 375px | iPhone SE | 单列布局、表格滚动、弹窗、Toast |
| 768px | iPad 竖屏 | 两列栅格、筛选栏换行 |
| 1024px | iPad 横屏 | 侧栏布局降级 |
| 1280px | 笔记本 | 完整四列指标卡 |
| 1440px | 桌面 | 标称布局 |
| 1920px | 大屏 | 容器居中，两侧留白 |
