import { I18N_KEYS, PERMISSIONS } from '../shared';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';

const links = [
  { to: '/admin', label: I18N_KEYS.NAV_DASHBOARD, end: true, permission: null },
  { to: '/admin/locations', label: I18N_KEYS.NAV_LOCATIONS, permission: PERMISSIONS.LOCATION_VIEW },
  { to: '/admin/employees', label: I18N_KEYS.NAV_EMPLOYEES, permission: PERMISSIONS.HRM_EMPLOYEE_VIEW },
  { to: '/admin/roles', label: I18N_KEYS.NAV_ROLES, permission: PERMISSIONS.ROLE_VIEW },
  { to: '/admin/attendance', label: I18N_KEYS.NAV_ATTENDANCE, permission: PERMISSIONS.HRM_ATTENDANCE_VIEW },
  { to: '/admin/leaves', label: I18N_KEYS.NAV_LEAVES, permission: PERMISSIONS.HRM_LEAVE_VIEW },
  { to: '/admin/leads', label: I18N_KEYS.NAV_LEADS, end: true, permission: PERMISSIONS.LEAD_VIEW },
  { to: '/admin/reminders', label: I18N_KEYS.NAV_REMINDERS, permission: PERMISSIONS.LEAD_VIEW },
  { to: '/admin/leads/import', label: I18N_KEYS.NAV_LEAD_IMPORT, permission: PERMISSIONS.LEAD_IMPORT },
  { to: '/admin/settings', label: I18N_KEYS.NAV_SETTINGS, permission: PERMISSIONS.TENANT_UPDATE },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const brand = user.tenant.brandName || 'MoneyZone';
  const logo = user.tenant.logoUrl || '/moneyzone-logo.png';

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-7 shadow-sm">
        <div className="px-1">
          <img src={logo} alt={brand} className="h-20 w-auto max-w-full object-contain" />
        </div>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {links
            .filter((link) => !link.permission || user.permissions.includes(link.permission))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#C62127]/10 text-[#C62127] ring-1 ring-[#C62127]/20'
                      : 'text-slate-600 hover:bg-[#0087C3]/10 hover:text-[#0087C3]'
                  }`
                }
              >
                {t(link.label)}
              </NavLink>
            ))}
        </nav>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          <p className="font-semibold text-[#0087C3]">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-1">{user.roleKeys.join(' · ')}</p>
        </div>
        <button
          type="button"
          className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-[#C62127] hover:text-[#C62127]"
          onClick={() => void signOut()}
        >
          {t(I18N_KEYS.AUTH_LOGOUT)}
        </button>
      </aside>
      <div className="min-w-0 flex-1 px-10 py-9">
        <Outlet />
      </div>
    </div>
  );
}
