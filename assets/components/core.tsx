import React from 'react';

/* ============================================================
 * Button
 * ============================================================ */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  /** 无障碍标签，iconOnly 时必填 */
  ariaLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    block = false,
    iconOnly = false,
    ariaLabel,
    disabled,
    className,
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'ds-btn',
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    block ? 'ds-btn--block' : '',
    iconOnly ? 'ds-btn--icon' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel ?? (iconOnly ? undefined : rest['aria-label'])}
      {...rest}
    >
      {loading && <span className="ds-btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

/* ============================================================
 * Field 容器（label / helper / error）
 * ============================================================ */
export interface FieldProps {
  label?: React.ReactNode;
  required?: boolean;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function Field({ label, required, helperText, errorText, htmlFor, children, id, className }: FieldProps) {
  const hasError = Boolean(errorText);
  return (
    <div className={['ds-field', className ?? ''].filter(Boolean).join(' ')} id={id}>
      {label && (
        <label className="ds-field__label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="ds-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hasError ? (
        <span className="ds-field__error" role="alert">
          {errorText}
        </span>
      ) : (
        helperText && <span className="ds-field__helper">{helperText}</span>
      )}
    </div>
  );
}

/* ============================================================
 * Input
 * ============================================================ */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, inputSize = 'md', className, ...rest },
  ref
) {
  const classes = [
    'ds-input',
    inputSize !== 'md' ? `ds-input--${inputSize}` : '',
    invalid ? 'ds-input--invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <input ref={ref} className={classes} aria-invalid={invalid || undefined} {...rest} />;
});

/* ============================================================
 * Textarea / Select
 * ============================================================ */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, ...rest },
  ref
) {
  const classes = ['ds-textarea', invalid ? 'ds-textarea--invalid' : '', className ?? ''].filter(Boolean).join(' ');
  return <textarea ref={ref} className={classes} aria-invalid={invalid || undefined} {...rest} />;
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref
) {
  const classes = ['ds-select', invalid ? 'ds-select--invalid' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <select ref={ref} className={classes} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
});

/* ============================================================
 * Checkbox / Radio / Switch
 * ============================================================ */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}
export function Checkbox({ label, ...rest }: CheckboxProps) {
  return (
    <label className="ds-check">
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}
export function Radio({ label, ...rest }: RadioProps) {
  return (
    <label className="ds-check">
      <input type="radio" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}
export function Switch({ label, ...rest }: SwitchProps) {
  return (
    <label className="ds-switch">
      <input type="checkbox" role="switch" {...rest} />
      <span>{label}</span>
    </label>
  );
}

/* ============================================================
 * Card
 * ============================================================ */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'compact' | 'default' | 'flush';
  interactive?: boolean;
}
export function Card({ padding = 'default', interactive, className, children, ...rest }: CardProps) {
  const classes = ['ds-card', `ds-card--${padding}`, interactive ? 'ds-card--interactive' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}
export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <div className="ds-card__header">
      <div>
        <div className="ds-card__title">{title}</div>
        {subtitle && <div className="ds-card__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="ds-row" style={{ gap: 'var(--ds-space-2)' }}>{actions}</div>}
    </div>
  );
}

/* ============================================================
 * Badge / Tag
 * ============================================================ */
export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  dot?: boolean;
}
export function Badge({ tone = 'neutral', size = 'md', dot, className, children, ...rest }: BadgeProps) {
  const classes = ['ds-badge', `ds-badge--${tone}`, size === 'sm' ? 'ds-badge--sm' : '', dot ? 'ds-badge--dot' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}
export function Tag({ onRemove, className, children, ...rest }: TagProps) {
  const classes = ['ds-tag', onRemove ? 'ds-tag--removable' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
      {onRemove && (
        <button type="button" className="ds-tag__close" onClick={onRemove} aria-label="移除">
          ×
        </button>
      )}
    </span>
  );
}

/* ============================================================
 * Avatar
 * ============================================================ */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}
export function Avatar({ src, name, size = 'md', className, ...rest }: AvatarProps) {
  const classes = ['ds-avatar', size !== 'md' ? `ds-avatar--${size}` : '', className ?? ''].filter(Boolean).join(' ');
  const initials = (name ?? '').slice(0, 2).toUpperCase();
  return (
    <span className={classes} {...rest}>
      {src ? <img src={src} alt={name ?? ''} /> : initials}
    </span>
  );
}

