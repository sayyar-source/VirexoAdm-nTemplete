# NEXORA admin template — analysis & implementation notes

What this document is: the read-out from implementing the Figma sheet as a real
React + Tailwind app, focused on the two things you asked about — **RTL / i18n**
and **feasibility gaps**. Everything marked ✅ is fixed in the code; ⚠️ is a
decision that needs a product answer before it can be finished.

The claims about colour and contrast in here are measured, not estimated. See
[§6 Verification](#6-verification).

---

## 1. Tokens read off the sheet

| Group | Values in the sheet | Where they live in code |
|---|---|---|
| Brand | Primary `#6366F1`, Primary Light `#EEF2FF` | `--nx-primary-base`, `--nx-primary-tint` |
| Status | Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`, Info `#3B82F6` | `--nx-success` … `--nx-info` |
| Neutrals | 50 `#F9FAFB` · 100 `#F3F4F6` · 200 `#E5E7EB` · 300 `#D1D5DB` · 600 `#4B5563` · 900 `#0F172A` | `--nx-neutral-*` (400/500/700/800 interpolated — the sheet skips them but the UI needs them) |
| Type | Inter · H1 32/40 Bold · H2 24/32 SemiBold · H3 20/28 SemiBold · Body 16/24 · Body sm 14/20 · Caption 12/16 | `--text-h1 … --text-caption` |
| Spacing | 8pt grid: 4 8 16 20 24 32 40 48 64 80 96 | Tailwind's default 4px scale covers all of them |
| Radius | 4 · 6 · 8 · 12 · 16 · 20 | `--radius-xs … --radius-2xl` |
| Elevation | Sm · Md · Lg · Xl | `--shadow-sm … --shadow-xl` |

Two structural decisions follow from this:

- **Nothing in a component references a hex.** Components only use semantic
  tokens (`surface`, `border`, `fg-muted`, `primary-soft`, `success-fg`, …).
  That is what makes dark mode a 40-line override block instead of a second
  stylesheet, and what makes the runtime brand-colour picker possible.
- **Dark mode is not the light ramp inverted.** The sheet's dark frames were
  sampled for surfaces (`#0B1120` page, `#111827` card, `#1F2937` border), and
  every ink and every "soft" fill was then re-derived against those surfaces —
  because the naive inversion is measurably wrong (§4.2).

---

## 2. Component inventory → code

| Sheet | File | Notes |
|---|---|---|
| Buttons (Primary/Hover/Secondary/Outline/Ghost/Danger) | `ui/Button.tsx` | + `loading`, `block`, `IconButton` (which *requires* a label) |
| Inputs (Default/Focus/Filled/Disabled/Error), Select, Checkbox, Radio, Switch | `ui/Field.tsx` | + label / hint / error slots, which the sheet has no place for |
| Badge, Avatar | `ui/Badge.tsx` | `dot` gives status a second, non-colour channel |
| Table | `ui/DataTable.tsx` | generic, locale-aware sorting, `loading`/`error`/`empty` states |
| Card, Modal, Alert / Toast | `ui/Card.tsx`, `ui/Modal.tsx`, `ui/Feedback.tsx`, `ui/Toast.tsx` | Modal is a native `<dialog>` |
| Sidebar, Topbar, Mobile drawer, Mobile tab bar | `layout/` | |
| Dashboard, CRM pipeline, Customers, Leads, Products, Orders, Users, Roles, Settings/Appearance | `pages/` | 12 routes |
| Revenue line chart, Sales donut | `charts/` | hand-rolled SVG, no chart dependency |
| — (added) | `ui/SegmentedControl.tsx`, `ui/Pagination.tsx`, `ui/Menu.tsx`, `EmptyState`, `ErrorState`, `Skeleton` | pieces the screens imply but the sheet doesn't draw |

---

## 3. RTL & i18n

The app ships **en / tr / ar**. `dir` and `lang` are set on `<html>` from the
locale (with a blocking inline script so there is no flash), and Arabic is a
first-class locale rather than a mirrored afterthought.

### 3.1 The rules the code follows

1. **Logical properties only.** `ps-/pe-`, `ms-/me-`, `start-/end-`,
   `border-s/-e`, `rounded-s/-e`, `text-start/-end`. Props are named
   `iconStart`/`iconEnd`, and `Column.align` is `'start' | 'end' | 'center'` —
   there is no `left` in the API. Enforced by `npm run verify:logical`, which
   fails the build on `ml-`, `text-left`, `left-0`, `translate-x-`,
   `margin-left:` and friends. Exactly **two** exceptions exist, both annotated
   `rtl-ok`: the off-canvas drawer slide (a transform has no logical form, so it
   carries an `rtl:` variant) and the chart tooltip (positioned in visual pixels
   after direction was already resolved).
2. **Mirroring is a property of the glyph, not of the layout.** `Icon.tsx`
   carries a `MIRRORED` set: chevrons, the logout arrow, trend arrows, the
   activity pulse and the magnifier flip; the logo, the clock, media controls,
   avatars and the 👋 emoji do not.
3. **Direction handling is centralised per component.** In `LineChart` the whole
   RTL story is one function, `xFor()` — a time axis reads in the reading
   direction, so in RTL the earliest day sits on the right. `DonutChart` winds
   counter-clockwise so the first slice still starts at 12 o'clock and grows
   with the text. The sparklines mirror too.
4. **Rotation beats mirroring.** The collapsible-nav chevron uses
   `rotate-180`, which needs no RTL case at all.

### 3.2 What actually breaks in RTL (and is fixed)

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 ✅ | `Acme Inc.` renders as `.Acme Inc` | trailing full stop is bidi-neutral, so it snaps to the paragraph's leading edge | `dir="auto"` on every free-text data value (names, companies, deal titles) |
| 2 ✅ | `#10231` renders as `10231#` | the `#` is neutral too | `.code` utility: `unicode-bidi: isolate; direction: ltr` for identifiers, emails, SKUs |
| 3 ✅ | Currency symbol lands on the wrong side | the *opposite* mistake — forcing LTR on a whole money string breaks `١٢٣ د.إ.` | `.num` isolates and sets tabular figures but deliberately does **not** force direction |
| 4 ✅ | Arabic shows `٠١٢` where the mock shows `0`–`9` | `ar` defaults to `arab` numerals | `latn` is the shipped default via `ar-u-nu-latn`, with a Settings toggle — a real product decision, now explicit |
| 5 ✅ | `"May 12 – May 18, 2024"` | the mock hardcodes an en-US range pattern | `Intl.DateTimeFormat.formatRange` → `12–18 Mayıs 2024`, `١٢–١٨ مايو ٢٠٢٤`; it also collapses the shared year for you |
| 6 ✅ | `"8 results"` pluralised with `count === 1` | Arabic has **six** CLDR plural categories, Turkish has one | `Intl.PluralRules` + a small ICU `{count, plural, …}` formatter (`i18n/message.ts`) |
| 7 ✅ | `"Müşteriler Ekle"` ("Add Customers") | the plural noun was interpolated into `Add {entity}` | separate singular `entity.*` keys; number and case are grammar, not concatenation |
| 8 ✅ | Turkish/Arabic names sort wrongly | `a < b` doesn't know `ı`/`i`/`İ` | `Intl.Collator(locale, { numeric: true })` in `DataTable` |
| 9 ✅ | Arabic renders in a fallback face | Inter has **no Arabic coverage** | IBM Plex Sans Arabic is self-hosted alongside Inter, and `:lang(ar)` gets 1.7 line-height — the sheet's 14/20 is too tight for Arabic |
| 10 ✅ | Chip and axis labels clip | `"LTR"` (3 chars) is `"Soldan sağa"` (11) in Turkish; `"$140K"` is `"140 ألف US$"` in Arabic | the segmented control never pins a chip width, and the chart's axis gutter is measured from the actual formatted labels |
| 11 ✅ | Drawer slides in from the wrong edge | `translate-x` is physical | `-translate-x-full rtl:translate-x-full` (the annotated exception) |
| 12 ✅ | Row-action menu opens off-screen | `right-0` popover | `end-0` |

### 3.3 The one that isn't a bug in the code — it's in the data model

**Currency belongs to the record, not to the viewer.** The mock shows `$` on
every figure, which quietly implies "currency = locale". A Turkish user looking
at a US customer's order must still see `$240.00`, not `₺240,00`. So amounts are
modelled as `{ amount, currency }` and formatted as
`fmt.money(row.amount, row.currency)` — the locale controls grouping, decimal
separator and symbol *placement*; the record controls the symbol. `LOCALES` also
carries a `defaultCurrency` for figures the tenant reports in its own currency.

---

## 4. Feasibility gaps in the sheet

The design draws the happy path in one state. These are the things that stop it
being shippable, in rough order of how much work they hide.

### 4.1 Missing states (⚠️ → ✅ scaffolded)

No frame in the sheet shows a table or chart that is **loading, empty, errored,
or permission-denied**, and there is no zero/one-row case. Those states are most
of a real admin panel's life. Implemented: `TableSkeleton`, `EmptyState` (with
the search term echoed back and a "clear filters" affordance), `ErrorState` with
retry, and a state switcher on the Analytics page so you can see all three.
Still needed from product: what a user without `viewProducts` sees — an empty
table, a hidden nav item, or a 403 page.

