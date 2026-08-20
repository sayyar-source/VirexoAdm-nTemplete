import { useState } from 'react'
import { useI18n } from '@/i18n'
import { ListPage } from '@/components/layout/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Menu } from '@/components/ui/Menu'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { CUSTOMERS, ENTITY_STATUS_TONE, type Customer } from '@/data/mock'

export function CustomersPage({ leadsOnly = false }: { leadsOnly?: boolean }) {
  const { t, fmt } = useI18n()
  const toast = useToast()
  const [rows, setRows] = useState<Customer[]>(CUSTOMERS)
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null)

  const source = leadsOnly ? rows.filter((row) => row.status === 'pending') : rows

  const columns: Column<Customer>[] = [
    {
      id: 'name',
      header: t('table.customer'),
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size={32} />
          <span className="min-w-0">
            {/* dir="auto" per value: this table mixes Latin, Turkish and
                Arabic names, so one document-level direction can't be right
                for all of them. */}
            <span dir="auto" className="block truncate font-medium text-fg">
              {row.name}
            </span>
            <span className="code block truncate text-caption text-fg-subtle md:hidden">
              {row.email}
            </span>
          </span>
        </div>
      ),
    },
    {
      id: 'company',
      header: t('table.company'),
      sortable: true,
      sortValue: (row) => row.company,
      hideOnMobile: true,
      cell: (row) => (
        <span dir="auto" className="text-fg-muted">
          {row.company}
        </span>
      ),
    },
    {
      id: 'email',
      header: t('table.email'),
      hideOnMobile: true,
      // `.code` = tabular + bidi isolate + forced LTR: an address must never
      // be reordered by the surrounding Arabic run.
      cell: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="code text-fg-muted hover:text-primary-ink hover:underline"
        >
          {row.email}
        </a>
      ),
    },
    {
      id: 'orders',
      header: t('table.orders'),
      numeric: true,
      sortable: true,
      sortValue: (row) => row.orders,
      cell: (row) => fmt.number(row.orders),
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
      cell: (row) => (
        <Menu
          label={t('common.actions')}
          items={[
            { id: 'view', label: t('common.view'), icon: 'eye' },
            { id: 'edit', label: t('common.edit'), icon: 'edit' },
            {
              id: 'delete',
              label: t('common.delete'),
              icon: 'trash',
              tone: 'danger',
              onSelect: () => setPendingDelete(row),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <ListPage
        title={leadsOnly ? t('nav.leads') : t('nav.customers')}
        entityPlural={leadsOnly ? t('nav.leads') : t('nav.customers')}
        entitySingular={leadsOnly ? t('entity.lead') : t('entity.customer')}
        rows={source}
        matches={(row, q) =>
          [row.name, row.company, row.email].some((field) =>
            field.toLocaleLowerCase().includes(q),
          )
        }
      >
        {({ rows: visible, query }) => (
          <DataTable
            columns={columns}
            rows={visible}
            getRowId={(row) => row.id}
            caption={t('nav.customers')}
            query={query}
          />
        )}
      </ListPage>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={`${t('common.delete')} — ${pendingDelete?.name ?? ''}`}
        description={t('common.noResultsBody', { query: pendingDelete?.email ?? '' })}
        closeLabel={t('common.close')}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const target = pendingDelete
                setPendingDelete(null)
                if (!target) return
                setRows((prev) => prev.filter((row) => row.id !== target.id))
                toast.push({ tone: 'success', title: `${target.name} — ${t('common.delete')}` })
              }}
            >
              {t('common.confirm')}
            </Button>
          </>
        }
      />
    </>
  )
}
