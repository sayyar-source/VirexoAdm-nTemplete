import type { IconName } from '@/components/Icon'
import type { MessageKey } from '@/i18n'

export interface NavLeaf {
  to: string
  labelKey: MessageKey
  icon?: IconName
  badge?: string
}

export interface NavBranch {
  id: string
  labelKey: MessageKey
  icon: IconName
  children: NavLeaf[]
}

export type NavItem = NavLeaf | NavBranch

export interface NavGroup {
  /** The sheet's sidebar has no group labels; they are added here because a
   *  12-item flat list has no scannable structure. Purely visual — screen
   *  readers get them as <h2>s inside the nav landmark. */
  labelKey: MessageKey
  items: NavItem[]
}

export const isBranch = (item: NavItem): item is NavBranch => 'children' in item

export const NAV: NavGroup[] = [
  {
    labelKey: 'nav.sections.main',
    items: [
      { to: '/', labelKey: 'nav.dashboard', icon: 'dashboard' },
      { to: '/analytics', labelKey: 'nav.analytics', icon: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.sections.workspace',
    items: [
      {
        id: 'crm',
        labelKey: 'nav.crm',
        icon: 'crm',
        children: [
          { to: '/crm/customers', labelKey: 'nav.customers' },
          { to: '/crm/leads', labelKey: 'nav.leads' },
          { to: '/crm/deals', labelKey: 'nav.deals' },
        ],
      },
      { to: '/products', labelKey: 'nav.products', icon: 'products' },
      { to: '/orders', labelKey: 'nav.orders', icon: 'orders' },
      { to: '/reports', labelKey: 'nav.reports', icon: 'reports' },
    ],
  },
  {
    labelKey: 'nav.sections.system',
    items: [
      {
        id: 'users',
        labelKey: 'nav.users',
        icon: 'users',
        children: [
          { to: '/users', labelKey: 'nav.users' },
          { to: '/users/roles', labelKey: 'nav.roles' },
        ],
      },
      { to: '/settings', labelKey: 'nav.settings', icon: 'settings' },
    ],
  },
]

export const FOOTER_NAV: NavLeaf[] = [
  { to: '/help', labelKey: 'nav.help', icon: 'help' },
]