### 4.2 Contrast — measured, and mostly failing as drawn

| As drawn | Measured | Required |
|---|---|---|
| `Pending` badge: `#F59E0B` on `#FFFBEB` | **2.07:1** | 4.5:1 |
| `Completed` badge: `#10B981` on `#ECFDF5` | **2.41:1** | 4.5:1 |
| `Processing`: `#3B82F6` on `#EFF6FF` | **3.38:1** | 4.5:1 |
| `Cancelled`: `#EF4444` on `#FEF2F2` | **3.44:1** | 4.5:1 |
| Tertiary text `#9CA3AF` on white (timestamps, captions, axis labels) | **2.54:1** | 4.5:1 |
| White label on Primary `#6366F1` | **4.47:1** | 4.5:1 |
| 6 of the 8 Primary-Color swatches, with a white label | 2.15–4.23:1 | 4.5:1 |

Fixes, all of them token-level:

- Each status pill keeps the sheet's fill but gets an ink step **searched** until
  it clears 4.5:1 (`#9b6204` on `#fff0e0` = 4.54:1, and so on). The fills barely
  move; the text becomes legible.
- Tertiary text drops one step to `#6B7280` (4.83:1). Note this does **not**
  invert: `#6B7280` is only 3.67:1 on the dark surface, while `#9CA3AF` is
  6.99:1 there. Each mode picks its own step.
