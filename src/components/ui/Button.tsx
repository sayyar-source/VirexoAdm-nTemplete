import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'

/** Figma: 02 Components / Buttons — Primary · Hover · Secondary · Outline ·
 *  Ghost · Danger. "Hover" is a state, not a variant, so it is folded in here. */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active shadow-sm',
  secondary:
    'bg-surface-2 text-fg hover:bg-surface-3 active:bg-surface-3 dark:bg-surface-2',
  outline:
    'border border-border-strong bg-surface text-fg hover:bg-surface-2 active:bg-surface-3',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-3',
  danger: 'bg-danger text-white hover:brightness-95 active:brightness-90 shadow-sm',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-caption rounded-sm',
  md: 'h-10 gap-2 px-4 text-body-sm rounded-md',
  lg: 'h-12 gap-2 px-5 text-body rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** `Start`/`End`, never `Left`/`Right` — the slot follows reading order. */
  iconStart?: IconName
  iconEnd?: IconName
  loading?: boolean
  block?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  loading = false,
  block = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-[background-color,color,box-shadow,filter] duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} />
      ) : (
        iconStart && <Icon name={iconStart} size={iconSize} />
      )}
      {children}
      {iconEnd && !loading && <Icon name={iconEnd} size={iconSize} />}
    </button>
  )
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('animate-spin motion-safe-anim', className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" fill="none" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconStart' | 'iconEnd'> {
  icon: IconName
  /** Required: an icon-only control has no accessible name otherwise. */
  label: string
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={cn('px-0', size === 'sm' ? 'w-8' : size === 'lg' ? 'w-12' : 'w-10', className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 18} />
    </Button>
  )
}
