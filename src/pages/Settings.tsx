import { cn } from '@/lib/cn'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout/AppShell'
import { Icon, type IconName } from '@/components/Icon'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import {
  PRIMARY_SWATCHES,
  useAppConfig,
  type Density,
  type DirSetting,
  type ThemeMode,
} from '@/providers/AppConfig'
import { LOCALES, type Locale } from '@/i18n/types'
import type { NumeralMode } from '@/i18n/format'
import type { MessageKey } from '@/i18n'

const SECTIONS: { id: string; labelKey: MessageKey; icon: IconName; active?: boolean }[] = [
  { id: 'profile', labelKey: 'settings.profile', icon: 'customers' },
  { id: 'account', labelKey: 'settings.account', icon: 'crm' },
  { id: 'security', labelKey: 'settings.security', icon: 'lock' },
  { id: 'notifications', labelKey: 'settings.notifications', icon: 'bell' },
  { id: 'appearance', labelKey: 'settings.appearance', icon: 'palette', active: true },
  { id: 'localization', labelKey: 'settings.localization', icon: 'globe' },
  { id: 'billing', labelKey: 'settings.billing', icon: 'card' },
]

/** Figma: Settings / Appearance. Every control here writes straight through to
 *  the token layer, so what you see is the same mechanism a real tenant theme
 *  would use — no per-component overrides. */
export function SettingsPage() {
  const { t } = useI18n()
  const config = useAppConfig()

  const themeOptions: { value: ThemeMode; label: string; icon: IconName }[] = [
    { value: 'light', label: t('settings.light'), icon: 'sun' },
    { value: 'dark', label: t('settings.dark'), icon: 'moon' },
    { value: 'system', label: t('settings.system'), icon: 'monitor' },
  ]

  const dirOptions: { value: DirSetting; label: string }[] = [
    { value: 'ltr', label: t('settings.ltr') },
    { value: 'rtl', label: t('settings.rtl') },
    { value: 'auto', label: t('settings.numeralsAuto') },
  ]

  const densityOptions: { value: Density; label: string }[] = [
    { value: 'default', label: t('settings.default') },
    { value: 'compact', label: t('settings.compact') },
    { value: 'wide', label: t('settings.wide') },
  ]

  const numeralOptions: { value: NumeralMode; label: string }[] = [
    { value: 'latn', label: t('settings.numeralsLatin') },
    { value: 'auto', label: t('settings.numeralsAuto') },
  ]

  return (
    <>
      <PageHeader title={t('settings.title')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[15rem_1fr]">
        <Card className="h-fit">
          <nav aria-label={t('settings.title')} className="p-2">
            <ul className="space-y-0.5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    aria-current={section.active ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-start text-body-sm',
                      'transition-colors duration-150',
                      section.active
                        ? 'bg-primary-soft font-medium text-primary-ink'
                        : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    <Icon name={section.icon} size={17} />
                    {t(section.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Card>

        <Card>
          <CardHeader title={t('settings.appearance')} />
          <CardBody className="space-y-7">
            <Row label={t('settings.theme')} hint={t('settings.themeHint')}>
              <SegmentedControl
                label={t('settings.theme')}
                options={themeOptions}
                value={config.theme}
                onChange={(value) => config.set('theme', value)}
              />
            </Row>

            <Row label={t('settings.direction')} hint={t('settings.directionHint')}>
              <SegmentedControl
                label={t('settings.direction')}
                options={dirOptions}
                value={config.dirSetting}
                onChange={(value) => config.set('dirSetting', value)}
              />
            </Row>

            <Row label={t('settings.primaryColor')} hint={t('settings.primaryColorHint')}>
              <div role="radiogroup" aria-label={t('settings.primaryColor')} className="flex flex-wrap gap-2">
                {PRIMARY_SWATCHES.map((swatch) => {
                  const selected = config.primary.toLowerCase() === swatch
                  return (
                    <button
                      key={swatch}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={swatch}
                      onClick={() => config.set('primary', swatch)}
                      style={{ backgroundColor: swatch }}
                      className={cn(
                        'grid size-7 place-items-center rounded-full transition-transform duration-150',
                        // Without the inset hairline the near-black swatch is
                        // invisible on the dark surface — a fixed swatch list
                        // always contains one colour that matches a surface.
                        'ring-1 ring-black/15 ring-inset dark:ring-white/25',
                        selected
                          ? 'outline-2 outline-fg outline-offset-2'
                          : 'hover:scale-110',
                      )}
                    >
                      {selected && <Icon name="check" size={14} className="text-white" />}
                    </button>
                  )
                })}
              </div>
            </Row>

            <Row label={t('settings.layout')}>
              <SegmentedControl
                label={t('settings.layout')}
                options={densityOptions}
                value={config.density}
                onChange={(value) => config.set('density', value)}
              />
            </Row>

            <Row label={t('settings.language')}>
              <Select
                value={config.locale}
                onChange={(event) => config.set('locale', event.target.value as Locale)}
                className="max-w-56"
              >
                {Object.values(LOCALES).map((meta) => (
                  <option key={meta.code} value={meta.code}>
                    {meta.label}
                  </option>
                ))}
              </Select>
            </Row>

            <Row label={t('settings.numerals')} hint={t('settings.numeralsHint')}>
              <SegmentedControl
                label={t('settings.numerals')}
                options={numeralOptions}
                value={config.numerals}
                onChange={(value) => config.set('numerals', value)}
              />
            </Row>

            <Alert tone="info" title={t('settings.saved')}>
              {t('settings.primaryColorHint')}
            </Alert>
          </CardBody>
        </Card>
      </div>
    </>
  )
}

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-start sm:gap-6">
      <div>
        <p className="text-body-sm font-medium text-fg">{label}</p>
        {hint && <p className="mt-0.5 text-caption text-fg-subtle">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}
