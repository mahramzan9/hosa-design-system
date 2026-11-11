# 吉祥物层 · 后鲨 HOSA

> 公司 AI 机器人吉祥物「后鲨（HOSA）」。
> 素材已接入：主形象 + 三姿态，主题色由像素级提取。

---

## 1. 角色设定

| 项 | 内容 |
| --- | --- |
| 名称 | 后鲨，英文名 HOSA |
| 身份 | AI 机器人，戴鲨鱼头套 |
| 星座 | 摩羯座 |
| 爱好 | 冲浪、游泳、研发 |
| 性格 | 热情、创新、大胆爱做炫酷的事、对未知事物充满好奇、勇于探索 |
| 偏好色 | 蓝色 |
| 未来演进 | 鲨鱼头套智能芯片研发中，后续在工作场景落地 |

### 设计寓意

以鲨鱼为原型，「鲨」取「沙」之音（*hòu shā*），谐音而得「后鲨」之名。鲨鱼是历经演化留存至今的海中霸主，以此寓意企业未来能够稳健强盛地发展。整体设计结合「浪」「沙」的品牌内核与未来科技元素——「沙」是海洋的肌理，「浪」是动能与突破，「鲨」则是两者之上的统治力。

> **用字规范**：正式名称为**后鲨**（鲨鱼的「鲨」），错字为「后沙」，不得使用。谐音关系是「鲨」取「沙」之音，方向不可颠倒。品牌内核中的「沙」仍指沙，二者在文案中各司其职。

### 对设计规范的映射

角色设定不是装饰文案，它直接决定规范里的具体条目：

| 角色设定 | 规范映射 |
| --- | --- |
| 喜欢蓝色 | 吉祥物主色为深海军蓝，且该色域为后鲨专属，通用层禁用 |
| 冲浪 / 游泳 | 「浪」元素 → `mascot.surface` / `surface-strong` 用浅蓝底；「姿态一」为冲浪形态，用于引导与激活动态场景 |
| 热情、大胆、炫酷 | 主形象（挥手欢呼）用于品牌标识、加载、成功等高能量场景 |
| 摩羯座 / 研发 | 「姿态三」坐姿休息用于低打扰场景（暂不需要提醒）；「姿态二」站立专注用于工作态 |
| 好奇、勇于探索 | 「姿态二」专注表情用于引导用户进入新功能 |
| 智能芯片（未来） | 见 §6 演进预留 |

---

## 2. 形态体系

素材提供 4 种形态，组件通过 `mood` 属性映射。

| mood | 素材 | 形象 | 语义 | 典型场景 |
| --- | --- | --- | --- | --- |
| `happy` | `hosa-main-transparent.png` | 挥手欢呼 | 热情、欢迎、鼓励 | Logo 标识、加载态、成功提示 |
| `excited` | `pose-1.png` | 冲浪划水 | 动感、突破、探索 | 引导、空状态、激活动态 |
| `serious` | `pose-2.png` | 站立专注 | 严谨、专注、警戒 | 异常提示、需要用户处理 |
| `relaxed` | `pose-3.png` | 坐姿休息 | 平静、无打扰 | 暂无更多内容、稍后提醒 |

```tsx
<MascotAsset mood="excited" size={96} />
<MascotState mood="serious" title="授权已过期" description="…" />
```

素材路径集中在 `HOSA_ASSETS` 常量（`src/components/mascot.tsx`），实际项目接入 CDN 时只改这一处。

---

## 3. 配色隔离

后鲨拥有独立的 `semantic.mascot.*` 组，与通用主色**不共享任何 Token**。

| Token | 角色 | 值 | 来源 |
| --- | --- | --- | --- |
| `mascot.fill` | 形象主体填充（深海军蓝） | `#034285` | 素材像素提取 12.3% |
| `mascot.accent` | 形象点缀（腹部金黄） | `#EAC46D` | 素材像素提取 15.7% |
| `mascot.support` | 强调细节（红眼） | `#AE2129` | 素材像素提取 0.7% |
| `mascot.ink` | 描边、气泡文字（最深蓝） | `#142D4F` | 素材像素提取 1.5% |
| `mascot.surface` | 插画底色、品牌带底色 | `#EEF3FA` | 主色派生 |
| `mascot.surface-strong` | 描边、次级底 | `#D8E5F4` | 主色派生 |
| `mascot.bubble-bg` | 气泡背景 | `#F5F9FD` | 主色派生 |
| `mascot.bubble-fg` | 气泡文字 | `#142D4F` | 同 ink |

### 色域隔离规则

**深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，通用规范层禁止使用。**

三个可验证的量化指标：

