import React from 'react';
import { Button, Badge, EmptyState, Pagination, Skeleton } from './core';
import type { BadgeTone } from './core';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** 数值列右对齐并使用等宽数字 */
  numeric?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  title?: React.ReactNode;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  /** 名称列渲染（带副标题） */
  renderName?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyText?: string;
  /** 工具栏右侧动作 */
  actions?: React.ReactNode;
  /** 分页 */
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  compact?: boolean;
  id?: string;
  className?: string;
}

export function DataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  renderName,
  loading,
  emptyText,
  actions,
  page,
  pageSize = 20,
  total,
  onPageChange,
  compact,
  id,
  className,
}: DataTableProps<T>) {
  // 第一列固定为「名称列」：若提供 renderName，则由 renderName 负责该列内容，其余列从第 2 列开始
  const nameColumn = columns[0];
  const restColumns = renderName ? columns.slice(1) : columns;

  const renderCell = (column: DataTableColumn<T>, row: T, index: number) => {
    if (column.render) return column.render(row, index);
    return (row as Record<string, unknown>)[column.key] as React.ReactNode;
  };

  return (
    <div id={id} className={['ds-dtable', className ?? ''].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <div className="ds-dtable__toolbar">
          <div className="ds-dtable__title">{title}</div>
          {actions && <div className="ds-dtable__toolbar-actions">{actions}</div>}
        </div>
      )}
      <div className="ds-table-wrap">
        <table className={`ds-table${compact ? ' ds-table--compact' : ''}`}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={c.numeric ? 'ds-table__num' : undefined}
                  scope="col"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {columns.map((c) => (
                      <td key={c.key}>
                        <Skeleton height={14} width={c.numeric ? 60 : '80%'} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, i) => (
                  <tr key={rowKey(row, i)}>
                    {nameColumn && (
                      <td className={nameColumn.numeric ? 'ds-table__num' : undefined}>
                        {renderName ? (
                          <div className="ds-dtable__cell-name">{renderName(row)}</div>
                        ) : (
                          renderCell(nameColumn, row, i)
                        )}
                      </td>
                    )}
                    {restColumns.map((c) => (
                      <td key={c.key} className={c.numeric ? 'ds-table__num' : undefined}>
                        {renderCell(c, row, i)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 && <EmptyState title={emptyText ?? '暂无数据'} description="调整筛选条件或时间范围后再试" />}
      {onPageChange && total !== undefined && (
        <div className="ds-dtable__footer">
          <span className="ds-pagination__info">
            共 {total} 条
          </span>
          <Pagination page={page ?? 1} pageSize={pageSize} total={total} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * 表格内常用单元格
 * ============================================================ */
export function StatusCell({ tone, label }: { tone: BadgeTone; label: string }) {
  return <Badge tone={tone}>{label}</Badge>;
}

export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="ds-row" style={{ gap: 'var(--ds-space-1)', justifyContent: 'flex-end' }}>
      {children}
    </div>
  );
}

export function CellTitle({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{title}</div>
      {subtitle && <div className="ds-dtable__cell-sub">{subtitle}</div>}
    </div>
  );
}

export { Button };
