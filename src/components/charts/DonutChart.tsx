import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useI18n } from '@/i18n'

export interface DonutSlice {
  id: string
  label: string
  value: number
  /** 1-based categorical slot. Fixed per entity, never by rank. */
  slot: 1 | 2 | 3 | 4 | 5
}

const FILL = {
  1: 'fill-chart-1',
  2: 'fill-chart-2',
  3: 'fill-chart-3',
  4: 'fill-chart-4',
  5: 'fill-chart-5',
} as const

const DOT = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  4: 'bg-chart-4',
  5: 'bg-chart-5',
} as const

/**
 * Figma: Dashboard / Sales by Category.
 *
 * Kept as a donut for fidelity with the sheet — defensible at three slices with
 * a labelled legend. Past ~5 categories this should become a horizontal bar
 * chart; arc length stops being comparable.
 *
 * RTL: the ring winds counter-clockwise, so the first (largest) slice still
 * starts at 12 o'clock and grows in the reading direction.
 */
export function DonutChart({
  slices,
  currency,
  size = 168,
  thickness = 26,
  centerLabel,
}: {
  slices: DonutSlice[]
  currency: string
  size?: number
  thickness?: number
  centerLabel: string
}) {
  const { fmt, isRtl } = useI18n()
  const [active, setActive] = useState<string | null>(null)

  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const cx = size / 2
  const cy = size / 2
  const rOuter = size / 2 - 2
  const rInner = rOuter - thickness
  const sign = isRtl ? -1 : 1
  // 2px of surface between segments, expressed as an angle at the mid-radius.
  const gapDeg = (2 / (((rOuter + rInner) / 2) * 2 * Math.PI)) * 360

  let cursor = 0
  const arcs = slices.map((slice) => {
    const sweep = total > 0 ? (slice.value / total) * 360 : 0
    const from = cursor
    const to = cursor + Math.max(sweep - gapDeg, 0.6)
    cursor += sweep
    return { slice, d: ring(cx, cy, rOuter, rInner, sign * from, sign * to) }
  })

  return (
    <figure className="m-0 flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          role="img"
          aria-label={`${centerLabel}: ${fmt.money(total, currency)}`}
          onPointerLeave={() => setActive(null)}
        >
          {arcs.map(({ slice, d }) => (
            <path
              key={slice.id}
              d={d}
              className={cn(
                FILL[slice.slot],
                'transition-opacity duration-150',
                active && active !== slice.id && 'opacity-35',
              )}
              onPointerEnter={() => setActive(slice.id)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-body font-semibold text-fg">
            {fmt.money(total, currency)}
          </span>
          <span className="text-caption text-fg-subtle">{centerLabel}</span>
        </div>
      </div>

      {/* Legend with visible values — the direct-label relief the palette
          checker requires for the low-contrast light-mode slot. */}
      <ul className="min-w-0 flex-1 space-y-3">
        {slices.map((slice) => (
          <li
            key={slice.id}
            className="flex items-start gap-2.5"
            onPointerEnter={() => setActive(slice.id)}
            onPointerLeave={() => setActive(null)}
          >
            <span
              className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', DOT[slice.slot])}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm text-fg">{slice.label}</span>
              <span className="num block text-caption text-fg-subtle">
                {fmt.money(slice.value, currency)} ·{' '}
                {fmt.percent(total > 0 ? slice.value / total : 0, 1)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const
}

function ring(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  from: number,
  to: number,
) {
  const [x0, y0] = polar(cx, cy, rOuter, from)
  const [x1, y1] = polar(cx, cy, rOuter, to)
  const [x2, y2] = polar(cx, cy, rInner, to)
  const [x3, y3] = polar(cx, cy, rInner, from)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  const sweep = to > from ? 1 : 0
  return [
    `M${x0},${y0}`,
    `A${rOuter},${rOuter} 0 ${large} ${sweep} ${x1},${y1}`,
    `L${x2},${y2}`,
    `A${rInner},${rInner} 0 ${large} ${1 - sweep} ${x3},${y3}`,
    'Z',
  ].join(' ')
}
