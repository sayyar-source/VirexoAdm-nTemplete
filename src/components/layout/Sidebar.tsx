import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { FOOTER_NAV, isBranch, NAV, type NavLeaf } from '@/app/nav'

const LINK_BASE =
  'flex items-center gap-3 rounded-md px-3 py-2 text-body-sm font-medium ' +
  'transition-colors duration-150'

function Leaf({ item, indented = false }: { item: NavLeaf; indented?: boolean }) {
  const { t } = useI18n()
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          LINK_BASE,
          // ps-* = padding-inline-start: the indent follows reading direction.
          indented && 'ps-11',
          isActive
            ? 'bg-primary text-primary-fg shadow-sm'
            : 'text-nav-fg hover:bg-surface-2 hover:text-fg',
        )
      }
    >
      {item.icon && <Icon name={item.icon} size={18} />}
      <span className="truncate">{t(item.labelKey)}</span>
      {item.badge && (
        <span className="ms-auto rounded-full bg-primary-soft px-1.5 py-0.5 text-[0.625rem] font-semibold text-primary-ink">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n()
  const { pathname } = useLocation()

  // A group containing the current route starts open — and re-opens if the
  // route changes from elsewhere (breadcrumb, deep link, browser back).
  const [open, setOpen] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev }
      for (const group of NAV) {
        for (const item of group.items) {
          if (isBranch(item) && item.children.some((child) => pathname.startsWith(child.to))) {
            next[item.id] = true
          }
        }
      }
      return next
    })
  }, [pathname])

  return (
    <nav aria-label={t('a11y.sidebar')} className="flex min-h-0 flex-1 flex-col" onClick={onNavigate}>
      <div className="nx-scroll flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.labelKey} className="mb-5 last:mb-0">
            <h2 className="mb-1.5 px-3 text-[0.6875rem] font-semibold tracking-wide text-fg-subtle uppercase">
              {t(group.labelKey)}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                if (!isBranch(item)) {
                  return (
                    <li key={item.to}>
                      <Leaf item={item} />
                    </li>
                  )
                }
                const expanded = open[item.id] ?? false
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`nav-${item.id}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }}
                      className={cn(
                        LINK_BASE,
                        'w-full text-nav-fg hover:bg-surface-2 hover:text-fg',
                      )}
                    >
                      <Icon name={item.icon} size={18} />
                      <span className="truncate">{t(item.labelKey)}</span>
                      {/* Rotation is direction-neutral, so the collapse
                          affordance needs no RTL special case. */}
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={cn(
                          'ms-auto transition-transform duration-200 motion-safe-anim',
                          expanded && 'rotate-180',
                        )}
                      />
                    </button>
                    {expanded && (
                      <ul id={`nav-${item.id}`} className="mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <Leaf item={child} indented />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-3 py-3">
        <ul className="space-y-0.5">
          {FOOTER_NAV.map((item) => (
            <li key={item.to}>
              <Leaf item={item} />
            </li>
          ))}
          <li>
            <button type="button" className={cn(LINK_BASE, 'w-full text-nav-fg hover:bg-danger-soft hover:text-danger')}>
              <Icon name="logout" size={18} />
              {t('nav.logout')}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-16 items-center gap-2.5 px-5', className)}>
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-fg">
        {/* Logos never mirror. */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 19V5l14 14V5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-body font-semibold tracking-tight">NEXORA</span>
    </div>
  )
}

/** Desktop rail. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[16.5rem] shrink-0 flex-col border-e border-border bg-nav-bg lg:flex">
      <Brand className="border-b border-border" />
      <SidebarNav />
    </aside>
  )
}

/** Mobile drawer — Figma: "Mobile / Sidebar (Drawer)". */
export function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden motion-safe-anim',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      {/* `start-0` anchors the drawer to the inline start. The slide itself is
          the one place a physical transform is unavoidable, so the `rtl:`
          variant supplies the mirrored offset. */}
      <div
        role="dialog"
        aria-modal={open}
        aria-label={t('a11y.sidebar')}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-[17rem] flex-col bg-nav-bg shadow-xl lg:hidden',
          'transition-transform duration-250 ease-out motion-safe-anim',
          // An off-canvas slide has no logical equivalent; the rtl: variant
          // supplies the mirrored offset.
          open ? 'translate-x-0' : /* rtl-ok */ '-translate-x-full rtl:translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border pe-2">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.closeMenu')}
            className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-2"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </>
  )
}