| 指标 | 判定标准 | 当前值（通用紫罗兰 ↔ 后鲨海军蓝） |
| --- | --- | --- |
| CIEDE2000 色差 ΔE00 | > 15 才算可辨 | **22.3** |
| 明度差（相对） | > 20% | 58% vs 27% |
| 饱和度差 | > 15% | 96% vs 81% |

**替换通用主色前必须重算 ΔE00。** 若降到 15 以下，需要同时调整主色相或后鲨色域边界。

### 为什么通用层主色必须让开蓝色

若通用主色沿用靛蓝（`#4F46E5`，色相 243），与后鲨海军蓝（色相 211）仅差 32°，ΔE00 = 6.9——低于 15 的可辨阈值，两者同屏时无法区分谁是谁的品牌标志。因此通用层主色改为紫罗兰（色相 271），ΔE00 = 22.3。

### 禁止事项

- ❌ 用 `mascot.fill` 做按钮底色
- ❌ 用 `mascot.accent` 做文字（1.6:1，远低于阈值）
- ❌ 把吉祥物色加入 `chart.series-*`
- ❌ 用吉祥物色表达涨跌（那是 `trend` 的职责）
- ❌ 让吉祥物成为纯图标按钮的唯一标识
- ❌ 在通用层任何位置使用深海军蓝

---

## 4. 组件规格

### 4.1 MascotMark 品牌标识

```tsx
<MascotMark name="投放工作台" tagline="AI ADVERTISING CONSOLE" size={36} mood="happy" />
```

| 元素 | 规格 |
| --- | --- |
| 图形 | `size` 控制，默认 36px，等比缩放不裁切 |
| 名称 | 18px / 700 / `text.primary` / letter-spacing -0.01em |
| 标语 | 11px / `text.tertiary` / letter-spacing 0.02em |

**Logo 锁定区**：图形与名称的相对位置、间距比例固定，不允许单独调整。`glyphOnly` 用于折叠态侧边栏。

### 4.2 MascotBadge 吉祥物徽章

```tsx
<MascotBadge size="md" mood="happy" pin="Beta" />
```

| size | 尺寸 | 用途 |
| --- | --- | --- |
| `sm` | 20px | 表格内 |
| `md` | 24px | 默认 |
| `lg` | 32px | 卡片角标 |
| `xl` | 48px | 空状态插画位 |

`pin` 旁挂标签（`Beta`、`新`）用 `mascot.accent` 底 + `mascot.ink` 边框。

**与 Avatar 的区别**：Avatar 表示人，吉祥物徽章表示品牌角色。同一位置只用其一。

### 4.3 MascotBubble 引导气泡

```tsx
<MascotBubble mood="happy" tail="left">
  本周有 3 个计划 CPA 超出目标 30%，要我帮你定位是出价还是素材的问题吗？
</MascotBubble>
```

| 元素 | 规格 |
| --- | --- |
| 容器 | `mascot.bubble-bg` 底 + `mascot.surface-strong` 描边 + 12px 圆角 |
| 尾巴 | 8px 旋转 45° 方形，与容器同底同描边 |
| 头像 | 28px 吉祥物 |
| 文字 | 14px / `mascot.bubble-fg` |

尾巴位置 `tail="left"` / `"right"`，必须指向吉祥物所在侧。

### 4.4 MascotState 状态插画

```tsx
<MascotState
  mood="serious"
  title="授权已过期"
  description="重新授权后即可恢复同步，历史数据不会丢失。"
  actions={<Button variant="primary">重新授权</Button>}
/>
```

结构：插画（96px）+ 标题（16px/600）+ 说明（13px/tertiary，最大 44ch）+ 操作区。

**空态必须有下一步指引**——说明怎么产生数据，或直接给操作按钮。

### 4.5 MascotBand 品牌带

看板页脚或横幅位使用。左文右图，`mascot.surface` 底 + `mascot.surface-strong` 描边。默认用 `excited` 形态（动感强，适合横幅）。

### 4.6 MascotIcon 图标组

```tsx
<MascotIcon name="insight" size={20} />
```

| name | 用途 |
| --- | --- |
| `insight` | 洞察 |
| `report` | 报表 |
| `plan` | 计划 |
| `material` | 素材 |
| `agent` | Agent |

**与通用线性图标的区别**：通用图标是 1.5px 描边单色；吉祥物图标是实心填充 + `mascot.ink` 描边。两者靠形态而非颜色区分。

图标组用于**功能入口的图标位**，不作为纯图标按钮。

---

## 5. 素材管线

