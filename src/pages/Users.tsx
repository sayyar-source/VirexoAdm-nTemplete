import { useI18n } from '@/i18n'
import { ListPage } from '@/components/layout/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar, Badge } from '@/components/ui/Badge'
import { Menu } from '@/components/ui/Menu'
import { ENTITY_STATUS_TONE, USERS, type AppUser } from '@/data/mock'

export function UsersPage() {
  const { t } = useI18n()

  const columns: Column<AppUser>[] = [
    {
      id: 'name',
      header: t('table.user'),
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size={32} />
          <span dir="auto" className="font-medium text-fg">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      id: 'email',
      header: t('table.email'),
      hideOnMobile: true,
      cell: (row) => (
        <span className="code text-fg-muted">{row.email}</span>
      ),
    },
    {
      id: 'role',
      header: t('table.role'),
      sortable: true,
      sortValue: (row) => row.role,
      cell: (row) => <Badge tone="primary">{t(`roles.name.${row.role}`)}</Badge>,
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
      title={t('nav.users')}
      entityPlural={t('nav.users')}
      entitySingular={t('entity.user')}
      rows={USERS}
      matches={(row, q) =>
        [row.name, row.email].some((field) => field.toLocaleLowerCase().includes(q))
      }
    >
      {({ rows, query }) => (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          caption={t('nav.users')}
          query={query}
        />
      )}
    </ListPage>
  )
}
