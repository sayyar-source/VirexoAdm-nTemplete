import { useI18n } from '@/i18n'
import { ListPage } from '@/components/layout/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Menu } from '@/components/ui/Menu'
import { ENTITY_STATUS_TONE, PRODUCTS, type Product } from '@/data/mock'

export function ProductsPage() {
  const { t, fmt } = useI18n()

  const columns: Column<Product>[] = [
    {
      id: 'name',
      header: t('table.product'),
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <span dir="auto" className="font-medium text-fg">
          {row.name}
        </span>
      ),
    },
    {
      id: 'category',
      header: t('table.category'),
      hideOnMobile: true,
      cell: (row) => <Badge tone="neutral">{row.category}</Badge>,
    },
    {
      id: 'price',
      header: t('table.price'),
      numeric: true,
      sortable: true,
      sortValue: (row) => row.price,
      cell: (row) => fmt.money(row.price, row.currency, { cents: true }),
    },
    {
      id: 'stock',
      header: t('table.stock'),
      numeric: true,
      sortable: true,
      sortValue: (row) => row.stock,
      cell: (row) => (
        // Low stock is flagged with a word, not just a colour.
        <span className={row.stock < 40 ? 'text-warning-fg font-medium' : undefined}>
          {fmt.number(row.stock)}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('table.status'),
      cell: (row) => (
        <Badge tone={ENTITY_STATUS_TONE[row.status]} dot>
          {t(`status.${row.status}`)}
        </Badge>
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
            { id: 'edit', label: t('common.edit'), icon: 'edit' },
            { id: 'delete', label: t('common.delete'), icon: 'trash', tone: 'danger' },
          ]}
        />
      ),
    },
  ]

  return (
    <ListPage
      title={t('nav.products')}
      entityPlural={t('nav.products')}
      entitySingular={t('entity.product')}
      rows={PRODUCTS}
      matches={(row, q) =>
        [row.name, row.category].some((field) => field.toLocaleLowerCase().includes(q))
      }
    >
      {({ rows, query }) => (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          caption={t('nav.products')}
          query={query}
        />
      )}
    </ListPage>
  )
}
