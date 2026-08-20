import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import { useElementSize } from '@/lib/useElementSize'
import { useI18n } from '@/i18n'

export interface LinePoint {
  /** ISO date — formatting is the chart's job, not the data's. */
  date: string
  value: number
}

/**
 * Figma: Dashboard / Revenue Overview.
 *
 * Single series, so no legend — the card title names it. Direction handling is
 * confined to one function, `xFor()`: a time axis reads in the *reading*
 * direction, so in RTL the earliest point sits on the right. Everything else
 * (tick labels, tooltip, crosshair) is computed in visual pixels from that.
 */
export function LineChart({
  data,
  currency,
  height = 220,
  label,
}: {
  data: LinePoint[]
  currency: string
  height?: number
  label: string
}) {
  const { fmt, isRtl, t } = useI18n()
  const [ref, { width }] = useElementSize<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const gradientId = useId()

  const PAD_TOP = 14
  const PAD_BOTTOM = 26
  const EDGE = 10

  const n = data.length
  const values = data.map((d) => d.value)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  // Round the domain out to a readable step so the ticks are round numbers.
  const step = niceStep((max - min || max || 1) / 4)
  const domainMax = Math.ceil(max / step) * step
  const domainMin = Math.floor(min / step) * step
  const ticks: number[] = []
  for (let v = domainMin; v <= domainMax + 1e-9; v += step) ticks.push(v)

  // The axis gutter cannot be a constant: "$140K" is 5 characters, its Arabic
  // equivalent "140 ألف US$" is 11. Size the gutter from the actual labels.
  const tickLabels = ticks.map((tick) => fmt.money(tick, currency, { compact: true }))
  const AXIS = Math.min(
    120,
    Math.max(46, 14 + Math.max(...tickLabels.map((label) => label.length)) * 6.5),
  )

  const plotStart = isRtl ? EDGE : AXIS
  const plotEnd = width - (isRtl ? AXIS : EDGE)
  const plotTop = PAD_TOP
  const plotBottom = height - PAD_BOTTOM

  const xFor = (index: number) => {
    const t = n <= 1 ? 0.5 : index / (n - 1)
    const traversed = isRtl ? 1 - t : t
    return plotStart + traversed * (plotEnd - plotStart)
  }
  const yFor = (value: number) =>
    plotBottom - ((value - domainMin) / (domainMax - domainMin || 1)) * (plotBottom - plotTop)

  const linePath = data
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${xFor(index)},${yFor(point.value)}`)
    .join(' ')
  const areaPath =
    n > 0
      ? `${linePath} L${xFor(n - 1)},${plotBottom} L${xFor(0)},${plotBottom} Z`
      : ''

  const activePoint = active === null ? null : data[active]
  const ready = width > 0

  return (
    <figure className="m-0">
      <div ref={ref} className="relative w-full" style={{ height }}>
        {ready && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${label}. ${fmt.money(values[n - 1] ?? 0, currency)}`}
            className="overflow-visible text-chart-1"
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Recessive hairline grid; no vertical rules. */}
            {ticks.map((tick, tickIndex) => (
              <g key={tick}>
                <line
                  x1={isRtl ? EDGE : AXIS}
                  x2={width - (isRtl ? AXIS : EDGE)}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  className="stroke-chart-grid"
                  strokeWidth={1}
                />
                <text
                  x={isRtl ? width - AXIS / 2 : AXIS / 2}
                  y={yFor(tick)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-fg-subtle text-[0.6875rem]"
                >
                  {tickLabels[tickIndex]}
                </text>
              </g>
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((point, index) => (
              <text
                key={point.date}
                x={xFor(index)}
                y={height - 8}
                textAnchor="middle"
                className="fill-fg-subtle text-[0.6875rem]"
              >
                {fmt.date(point.date, 'short')}
              </text>
            ))}

            {/* Crosshair + marker for the hovered point. */}
            {active !== null && activePoint && (
              <g>
                <line
                  x1={xFor(active)}
                  x2={xFor(active)}
                  y1={plotTop}
                  y2={plotBottom}
                  className="stroke-border-strong"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={xFor(active)}
                  cy={yFor(activePoint.value)}
                  r={5}
                  fill="currentColor"
                  className="stroke-surface"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Hit targets are a full column each — much bigger than the mark. */}
            {data.map((point, index) => {
              const half = (plotEnd - plotStart) / Math.max(n - 1, 1) / 2
              return (
                <rect
                  key={`hit-${point.date}`}
                  x={xFor(index) - half}
                  y={plotTop}
                  width={half * 2}
                  height={plotBottom - plotTop}
                  fill="transparent"
                  onPointerEnter={() => setActive(index)}
                />
              )
            })}
          </svg>
        )}

        {/* Tooltip lives in HTML (readable text, no SVG font quirks). It is
            positioned in *visual* pixels — physical `left` is correct in both
            directions because xFor() already resolved reading order. */}
        {active !== null && activePoint && (
          <div
            className={/* rtl-ok: visual-pixel overlay, see comment above */ 'pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-1.5 shadow-lg'}
            style={/* rtl-ok */ { left: xFor(active), top: Math.max(yFor(activePoint.value) - 54, 0) }}
          >
            <p className="text-[0.6875rem] text-fg-subtle">{fmt.date(activePoint.date)}</p>
            <p className="num text-body-sm font-semibold text-fg">
              {fmt.money(activePoint.value, currency)}
            </p>
          </div>
        )}
      </div>

      {/* Table view — the non-visual equivalent, always present. */}
      <figcaption className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{t('table.date')}</th>
              <th scope="col">{t('table.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.date}>
                <th scope="row">{fmt.date(point.date)}</th>
                <td>{fmt.money(point.value, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

function niceStep(rough: number) {
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const snapped = normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1
  return snapped * magnitude
}

/** Compact one-series line for the mobile KPI cards. */
export function Sparkline({
  values,
  className,
  width = 96,
  height = 28,
}: {
  values: number[]
  className?: string
  width?: number
  height?: number
}) {
  const { isRtl } = useI18n()
  const max = Math.max(...values)
  const min = Math.min(...values)
  const path = values
    .map((value, index) => {
      const t = index / Math.max(values.length - 1, 1)
      const x = (isRtl ? 1 - t : t) * width
      const y = height - ((value - min) / (max - min || 1)) * height
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} className={cn('text-chart-1', className)} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}
