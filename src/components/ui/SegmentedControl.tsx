import { useId } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: IconName
}

/**
 * Figma: Settings / Appearance — the Light/Dark/System, LTR/RTL and
 * Default/Compact/Wide chip rows.
 *
 * Implemented as a real radiogroup (arrow keys, one tab stop, announced as
 * "2 of 3") instead of buttons. It also does NOT pin a chip width: the Turkish
 * label for "LTR" is "Soldan sağa" — 11 characters where the mock has 3.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: {
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const name = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-md border border-border bg-surface-2 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const checked = option.value === value
        const id = `${name}-${option.value}`
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-sm font-medium',
              'transition-colors duration-150',
              size === 'sm' ? 'px-2.5 py-1 text-caption' : 'px-3 py-1.5 text-body-sm',
              checked
                ? 'bg-surface text-fg shadow-sm'
                : 'text-fg-muted hover:bg-surface-3 hover:text-fg',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon && <Icon name={option.icon} size={14} />}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}
