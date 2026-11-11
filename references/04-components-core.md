# 通用规范层组件 · Core Components

本层组件适用于**所有**产品界面。看板专项组件建在其上，不重复定义基础样式。

组件规格表统一包含：变体、尺寸、状态、Token、可访问性要求。

---

## 1. Button

```tsx
<Button variant="primary" size="md">新建计划</Button>
```

### 变体

| variant | 用途 | 数量约束 |
| --- | --- | --- |
| `primary` | 页面/区块的主操作 | **每个视口最多 1 个主按钮** |
| `secondary` | 次要操作、并列操作 | 可多个 |
| `tertiary` | 弱操作、表单尾部 | 可多个 |
| `ghost` | 工具栏图标按钮、卡片内操作 | 可多个 |
| `danger` | 不可逆操作（删除、终止投放） | 必须配二次确认 |

### 尺寸

| size | 高 | 内边距 | 字号 | 场景 |
| --- | --- | --- | --- | --- |
| `sm` | 28px | 0 10px | 12px | 表格内操作、紧凑工具栏 |
| `md` | 36px | 0 16px | 14px | **默认** |
| `lg` | 44px | 0 20px | 16px | 空状态、引导页主操作 |

### 状态

| 状态 | 表现 |
| --- | --- |
| default | — |
| hover | 底色加深一档（primary: 600→700） |
| active | 底色再深一档（primary: →800） |
| focus-visible | 2px 实线焦点环 + 2px 偏移，不改底色 |
| loading | 禁用 + 左侧 spinner + `aria-busy="true"` |
| disabled | 底色 `gray-100`，文字 `gray-400`，`cursor: not-allowed` |

### 用法约束

- 一个区块内 `primary` 只能有一个。出现两个主按钮说明信息层级没想清楚。
- `danger` 按钮文案必须是动词短语（「终止投放」而不是「确定」）。
- `iconOnly` 必须传 `ariaLabel`。
- 按钮宽度由内容决定，不写 `width: 100%`（`block` 属性除外）。

---

## 2. Field + Input / Textarea / Select

### Field 容器

```tsx
<Field label="投放渠道" required errorText="请填写 1–64 个字符的渠道名称">
  <Input invalid placeholder="请选择投放渠道" />
</Field>
```

`Field` 负责 label、必填标记、辅助说明、错误提示四件事。**不要在业务代码里手写这四块**，否则标签与输入框的 `htmlFor` 关联容易漏掉，屏幕阅读器会失去关联。

### 规则

| 项 | 规则 |
| --- | --- |
| label | 必填，不使用 placeholder 代替 label |
| required | 必填标记用 `*` + `aria-hidden`，实际必填由原生 `required` 属性承担 |
| errorText | 存在时用 `role="alert"`，且替换 helperText（不同时显示） |
| helperText | 说明格式/范围，不是错误提示 |
| 尺寸 | `sm` 28px / `md` 36px / `lg` 44px |
| 校验时机 | 失焦校验（blur），不在每次按键时报错 |

---

## 3. Checkbox / Radio / Switch

| 组件 | 用途 | 备注 |
| --- | --- | --- |
| `Checkbox` | 多选、开关型选项 | 未选中边框用 `border.input`（≥3:1） |
| `Radio` | 单选，2–5 项 | 同组必须有共同的 `name` |
| `Switch` | 立即生效的开关 | 不用在需要「保存」的场景 |

**Switch vs Checkbox**：Switch 改的是系统状态并立即生效（如「开启自动扩量」）；Checkbox 是表单里的一个待提交值。需要点「保存」的一律用 Checkbox。

---

## 4. Card

```tsx
<Card padding="default">
  <CardHeader title="渠道投放表现" subtitle="近 7 天" actions={<Button size="sm">导出</Button>} />
  …
</Card>
```

| padding | 内边距 | 用途 |
| --- | --- | --- |
| `compact` | 16px | 密集内容、小卡片 |
| `default` | 24px | **默认** |
| `flush` | 0 | 内嵌表格/图表（由内部组件自带内边距） |

`interactive` 属性加悬浮抬升效果，仅用于真正可点击的卡片。可点击卡片内部不应再嵌套按钮（会触发事件冲突）。

---

## 5. Badge / Tag

### Badge（状态标识）

| tone | 用途 |
| --- | --- |
| `neutral` | 默认、无特殊含义 |
| `brand` | 品牌相关标签 |
| `success` / `warning` / `danger` / `info` | 四态状态 |

Badge 不可点击、不承载操作。若需要可点击，用 Tag 或按钮。

### Tag（可移除标签）

用于筛选条件、已选项。`onRemove` 存在时渲染关闭按钮，`aria-label="移除"`。

**Badge 与 Tag 的区别**：Badge 表达状态（不可交互），Tag 表达一个可移除的值（可交互）。不要用 Badge 做筛选条件。

---

## 6. Avatar

