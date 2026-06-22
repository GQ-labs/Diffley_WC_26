import type { KeyboardEvent, ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  id: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  hideOnMobile?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  expandedRowKey?: string | null;
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
  leaderKey?: string;
  getRowLabel?: (row: T) => string;
  rowClickHint?: string;
  getRowClickHint?: (row: T, isExpanded: boolean) => string;
}

export function DataTable<T>({
  caption,
  columns,
  data,
  rowKey,
  expandedRowKey,
  renderExpanded,
  onRowClick,
  isRowClickable,
  leaderKey,
  getRowLabel,
  rowClickHint,
  getRowClickHint,
}: DataTableProps<T>) {
  return (
    <div
      className={styles.wrapper}
      role="region"
      aria-label={caption}
    >
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={colClass(col)}
                data-align={col.align ?? 'left'}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = rowKey(row);
            const isExpanded = expandedRowKey === key;
            const isLeader = leaderKey === key;

            return (
              <TableRowGroup
                key={key}
                row={row}
                columns={columns}
                isExpanded={isExpanded}
                isLeader={isLeader}
                onRowClick={onRowClick}
                isRowClickable={isRowClickable}
                renderExpanded={renderExpanded}
                rowLabel={getRowLabel?.(row)}
                rowClickHint={rowClickHint}
                getRowClickHint={getRowClickHint}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function colClass<T>(col: Column<T>): string | undefined {
  const parts = [col.className, col.hideOnMobile ? styles.hideMobile : undefined].filter(
    Boolean,
  );
  return parts.length ? parts.join(' ') : undefined;
}

function TableRowGroup<T>({
  row,
  columns,
  isExpanded,
  isLeader,
  onRowClick,
  isRowClickable,
  renderExpanded,
  rowLabel,
  rowClickHint,
  getRowClickHint,
}: {
  row: T;
  columns: Column<T>[];
  isExpanded: boolean;
  isLeader: boolean;
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
  renderExpanded?: (row: T) => ReactNode;
  rowLabel?: string;
  rowClickHint?: string;
  getRowClickHint?: (row: T, isExpanded: boolean) => string;
}) {
  const clickable = Boolean(onRowClick) && (isRowClickable?.(row) ?? true);
  const clickHint =
    getRowClickHint?.(row, isExpanded) ??
    rowClickHint ??
    (isExpanded ? 'Collapse team breakdown' : 'Expand team breakdown');

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!clickable || !onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <>
      <tr
        className={styles.row}
        data-leader={isLeader || undefined}
        data-expanded={isExpanded || undefined}
        data-clickable={clickable || undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-expanded={clickable ? isExpanded : undefined}
        aria-label={
          clickable && rowLabel ? `${rowLabel}. ${clickHint}` : undefined
        }
        onClick={clickable ? () => onRowClick?.(row) : undefined}
        onKeyDown={handleKeyDown}
      >
        {columns.map((col) => (
          <td
            key={col.id}
            className={col.hideOnMobile ? styles.hideMobile : undefined}
            data-align={col.align ?? 'left'}
          >
            {col.render(row)}
          </td>
        ))}
      </tr>
      {isExpanded && renderExpanded && (
        <tr className={styles.expandedRow}>
          <td colSpan={columns.length}>{renderExpanded(row)}</td>
        </tr>
      )}
    </>
  );
}
