import React from 'react';

/* ============================================================
 * 吉祥物层 · 后鲨 HOSA
 *
 * 形象来源: mascot/assets/hosa-main.png 与 hosa-poses.png（公司官方素材）
 * 主题色: 由素材像素级提取，见 tokens/source.json 的 primitive.mascot
 *
 * 隔离铁律:
 *   1. 所有颜色只走 --ds-semantic-mascot-* / --ds-mascot-* 变量，不硬编码。
 *   2. 吉祥物永远不是唯一信息载体，必须同时有文本。
 *   3. 吉祥物不占据栅格列，不影响通用布局流。
 *   4. 深海军蓝（色相 205–225 且明度 < 30%）为后鲨专属色域，
 *      通用规范层禁止使用——通用层主色已改为紫罗兰以拉开 ΔE00 = 22.3。
 * ============================================================ */

/** 吉祥物表情，对应素材中的实际形象 */
export type MascotMood =
  | 'happy'    // 主形象：挥手欢呼
  | 'excited'  // 姿态一：冲浪 / 划水
  | 'serious'  // 姿态二：站立 / 专注
  | 'relaxed'; // 姿态三：坐姿 / 休息

/** 素材路径常量 —— 实际项目请改为构建产物路径或 CDN */
export const HOSA_ASSETS = {
  main: 'mascot/assets/processed/hosa-main-transparent.png',
  excited: 'mascot/assets/processed/pose-1.png',
  serious: 'mascot/assets/processed/pose-2.png',
  relaxed: 'mascot/assets/processed/pose-3.png',
  /** 品牌标识用方形头像（主形象） */
  avatar: 'mascot/assets/processed/hosa-128.png',
} as const;

const MOOD_SRC: Record<MascotMood, string> = {
  happy: HOSA_ASSETS.main,
  excited: HOSA_ASSETS.excited,
  serious: HOSA_ASSETS.serious,
  relaxed: HOSA_ASSETS.relaxed,
};

/* ============================================================
 * MascotAsset — 吉祥物形象
 * ============================================================ */
export interface MascotAssetProps {
  /** 素材路径；不传则按 mood 取默认素材 */
  src?: string;
  /** 表情，决定默认素材 */
  mood?: MascotMood;
  /** 显示尺寸（px，高度自适应等比） */
  size?: number;
  /** 无障碍描述；纯装饰时留空 */
  label?: string;
  className?: string;
  id?: string;
}

export function MascotAsset({ src, mood = 'happy', size = 40, label, className, id }: MascotAssetProps) {
  const source = src ?? MOOD_SRC[mood];
  return (
    <img
      id={id}
      src={source}
      width={size}
      height={size}
      alt={label ?? ''}
      className={className}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}
      draggable={false}
    />
  );
}

/* ============================================================
 * MascotMark — 品牌标识（Logo 锁定区）
 * ============================================================ */
export interface MascotMarkProps {
  src?: string;
  name: string;
  tagline?: string;
  size?: number;
  /** 折叠态：仅保留图形 */
  glyphOnly?: boolean;
  mood?: MascotMood;
  id?: string;
  className?: string;
}
export function MascotMark({ src, name, tagline, size = 36, glyphOnly, mood = 'happy', id, className }: MascotMarkProps) {
  return (
    <span id={id} className={['ds-mascot-mark', className ?? ''].filter(Boolean).join(' ')}>
      <MascotAsset src={src} mood={mood} size={size} className="ds-mascot-mark__glyph" />
      {!glyphOnly && (
        <span className="ds-mascot-mark__text">
          <span className="ds-mascot-mark__name">{name}</span>
          {tagline && <span className="ds-mascot-mark__tagline">{tagline}</span>}
        </span>
      )}
    </span>
  );
}

/* ============================================================
 * MascotBadge — 吉祥物徽章（头像位 / 状态标识位）
 * ============================================================ */