```
mascot/assets/
├── hosa-main.png              官方主形象（原始）
├── hosa-poses.png             官方三姿态（原始）
└── processed/
    ├── hosa-main-transparent.png   去底主形象
    ├── hosa-poses-transparent.png  去底三姿态
    ├── pose-1.png / pose-2.png / pose-3.png   切分后的独立姿态
    └── hosa-64.png / hosa-128.png / hosa-256.png  多尺寸导出
```

### 5.1 五个处理步骤

| 步骤 | 脚本 | 作用 |
| --- | --- | --- |
| 1. 归档 | — | 原始素材放入 `mascot/assets/` |
| 2. 像素级取色 | `mascot/extract-palette.mjs` | 提取实色分布，输出占比/色相/饱和度/明度 |
| 3. 去底 | `mascot/process-assets.mjs` | 近白背景转透明 + 边缘羽化 + 包围盒裁切 + 多尺寸导出 |
| 4. 姿态切分 | `mascot/split-poses.mjs` | 列密度谷值检测，自动分离多姿态 |
| 5. 接入组件 | `src/components/mascot.tsx` | `HOSA_ASSETS` 路径映射 |

### 5.2 取色规则

`extract-palette.mjs` 的判定逻辑：

1. 过滤 `alpha < 200` 的像素（透明区）
2. 过滤近白像素（`r,g,b > 242`）——视为背景
3. 按 12 级分桶统计，取出现频次前 28 的颜色
4. 每个桶输出：精确均值色、像素占比、HSL 三分量

人工指定色值容易偏，带宽一点的均值更接近大面积观感。

### 5.3 去底规则

- 判定为背景：`max(r,g,b) ≥ 236` 且饱和度 `< 0.08`
- 边缘羽化：亮度落在 `[236-56, 236]` 且饱和度 `< 0.18` 的像素，alpha 按亮度线性映射
- 裁切：扫描 alpha > 8 的像素求包围盒，外扩 6px padding

### 5.4 姿态切分规则

不使用固定坐标（素材换版会失效），改用列密度谷值检测：

1. 逐列统计 alpha > 12 的像素数
2. 峰值 `peak`，谷值阈值 `max(2, peak × 0.02)`
3. 连续低于阈值的列段宽度 ≥ 3px 记为切分点
4. 每段最小宽度 `图宽 × 0.12`，避免把同一角色的肢体误切

### 5.5 新素材接入

替换素材后依次执行：

```bash
node mascot/extract-palette.mjs mascot/assets/hosa-main.png   # 1. 取色，比对是否与 token 一致
node mascot/process-assets.mjs                                # 2. 去底
node mascot/split-poses.mjs                                   # 3. 切姿态
npm run tokens                                                 # 4. 重建产物
npm run tokens:check                                           # 5. 对比度校验
```

若新素材主色变化，需回写 `tokens/source.json` 的 `primitive.mascot` 段，并重新核算与通用主色的 ΔE00。

---

## 6. 演进预留：鲨鱼头套智能芯片

头套智能芯片研发中，后续会在工作场景落地。设计规范提前预留接口，避免届时临时加色破坏隔离。

### 6.1 预留 Token

后续新增时走 `semantic.mascot.*` 组，不新增通用层颜色：

| 预留 Token | 用途 | 当前状态 |
| --- | --- | --- |
| `mascot.chip-glow` | 芯片发光效果（呼吸动效） | 待补 |
| `mascot.chip-active` | 芯片激活态描边 | 待补 |
| `mascot.chip-idle` | 芯片静息态 | 待补 |

### 6.2 预留场景

| 场景 | 形态 |
| --- | --- |
| 后鲨主动发起任务 | 主形象 + 芯片呼吸光环 |
| 数据同步中 | 芯片加载环，替代通用 spinner |
| 芯片异常 | 主形象 + 芯片告警描边（`support` 色） |
| 芯片静息 | 无光环，仅在长时驻留角落显示 |

### 6.3 约束

- 芯片效果只作用于吉祥物形象本身，不作为通用组件的加载态
- 芯片发光的色相必须落在后鲨专属色域内，不得引入通用层主色
- 动效遵循 `prefers-reduced-motion`

---

## 7. 检查清单

- [x] 官方素材已归档并去底
- [x] 主题色由像素级提取，非人工指定
- [x] 通用主色已改为紫罗兰，与后鲨 ΔE00 = 22.3
- [x] `npm run tokens:check` 全部通过
- [x] 4 种形态已接入组件
- [x] 图板 `05-mascot-layer.png` 已用真实素材重新生成
- [ ] 智能芯片视觉稿到位后，补充 §6 的三个 Token 与场景
- [ ] 正式项目接入时把 `HOSA_ASSETS` 路径改为 CDN 地址
