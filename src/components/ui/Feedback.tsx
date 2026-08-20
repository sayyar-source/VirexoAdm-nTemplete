import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'
import { Button, IconButton } from './Button'
import type { Tone } from './Badge'

/* Figma: 02 Components / Alert · Toast — success + error only.
   Info and warning are added here so the set is complete, and the icon carries
   the meaning alongside the colour. */

const ALERT_TONES: Record<Exclude<Tone, 'primary' | 'neutral'>, { cls: string; icon: IconName }> = {
  success: { cls: 'bg-success-soft text-success-fg border-success/25', icon: 'checkCircle' },
  danger: { cls: 'bg-danger-soft text-danger-fg border-danger/25', icon: 'alertCircle' },
  warning: { cls: 'bg-warning-soft text-warning-fg border-warning/25', icon: 'warning' },
  info: { cls: 'bg-info-soft text-info-fg border-info/25', icon: 'info' },
}

export function Alert({
  tone = 'info',
  title,
  children,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
}: {
  tone?: keyof typeof ALERT_TONES
  title?: ReactNode
  children?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}) {
  const { cls, icon } = ALERT_TONES[tone]
  return (
    <div
      // Errors interrupt; everything else waits for a natural pause.
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md border px-4 py-3', cls, className)}
    >
      <Icon name={icon} size={18} className="mt-px" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-body-sm font-medium">{title}</p>}
        {children && <div className="text-caption opacity-90">{children}</div>}
      </div>
      {onDismiss && (
        <IconButton
          icon="close"
          label={dismissLabel}
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="-me-1.5 -mt-1 text-current hover:bg-black/5 dark:hover:bg-white/10"
        />
      )}
    </div>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  body,
  action,
  className,
}: {
  icon?: IconName
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}>
      <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-fg-subtle">
        <Icon name={icon} size={22} />
      </span>
      <div>
        <p className="text-body-sm font-medium text-fg">{title}</p>
        {body && <p className="mx-auto mt-1 max-w-sm text-caption text-fg-subtle">{body}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
}: {
  title: ReactNode
  body?: ReactNode
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <EmptyState
      icon="alertCircle"
      title={title}
      body={body}
      action={
        <Button variant="outline" size="sm" iconStart="activity" onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-pulse rounded-sm bg-surface-2 motion-safe-anim', className)}
    />
  )
}

/** Table-shaped placeholder so first paint doesn't jump. */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={cn('h-4 flex-1', c === 0 && 'max-w-40')} />
          ))}
        </div>
      ))}
    </div>
  )
}
