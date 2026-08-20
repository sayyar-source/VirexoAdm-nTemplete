import { cn } from '@/lib/cn'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { useAppConfig } from '@/providers/AppConfig'
import { Avatar } from '@/components/ui/Badge'
import { Menu } from '@/components/ui/Menu'
import { LOCALES, type Locale } from '@/i18n/types'
import { CURRENT_USER } from '@/data/mock'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t } = useI18n()
  const { locale, resolvedTheme, set } = useAppConfig()

  return (
    // Opaque, not `bg-surface/85 backdrop-blur`: a translucent sticky bar
    // composites over whatever scrolls beneath it, so the contrast of its own
    // labels depends on page content and cannot be guaranteed.
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={t('common.openMenu')}
        className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-2 lg:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      {/* Search: `ps-9` leaves room for the icon at the inline start. */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Icon
          name="search"
          size={16}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
        <input
          type="search"
          aria-label={t('common.search')}
          placeholder={t('common.searchAnything')}
          className={cn(
            'h-10 w-full rounded-md border border-border bg-surface-2 ps-9 pe-3 text-body-sm',
            'placeholder:text-fg-subtle focus:border-primary focus:bg-surface focus:outline-none focus:ring-3 focus:ring-ring',
          )}
        />
      </div>

      <div className="ms-auto flex items-center gap-1">
        <button
          type="button"
          aria-label={t('a11y.themeToggle')}
          onClick={() => set('theme', resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        <Menu
          label={t('a11y.langSwitch')}
          items={Object.values(LOCALES).map((meta) => ({
            id: meta.code,
            label: meta.label,
            icon: meta.code === locale ? 'check' : undefined,
            onSelect: () => set('locale', meta.code as Locale),
          }))}
          trigger={
            <span className="flex items-center gap-1.5 text-body-sm">
              <Icon name="globe" size={18} />
              <span className="hidden sm:inline">{LOCALES[locale].label}</span>
            </span>
          }
        />

        <button
          type="button"
          aria-label={t('common.notifications')}
          className="relative grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="bell" size={18} />
          <span className="absolute end-2 top-2 size-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Menu
          label={t('common.profile')}
          items={[
            { id: 'profile', label: t('settings.profile'), icon: 'customers' },
            { id: 'settings', label: t('settings.title'), icon: 'settings' },
            { id: 'logout', label: t('nav.logout'), icon: 'logout', tone: 'danger' },
          ]}
          trigger={
            <span className="flex items-center gap-2.5">
              <Avatar name={CURRENT_USER.name} size={32} />
              <span className="hidden text-start leading-tight sm:block">
                <span className="block text-body-sm font-medium text-fg">{CURRENT_USER.name}</span>
                <span className="block text-caption text-fg-subtle">
                  {t(CURRENT_USER.roleKey)}
                </span>
              </span>
              <Icon name="chevronDown" size={14} className="hidden text-fg-subtle sm:block" />
            </span>
          }
        />
      </div>
    </header>
  )
}
