# 无障碍对比度校验报告

- 生成命令: `npm run tokens:check`
- 校验标准: WCAG 2.1 AA
  - 正文文字（text）: ≥ 4.5:1
  - 承载信息的非文字元素（ui）: ≥ 3:1
  - 纯装饰元素（decor）: 不设硬性阈值，仅记录备案
- 校验组合总数: 49　必须通过: 44　未通过: 0

| 前景 Token | 背景 Token | 前景色 | 背景色 | 类型 | 对比度 | 要求 | 结果 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `semantic.text.primary` | `semantic.bg.surface` | #1B2028 | #FFFFFF | 正文 | 16.36 | 4.5:1 | 通过 |  |
| `semantic.text.primary` | `semantic.bg.canvas` | #1B2028 | #F7F8FA | 正文 | 15.39 | 4.5:1 | 通过 |  |
| `semantic.text.primary` | `semantic.bg.surface-subtle` | #1B2028 | #F1F3F6 | 正文 | 14.71 | 4.5:1 | 通过 |  |
| `semantic.text.secondary` | `semantic.bg.surface` | #454D5D | #FFFFFF | 正文 | 8.49 | 4.5:1 | 通过 |  |
| `semantic.text.secondary` | `semantic.bg.canvas` | #454D5D | #F7F8FA | 正文 | 7.99 | 4.5:1 | 通过 |  |
| `semantic.text.tertiary` | `semantic.bg.surface` | #616A7B | #FFFFFF | 正文 | 5.45 | 4.5:1 | 通过 |  |
| `semantic.text.link` | `semantic.bg.surface` | #7C3AED | #FFFFFF | 正文 | 5.7 | 4.5:1 | 通过 |  |
| `semantic.text.link-hover` | `semantic.bg.surface` | #6D28D9 | #FFFFFF | 正文 | 7.1 | 4.5:1 | 通过 |  |
| `semantic.text.inverse` | `semantic.bg.surface-inverse` | #FFFFFF | #1B2028 | 正文 | 16.36 | 4.5:1 | 通过 |  |
| `semantic.text.inverse-secondary` | `semantic.bg.surface-inverse` | #CFD4DC | #1B2028 | 正文 | 10.99 | 4.5:1 | 通过 |  |
| `semantic.action.primary-fg` | `semantic.action.primary-bg` | #FFFFFF | #7C3AED | 正文 | 5.7 | 4.5:1 | 通过 |  |
| `semantic.action.primary-fg` | `semantic.action.primary-bg-hover` | #FFFFFF | #6D28D9 | 正文 | 7.1 | 4.5:1 | 通过 |  |
| `semantic.action.secondary-fg` | `semantic.action.secondary-bg` | #2C323E | #FFFFFF | 正文 | 12.86 | 4.5:1 | 通过 |  |
| `semantic.action.secondary-fg` | `semantic.action.secondary-bg-hover` | #2C323E | #F1F3F6 | 正文 | 11.57 | 4.5:1 | 通过 |  |
| `semantic.action.tertiary-fg` | `semantic.action.secondary-bg` | #454D5D | #FFFFFF | 正文 | 8.49 | 4.5:1 | 通过 |  |
| `semantic.action.ghost-fg` | `semantic.bg.surface` | #616A7B | #FFFFFF | 正文 | 5.45 | 4.5:1 | 通过 |  |
| `semantic.action.ghost-fg-hover` | `semantic.bg.surface` | #1B2028 | #FFFFFF | 正文 | 16.36 | 4.5:1 | 通过 |  |
| `semantic.action.danger-fg` | `semantic.action.danger-bg` | #FFFFFF | #D92D20 | 正文 | 4.83 | 4.5:1 | 通过 |  |
| `semantic.feedback.success-fg` | `semantic.feedback.success-bg` | #027A48 | #ECFDF3 | 正文 | 5.13 | 4.5:1 | 通过 |  |
| `semantic.feedback.warning-fg` | `semantic.feedback.warning-bg` | #B54708 | #FFFAEB | 正文 | 5.2 | 4.5:1 | 通过 |  |
| `semantic.feedback.danger-fg` | `semantic.feedback.danger-bg` | #B42318 | #FEF3F2 | 正文 | 6.05 | 4.5:1 | 通过 |  |
| `semantic.feedback.info-fg` | `semantic.feedback.info-bg` | #026AA2 | #EFF8FF | 正文 | 5.45 | 4.5:1 | 通过 |  |
| `semantic.trend.positive` | `semantic.bg.surface` | #027A48 | #FFFFFF | 正文 | 5.41 | 4.5:1 | 通过 |  |
| `semantic.trend.negative` | `semantic.bg.surface` | #B42318 | #FFFFFF | 正文 | 6.57 | 4.5:1 | 通过 |  |
| `semantic.trend.flat` | `semantic.bg.surface` | #616A7B | #FFFFFF | 正文 | 5.45 | 4.5:1 | 通过 |  |
| `semantic.chart.axis-label` | `semantic.bg.surface` | #616A7B | #FFFFFF | 正文 | 5.45 | 4.5:1 | 通过 |  |
| `semantic.chart.tooltip-fg` | `semantic.chart.tooltip-bg` | #FFFFFF | #1B2028 | 正文 | 16.36 | 4.5:1 | 通过 |  |
| `semantic.mascot.ink` | `semantic.mascot.surface` | #142D4F | #EEF3FA | 正文 | 12.41 | 4.5:1 | 通过 |  |
| `semantic.mascot.bubble-fg` | `semantic.mascot.bubble-bg` | #142D4F | #F5F9FD | 正文 | 13.08 | 4.5:1 | 通过 |  |
| `semantic.border.strong` | `semantic.bg.surface` | #616A7B | #FFFFFF | 非文字 | 5.45 | 3:1 | 通过 |  |
| `semantic.border.input` | `semantic.bg.surface` | #828B9B | #FFFFFF | 非文字 | 3.43 | 3:1 | 通过 |  |
| `semantic.icon.secondary` | `semantic.bg.surface` | #828B9B | #FFFFFF | 非文字 | 3.43 | 3:1 | 通过 |  |
| `semantic.chart.axis` | `semantic.bg.surface` | #828B9B | #FFFFFF | 非文字 | 3.43 | 3:1 | 通过 |  |
| `semantic.chart.series-1` | `semantic.bg.surface` | #7C3AED | #FFFFFF | 非文字 | 5.7 | 3:1 | 通过 |  |
| `semantic.chart.series-2` | `semantic.bg.surface` | #0B8379 | #FFFFFF | 非文字 | 4.63 | 3:1 | 通过 |  |
| `semantic.chart.series-3` | `semantic.bg.surface` | #0086C9 | #FFFFFF | 非文字 | 4 | 3:1 | 通过 |  |
| `semantic.chart.series-4` | `semantic.bg.surface` | #DC6803 | #FFFFFF | 非文字 | 3.49 | 3:1 | 通过 |  |
| `semantic.chart.series-5` | `semantic.bg.surface` | #D92D20 | #FFFFFF | 非文字 | 4.83 | 3:1 | 通过 |  |
| `semantic.chart.series-6` | `semantic.bg.surface` | #039855 | #FFFFFF | 非文字 | 3.73 | 3:1 | 通过 |  |
| `semantic.feedback.success-border` | `semantic.feedback.success-bg` | #039855 | #ECFDF3 | 非文字 | 3.54 | 3:1 | 通过 |  |
| `semantic.feedback.warning-border` | `semantic.feedback.warning-bg` | #DC6803 | #FFFAEB | 非文字 | 3.34 | 3:1 | 通过 |  |
| `semantic.feedback.danger-border` | `semantic.feedback.danger-bg` | #D92D20 | #FEF3F2 | 非文字 | 4.44 | 3:1 | 通过 |  |
| `semantic.feedback.info-border` | `semantic.feedback.info-bg` | #0086C9 | #EFF8FF | 非文字 | 3.72 | 3:1 | 通过 |  |
| `semantic.mascot.ink` | `semantic.mascot.surface` | #142D4F | #EEF3FA | 非文字 | 12.41 | 3:1 | 通过 |  |
| `semantic.border.default` | `semantic.bg.surface` | #E0E4EA | #FFFFFF | 装饰 | 1.28 | — | 通过 | 装饰性, 记录备案 |
| `semantic.border.subtle` | `semantic.bg.surface` | #E8EBF0 | #FFFFFF | 装饰 | 1.2 | — | 通过 | 装饰性, 记录备案 |
| `semantic.chart.grid` | `semantic.bg.surface` | #E8EBF0 | #FFFFFF | 装饰 | 1.2 | — | 通过 | 装饰性, 记录备案 |
| `semantic.text.disabled` | `semantic.bg.surface` | #A9B1BE | #FFFFFF | 装饰 | 2.16 | — | 通过 | 装饰性, 记录备案 |
| `semantic.mascot.fill` | `semantic.mascot.surface` | #034285 | #EEF3FA | 装饰 | 8.88 | — | 通过 | 吉祥物轮廓由 mascot.ink 描边承担，填色不单独承担可感知性要求 |
