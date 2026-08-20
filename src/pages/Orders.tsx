import { useI18n } from '@/i18n'
import { ListPage } from '@/components/layout/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Menu } from '@/components/ui/Menu'
import { ORDERS, ORDER_STATUS_TONE, type Order } from '@/data/mock'

export function OrdersPage() {
  const { t, fmt } = useI18n()

  const columns: Column<Order>[] = [
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
      cell: (row) => (
        <time dateTime={row.date} className="text-fg-muted">
          {fmt.date(row.date)}
        </time>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      width: '4rem',
      cell: () => (
        <Menu
          label={t('common.actions')}
          items={[
            { id: 'view', label: t('common.view'), icon: 'eye' },
            { id: 'edit', label: t('common.edit'), icon: 'edit' },
          ]}
        />
      ),
    },
  ]

  return (
    <ListPage
      title={t('nav.orders')}
      entityPlural={t('nav.orders')}
      entitySingular={t('entity.order')}
      rows={ORDERS}
      matches={(row, q) =>
        [row.id, row.customer].some((field) => field.toLocaleLowerCase().includes(q))
      }
    >
      {({ rows, query }) => (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          caption={t('nav.orders')}
          query={query}
        />
      )}
    </ListPage>
  )
}
