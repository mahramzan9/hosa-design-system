# 无障碍规范 · Accessibility

目标：WCAG 2.1 AA。设计规范里的每一条无障碍要求都由 `npm run tokens:check` 自动校验或有明确的代码实现，不依赖人工目测。

---

## 1. 对比度

### 1.1 阈值

| 判定类型 | 阈值 | 适用对象 |
| --- | --- | --- |
| `text` | ≥ 4.5:1 | 所有正文文字、图标文字、图表标签 |
| `ui` | ≥ 3:1 | 承载信息的非文字元素：控件边界、图表序列、状态描边、焦点环 |
| `decor` | 无硬性阈值 | 纯装饰：分隔线、网格线、禁用文字 |

大号文字（≥ 18.66px 粗体 或 ≥ 24px）可用 3:1，但本系统统一按 4.5:1 校验，避免「算不算大号」的争议。

### 1.2 自动校验

```bash
npm run tokens:check
```

- 校验 49 组前后景配对
- 输出 `tokens/contrast-report.md`（含每组比值、要求、结果、备注）
- 不通过时**退出码为 1**，可直接接入 CI 阻断合并

### 1.3 豁免边界

`decor` 类之所以不设阈值：WCAG 1.4.11 只要求「承载识别 UI 组件或状态所需的信息」的元素达 3:1。表格装饰分隔线不承担状态识别功能，强行提到 3:1 只会让表格视觉噪声过大。

这条边界写在校验脚本的注释里，避免后续被误当成漏洞或被随意放宽。

### 1.4 当前校验结果

全部 49 组通过。关键组合：

| 组合 | 比值 |
| --- | --- |
| `text.primary` on `bg.surface` | 15.8:1 |
| `text.secondary` on `bg.surface` | 8.6:1 |
| `text.tertiary` on `bg.surface` | 5.5:1 |
| `action.primary-fg` on `action.primary-bg` | 5.7:1 |
| `feedback.danger-fg` on `feedback.danger-bg` | 6.1:1 |
| `trend.positive` on `bg.surface` | 5.4:1 |
| `mascot.ink` on `mascot.surface` | 13.6:1 |
| `border.input` on `bg.surface` | 3.4:1 |

---

## 2. 键盘可达性

### 2.1 焦点可见性

