import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/auth';
import { I18N_KEYS } from './shared';
import { AttendancePage } from './pages/AttendancePage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { HomePage } from './pages/HomePage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { LeadImportPage } from './pages/LeadImportPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeavesPage } from './pages/LeavesPage';
import { LocationsPage } from './pages/LocationsPage';
import { LoginPage } from './pages/LoginPage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';
import { C2cDashboardPage } from './pages/C2cDashboardPage';
import { PayrollPage } from './pages/PayrollPage';
import { PayslipPage } from './pages/PayslipPage';
import { PayslipDetailPage } from './pages/PayslipDetailPage';
import { BanksPage } from './pages/BanksPage';
import { EnquiriesPage } from './pages/EnquiriesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { RegisterPage } from './pages/RegisterPage';
import { RemindersPage } from './pages/RemindersPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkInfoPage } from './pages/WorkInfoPage';
import { WorkInfoDetailPage } from './pages/WorkInfoDetailPage';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="branches" element={<LocationsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="leaves" element={<LeavesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="payslip" element={<PayslipPage />} />
              <Route path="payslip/:id" element={<PayslipDetailPage />} />
              <Route path="work-info" element={<WorkInfoPage />} />
              <Route path="work-info/:id" element={<WorkInfoDetailPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="c2c" element={<C2cDashboardPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="leads/import" element={<LeadImportPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="website/basic" element={
                  <ModulePlaceholderPage
                    titleKey={I18N_KEYS.NAV_WEBSITE_BASIC}
                    groupLabel="Website"
                    description="Public website company profile, contact blocks, and hero content will be managed here."
                  />
                }
              />
              <Route path="website/banks" element={<BanksPage />} />
              <Route path="website/enquiries" element={<EnquiriesPage />} />
              <Route path="website/announcements" element={<AnnouncementsPage />} />
              <Route
                path="website/loan-types"
                element={
                  <ModulePlaceholderPage
                    titleKey={I18N_KEYS.NAV_LOAN_TYPES}
                    groupLabel="Website"
                    description="Loan products shown on the MoneyZone website will be managed here. Supported codes: PL, BL, CC, HL, GL, LAP, INS (Insurance)."
                  />
                }
              />
              <Route
                path="website/pages"
                element={
                  <ModulePlaceholderPage
                    titleKey={I18N_KEYS.NAV_WEBSITE_PAGES}
                    groupLabel="Website"
                    description="CMS-style website pages (About, Services, Contact) will be managed here."
                  />
                }
              />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
