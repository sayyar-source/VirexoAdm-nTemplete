import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout/AppShell'
import { StatTile } from '@/components/StatTile'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { LineChart } from '@/components/charts/LineChart'
import { DonutChart } from '@/components/charts/DonutChart'
import {
  ACTIVITIES,
  CATEGORY_SLICES,
  CURRENT_USER,
  DATE_RANGE,
  KPIS,
  ORDERS,
  ORDER_STATUS_TONE,
  REVENUE_SERIES,
  TENANT_CURRENCY,
  type Order,
} from '@/data/mock'

export function DashboardPage() {
  const { t, fmt } = useI18n()

  const hour = new Date().getHours()
  const greetingKey =
    hour < 12
      ? 'dashboard.greeting.morning'
      : hour < 18
        ? 'dashboard.greeting.afternoon'
        : 'dashboard.greeting.evening'

  const orderColumns: Column<Order>[] = [
    {
      id: 'id',
      header: t('table.orderId'),
      code: true,
      align: 'start',
      sortable: true,
      sortValue: (row) => row.id,
      cell: (row) => <span className="font-medium text-fg">{row.id}</span>,
    },
    {
      id: 'customer',
      header: t('table.customer'),
      sortable: true,
      sortValue: (row) => row.customer,
      // dir="auto" isolates the value and takes its direction from its own
      // first strong character, so "Acme Inc." keeps its full stop at the end
      // inside an Arabic table. Every free-text data cell needs this.
      cell: (row) => <span dir="auto">{row.customer}</span>,
    },
    {
      id: 'amount',
      header: t('table.amount'),
      numeric: true,
      sortable: true,
      sortValue: (row) => row.amount,
      cell: (row) => fmt.money(row.amount, row.currency, { cents: true }),
    },
    {
      id: 'status',
      header: t('table.status'),
      cell: (row) => (
        <Badge tone={ORDER_STATUS_TONE[row.status]} dot>
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
    {
      id: 'date',
      header: t('table.date'),
      hideOnMobile: true,
      sortable: true,
      sortValue: (row) => row.date,
      cell: (row) => <span className="text-fg-muted">{fmt.date(row.date)}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        title={
          <>
            {t(greetingKey, { name: CURRENT_USER.name })}{' '}
            {/* Emoji is content, not an icon — it must not mirror. */}
            <span aria-hidden="true">👋</span>
          </>
        }
        subtitle={t('dashboard.subtitle')}
        actions={
          <Button variant="outline" iconStart="calendar" iconEnd="chevronDown">
            <span className="num">{fmt.dateRange(DATE_RANGE.from, DATE_RANGE.to)}</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <StatTile
            key={kpi.id}
            icon={kpi.icon}
            tone={kpi.tone}
            label={t(kpi.labelKey)}
            delta={kpi.delta}
            trend={kpi.trend}
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
          <CardHeader
            title={t('dashboard.revenueOverview')}
            action={
              <Button variant="ghost" size="sm" iconEnd="chevronDown">
                {t('dashboard.thisWeek')}
              </Button>
            }
          />
          <CardBody>
            <LineChart
              data={REVENUE_SERIES}
              currency={TENANT_CURRENCY}
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t('dashboard.recentOrders')}
            action={
              <Link
                to="/orders"
                className="flex items-center gap-1 rounded-xs text-caption font-medium text-primary-ink hover:underline"
              >
                {t('common.viewAll')}
                <Icon name="chevronEnd" size={13} />
              </Link>
            }
          />
          <DataTable
            columns={orderColumns}
            rows={ORDERS.slice(0, 5)}
            getRowId={(row) => row.id}
            caption={t('dashboard.recentOrders')}
          />
        </Card>

        <Card>
          <CardHeader title={t('dashboard.activities')} />
          <CardBody>
            <ol className="space-y-4">
              {ACTIVITIES.map((entry) => {
                const when = new Date(Date.now() - entry.minutesAgo * 60_000)
                const values = { ...entry.values }
                if (typeof values.amount === 'number') {
                  values.amount = fmt.money(values.amount, TENANT_CURRENCY, { cents: true })
                }
                return (
                  <li key={entry.id} className="flex gap-3">
                    <span className="relative mt-1.5 flex flex-col items-center">
                      <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                      <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 pb-1">
                      <span className="block text-body-sm text-fg">
                        {t(entry.messageKey, values)}
                      </span>
                      {/* <time> + Intl.RelativeTimeFormat: "2 minutes ago"
                          localises, and the datetime attribute stays machine
                          readable. */}
                      <time
                        dateTime={when.toISOString()}
                        className="mt-0.5 block text-caption text-fg-subtle"
                      >
                        {fmt.relative(when)}
                      </time>
                    </span>
                  </li>
                )
              })}
            </ol>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
