import type { Tone } from '@/components/ui/Badge'
import type { MessageKey } from '@/i18n'
import type { DonutSlice } from '@/components/charts/DonutChart'
import type { LinePoint } from '@/components/charts/LineChart'

/* Figures transcribed from the Figma frames so the implementation can be
   compared against the mock 1:1. Every amount carries its own currency code —
   money is a property of the record, not of the viewer's locale. */

export const TENANT_CURRENCY = 'USD'

export const CURRENT_USER = { name: 'Mohammad', roleKey: 'roles.name.administrator' } as const

export const DATE_RANGE = { from: '2024-05-12', to: '2024-05-18' } as const

export interface Kpi {
  id: string
  labelKey: MessageKey
  icon: 'revenue' | 'customers' | 'orders' | 'percent'
  /** Money KPIs carry a currency; counts and ratios do not. */
  currency?: string
  value: number
  format: 'money' | 'number' | 'percent'
  delta: number
  tone: Tone
  trend: number[]
}

export const KPIS: Kpi[] = [
  {
    id: 'revenue',
    labelKey: 'dashboard.revenue',
    icon: 'revenue',
    currency: TENANT_CURRENCY,
    value: 128430,
    format: 'money',
    delta: 0.125,
    tone: 'primary',
    trend: [58, 72, 65, 84, 79, 103, 128],
  },
  {
    id: 'customers',
    labelKey: 'dashboard.customers',
    icon: 'customers',
    value: 12842,
    format: 'number',
    delta: 0.082,
    tone: 'info',
    trend: [92, 96, 101, 99, 108, 118, 128],
  },
  {
    id: 'orders',
    labelKey: 'dashboard.orders',
    icon: 'orders',
    value: 3642,
    format: 'number',
    delta: 0.143,
    tone: 'success',
    trend: [24, 31, 28, 35, 33, 41, 46],
  },
  {
    id: 'conversion',
    labelKey: 'dashboard.conversion',
    icon: 'percent',
    value: 0.0842,
    format: 'percent',
    delta: 0.024,
    tone: 'warning',
    trend: [6.2, 6.9, 7.1, 7.4, 7.9, 8.1, 8.42],
  },
]

export const REVENUE_SERIES: LinePoint[] = [
  { date: '2024-05-12', value: 58000 },
  { date: '2024-05-13', value: 72000 },
  { date: '2024-05-14', value: 64500 },
  { date: '2024-05-15', value: 84000 },
  { date: '2024-05-16', value: 78500 },
  { date: '2024-05-17', value: 103000 },
  { date: '2024-05-18', value: 128430 },
]

export const CATEGORY_SLICES: (Omit<DonutSlice, 'label'> & { labelKey: MessageKey })[] = [
  { id: 'product', labelKey: 'dashboard.category.product', value: 72450, slot: 1 },
  { id: 'service', labelKey: 'dashboard.category.service', value: 38430, slot: 2 },
  { id: 'subscription', labelKey: 'dashboard.category.subscription', value: 17570, slot: 3 },
]

export type OrderStatus = 'completed' | 'pending' | 'processing' | 'cancelled'

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  cancelled: 'danger',
}

export interface Order {
  id: string
  customer: string
  amount: number
  currency: string
  status: OrderStatus
  date: string
}

export const ORDERS: Order[] = [
  { id: '#10231', customer: 'John Doe', amount: 240, currency: 'USD', status: 'completed', date: '2024-05-18' },
  { id: '#10230', customer: 'Sarah Lee', amount: 180, currency: 'USD', status: 'pending', date: '2024-05-18' },
  { id: '#10229', customer: 'Mike Ross', amount: 520, currency: 'USD', status: 'processing', date: '2024-05-17' },
  { id: '#10228', customer: 'Lisa Ray', amount: 320, currency: 'USD', status: 'completed', date: '2024-05-17' },
  { id: '#10227', customer: 'David Kim', amount: 150, currency: 'USD', status: 'cancelled', date: '2024-05-16' },
  { id: '#10226', customer: 'Ayşe Yılmaz', amount: 410, currency: 'USD', status: 'completed', date: '2024-05-16' },
  { id: '#10225', customer: 'Omar Haddad', amount: 275, currency: 'USD', status: 'pending', date: '2024-05-15' },
  { id: '#10224', customer: 'Elena Petrova', amount: 640, currency: 'USD', status: 'processing', date: '2024-05-15' },
]

