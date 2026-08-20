import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
  as: As = 'section',
}: {
  className?: string
  children: ReactNode
  as?: 'section' | 'div' | 'article'
}) {
  return (
    <As
      className={cn(
        'rounded-lg border border-border bg-surface shadow-sm',
        'transition-colors duration-150',
        className,
      )}
    >
      {children}
    </As>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  id,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
  id?: string
}) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="truncate text-body font-semibold text-fg">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-caption text-fg-subtle">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  )
}

export function CardBody({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('card-p', className)}>{children}</div>
}

export function CardFooter({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3',
        className,
      )}
    >
      {children}
    </footer>
  )
}