/* ============================================================
 * Tabs
 * ============================================================ */
export interface TabItem {
  value: string;
  label: React.ReactNode;
}
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
  ariaLabel?: string;
  id?: string;
  className?: string;
}
export function Tabs({ items, value, onChange, children, ariaLabel, id, className }: TabsProps) {
  return (
    <div id={id} className={className}>
      <div className="ds-tabs__list" role="tablist" aria-label={ariaLabel}>
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            role="tab"
            className="ds-tabs__tab"
            aria-selected={it.value === value}
            onClick={() => onChange(it.value)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="ds-tabs__panel" role="tabpanel">
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Alert
 * ============================================================ */
export type AlertTone = 'success' | 'warning' | 'danger' | 'info';
export interface AlertProps {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  className?: string;
}
const ALERT_ICON: Record<AlertTone, string> = {
  success: '✓',
  warning: '!',
  danger: '×',
  info: 'i',
};
export function Alert({ tone = 'info', title, children, action, id, className }: AlertProps) {
  return (
    <div
      id={id}
      className={['ds-alert', `ds-alert--${tone}`, className ?? ''].filter(Boolean).join(' ')}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className="ds-alert__icon" aria-hidden="true">
        {ALERT_ICON[tone]}
      </span>
      <div className="ds-alert__body">
        {title && <div className="ds-alert__title">{title}</div>}
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
 * EmptyState / Skeleton
 * ============================================================ */
export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  className?: string;
}
export function EmptyState({ title, description, action, id, className }: EmptyStateProps) {
  return (
    <div id={id} className={['ds-empty', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-empty__title">{title}</div>
      {description && <div className="ds-empty__desc">{description}</div>}
      {action}
    </div>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}
export function Skeleton({ width = '100%', height = 16, style, className, ...rest }: SkeletonProps) {
  return (
    <div
      className={['ds-skeleton', className ?? ''].filter(Boolean).join(' ')}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

/* ============================================================
 * Pagination
 * ============================================================ */
export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  id?: string;
  className?: string;
}
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  id,
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | '...')[] = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) pages.push(i);
    if (page < pageCount - 2) pages.push('...');
    pages.push(pageCount);
  }

  return (
    <div id={id} className={['ds-pagination', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-row" style={{ gap: 'var(--ds-space-4)' }}>
        <span className="ds-pagination__info">
          第 {from}–{to} 条，共 {total} 条
        </span>
        {onPageSizeChange && (
          <select
            className="ds-select"
            style={{ width: 'auto', minHeight: 28, fontSize: 'var(--ds-font-size-small)' }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="每页条数"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} 条/页
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="ds-pagination__list">
        <button
          type="button"
          className="ds-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="上一页"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} className="ds-pagination__info" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className="ds-pagination__btn"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="ds-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="下一页"
        >
          ›
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Modal（需自行挂载 Portal；此处提供结构与焦点管理）
 * ============================================================ */
export interface ModalProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  id?: string;
  className?: string;
}
export function Modal({ open, title, onClose, children, footer, wide, id, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="ds-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id={id}
        className={`ds-modal${wide ? ' ds-modal--wide' : ''}${className ? ' ' + className : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        <div className="ds-modal__header">
          <div className="ds-modal__title">{title}</div>
          <button type="button" className="ds-modal__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="ds-modal__body">{children}</div>
        {footer && <div className="ds-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ============================================================
 * Toast
 * ============================================================ */
export type ToastTone = 'success' | 'warning' | 'danger' | 'info';
export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: React.ReactNode;
  description?: React.ReactNode;
}
export function ToastRegion({ items }: { items: ToastItem[] }) {
  return (
    <div className="ds-toast-region" role="region" aria-live="polite" aria-label="通知">
      {items.map((t) => (
        <div key={t.id} className={`ds-toast ds-toast--${t.tone}`}>
          <span className="ds-toast__icon" aria-hidden="true">
            {ALERT_ICON[t.tone]}
          </span>
          <div className="ds-toast__body">
            <div className="ds-toast__title">{t.title}</div>
            {t.description && <div className="ds-toast__desc">{t.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
