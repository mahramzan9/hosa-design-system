import React from 'react';

/* ============================================================
 * TrendValue — 指标方向值
 * 注意: 本组件的 positive/negative 表示「业务方向」，
 *       与证券行情的「红涨绿跌」惯例无关，不做反转。
 * ============================================================ */
export type TrendDirection = 'positive' | 'negative' | 'flat';

export interface TrendValueProps {
  /** 已带符号的数值文本，例如 "+12.4%"、"−3.1%" */
  value: string;
  direction: TrendDirection;
  /** 对比窗口说明，例如 "较上周" */
  comparison?: React.ReactNode;
  id?: string;
  className?: string;
}

const ARROW: Record<TrendDirection, string> = {
  positive: '▲',
  negative: '▼',
  flat: '—',
};

export function TrendValue({ value, direction, comparison, id, className }: TrendValueProps) {
  return (
    <span id={id} className={['ds-trend', `ds-trend--${direction}`, className ?? ''].filter(Boolean).join(' ')}>
      <span className="ds-trend__arrow" aria-hidden="true">
        {ARROW[direction]}
      </span>
      <span>{value}</span>
      {comparison && <span className="ds-trend__window">{comparison}</span>}
    </span>
  );
}

/* ============================================================
 * Sparkline — 迷你趋势
 * ============================================================ */
export interface SparklineProps {
  /** 归一化前的原始序列，组件内部做 min/max 映射 */
  data: number[];
  direction?: TrendDirection;
  height?: number;
  width?: number;
  /** 无障碍描述 */
  ariaLabel?: string;
  id?: string;
  className?: string;
}