- Primary shifts to `#5457E0` (5.50:1 both directions) — visually
  indistinguishable from `#6366F1`, which stays as chart slot 1 where the bar
  for a graphical object is 3:1, not 4.5:1.
- The swatch row ships the 600/700 step of the same eight hues (all ≥ 4.83:1),
  and `buildPrimaryRamp()` derives hover/active/soft/**ink**/label from whatever
  brand hex it is given, searching for a passing step rather than assuming one.
  A tenant colour that still can't carry a label logs a dev warning.
- `--nx-primary-ink` exists separately from `--nx-primary` because the fill and
  the text cannot be the same colour in both modes: `#5457E0` is 5.5:1 on white
  but 3.2:1 on `#111827`, so dark mode inks at `#7B88EC`.

### 4.3 Accessibility the sheet has no layer for (✅)

- **No focus-visible state anywhere.** Added as a project-wide default, so no
  component can forget it.
- **No skip link**, in a shell with a 12-item sidebar. Added.
- **Icon-only buttons with no name.** `IconButton` makes `label` required.
- **The kanban implies drag-and-drop**, which is not operable by keyboard or
  screen reader. The authoritative interaction is a per-card
  *"Move to <stage>"* menu; a pointer-drag layer can sit on top of the same
  `move()` call, never instead of it.
- **Modal** is a native `<dialog>` (focus trap, focus restore, Esc, inert
  background, top layer) rather than a positioned div.
