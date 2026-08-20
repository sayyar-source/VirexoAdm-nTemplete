import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'

export interface MenuItem {
  id: string
  label: string
  icon?: IconName
  tone?: 'default' | 'danger'
  onSelect?: () => void
}

/**
 * The "…" row-actions menu from every table in the sheet.
 * Anchored with `end-0` so it opens toward the inline end and never off-screen
 * in RTL, where a physically-right-anchored popover would run off the
 * viewport. (rtl-ok: prose only)
 */
export function Menu({
  label,
  items,
  align = 'end',
  trigger,
}: {
  label: string
  items: MenuItem[]
  align?: 'start' | 'end'
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    listRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const moveFocus = (from: HTMLElement, delta: 1 | -1) => {
    const all = [...(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const index = all.indexOf(from)
    all[(index + delta + all.length) % all.length]?.focus()
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={trigger ? undefined : label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md text-fg-muted',
          'transition-colors duration-150 hover:bg-surface-2 hover:text-fg',
          trigger ? 'px-2 py-1.5' : 'size-8 justify-center',
        )}
      >
        {trigger ?? <Icon name="more" size={18} />}
      </button>

      {open && (
        <div
          ref={listRef}
          role="menu"
          aria-label={label}
          className={cn(
            'absolute top-full z-30 mt-1 min-w-44 overflow-hidden rounded-md border border-border',
            'bg-surface p-1 shadow-lg',
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect?.()
                setOpen(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  moveFocus(event.currentTarget, 1)
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  moveFocus(event.currentTarget, -1)
                }
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-body-sm',
                // logical alignment (rtl-ok: prose only)
                'text-start transition-colors duration-100',
                item.tone === 'danger'
                  ? 'text-danger hover:bg-danger-soft'
                  : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {item.icon && <Icon name={item.icon} size={15} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
