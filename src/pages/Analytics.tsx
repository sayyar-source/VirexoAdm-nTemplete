import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/Feedback'
import { LineChart } from '@/components/charts/LineChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { StatTile } from '@/components/StatTile'
import {
  CATEGORY_SLICES,
  KPIS,
  ORDERS,
  ORDER_STATUS_TONE,
  REVENUE_SERIES,
  TENANT_CURRENCY,
  type Order,
} from '@/data/mock'

type Period = 'week' | 'month' | 'quarter'
type LoadState = 'ready' | 'loading' | 'error'

/** Analytics doubles as the state gallery: the Figma sheet draws tables and
 *  charts in one state only (populated, loaded, no errors), so the three states
 *  a real screen spends most of its life in are wired up here to prove the
 *  components handle them. */
export function AnalyticsPage() {
  const { t, fmt } = useI18n()
  const [period, setPeriod] = useState<Period>('week')
  const [state, setState] = useState<LoadState>('ready')

  const columns: Column<Order>[] = [
    { id: 'id', header: t('table.orderId'), code: true, align: 'start', cell: (row) => row.id },
    { id: 'customer', header: t('table.customer'), cell: (row) => <span dir="auto">{row.customer}</span> },
    {
      id: 'status',
      header: t('table.status'),
      cell: (row) => (
        <Badge tone={ORDER_STATUS_TONE[row.status]} dot>
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('nav.analytics')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <SegmentedControl
            label={t('dashboard.thisWeek')}
            size="sm"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'week', label: t('dashboard.thisWeek') },
              { value: 'month', label: t('dashboard.thisMonth') },
              { value: 'quarter', label: t('dashboard.thisQuarter') },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPIS.slice(0, 3).map((kpi) => (
          <StatTile
            key={kpi.id}
            icon={kpi.icon}
            tone={kpi.tone}
            label={t(kpi.labelKey)}
            delta={kpi.delta}
            value={
              kpi.format === 'money'
                ? fmt.money(kpi.value, kpi.currency ?? TENANT_CURRENCY)
                : kpi.format === 'percent'
                  ? fmt.percent(kpi.value)
                  : fmt.number(kpi.value)
            }
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t('dashboard.revenueOverview')} />
          <CardBody>
            <LineChart
              // Slicing by period keeps the chart honest about the control.
              data={period === 'week' ? REVENUE_SERIES : REVENUE_SERIES.slice(0, period === 'month' ? 5 : 3)}
              currency={TENANT_CURRENCY}
              height={260}
              label={t('dashboard.revenueOverview')}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={t('dashboard.salesByCategory')} />
          <CardBody>
            <DonutChart
              currency={TENANT_CURRENCY}
              centerLabel={t('common.total')}
              size={148}
              slices={CATEGORY_SLICES.map((slice) => ({
                id: slice.id,
                value: slice.value,
                slot: slice.slot,
                label: t(slice.labelKey),
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title={t('dashboard.recentOrders')}
          action={
            <SegmentedControl
              label={t('common.loading')}
              size="sm"
              value={state}
              onChange={setState}
              options={[
                { value: 'ready', label: t('status.active') },
                { value: 'loading', label: t('common.loading') },
                { value: 'error', label: t('common.loadFailed') },
              ]}
            />
          }
        />
        <DataTable
          columns={columns}
          rows={ORDERS.slice(0, 4)}
          getRowId={(row) => row.id}
          caption={t('dashboard.recentOrders')}
          state={state}
          onRetry={() => setState('ready')}
        />
      </Card>
    </>
  )
}

export function ReportsPage() {
  const { t } = useI18n()
  return (
    <>
      <PageHeader title={t('nav.reports')} />
      <Card>
        <EmptyState
          icon="reports"
          title={t('common.noResults')}
          body={t('dashboard.subtitle')}
          action={<Button iconStart="plus">{t('common.add', { entity: t('entity.report') })}</Button>}
        />
      </Card>
    </>
  )
}

export function HelpPage() {
  const { t } = useI18n()
  return (
    <>
      <PageHeader title={t('nav.help')} />
      <Card>
        <EmptyState icon="help" title={t('nav.help')} body={t('dashboard.subtitle')} />
      </Card>
    </>
  )
}

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <Card className="mt-10">
      <EmptyState
        icon="alertCircle"
        title="404"
        body={t('common.noResults')}
        action={
          <Link to="/">
            <Button variant="outline">{t('nav.dashboard')}</Button>
          </Link>
        }
      />
    </Card>
  )
}
