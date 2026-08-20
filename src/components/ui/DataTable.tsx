import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { EmptyState, ErrorState, TableSkeleton } from './Feedback'

export interface Column<T> {
  id: string
  header: string
  /** Logical alignment. There is no `left`/`right`. */
  align?: 'start' | 'end' | 'center'
  /** Tabular figures + bidi isolation — money, counts, percentages. */
  numeric?: boolean
  /** Opaque identifier: forces LTR so "#10231" keeps its "#" at the front. */
  code?: boolean
  width?: string
  sortable?: boolean
  /** Value used for sorting; strings go through a locale-aware collator. */
  sortValue?: (row: T) => string | number
  cell: (row: T) => ReactNode
  /** Hide below `md`; the column then appears in the mobile card layout. */
  hideOnMobile?: boolean
}

type SortState = { columnId: string; dir: 'asc' | 'desc' } | null

const ALIGN = { start: 'text-start', end: 'text-end', center: 'text-center' } as const

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  state = 'ready',
  onRetry,
  query,
  emptyAction,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Screen-reader description of what the table contains. */
  caption: string
  state?: 'loading' | 'error' | 'ready'
  onRetry?: () => void
  query?: string
  emptyAction?: ReactNode
  className?: string
}) {
  const { t, locale } = useI18n()
  const [sort, setSort] = useState<SortState>(null)

  // Turkish (i/İ, ı) and Arabic cannot be sorted with `<`. A locale collator is
  // the only correct comparison — `numeric` also makes "#10231" sort sanely.
  const collator = useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }),
    [locale],
  )

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.id === sort.columnId)
    if (!column?.sortValue) return rows
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a)
      const bv = column.sortValue!(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return collator.compare(String(av), String(bv)) * factor
    })
  }, [rows, sort, columns, collator])

  if (state === 'loading') return <TableSkeleton cols={columns.length} />
  if (state === 'error') {
    return (
      <ErrorState
        title={t('common.loadFailed')}
        body={t('common.loadFailedBody')}
        retryLabel={t('common.retry')}
        onRetry={() => onRetry?.()}
      />
    )
  }
  if (sorted.length === 0) {
    return (
      <EmptyState
        title={t('common.noResults')}
        body={query ? t('common.noResultsBody', { query }) : undefined}
        action={emptyAction}
      />
    )
  }

  return (
    // A scroll container must be focusable, or keyboard users can't reach the
    // overflowing columns. `role="region"` + tabIndex is the accepted pattern.
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={cn('nx-scroll overflow-x-auto', className)}
    >
      <table className="w-full border-collapse text-body-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-surface-2">
            {columns.map((column) => {
              const active = sort?.columnId === column.id
              return (
                <th
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={
                    column.sortable
                      ? active
                        ? sort!.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                  className={cn(
                    'px-5 py-3 text-caption font-medium text-fg-muted',
                    ALIGN[column.align ?? (column.numeric ? 'end' : 'start')],
                    column.hideOnMobile && 'hidden md:table-cell',
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.columnId === column.id
                            ? { columnId: column.id, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                            : { columnId: column.id, dir: 'asc' },
                        )
                      }
                      className={cn(
                        'inline-flex items-center gap-1 rounded-xs transition-colors hover:text-fg',
                        active && 'text-fg',
                      )}
                    >
                      {column.header}
                      <Icon
                        name="chevronDown"
                        size={13}
                        className={cn(
                          'transition-transform duration-150',
                          active && sort!.dir === 'asc' && 'rotate-180',
                          !active && 'opacity-0 group-hover:opacity-40',
                        )}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={getRowId(row)}
              className="border-b border-border last:border-0 transition-colors duration-100 hover:bg-surface-2"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    'row-y px-5 align-middle text-fg',
                    ALIGN[column.align ?? (column.numeric ? 'end' : 'start')],
                    column.numeric && 'num',
                    column.code && 'code',
                    column.hideOnMobile && 'hidden md:table-cell',
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
