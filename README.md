# NEXORA Admin — React + Tailwind

Implementation of the NEXORA admin Figma sheet: design tokens, component
library, 12 screens, light/dark, and **en / tr / ar with real RTL**.

Read [`ANALYSIS.md`](./ANALYSIS.md) for the design review — the RTL/i18n rules,
the contrast measurements, and the gaps in the sheet that needed product
decisions.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

```bash
npm run build           # tsc --noEmit && vite build
npm run preview         # serve dist on :4173

# gates (need `npm run preview` running for the last two)
npm run verify:logical  # fails on any physical-direction CSS in src/
npm run verify:contrast # measures rendered WCAG AA contrast, 9 pages × 4 modes
npm run verify:shots    # screenshots light/dark × ltr/rtl into shots/
```

`verify:contrast` and `verify:shots` need Playwright's Chromium. If it isn't in
the default location, point at it:
`CHROME_PATH=/path/to/chrome npm run verify:contrast`.

## Stack

React 19 · TypeScript (strict) · Tailwind CSS 4 · React Router 7 · Vite.
No component library, no chart library, no i18n library — see below for why.

## Layout

```
src/
  index.css              token layer: palette → semantic tokens → Tailwind @theme
  providers/AppConfig     theme · direction · locale · brand colour · density
  i18n/
    index.tsx             provider, t(), typed message keys
    message.ts            ICU {count, plural, …} subset over Intl.PluralRules
    format.ts             Intl number / currency / percent / date / range / relative
    locales/{en,tr,ar}    en is the typed source of truth
  lib/color.ts            OKLab mixing + contrast search for the primary ramp
  lib/cn.ts               clsx + tailwind-merge, taught this project's type scale
  components/
    Icon.tsx              one SVG set; mirroring is per-glyph metadata
    ui/                   Button Field Badge Card DataTable Modal Menu Toast …
    charts/               LineChart (+ Sparkline), DonutChart — direction-aware
    layout/               AppShell Sidebar Topbar ListPage
  pages/                  Dashboard Analytics Deals Customers Products Orders
                          Users Roles Settings
  data/mock.ts            the sheet's figures, transcribed
scripts/                  the three verification gates
```

## The four conventions worth knowing before you edit

**1. Semantic tokens only.** No component contains a hex value. `bg-surface`,
`text-fg-muted`, `border-border`, `bg-success-soft`/`text-success-fg`. Dark mode
and the brand-colour picker both work by rewriting variables, so a hardcoded
colour breaks both at once.

**2. Logical properties only.** `ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`,
`border-s`/`border-e`, `text-start`/`text-end`. Component props are
`iconStart`/`iconEnd`; alignment is `'start' | 'end' | 'center'`.
`npm run verify:logical` fails the build on `ml-`, `text-left`, `left-0`,
`translate-x-`, `margin-left:` and friends. If a line genuinely needs a physical
value, annotate it `// rtl-ok: <reason>` — there are currently two.

**3. Format through `useI18n()`.** Never `toLocaleString()`, never string
concatenation for plurals, never a hand-built date range.

```tsx
const { t, fmt, isRtl } = useI18n()

fmt.money(row.amount, row.currency)     // currency is the record's, not the locale's
fmt.dateRange(from, to)                 // Intl collapses the shared year
fmt.relative(timestamp)                 // "2 minutes ago" / "قبل دقيقتين"
t('common.results', { count: n })       // Arabic has six plural categories
t('common.add', { entity: t('entity.customer') })   // singular key, not the plural
```

**4. Free-text data gets `dir="auto"`; identifiers get `.code`.** A customer
name may be Latin, Turkish or Arabic in the same table, so each value takes its
direction from its own content. Order numbers, emails and SKUs are LTR by
definition and use `.code`. Plain figures use `.num`, which isolates and sets
tabular figures but does *not* force direction — a formatted currency string may
legitimately end with an RTL symbol.

## Why no libraries

- **No component library.** The sheet is a complete design system; wrapping and
  overriding someone else's tokens costs more than the ~15 primitives here.
  Swapping in Radix or Base UI for the overlay primitives later is contained to
  `ui/`.
- **No chart library.** Two chart types, and both needed direction-aware axes
  plus a screen-reader table. Hand-rolled SVG is ~250 lines and does exactly
  that; Recharts would need patching for both.
- **No i18n library.** `Intl` covers plurals, dates, numbers, currency and
  collation. `message.ts` is a 90-line ICU subset with the same call shape as
  `intl-messageformat`, so swapping up is mechanical.

## Theming for a tenant

Change one hex:

```ts
config.set('primary', '#0e7490')
```

`buildPrimaryRamp()` derives hover, active, soft, ink and label colour, searching
for a step that clears 4.5:1 rather than assuming one, and writes them onto
`<html>`. Chart series colours deliberately do **not** follow the brand colour —
series identity belongs to the entity, and a hue ramp generated from an arbitrary
brand colour can't be held to a colour-blindness floor.
