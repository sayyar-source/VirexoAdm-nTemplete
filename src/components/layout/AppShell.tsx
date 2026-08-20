import { useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { Sidebar, SidebarDrawer } from './Sidebar'
import { Topbar } from './Topbar'
import type { MessageKey } from '@/i18n'

export function AppShell() {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Missing from the sheet; mandatory in a shell with a 12-link sidebar. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-99 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:text-primary-fg"
      >
        {t('common.skipToContent')}
      </a>

      <Sidebar />
      <SidebarDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main
          id="main"
          className="mx-auto w-full max-w-(--nx-page-max) flex-1 p-(--nx-gutter) pb-24 lg:pb-8"
        >
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </div>
  )
}

const TABS: { to: string; labelKey: MessageKey; icon: IconName }[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: 'dashboard' },
  { to: '/crm/deals', labelKey: 'nav.crm', icon: 'crm' },
  { to: '/orders', labelKey: 'nav.orders', icon: 'orders' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'settings' },
]

/** Figma: "Mobile / Dashboard" bottom bar. */
function MobileTabBar() {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t('a11y.sidebar')}
      className="fixed bottom-0 z-30 flex w-full border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6875rem]',
              isActive ? 'text-primary-ink' : 'text-fg-subtle',
            )
          }
        >
          <Icon name={tab.icon} size={20} />
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-h2 text-fg lg:text-h1">{title}</h1>
        {subtitle && <p className="mt-1 text-body-sm text-fg-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