export interface ActivityEntry {
  id: string
  messageKey: MessageKey
  values: Record<string, string | number>
  minutesAgo: number
  tone: Tone
}

export const ACTIVITIES: ActivityEntry[] = [
  { id: 'a1', messageKey: 'activity.orderReceived', values: { id: '#10231' }, minutesAgo: 2, tone: 'primary' },
  { id: 'a2', messageKey: 'activity.customerRegistered', values: { name: 'John Doe' }, minutesAgo: 15, tone: 'info' },
  { id: 'a3', messageKey: 'activity.paymentReceived', values: { amount: 240 }, minutesAgo: 60, tone: 'success' },
  { id: 'a4', messageKey: 'activity.orderPending', values: { id: '#10230' }, minutesAgo: 120, tone: 'warning' },
  { id: 'a5', messageKey: 'activity.newCustomer', values: { name: 'Sarah Lee' }, minutesAgo: 180, tone: 'info' },
]

export type StageId = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won'

export const STAGE_ORDER: StageId[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won']

export interface Deal {
  id: string
  title: string
  company: string
  amount: number
  currency: string
  stage: StageId
}

export const DEALS: Deal[] = [
  { id: 'd-a', title: 'Deal A', company: 'Acme Inc.', amount: 2400, currency: 'USD', stage: 'lead' },
  { id: 'd-b', title: 'Deal B', company: 'Globex Corp.', amount: 1800, currency: 'USD', stage: 'lead' },
  { id: 'd-c', title: 'Deal C', company: 'Initech', amount: 4200, currency: 'USD', stage: 'lead' },
  { id: 'd-d', title: 'Deal D', company: 'Soylent Corp.', amount: 4300, currency: 'USD', stage: 'qualified' },
  { id: 'd-e', title: 'Deal E', company: 'Umbrella Corp.', amount: 6400, currency: 'USD', stage: 'qualified' },
  { id: 'd-f', title: 'Deal F', company: 'Cyberdyne', amount: 8300, currency: 'USD', stage: 'proposal' },
  { id: 'd-g', title: 'Deal G', company: 'Stark Industries', amount: 7200, currency: 'USD', stage: 'proposal' },
  { id: 'd-h', title: 'Deal H', company: 'Wayne Enterprises', amount: 12000, currency: 'USD', stage: 'negotiation' },
  { id: 'd-i', title: 'Deal I', company: 'Oscorp', amount: 5300, currency: 'USD', stage: 'negotiation' },
  { id: 'd-j', title: 'Deal J', company: 'Wonka Industries', amount: 18200, currency: 'USD', stage: 'won' },
  { id: 'd-k', title: 'Deal K', company: 'Tyrell Corp.', amount: 25100, currency: 'USD', stage: 'won' },
]

export type EntityStatus = 'active' | 'pending' | 'inactive' | 'draft'

export const ENTITY_STATUS_TONE: Record<EntityStatus, Tone> = {
  active: 'success',
  pending: 'warning',
  inactive: 'neutral',
  draft: 'info',
}

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  orders: number
  status: EntityStatus
}