- **Charts** get `role="img"` with a summary, plus a screen-reader table of the
  same numbers. Legends carry visible values, so identity is never colour-only.
- **Toasts** live in an `aria-live="polite"` region; errors persist until
  dismissed, confirmations time out.
- Horizontally scrolling tables are focusable regions, or keyboard users cannot
  reach the overflowing columns.

### 4.4 Data problems in the mock (⚠️ product decisions)

These are worth raising with whoever authored the numbers, because they indicate
missing definitions rather than typos:

1. **The donut doesn't add up to the KPI.** Product 72,450 + Service 38,430 +
   Subscription 17,570 = **128,450**, but the Revenue tile reads **128,430** —
   a $20 gap. And the sheet's `28.9%` for Service matches neither total
   (38,430 / 128,430 = 29.9%). Consequence for the build: **percentages are
   computed from values at render time, never authored.** If the real numbers
   legitimately differ, the dashboard needs to say why (excluded refunds? a
   different period?).
2. **Stage counts contradict the cards.** "Lead (12)" sits above 3 cards. Is the
   header the total in the stage (so the column is paginated / lazy-loaded, and
   needs a "load more") or the loaded count (so the label is wrong)? The
   implementation currently derives the count from the loaded cards.
3. **Role counts don't reconcile with the user list** (5 + 12 + 12 + 4 + 25 = 58
   users vs 5 rows), and Manager and Editor are both 12.
4. **`Pending` means two different things** — an order state and a customer
   state — and they share a colour. Fine visually, but they need separate
   enums, or filters will collide.

### 4.5 Interaction and layout gaps (⚠️)

- **Density (Default / Compact / Wide) has no spec.** Mapped here to row
  padding, card padding, page max-width and gutter (`--nx-row-y`, `--nx-card-p`,
  `--nx-page-max`, `--nx-gutter`). If it was meant to change font size or column
  count, that's a different implementation.
