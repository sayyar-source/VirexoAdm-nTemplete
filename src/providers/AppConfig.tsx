import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Dir, Locale } from '@/i18n/types'
import { LOCALES } from '@/i18n/types'
import type { NumeralMode } from '@/i18n/format'
import { buildPrimaryRamp, contrast } from '@/lib/color'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'default' | 'compact' | 'wide'
export type DirSetting = 'auto' | Dir

/**
 * Figma: Settings / Appearance / Primary Color — 8 swatches.
 *
 * The sheet's row is the 500 step of each hue. Measured against a white 14px
 * label, six of those eight fail AA (amber #f59e0b is 2.15:1, emerald #10b981
 * 2.54:1, cyan #06b6d4 2.43:1, violet #8b5cf6 4.23:1, blue #3b82f6 3.68:1,
 * rose #ef4444 3.76:1). A brand-colour picker that can produce an illegible
 * button is a bug, not a preference — so the row ships the 600/700 step of the
 * same hues, each ≥ 4.8:1 with white text and ≥ 4.8:1 as text on white.
 * `pickInkFor()` below still runs, so a tenant-supplied colour outside this
 * list also gets a legible label.
 */
export const PRIMARY_SWATCHES = [
  '#5457e0', // indigo  5.50:1
  '#0f172a', // slate  17.85:1
  '#7c3aed', // violet  5.70:1
  '#b45309', // amber   5.02:1
  '#047857', // emerald 5.48:1
  '#0e7490', // cyan    5.36:1
  '#2563eb', // blue    5.17:1
  '#dc2626', // rose    4.83:1
] as const



export interface AppConfigState {
  theme: ThemeMode
  locale: Locale
  dirSetting: DirSetting
  primary: string
  density: Density
  numerals: NumeralMode
}

const STORAGE_KEY = 'nexora.config'

const DEFAULTS: AppConfigState = {
  theme: 'system',
  locale: 'en',
  dirSetting: 'auto',
  primary: PRIMARY_SWATCHES[0],
  density: 'default',
  numerals: 'latn',
}

interface AppConfigContextValue extends AppConfigState {
  /** Resolved values — what the UI should actually branch on. */
  dir: Dir
  resolvedTheme: 'light' | 'dark'
  set<K extends keyof AppConfigState>(key: K, value: AppConfigState[K]): void
  reset(): void
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null)

function read(): AppConfigState {
  if (typeof localStorage === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppConfigState>) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

function systemPrefersDark() {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppConfigState>(read)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Follow the OS when theme === 'system'.
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const dir: Dir =
    state.dirSetting === 'auto' ? LOCALES[state.locale].dir : state.dirSetting
  const resolvedTheme = state.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.theme

  // Single place where config touches the DOM. `dir`/`lang` live on <html> so
  // that CSS logical properties, `:lang()` rules and native form controls
  // (date pickers, select popups, spellcheck) all mirror without extra work.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
    root.lang = state.locale
    root.dir = dir
    root.dataset.density = state.density

    // Derive the whole primary ramp from the one brand hex, for this theme.
    const ramp = buildPrimaryRamp(state.primary, resolvedTheme)
    root.style.setProperty('--nx-primary-base', ramp.primary)
    root.style.setProperty('--nx-primary-hover', ramp.hover)
    root.style.setProperty('--nx-primary-active', ramp.active)
    root.style.setProperty('--nx-primary-soft', ramp.soft)
    root.style.setProperty('--nx-primary-ink', ramp.ink)
    root.style.setProperty('--nx-primary-fg', ramp.fg)
    root.style.setProperty('--nx-ring', ramp.ring)

    if (import.meta.env.DEV) {
      const onFill = contrast(ramp.fg, ramp.primary)
      if (onFill < 4.5) {
        console.warn(
          `[theme] label on primary is ${onFill.toFixed(2)}:1 — below AA. Pick a darker or lighter brand colour.`,
        )
      }
    }
  }, [resolvedTheme, state.locale, dir, state.primary, state.density])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, dir }))
    } catch {
      /* private mode — preferences simply don't persist */
    }
  }, [state, dir])

  const set = useCallback<AppConfigContextValue['set']>((key, value) => {
    setState((prev) => {
      const next = { ...prev, [key]: value }
      // Changing language resets an explicit direction override, otherwise
      // switching en → ar would silently keep LTR.
      if (key === 'locale') next.dirSetting = 'auto'
      return next
    })
  }, [])

  const reset = useCallback(() => setState(DEFAULTS), [])

  const value = useMemo<AppConfigContextValue>(
    () => ({ ...state, dir, resolvedTheme, set, reset }),
    [state, dir, resolvedTheme, set, reset],
  )

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext)
  if (!ctx) throw new Error('useAppConfig must be used inside <AppConfigProvider>')
  return ctx
}
