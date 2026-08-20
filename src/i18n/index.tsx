import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAppConfig } from '@/providers/AppConfig'
import { en } from './locales/en'
import { tr } from './locales/tr'
import { ar } from './locales/ar'
import { formatMessage, type MessageValues } from './message'
import { getFormatters, type Formatters } from './format'
import type { Dir, Locale, MessageKey, Messages } from './types'

/** Three locales are small enough to ship in the main bundle. Past ~5 locales,
 *  switch to `const loaders = { tr: () => import('./locales/tr') }` and suspend
 *  on the promise — the provider API below does not change. */
const DICTIONARIES: Record<Locale, Messages> = { en, tr, ar }

interface I18nValue {
  locale: Locale
  dir: Dir
  isRtl: boolean
  t: (key: MessageKey, values?: MessageValues) => string
  fmt: Formatters
}

const I18nContext = createContext<I18nValue | null>(null)

function lookup(dict: unknown, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)
  return typeof value === 'string' ? value : undefined
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale, dir, numerals } = useAppConfig()

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[locale]
    const fmt = getFormatters(locale, numerals)

    const t: I18nValue['t'] = (key, values) => {
      const template = lookup(dict, key) ?? lookup(en, key)
      if (template === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`)
        return key
      }
      return formatMessage(template, values, fmt.plural, fmt.number)
    }

    return { locale, dir, isRtl: dir === 'rtl', t, fmt }
  }, [locale, dir, numerals])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

export type { MessageKey }
