import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Figma: 02 Components / Badge + every status pill in the tables.
 *  Tone is semantic, never "green"/"amber" — dark mode remaps the fills. */
export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONES: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary-ink',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
  info: 'bg-info-soft text-info-fg',
  neutral: 'bg-neutral-soft text-neutral-fg',
}

const DOTS: Record<Tone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-fg-subtle',
}

export function Badge({
  tone = 'neutral',
  dot = false,
  size = 'md',
  className,
  children,
}: {
  tone?: Tone
  /** A colour-blind-safe second channel: status is never colour alone. */
  dot?: boolean
  size?: 'sm' | 'md'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[0.6875rem]' : 'px-2.5 py-1 text-caption',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOTS[tone])} aria-hidden="true" />}
      {children}
    </span>
  )
}

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string
  src?: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0] ?? '')
    .join('')
    .toLocaleUpperCase()

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-primary-soft text-primary-ink font-medium select-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      // Decorative: the row always shows the name in text next to it.
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials}
    </span>
  )
}
