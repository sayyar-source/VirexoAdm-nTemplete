import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import {
  PERMISSION_GROUPS,
  ROLE_COUNTS,
  ROLE_PERMISSIONS,
  type PermissionId,
  type RoleId,
} from '@/data/mock'

const ROLE_IDS = Object.keys(ROLE_COUNTS) as RoleId[]

/** Figma: Roles & Permissions — role list on one side, permission matrix on the
 *  other. The mock shows the matrix with no save affordance and no indication
 *  of what happens to the Administrator role's own delete permission; both are
 *  resolved here (explicit Save, and the admin row is locked). */
export function RolesPage() {
  const { t, fmt } = useI18n()
  const toast = useToast()
  const [role, setRole] = useState<RoleId>('administrator')
  const [matrix, setMatrix] = useState<Record<RoleId, PermissionId[]>>(ROLE_PERMISSIONS)
  const [dirty, setDirty] = useState(false)

  const granted = new Set(matrix[role])
  const locked = role === 'administrator'

  const toggle = (permission: PermissionId) => {
    setMatrix((prev) => {
      const next = new Set(prev[role])
      if (next.has(permission)) next.delete(permission)
      else next.add(permission)
      return { ...prev, [role]: [...next] }
    })
    setDirty(true)
  }

  return (
    <>
      <PageHeader title={t('nav.roles')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <Card>
          <CardHeader title={t('roles.roles')} />
          <ul role="radiogroup" aria-label={t('roles.roles')} className="p-2">
            {ROLE_IDS.map((id) => {
              const selected = id === role
              return (
                <li key={id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRole(id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-start',
                      'transition-colors duration-150',
                      selected
                        ? 'bg-primary-soft text-primary-ink'
                        : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    <span className="text-body-sm font-medium">{t(`roles.name.${id}`)}</span>
                    <span className="num text-caption text-fg-muted">
                      {fmt.number(ROLE_COUNTS[id])}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title={t('roles.permissionsFor', { role: t(`roles.name.${role}`) })}
            subtitle={locked ? t('common.required') : undefined}
            action={
              <Button size="sm" disabled={!dirty || locked} onClick={() => {
                setDirty(false)
                toast.push({ tone: 'success', title: t('settings.saved') })
              }}>
                {t('common.save')}
              </Button>
            }
          />
          <CardBody className="space-y-6">
            {PERMISSION_GROUPS.map((group) => (
              <fieldset key={group.group} disabled={locked}>
                <legend className="mb-3 text-caption font-semibold tracking-wide text-fg-subtle uppercase">
                  {t(`roles.group.${group.group}`)}
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((permission) => (
                    <Checkbox
                      key={permission}
                      label={t(`roles.perm.${permission}`)}
                      checked={granted.has(permission)}
                      onChange={() => toggle(permission)}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