统一 `:focus-visible`，禁止 `outline: none` 后不补样式：

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--ds-semantic-border-focus);
  outline-offset: 2px;
}
```

用 `:focus-visible` 而非 `:focus`——鼠标点击不显示焦点环，键盘操作显示。

### 2.2 Tab 顺序

Tab 顺序必须与视觉阅读顺序一致。禁止用 `tabindex` 大于 0 做排序。

### 2.3 焦点陷阱

Modal / Drawer 打开后，焦点必须：

1. 移入弹窗内第一个可交互元素
2. Tab 循环在弹窗内，不逸出到背景
3. 关闭后焦点归还到触发元素

`Modal` 组件已实现 ESC 关闭与 `aria-modal`；**完整焦点陷阱待补**（见 [README §6](README.md)）。

### 2.4 快捷键

| 键 | 行为 |
| --- | --- |
| `Esc` | 关闭 Modal / Drawer / 下拉菜单 |
| `Tab` / `Shift+Tab` | 前后移动焦点 |
| `Enter` | 触发当前聚焦的按钮 / 提交表单 |
| `Space` | 切换 Checkbox / Switch |

### 2.5 跳转链接

页面顶部应有「跳到主内容」链接，键盘聚焦时出现。

---

## 3. 屏幕阅读器

### 3.1 语义化标签

| 组件 | 语义 |
| --- | --- |
| Button | `<button type="button">` |
| Tabs | `role="tablist"` / `role="tab"` / `role="tabpanel"` |
| Modal | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Alert | `role="alert"`（danger）/ `role="status"`（其他） |
| Toast 容器 | `role="region"` + `aria-live="polite"` |
| 输入框 | `<label for>` 关联，不靠 placeholder |
| 表格 | `<th scope="col">` |
| 进度条 | `role="progressbar"` + `aria-valuenow/min/max` |

### 3.2 图标按钮

必须有 `aria-label`：

```tsx
<Button iconOnly ariaLabel="关闭">×</Button>
```

### 3.3 动态内容

- Toast 用 `aria-live="polite"`，不打断当前操作
- 错误提示用 `role="alert"`，立即播报
- 加载中按钮加 `aria-busy="true"`
- 校验错误与输入框用 `aria-invalid` 关联

### 3.4 装饰性元素

纯装饰图形加 `aria-hidden="true"` + `focusable="false"`。

吉祥物形象默认 `alt=""`（装饰），需要传达含义时才写 `alt`。

---

## 4. 交互目标

| 场景 | 最小尺寸 |
| --- | --- |
| 常规可点击元素 | 44 × 44 px |
| 表格行内按钮（紧凑模式） | 32 × 32 px，需自带 padding 补偿点击区 |
| 密集表格行高 | 36 px（紧凑）/ 48 px（默认） |

**触摸目标与视觉尺寸可以分离**：紧凑表格里的图标按钮视觉 24px，但通过伪元素扩大点击区到 44px。

---

## 5. 动效降级

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

规则：

- 尊重系统设置，不自行判断
- **降级不等于移除**——状态变化仍要发生，只是瞬时完成
- 视差滚动、自动轮播、无限循环动画在降级下必须完全停止
- 后鲨芯片呼吸光环等拟物动效，遵循同一规则

---

## 6. 文本缩放

| 要求 | 说明 |
| --- | --- |
| 浏览器缩放 200% | 布局不丢失内容、不横向滚动 |
| 最小正文 14px | 辅助信息最低 12px |
| 行高不小于 1.4 | 长文本可读 |
| 容器用相对单位 | 不用固定 px 高度包裹可变文本 |

### 6.1 文本缩放测试清单

- [ ] 浏览器缩放 200% 后侧边栏不遮挡内容
- [ ] 表格横向滚动可用，不压缩列宽到不可读
- [ ] 指标卡数值不截断
- [ ] 弹窗内容可滚动，底部操作按钮可见

---

## 7. 不依赖颜色传达信息

| 场景 | 颜色之外必须有 |
| --- | --- |
| 指标涨跌 | 符号（▲/▼）+ 数值符号 |
| 状态标签 | 文字（不只是色块） |
| 表单错误 | 错误文案 + 图标 |
| 图表系列 | 图例文字 + 不同形态（线型/标记） |
| 阈值状态 | 数值 + 状态文字 |

**趋势色说明**：本系统的 `trend.positive`（绿）表示业务方向正向，不随证券行情「红涨绿跌」惯例反转。这与色弱用户的认知无关——符号已经承担了方向信息的传递。

---

## 8. 表格可访问性

| 项 | 要求 |
| --- | --- |
| 表头 | `<th scope="col">`，不使用 `<td>` 冒充 |
| 排序状态 | `aria-sort="ascending" \| "descending" \| "none"` |
| 当前页 | `aria-current="page"` |
| 横向滚动 | 容器 `overflow-x: auto`，保留列宽 |
| 读屏提示 | 数值列右对齐 + 等宽数字，视觉与读屏顺序一致 |

---

## 9. 测试清单

### 自动化

```bash
npm run tokens:check    # 对比度，49 组
npm run typecheck       # 组件类型
```

### 人工

- [ ] 全键盘走查一遍主要流程
- [ ] Chrome DevTools → Rendering → Emulate vision deficiencies（deuteranopia / protanopia / tritanopia）
- [ ] 屏幕阅读器（NVDA / VoiceOver）走查弹窗与表格
- [ ] 浏览器缩放 200% 检查布局
- [ ] 系统开启「减弱动态效果」后检查动画
- [ ] Windows 高对比度模式检查边框可见性
