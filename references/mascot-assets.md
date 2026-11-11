# 吉祥物素材 · 后鲨 HOSA

本目录存放公司吉祥物「后鲨（HOSA）」的原始素材与派生产物。

---

## 目录

| 路径 | 说明 | 维护方式 |
| --- | --- | --- |
| `assets/hosa-main.png` | 官方主形象（原始） | ✅ 手工维护，替换为公司官方素材 |
| `assets/hosa-poses.png` | 官方三姿态（原始） | ✅ 手工维护 |
| `assets/processed/*.png` | 去底 / 切分 / 多尺寸产物 | ❌ 脚本生成 |
| `mascot-theme.json` | 派生主题色 | ❌ 脚本生成 |

---

## 处理管线

```
assets/hosa-main.png  ─┐
                      ├─→ extract-palette.mjs  （取色）
                      │      ↓
                      │   tokens/source.json 的 primitive.mascot 段
                      │
                      ├─→ process-assets.mjs   （去底 + 多尺寸）
                      │      ↓
                      │   assets/processed/hosa-main-transparent.png
                      │
assets/hosa-poses.png ─┴─→ split-poses.mjs      （切分姿态）
                             ↓
                        assets/processed/pose-1..3.png
```

### 执行顺序

```bash
node mascot/extract-palette.mjs mascot/assets/hosa-main.png
node mascot/process-assets.mjs
node mascot/split-poses.mjs
npm run tokens
npm run tokens:check
```

---

## 各脚本说明

### extract-palette.mjs — 像素级取色

对 PNG 逐像素统计，输出每个颜色桶的精确均值、像素占比与 HSL 分量。

过滤规则：
- `alpha < 200` 的像素（透明区）
- 近白像素（`r,g,b > 242`，视为背景）

分桶步长 12，输出前 28 个高频色。

**为什么用脚本而不是手挑**：手挑颜色会受屏幕与主观判断影响，且容易选到抗锯齿边缘的过渡色。像素占比高的桶才代表视觉上的主色。

### process-assets.mjs — 去底

- 背景判定：`max(r,g,b) ≥ 236` 且饱和度 `< 0.08`
- 边缘羽化：亮度落在 `[180, 236]` 且饱和度 `< 0.18` 的像素，alpha 按亮度线性映射
- 自动裁切到可见包围盒，外扩 6px
- 额外导出 64 / 128 / 256 三档尺寸

### split-poses.mjs — 姿态切分

不使用固定坐标（素材换版即失效），改用列密度谷值检测：

1. 逐列统计 `alpha > 12` 的像素数
2. 谷值阈值 `max(2, peak × 0.02)`
3. 连续低密度列段宽度 ≥ 3px 记为切分点
4. 每段最小宽度 = 图宽 × 12%，防止把同一角色的肢体误切

---

## 主题色角色定义

| 角色 | Token | 值 | 来源 |
| --- | --- | --- | --- |
| 主色 | `--ds-semantic-mascot-fill` | `#034285` | 像素占比 12.3% |
| 点缀 | `--ds-semantic-mascot-accent` | `#EAC46D` | 像素占比 15.7% |
| 辅助 | `--ds-semantic-mascot-support` | `#AE2129` | 像素占比 0.7% |
| 墨色 | `--ds-semantic-mascot-ink` | `#142D4F` | 像素占比 1.5% |
| 浅底 | `--ds-semantic-mascot-surface` | `#EEF3FA` | 主色派生 |
| 气泡底 | `--ds-semantic-mascot-bubble-bg` | `#F5F9FD` | 主色派生 |

### 禁止用途

| 角色 | ❌ 禁止 |
| --- | --- |
| 主色 | 按钮底色、图表序列色 |
| 点缀 | 文字（对比度 1.6:1） |
| 辅助 | 信息载体 |
| 墨色 | 大面积填充 |
| 浅底 | 通用卡片底色 |

---

## 与通用规范层的隔离

**深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，通用规范层禁止使用。**

通用层主色因此定为紫罗兰 `#7C3AED`（色相 271），与后鲨海军蓝的 CIEDE2000 色差 **ΔE00 = 22.3**。

| 指标 | 阈值 | 当前值 |
| --- | --- | --- |
| CIEDE2000 ΔE00 | > 15 | 22.3 |
| 明度差 | > 20% | 58% vs 27% |
| 饱和度差 | > 15% | 96% vs 81% |

**替换素材或通用主色后必须重算 ΔE00。** 若降到 15 以下，两者在同屏时将无法区分谁是谁的品牌标志。

---

## 新素材接入清单

- [ ] 素材替换到 `assets/` 原始文件
- [ ] 执行五个脚本重新生成产物
- [ ] 比对 `extract-palette.mjs` 输出与 `tokens/source.json` 中 `primitive.mascot` 段是否一致，不一致则回写
- [ ] 重算与通用主色的 ΔE00，确认 ≥ 15
- [ ] `npm run tokens:check` 全部通过
- [ ] 检查 16px 尺寸下是否仍可辨识
- [ ] 更新 `src/components/mascot.tsx` 的 `HOSA_ASSETS` 路径映射
- [ ] 重新生成图板 `npm run boards`
