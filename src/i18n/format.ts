import type { Locale } from './types'

/** Arabic locales render Arabic-Indic digits (٠١٢) by default. Many enterprise
 *  dashboards deliberately force Latin digits so figures stay scannable next to
 *  charts and exports — the design sheet's RTL frame shows Latin digits, so
 *  `latn` is the shipped default and the choice is exposed in Settings. */
export type NumeralMode = 'auto' | 'latn'

export interface Formatters {
  tag: string
  plural: Intl.PluralRules
  number(n: number): string
  /** Compact form for chart axes and KPI deltas: 128430 → "128K". */
  compact(n: number): string
  /** `currency` is a property of the *record*, not of the user's locale. */
  money(n: number, currency: string, opts?: { cents?: boolean; compact?: boolean }): string
  /** `n` is a ratio: 0.0842 → "8.42%". */
  percent(n: number, fractionDigits?: number): string
  /** Always renders the sign, and always as a real minus (−) not a hyphen. */
  signedPercent(n: number, fractionDigits?: number): string
  date(d: Date | string, style?: 'short' | 'medium' | 'long'): string
  dateRange(a: Date | string, b: Date | string): string
  /** "2 minutes ago" / "منذ دقيقتين" / "2 dakika önce" */
  relative(from: Date | string, now?: Date): string
  list(items: string[]): string
}

const asDate = (d: Date | string) => (typeof d === 'string' ? new Date(d) : d)

const cache = new Map<string, Formatters>()

export function getFormatters(locale: Locale, numerals: NumeralMode): Formatters {
  const key = `${locale}:${numerals}`
  const hit = cache.get(key)
  if (hit) return hit

  const tag = numerals === 'latn' ? `${locale}-u-nu-latn` : locale

  const nf = new Intl.NumberFormat(tag)
  const nfCompact = new Intl.NumberFormat(tag, { notation: 'compact', maximumFractionDigits: 1 })
  const plural = new Intl.PluralRules(locale)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const lf = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' })

  const dtf = {
    short: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' }),
    medium: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric' }),
    long: new Intl.DateTimeFormat(tag, { dateStyle: 'long' }),
  }

  const money = (n: number, currency: string, opts?: { cents?: boolean; compact?: boolean }) =>
    new Intl.NumberFormat(tag, {
      style: 'currency',
      currency,
      notation: opts?.compact ? 'compact' : 'standard',
      minimumFractionDigits: opts?.cents ? 2 : 0,
      maximumFractionDigits: opts?.cents ? 2 : opts?.compact ? 1 : 0,
    }).format(n)

  const percent = (n: number, fractionDigits = 2) =>
    new Intl.NumberFormat(tag, {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n)

  const value: Formatters = {
    tag,
    plural,
    number: (n) => nf.format(n),
    compact: (n) => nfCompact.format(n),
    money,
    percent,
    signedPercent: (n, fractionDigits = 1) =>
      new Intl.NumberFormat(tag, {
        style: 'percent',
        signDisplay: 'exceptZero',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(n),
    date: (d, style = 'medium') => dtf[style].format(asDate(d)),
    // Intl builds the separator, the order and the "shared year" collapsing.
    // Hand-assembling "May 12 – May 18, 2024" breaks in every other locale.
    dateRange: (a, b) => dtf.medium.formatRange(asDate(a), asDate(b)),
    relative: (from, now = new Date()) => {
      const diffMs = asDate(from).getTime() - now.getTime()
      const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 31_536_000_000],
        ['month', 2_592_000_000],
        ['week', 604_800_000],
        ['day', 86_400_000],
        ['hour', 3_600_000],
        ['minute', 60_000],
      ]
      for (const [unit, ms] of units) {
        if (Math.abs(diffMs) >= ms) return rtf.format(Math.round(diffMs / ms), unit)
      }
      return rtf.format(Math.round(diffMs / 1000), 'second')
    },
    list: (items) => lf.format(items),
  }

  cache.set(key, value)
  return value
}
