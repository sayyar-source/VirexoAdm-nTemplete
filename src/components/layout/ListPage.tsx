import { useMemo, useState, type ReactNode } from 'react'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { PageHeader } from './AppShell'

/**
 * Every list screen in the sheet (Products, Orders, Users, Customers) is the
 * same frame: title → search + filter + export + primary action → table →
 * pagination. Building it once keeps the four pages honest and means the
 * search/paging/empty-state behaviour can only be wrong in one place.
 */
export function ListPage<T>({
  title,
  entityPlural,
  entitySingular,
  rows,
  matches,
  pageSize = 6,
  primaryAction,
  children,
}: {
  title: string
  /** Plural — goes into "Search {entity}…". */
  entityPlural: string
  /** Singular — goes into "Add {entity}". Separate prop on purpose. */
  entitySingular: string
  rows: T[]
  matches: (row: T, query: string) => boolean
  pageSize?: number
  primaryAction?: ReactNode
  children: (view: { rows: T[]; query: string }) => ReactNode
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return q ? rows.filter((row) => matches(row, q)) : rows
  }, [rows, query, matches])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pageCount)
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize)

  return (
    <>
      <PageHeader
        title={title}
        subtitle={t('common.results', { count: filtered.length })}
        actions={
          primaryAction ?? (
            <Button iconStart="plus">{t('common.add', { entity: entitySingular })}</Button>
          )
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              aria-label={t('common.searchPlaceholder', { entity: entityPlural })}
              placeholder={t('common.searchPlaceholder', { entity: entityPlural })}
              className="h-9 w-full rounded-md border border-border bg-surface ps-9 pe-3 text-body-sm focus:border-primary focus:outline-none focus:ring-3 focus:ring-ring"
            />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Button variant="outline" size="sm" iconStart="filter">
              {t('common.filter')}
            </Button>
            <Button variant="outline" size="sm" iconStart="download">
              {t('common.export')}
            </Button>
          </div>
        </div>

        {children({ rows: visible, query })}

        {filtered.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <Pagination
              page={current}
              pageCount={pageCount}
              onChange={setPage}
              total={filtered.length}
              pageSize={pageSize}
            />
          </div>
        )}
      </Card>
    </>
  )
}
