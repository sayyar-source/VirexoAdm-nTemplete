import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { Card } from '@/components/ui/Card'
import { Sparkline } from '@/components/charts/LineChart'
import type { Tone } from '@/components/ui/Badge'

const ICON_TONES: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary-ink',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
  info: 'bg-info-soft text-info-fg',
  neutral: 'bg-neutral-soft text-neutral-fg',
}

/** Figma: the four KPI tiles on the dashboard. */
export function StatTile({
  label,
  value,
  icon,
  tone = 'primary',
  delta,
  trend,
}: {
  label: string
  value: string
  icon: IconName
  tone?: Tone
  /** Signed ratio, e.g. 0.125 for +12.5%. */
  delta?: number
  trend?: number[]
}) {
  const { t, fmt } = useI18n()
  const up = (delta ?? 0) >= 0

  return (
    <Card className="card-p">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn('grid size-9 place-items-center rounded-md', ICON_TONES[tone])}
          aria-hidden="true"
        >
          <Icon name={icon} size={18} />
        </span>
        {trend && <Sparkline values={trend} className="opacity-70" />}
      </div>

      <p className="mt-4 text-caption text-fg-muted">{label}</p>
      <p className="num mt-1 text-h2 font-semibold text-fg">{value}</p>

      {delta !== undefined && (
        <p className="mt-2 flex items-center gap-1.5 text-caption">
          {/* Direction is carried by the icon AND the sign, never colour alone. */}
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              up ? 'text-success-fg' : 'text-danger-fg',
            )}
          >
            <Icon name={up ? 'trendUp' : 'trendDown'} size={13} />
            <span className="num">{fmt.signedPercent(delta)}</span>
          </span>
          <span className="text-fg-subtle">{t('dashboard.vsLastWeek')}</span>
          <span className="sr-only">
            {t(up ? 'dashboard.trendUp' : 'dashboard.trendDown', {
              value: fmt.percent(Math.abs(delta), 1),
            })}
          </span>
        </p>
      )}
    </Card>
  )
}