| size | 尺寸 | 用途 |
| --- | --- | --- |
| `sm` | 24px | 表格内头像 |
| `md` | 32px | 默认 |
| `lg` | 40px | 详情页 |

无 `src` 时显示姓名首 2 字符（大写）。头像加载失败要有兜底。

**吉祥物徽章**（`MascotBadge`）与 Avatar 是两件事：Avatar 表示人，吉祥物徽章表示品牌角色。同一位置只用其一。

---

## 7. Tabs

```tsx
<Tabs items={[{value:'day',label:'按日'},{value:'week',label:'按周'}]} value={tab} onChange={setTab}>
  {panel}
</Tabs>
```

- 使用 `role="tablist"` / `role="tab"` / `role="tabpanel"`
- 选中态用 `aria-selected`，样式用属性选择器而非 class 切换
- Tab 数量 ≤ 7。超过 7 项应该换成分段控件或下拉

---

## 8. Table / DataTable

见 [05-components-dashboard.md](05-components-dashboard.md)（看板数据表）。

---

## 9. Modal / Drawer

| | Modal | Drawer |
| --- | --- | --- |
| 宽度 | 520px（`wide` 760px） | 480px，右侧滑出 |
| 适用 | 确认、编辑、预览 | 长表单、详情 |
| 关闭 | 遮罩点击 + ESC + 关闭按钮 | ESC + 关闭按钮（不因遮罩点击关闭，避免误触） |

Modal 必备：`role="dialog"` + `aria-modal="true"` + `aria-label` + ESC 关闭 + 焦点移入弹窗。

**焦点陷阱**：Modal 打开后 Tab 键应在弹窗内循环。当前 `Modal` 组件已实现 ESC 关闭，完整的焦点陷阱与关闭后焦点归还需在产品接入时补充（见 [09-handoff.md](09-handoff.md) 的待办清单）。

---

## 10. Toast

```tsx
<ToastRegion items={[{id:'1',tone:'success',title:'已保存',description:'配置将在 1 分钟内生效'}]} />
```

| tone | 用途 |
| --- | --- |
| `success` | 操作完成 |
| `warning` | 需要注意但不阻断 |
| `danger` | 操作失败 |
| `info` | 中性提示 |

- 容器 `role="region"` + `aria-live="polite"`，不打断当前操作
- 4 秒自动消失；错误类不自动消失（需要用户主动关闭）
- 一次最多显示 3 条，超出折叠

**Toast 不能承载必须读到的信息**。需要用户确认的信息用 Modal。

---

## 11. Tooltip

用于补充说明，不承载关键信息。触发方式同时支持 hover 与 focus。

**Tooltip 里的内容不能是唯一的信息载体**——触屏设备没有 hover。

---

## 12. Alert

```tsx
<Alert tone="danger" title="投放账户授权已失效">
  请重新授权后同步转化数据，已缓存的报表可能不完整。
</Alert>
```

| tone | 语义 | 是否需要用户操作 |
| --- | --- | --- |
| `success` | 完成确认 | 否 |
| `info` | 说明 | 否 |
| `warning` | 需注意 | 可能 |
| `danger` | 错误/阻断 | 是 |

`danger` 用 `role="alert"`，其他用 `role="status"`。

---

## 13. EmptyState / Skeleton

### EmptyState

无数据时的标准空态。**必须有下一步指引**（文案说明怎么产生数据，或提供操作按钮），不能只写「暂无数据」。

看板场景的空态推荐用 `MascotState`（带吉祥物的空态插画），比纯文字空态更友好。

### Skeleton

加载占位。形状要贴近真实内容（表格用行，文字用条），避免加载完成后布局跳动。

超过 3 秒的加载必须展示进度或文字说明，不能只有骨架屏。

---

## 14. Pagination

- 显示「第 X–Y 条，共 N 条」，让用户知道自己在第几页
- 页码用 `aria-current="page"` 标记当前页
- 首末页始终可见，中间用 `…` 折叠
- 每页条数可切换（10/20/50/100）

---

## 15. Menu

```tsx
<div class="ds-menu">
  <div class="ds-menu__label">批量操作</div>
  <button class="ds-menu__item">暂停投放</button>
  <div class="ds-menu__divider" />
  <button class="ds-menu__item ds-menu__item--danger">删除计划</button>
</div>
```

危险操作放在分隔线之后，用 `danger` 样式。

---

## 16. 组件状态速查

每个可交互组件必须实现这 6 个状态：

| 状态 | 要求 |
| --- | --- |
| default | — |
| hover | 视觉可辨，但不改变布局尺寸 |
| active / pressed | 有明确反馈 |
| focus-visible | 2px 焦点环，与 hover 样式不冲突 |
| disabled | 视觉可辨 + `cursor: not-allowed` + 移除所有事件 |
| loading（异步组件） | 保留原宽高，避免布局跳动 |

**hover 不改变元素尺寸**——按钮 hover 时用 `transform: translateY(-1px)` + 阴影，不用改 padding 或字号。