export interface MascotBadgeProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: MascotMood;
  /** 旁挂提示，如 "Beta"、"新" */
  pin?: React.ReactNode;
  id?: string;
  className?: string;
}
export function MascotBadge({ src, size = 'md', mood = 'happy', pin, id, className }: MascotBadgeProps) {
  const px = size === 'sm' ? 20 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24;
  return (
    <span
      id={id}
      className={[
        'ds-mascot-badge',
        size === 'lg' ? 'ds-mascot-badge--lg' : '',
        size === 'xl' ? 'ds-mascot-badge--xl' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <MascotAsset src={src} mood={mood} size={px} />
      {pin && <span className="ds-mascot-pin">{pin}</span>}
    </span>
  );
}

/* ============================================================
 * MascotBubble — 吉祥物气泡（引导 / 提示）
 * ============================================================ */
export interface MascotBubbleProps {
  src?: string;
  children: React.ReactNode;
  mood?: MascotMood;
  /** 气泡尾巴朝向，须指向吉祥物所在侧 */
  tail?: 'left' | 'right';
  id?: string;
  className?: string;
}
export function MascotBubble({ src, children, mood = 'happy', tail = 'left', id, className }: MascotBubbleProps) {
  return (
    <div
      id={id}
      className={['ds-mascot-bubble', tail === 'right' ? 'ds-mascot-bubble--tail-right' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      <span className="ds-mascot-bubble__avatar">
        <MascotAsset src={src} mood={mood} size={28} />
      </span>
      <span className="ds-mascot-bubble__text">{children}</span>
    </div>
  );
}

/* ============================================================
 * MascotState — 吉祥物状态插画（空态 / 加载 / 异常）
 * ============================================================ */
export interface MascotStateProps {
  src?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  mood?: MascotMood;
  actions?: React.ReactNode;
  /** 吉祥物旁挂标签 */
  pin?: React.ReactNode;
  id?: string;
  className?: string;
}
export function MascotState({ src, title, description, mood = 'happy', actions, pin, id, className }: MascotStateProps) {
  return (
    <div id={id} className={['ds-mascot-state', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-mascot-state__figure">
        <MascotAsset src={src} mood={mood} size={96} />
        {pin && <span className="ds-mascot-pin">{pin}</span>}
      </div>
      <div className="ds-mascot-state__title">{title}</div>
      {description && <div className="ds-mascot-state__desc">{description}</div>}
      {actions && <div className="ds-mascot-state__actions">{actions}</div>}
    </div>
  );
}

/* ============================================================
 * MascotBand — 吉祥物品牌带（看板页脚 / 横幅位）
 * ============================================================ */
export interface MascotBandProps {
  src?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  mood?: MascotMood;
  id?: string;
  className?: string;
}
export function MascotBand({ src, title, description, actions, mood = 'excited', id, className }: MascotBandProps) {
  return (
    <div id={id} className={['ds-mascot-band', className ?? ''].filter(Boolean).join(' ')}>
      <div className="ds-mascot-band__body">
        <div className="ds-mascot-band__title">{title}</div>
        {description && <div className="ds-mascot-band__desc">{description}</div>}
        {actions}
      </div>
      <div className="ds-mascot-band__figure">
        <MascotAsset src={src} mood={mood} size={72} />
      </div>
    </div>
  );
}

/* ============================================================
 * MascotIcon — 功能入口的吉祥物图标组
 *
 * 与通用线性图标（1.5px 描边单色）区分：吉祥物图标为实心填充 + 墨色描边。
 * ============================================================ */
export interface MascotIconProps {
  name: 'insight' | 'report' | 'plan' | 'material' | 'agent';
  size?: number;
  className?: string;
  id?: string;
}

const ICON_PATHS: Record<MascotIconProps['name'], React.ReactNode> = {
  insight: (
    <>
      <path d="M8 26c0-9 6-16 16-16 3 0 5 .8 7 2-1 5-4 8-8 10 1 2 1 4 1 6-4 3-10 3-16-2z" />
      <circle cx="20" cy="18" r="2.6" fill="#fff" opacity="0.9" />
    </>
  ),
  report: (
    <>
      <rect x="11" y="9" width="20" height="24" rx="3" />
      <path d="M15 16h12M15 21h12M15 26h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  plan: (
    <>
      <rect x="10" y="12" width="22" height="19" rx="3" />
      <path d="M10 18h22" stroke="#fff" strokeWidth="2" fill="none" />
      <circle cx="16" cy="25" r="2" fill="#fff" />
      <circle cx="23" cy="25" r="2" fill="#fff" opacity="0.6" />
    </>
  ),
  material: (
    <>
      <rect x="9" y="12" width="14" height="14" rx="3" />
      <path d="M24 17h8v14H24z" opacity="0.55" />
    </>
  ),
  agent: (
    <>
      <circle cx="20" cy="20" r="9" />
      <path d="M20 4v4M20 32v4M4 20h4M32 20h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3" fill="#fff" />
    </>
  ),
};

export function MascotIcon({ name, size = 20, className, id }: MascotIconProps) {
  return (
    <span
      id={id}
      className={['ds-mascot-icon', className ?? ''].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      <svg className="ds-mascot-icon__svg" viewBox="0 0 40 40" role="presentation" aria-hidden="true" focusable="false">
        <g fill="var(--ds-semantic-mascot-fill)" stroke="var(--ds-semantic-mascot-ink)" strokeWidth="1.6" strokeLinejoin="round">
          {ICON_PATHS[name]}
        </g>
      </svg>
    </span>
  );
}