export const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'John Doe', company: 'Acme Inc.', email: 'john@acme.com', orders: 24, status: 'active' },
  { id: 'c2', name: 'Sarah Lee', company: 'Nova Ltd.', email: 'sarah@nova.com', orders: 18, status: 'active' },
  { id: 'c3', name: 'Mike Ross', company: 'Tech Corp.', email: 'mike@tech.com', orders: 7, status: 'pending' },
  { id: 'c4', name: 'Lisa Ray', company: 'Design Co.', email: 'lisa@design.com', orders: 12, status: 'active' },
  { id: 'c5', name: 'David Kim', company: 'Marketing Pro', email: 'david@market.com', orders: 6, status: 'inactive' },
  // Non-Latin names: proof that avatars, truncation and collation are not
  // ASCII-only. Turkish dotted/dotless i and Arabic script both appear.
  { id: 'c6', name: 'Ayşe Yılmaz', company: 'İstanbul Yazılım', email: 'ayse@iyazilim.com.tr', orders: 31, status: 'active' },
  { id: 'c7', name: 'عمر حداد', company: 'شركة الأفق', email: 'omar@ufuq.ae', orders: 15, status: 'active' },
  { id: 'c8', name: 'Ilker Işık', company: 'Işık Teknoloji', email: 'ilker@isik.com.tr', orders: 9, status: 'pending' },
]

export interface Product {
  id: string
  name: string
  category: 'Templates' | 'Extensions'
  price: number
  currency: string
  stock: number
  status: EntityStatus
}

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Dashboard UI', category: 'Templates', price: 49, currency: 'USD', stock: 120, status: 'active' },
  { id: 'p2', name: 'CRM Template', category: 'Templates', price: 69, currency: 'USD', stock: 84, status: 'active' },
  { id: 'p3', name: 'SaaS Kit', category: 'Templates', price: 99, currency: 'USD', stock: 32, status: 'draft' },
  { id: 'p4', name: 'Analytics Pro', category: 'Extensions', price: 29, currency: 'USD', stock: 64, status: 'active' },
  { id: 'p5', name: 'Mobile App UI', category: 'Templates', price: 39, currency: 'USD', stock: 48, status: 'active' },
]

export type RoleId = 'administrator' | 'manager' | 'editor' | 'support' | 'user'

export interface AppUser {
  id: string
  name: string
  email: string
  role: RoleId
  status: EntityStatus
}

export const USERS: AppUser[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'administrator', status: 'active' },
  { id: 'u2', name: 'Sarah Lee', email: 'sarah@example.com', role: 'manager', status: 'active' },
  { id: 'u3', name: 'Mike Ross', email: 'mike@example.com', role: 'editor', status: 'active' },
  { id: 'u4', name: 'Lisa Ray', email: 'lisa@example.com', role: 'support', status: 'inactive' },
  { id: 'u5', name: 'David Kim', email: 'david@example.com', role: 'user', status: 'active' },
]

export const ROLE_COUNTS: Record<RoleId, number> = {
  administrator: 5,
  manager: 12,
  editor: 12,
  support: 4,
  user: 25,
}

export type PermissionId =
  | 'viewUsers'
  | 'createUsers'
  | 'editUsers'
  | 'deleteUsers'
  | 'viewProducts'
  | 'createProducts'
  | 'editProducts'
  | 'deleteProducts'

export const PERMISSION_GROUPS: { group: 'users' | 'products'; items: PermissionId[] }[] = [
  { group: 'users', items: ['viewUsers', 'createUsers', 'editUsers', 'deleteUsers'] },
  { group: 'products', items: ['viewProducts', 'createProducts', 'editProducts', 'deleteProducts'] },
]

export const ROLE_PERMISSIONS: Record<RoleId, PermissionId[]> = {
  administrator: [
    'viewUsers',
    'createUsers',
    'editUsers',
    'deleteUsers',
    'viewProducts',
    'createProducts',
    'editProducts',
    'deleteProducts',
  ],
  manager: ['viewUsers', 'createUsers', 'editUsers', 'viewProducts', 'createProducts', 'editProducts'],
  editor: ['viewUsers', 'viewProducts', 'editProducts'],
  support: ['viewUsers', 'viewProducts'],
  user: ['viewProducts'],
}