export function Sparkline({ data, direction = 'flat', height = 32, width = 120, ariaLabel, id, className }: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;
  const step = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)},${height} L${pts[0][0].toFixed(2)},${height} Z`;

  return (
    <svg
      id={id}
      className={['ds-spark', `ds-spark--${direction}`, className ?? ''].filter(Boolean).join(' ')}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
    >
      <path className="ds-spark__area" d={area} />
      <path className="ds-spark__line" d={line} />
    </svg>
  );
}

/* ============================================================
 * MetricCard — 指标卡
 * ============================================================ */
export interface MetricCardProps {
  label: React.ReactNode;
  /** 主数值，例如 "1,284" */
  value: React.ReactNode;
  /** 数值单位，例如 "元"、"%"、"次"，与 value 同排显示 */
  unit?: React.ReactNode;
  trend?: { value: string; direction: TrendDirection; comparison?: React.ReactNode };
  /** 补充说明，例如 "日均" */
  footnote?: React.ReactNode;
  /** 迷你趋势序列 */
  spark?: number[];
  actions?: React.ReactNode;
  id?: string;
  className?: string;
}

export function MetricCard({ label, value, unit, trend, footnote, spark, actions, id, className }: MetricCardProps) {
  return (
    <div id={id} className={['ds-metric', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-metric__label">
        <span>{label}</span>
        {actions}
      </div>
      <div className="ds-metric__value">
        <span>{value}</span>
        {unit && <span className="ds-metric__unit">{unit}</span>}
      </div>
      {spark && spark.length > 1 && <Sparkline data={spark} direction={trend?.direction ?? 'flat'} />}
      <div className="ds-metric__footer">
        {trend ? (
          <TrendValue value={trend.value} direction={trend.direction} comparison={trend.comparison} />
        ) : (
          <span>{footnote}</span>
        )}
        {!trend && footnote && <span>{footnote}</span>}
      </div>
    </div>
  );
}

/* ============================================================
 * ChartFrame — 图表容器
 * ============================================================ */
export interface ChartLegendItem {
  label: string;
  /** CSS 颜色变量名，如 var(--ds-semantic-chart-series-1) */
  color: string;
}
export interface ChartFrameProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  legend?: ChartLegendItem[];
  height?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** 空态文案 */
  emptyText?: string;
  children?: React.ReactNode;
  id?: string;
  className?: string;
}
export function ChartFrame({
  title,
  subtitle,
  actions,
  legend,
  height = 'md',
  loading,
  emptyText,
  children,
  id,
  className,
}: ChartFrameProps) {
  return (
    <section id={id} className={['ds-chart', className ?? ''].filter(Boolean).join(' ')}>
      <header className="ds-chart__header">
        <div>
          <div className="ds-chart__title">{title}</div>
          {subtitle && <div className="ds-chart__subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="ds-chart__actions">{actions}</div>}
      </header>
      <div className={`ds-chart__body ds-chart__body--${height}`}>
        {loading ? (
          <div className="ds-loading-overlay">
            <span className="ds-spinner" aria-hidden="true" />
            <span>加载中…</span>
          </div>
        ) : (
          children ?? <div className="ds-chart-empty">{emptyText ?? '暂无数据'}</div>
        )}
      </div>
      {legend && legend.length > 0 && (
        <div className="ds-chart__legend">
          {legend.map((it) => (
            <span key={it.label} className="ds-chart__legend-item">
              <span className="ds-chart__legend-swatch" style={{ backgroundColor: it.color }} aria-hidden="true" />
              {it.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
 * SegmentedControl — 分段控件
 * ============================================================ */
export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
}
export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  id?: string;
  className?: string;
}
export function SegmentedControl({ options, value, onChange, ariaLabel, id, className }: SegmentedControlProps) {
  return (
    <div id={id} className={['ds-segmented', className ?? ''].filter(Boolean).join(' ')} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="ds-segmented__item"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
 * FilterBar — 看板筛选栏
 * ============================================================ */
export interface FilterBarProps {
  children: React.ReactNode;
  /** 右侧操作区 */
  actions?: React.ReactNode;
  id?: string;
  className?: string;
}
export function FilterBar({ children, actions, id, className }: FilterBarProps) {
  return (
    <div id={id} className={['ds-filterbar', className ?? ''].filter(Boolean).join(' ')}>
      {children}
      <span className="ds-filterbar__spacer" />
      {actions && <div className="ds-filterbar__group">{actions}</div>}
    </div>
  );
}

/* ============================================================
 * DateRangePicker — 日期范围（展示型，交互由外部接管）
 * ============================================================ */
export interface DateRangePickerProps {
  start: string;
  end: string;
  onChange?: (start: string, end: string) => void;
  presetLabel?: React.ReactNode;
}
export function DateRangePicker({ start, end, onChange, presetLabel }: DateRangePickerProps) {
  return (
    <div className="ds-daterange" role="group" aria-label="日期范围">
      {presetLabel && <span className="ds-text-small">{presetLabel}</span>}
      <input
        className="ds-input ds-input--sm"
        style={{ width: 132, border: 'none', padding: 0, minHeight: 20 }}
        type="date"
        value={start}
        onChange={(e) => onChange?.(e.target.value, end)}
        aria-label="开始日期"
      />
      <span className="ds-daterange__sep">—</span>
      <input
        className="ds-input ds-input--sm"
        style={{ width: 132, border: 'none', padding: 0, minHeight: 20 }}
        type="date"
        value={end}
        onChange={(e) => onChange?.(start, e.target.value)}
        aria-label="结束日期"
      />
    </div>
  );
}

/* ============================================================
 * ThresholdBar — 阈值进度条
 * ============================================================ */
export interface ThresholdBarProps {
  name: React.ReactNode;
  /** 当前值 */
  value: number;
  /** 阈值上限 */
  max: number;
  /** 显示文本，例如 "72%" */
  displayValue?: React.ReactNode;
  /** 阈值状态 */
  state?: 'normal' | 'warning' | 'danger';
  id?: string;
  className?: string;
}
export function ThresholdBar({ name, value, max, displayValue, state = 'normal', id, className }: ThresholdBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div id={id} className={['ds-threshold', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-threshold__row">
        <span className="ds-threshold__name">{name}</span>
        <span className="ds-threshold__value">{displayValue ?? `${Math.round(pct)}%`}</span>
      </div>
      <div
        className="ds-threshold__track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`ds-threshold__fill ds-threshold__fill--${state}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ============================================================
 * InsightList — 洞察列表
 * ============================================================ */
export interface InsightItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}
export interface InsightListProps {
  items: InsightItem[];
  id?: string;
  className?: string;
}
export function InsightList({ items, id, className }: InsightListProps) {
  return (
    <div id={id} className={['ds-insight', className ?? ''].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <div className="ds-insight__item" key={i}>
          <span className="ds-insight__index" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <div className="ds-insight__title">{it.title}</div>
            {it.description && <div className="ds-insight__desc">{it.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * Grid — 看板栅格
 * ============================================================ */
export type GridSpan = '4' | '3' | '2' | '2-1' | '1-2' | '3-2';
export function Grid({
  span = '2',
  children,
  className,
  id,
}: {
  span?: GridSpan;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={['ds-grid', `ds-grid--${span}`, className ?? ''].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
