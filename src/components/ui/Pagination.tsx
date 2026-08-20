import { cn } from '@/lib/cn'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'

/** Figma: the "‹ 1 2 3 … 10 ›" row under every table.
 *  Numbers are formatted through Intl, and the arrows are `chevronStart` /
 *  `chevronEnd` — mirrored glyphs, so "previous" always points backwards in
 *  reading order rather than always pointing left. */
export function Pagination({
  page,
  pageCount,
  onChange,
  total,
  pageSize,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
  total?: number
  pageSize?: number
}) {
  const { t, fmt } = useI18n()

  const pages = buildRange(page, pageCount)
  const from = pageSize ? (page - 1) * pageSize + 1 : undefined
  const to = pageSize && total ? Math.min(page * pageSize, total) : undefined

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {total !== undefined && from !== undefined && to !== undefined ? (
        <p className="text-caption text-fg-subtle">
          {t('common.showing', {
            from: fmt.number(from),
            to: fmt.number(to),
            total: fmt.number(total),
          })}
        </p>
      ) : (
        <span />
      )}

      <nav aria-label={t('common.page')} className="flex items-center gap-1">
        <PageButton
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          label={t('common.previous')}
        >
          <Icon name="chevronStart" size={16} />
        </PageButton>

        {pages.map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-caption text-fg-subtle">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                'size-8 rounded-sm text-caption font-medium transition-colors duration-150',
                entry === page
                  ? 'bg-primary text-primary-fg'
                  : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <span className="num">{fmt.number(entry)}</span>
            </button>
          ),
        )}

        <PageButton
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          label={t('common.next')}
        >
          <Icon name="chevronEnd" size={16} />
        </PageButton>
      </nav>
    </div>
  )
}

function PageButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-sm text-fg-muted',
        'transition-colors duration-150 hover:bg-surface-2 hover:text-fg',
        'disabled:pointer-events-none disabled:opacity-40',
      )}
    >
      {children}
    </button>
  )
}

function buildRange(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const out: (number | 'gap')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) out.push('gap')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < pageCount - 1) out.push('gap')
  out.push(pageCount)
  return out
}
