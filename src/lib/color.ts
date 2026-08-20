/**
 * Perceptual colour maths for the runtime theme.
 *
 * Why this exists rather than `color-mix(in oklab, …)` in CSS: the primary
 * ramp has to satisfy a *measurable* constraint — the text drawn on
 * `primary-soft` must clear 4.5:1 — and CSS cannot search for a value. The
 * ramp is therefore derived here, where the loop can stop at the first step
 * that passes, and the result is written back as plain hex custom properties.
 * A side benefit: computed styles resolve to rgb(), so `scripts/contrast.mjs`
 * can audit them.
 */

type Triplet = [number, number, number]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function hexToRgb(hex: string): Triplet {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ]
}

const rgbToHex = (rgb: Triplet) =>
  '#' +
  rgb
    .map((c) =>
      Math.round(clamp01(c) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toSrgb = (v: number) =>
  clamp01(v) <= 0.0031308 ? clamp01(v) * 12.92 : 1.055 * clamp01(v) ** (1 / 2.4) - 0.055

function linearToOklab([r, g, b]: Triplet): Triplet {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear([L, a, b]: Triplet): Triplet {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

/** Perceptually even blend, the same model `color-mix(in oklab, …)` uses. */
export function mix(a: string, b: string, t: number): string {
  const la = linearToOklab(hexToRgb(a).map(toLinear) as Triplet)
  const lb = linearToOklab(hexToRgb(b).map(toLinear) as Triplet)
  const blended = la.map((v, i) => v * (1 - t) + lb[i]! * t) as Triplet
  return rgbToHex(oklabToLinear(blended).map(toSrgb) as Triplet)
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as Triplet
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Whichever of white / near-black reads better on `background`. */
export const bestInk = (background: string) =>
  contrast('#ffffff', background) >= contrast('#0f172a', background) ? '#ffffff' : '#0f172a'

/** Walk `base` toward black or white until it clears `target` on every bg. */
function snapTo(base: string, backgrounds: string[], target = 4.5): string {
  const toward = luminance(backgrounds[0]!) > 0.18 ? '#000000' : '#ffffff'
  for (let step = 0; step <= 100; step++) {
    const candidate = mix(base, toward, step / 100)
    if (backgrounds.every((bg) => contrast(candidate, bg) >= target)) return candidate
  }
  return toward
}

export interface PrimaryRamp {
  primary: string
  hover: string
  active: string
  soft: string
  /** Text colour for primary-coloured links and text on `soft`. */
  ink: string
  /** Label colour on a solid `primary` fill. */
  fg: string
  ring: string
}

/**
 * Build the full primary ramp for one theme from a single brand hex.
 * `ink` is searched, not assumed: indigo #5457e0 is 5.5:1 on white but only
 * 3.2:1 on the dark surface, so dark mode needs a lighter step (#7b88ec).
 */
export function buildPrimaryRamp(base: string, mode: 'light' | 'dark'): PrimaryRamp {
  const surfaces =
    mode === 'light' ? ['#ffffff', '#f9fafb'] : ['#111827', '#0b1120']
  const soft = mode === 'light' ? mix(base, '#ffffff', 0.9) : mix(base, '#111827', 0.78)
  const [r, g, b] = hexToRgb(base).map((c) => Math.round(c * 255))

  return {
    primary: base,
    hover: mode === 'light' ? mix(base, '#000000', 0.16) : mix(base, '#ffffff', 0.14),
    active: mode === 'light' ? mix(base, '#000000', 0.28) : base,
    soft,
    ink: snapTo(base, [...surfaces, soft]),
    fg: bestInk(base),
    ring: `rgb(${r} ${g} ${b} / 0.32)`,
  }
}
