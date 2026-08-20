import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppConfigProvider } from '@/providers/AppConfig'
import { I18nProvider } from '@/i18n'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/Dashboard'
import { AnalyticsPage, HelpPage, NotFoundPage, ReportsPage } from '@/pages/Analytics'
import { CustomersPage } from '@/pages/Customers'
import { DealsPage } from '@/pages/Deals'
import { ProductsPage } from '@/pages/Products'
import { OrdersPage } from '@/pages/Orders'
import { UsersPage } from '@/pages/Users'
import { RolesPage } from '@/pages/Roles'
import { SettingsPage } from '@/pages/Settings'

export default function App() {
  return (
    <AppConfigProvider>
      <I18nProvider>
        <ToastProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/crm" element={<Navigate to="/crm/customers" replace />} />
                <Route path="/crm/customers" element={<CustomersPage />} />
                <Route path="/crm/leads" element={<CustomersPage leadsOnly />} />
                <Route path="/crm/deals" element={<DealsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/roles" element={<RolesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </I18nProvider>
    </AppConfigProvider>
  )
}