- **Appearance has no Save/Reset**, so instant-apply vs explicit-save is
  undefined. Chosen: appearance applies instantly (it's reversible and personal);
  the permission matrix requires an explicit Save (it isn't).
- **No tablet frame.** The sheet has desktop (≈1440) and mobile (390) only, and
  the sidebar (264px) + content (1152px) implies a ≈1180px minimum. 768–1024px
  is where admin panels actually get used; handled here at the `lg` breakpoint
  but it hasn't been designed.
- **Tables have no sort, selection, or bulk actions** drawn, and six columns
  don't fit 390px. Implemented: sortable headers with `aria-sort`, a
  `hideOnMobile` flag that folds secondary fields into the primary cell.
  Row selection + bulk bar is stubbed out, not built.
- **Pagination shows `1 2 3 … 10` with no totals.** Added
  "Showing 1–6 of 8", and the arrows use mirrored glyphs so "previous" points
  backwards in reading order rather than always pointing left.
- **The permission matrix has no dependency rules** (Delete surely implies View)
  and nothing stops an administrator removing their own access. The
  Administrator row is locked here; the implication graph is a product decision.
- **Search has no scope, debounce, loading state, or shortcut**, and the topbar
  and per-table searches look identical while doing different things.
- **The notification dot has no count and no live region.**
- **The sticky topbar was translucent** (`bg-surface/85` + blur). Its text
  contrast then depends on whatever scrolls underneath, which cannot be
  guaranteed — so it is opaque here.

### 4.6 Chart-specific

- **Chart colour must not follow the brand picker.** The sheet implies the donut
  is tinted from Primary; if a tenant picks red, a three-hue ramp generated from
  red collapses. Series colour follows the *entity*, so `--nx-chart-1…5` are
  fixed and validated independently — slot 1 merely starts at the mock's indigo.
- The five-slot categorical palette passes a colour-blindness separation check
  in both modes (see §6). Slot 3 is below 3:1 on white, so every chart using it
  ships visible value labels and a table view.
- The donut is defensible at three slices with a labelled legend. Past ~5
  categories it should become a horizontal bar chart — arc length stops being
  comparable.

### 4.7 Deviations from the mock, deliberate

| Change | Why |
|---|---|
| Sidebar gains `MAIN / WORKSPACE / SYSTEM` group headings | a flat 12-item list has nothing to scan by |
| Topbar's `+` quick-add replaced by a theme toggle and a language menu | the sheet has dark and RTL frames but no control that reaches them |
| KPI tiles gain a sparkline | the delta says "+12.5%" without saying *of what shape* |
| Primary `#6366F1` → `#5457E0`, tertiary grey one step darker, status inks re-derived | contrast (§4.2) |
| Settings gear glyph → sliders | the sheet's gear and the theme-toggle sun are the same shape at 18px |
| Fonts self-hosted, not a Google Fonts `<link>` | no third-party request at runtime; and Arabic needs its own face |

---

## 5. Non-obvious implementation gotchas

- **`tailwind-merge` needs to be told about a custom type scale.** Out of the
  box it cannot distinguish `text-body-sm` (a size) from `text-primary-fg` (a
  colour) — both are `text-*` with a non-standard value — so it treats them as
  one group and the later class silently deletes the earlier one. The live
  symptom was `<Button variant="primary">` losing its label colour and
  inheriting body ink: a 3.24:1 label on an indigo fill, in every primary
  button. Fixed by declaring the `font-size` group in `lib/cn.ts`. Worth knowing
  before you extend the theme.
- **Tailwind's opacity modifier compiles to `color-mix()`**, so `bg-surface/85`
  has no resolvable computed colour — which both defeats contrast auditing and
  means the real contrast depends on what's behind it.
- **The primary ramp is computed in TS, not in CSS**, because a `color-mix()`
  can't *search* for the first step that clears 4.5:1. `lib/color.ts` does the
  OKLab maths and writes plain hex back onto `<html>`.
- `dir`/`lang` on `<html>` (not on a wrapper div) is what makes native form
  controls, `select` popups, date pickers and spellcheck mirror for free.

---

## 6. Verification

Everything below was run against the production build.

```
npm run typecheck        → clean (TypeScript strict, noUnusedLocals)
npm run build            → clean
npm run verify:logical   → 44 files scanned, 0 physical-direction usages
npm run verify:contrast  → 2,416 rendered text nodes across 9 pages × 4 modes
                           (light/en, dark/en, light/ar, dark/tr)
                           → 0 WCAG 2.2 AA failures
npm run verify:shots     → 12 screenshots, 0 console errors
```

`verify:contrast` reads colours back off the *rendered layout* (walking
ancestors to composite the effective background, and using `fill` for SVG text),
so it measures what a user sees rather than what the tokens intend.

The categorical chart palette was validated separately for lightness band,
chroma floor, colour-blind separation (deutan/protan/tritan ΔE in OKLab×100),
and contrast against each mode's own surface:

```
light (surface #ffffff): worst adjacent CVD ΔE 9.1 · worst normal-vision ΔE 19.6
dark  (surface #111827): worst adjacent CVD ΔE 8.4 · worst normal-vision ΔE 19.3
first three slots also pass all-pairs in both modes
```

Screenshots are in `shots/` — dashboard, deals, customers, roles and settings in
light/dark × en/tr/ar, plus the mobile drawer in RTL.

---

## 7. What is not built

Deliberately out of scope, in the order I'd do them next:

1. **Data layer.** Everything reads `data/mock.ts`. No fetching, caching,
   optimistic updates or error taxonomy.
2. **Forms.** The field primitives exist with error slots, but there is no
   validation schema, no submit/dirty/reset handling, no create/edit drawer.
3. **Auth.** No login, session, or route guards; the permission matrix is UI only.
4. **Row selection + bulk actions**, saved filter chips, column visibility.
5. **Kanban pointer drag** on top of the existing keyboard-accessible `move()`.
6. **Tests.** No unit or e2e tests; the three `verify:*` scripts are the only
   automated gates.
7. **Locale code-splitting.** Three dictionaries ship in the main bundle; past
   ~5 locales they should be dynamic imports (the provider API doesn't change).
