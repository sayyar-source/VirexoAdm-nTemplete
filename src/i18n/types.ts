import type { Dictionary } from './locales/en'

/** Widen the `as const` literal types of the English source dictionary so that
 *  translations only have to match the *shape*, not the exact strings. */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> }

export type Messages = Widen<Dictionary>

/** Every dot-path that resolves to a string, e.g. `"crm.stage.won"`.
 *  Gives compile-time errors on typo'd keys — no runtime "missing key" hunting. */
export type MessageKey = Paths<Dictionary>

type Paths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
    }[keyof T & string]

export type Locale = 'en' | 'tr' | 'ar'
export type Dir = 'ltr' | 'rtl'

export interface LocaleMeta {
  code: Locale
  /** Endonym — always show a language in its own language. */
  label: string
  dir: Dir
  /** Currency the tenant's own figures are reported in, per locale build. */
  defaultCurrency: string
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: { code: 'en', label: 'English', dir: 'ltr', defaultCurrency: 'USD' },
  tr: { code: 'tr', label: 'Türkçe', dir: 'ltr', defaultCurrency: 'TRY' },
  ar: { code: 'ar', label: 'العربية', dir: 'rtl', defaultCurrency: 'AED' },
}
