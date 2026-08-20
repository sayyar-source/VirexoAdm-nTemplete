import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { IconButton } from './Button'

/**
 * Figma: 02 Components / Modal.
 *
 * Built on the native <dialog> element, which gives focus trapping, focus
 * restore, Esc-to-close, inert background and top-layer stacking for free —
 * all things the mock implies but a plain absolutely-positioned div does not do.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeLabel = 'Close',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeLabel?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault() // let React own the open state
        onClose()
      }}
      onClick={(event) => {
        // Clicks land on the dialog itself only when they hit the backdrop.
        if (event.target === ref.current) onClose()
      }}
      className={cn(
        'm-auto w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-0 text-fg shadow-xl',
        'backdrop:bg-black/40 backdrop:backdrop-blur-[2px]',
        size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md',
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h2 id={titleId} className="text-body font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-caption text-fg-muted">
              {description}
            </p>
          )}
        </div>
        <IconButton icon="close" label={closeLabel} size="sm" onClick={onClose} className="-me-2 -mt-1" />
      </div>

      {children && <div className="px-5 py-4 text-body-sm text-fg-muted">{children}</div>}

      {footer && (
        // `justify-end` = flex-end = inline-end, so the primary action sits on
        // the left in RTL without a second rule.
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
          {footer}
        </div>
      )}
    </dialog>
  )
}
