import { I18N_KEYS, PERMISSIONS, type I18nKey } from '../shared';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';

type NavItem = {
  to: string;
  label: I18nKey;
  end?: boolean;
  permission: string | null;
};

type NavGroup = {
  id: 'c2c' | 'hrm' | 'website';
  label: I18nKey;
  items: NavItem[];
};

const dashboardLink: NavItem = {
  to: '/admin',
  label: I18N_KEYS.NAV_DASHBOARD,
  end: true,
  permission: null,
};

const navGroups: NavGroup[] = [
  {
    id: 'c2c',
    label: I18N_KEYS.NAV_GROUP_C2C,
    items: [
      { to: '/admin/c2c', label: I18N_KEYS.NAV_C2C_DASHBOARD, permission: PERMISSIONS.LEAD_VIEW },
      { to: '/admin/leads', label: I18N_KEYS.NAV_LEADS, end: true, permission: PERMISSIONS.LEAD_VIEW },
      { to: '/admin/reminders', label: I18N_KEYS.NAV_REMINDERS, permission: PERMISSIONS.LEAD_VIEW },
      { to: '/admin/leads/import', label: I18N_KEYS.NAV_LEAD_IMPORT, permission: PERMISSIONS.LEAD_IMPORT },
    ],
  },
  {
    id: 'hrm',
    label: I18N_KEYS.NAV_GROUP_HRM,
    items: [
      { to: '/admin/employees', label: I18N_KEYS.NAV_EMPLOYEES, permission: PERMISSIONS.HRM_EMPLOYEE_VIEW },
      { to: '/admin/roles', label: I18N_KEYS.NAV_ROLES, permission: PERMISSIONS.ROLE_VIEW },
      { to: '/admin/attendance', label: I18N_KEYS.NAV_ATTENDANCE, permission: PERMISSIONS.HRM_ATTENDANCE_VIEW },
      { to: '/admin/leaves', label: I18N_KEYS.NAV_LEAVES, permission: PERMISSIONS.HRM_LEAVE_VIEW },
      { to: '/admin/payroll', label: I18N_KEYS.NAV_PAYROLL, permission: PERMISSIONS.HRM_EMPLOYEE_VIEW },
      { to: '/admin/payslip', label: I18N_KEYS.NAV_PAYSLIP, permission: PERMISSIONS.HRM_EMPLOYEE_VIEW },
      { to: '/admin/work-info', label: I18N_KEYS.NAV_WORK_INFO, permission: PERMISSIONS.HRM_EMPLOYEE_VIEW },
      { to: '/admin/locations', label: I18N_KEYS.NAV_LOCATIONS, permission: PERMISSIONS.LOCATION_VIEW },
    ],
  },
  {
    id: 'website',
    label: I18N_KEYS.NAV_GROUP_WEBSITE,
    items: [
      { to: '/admin/website/basic', label: I18N_KEYS.NAV_WEBSITE_BASIC, permission: PERMISSIONS.TENANT_UPDATE },
      { to: '/admin/website/banks', label: I18N_KEYS.NAV_BANKS, permission: PERMISSIONS.TENANT_VIEW },
      { to: '/admin/website/enquiries', label: I18N_KEYS.NAV_ENQUIRIES, permission: PERMISSIONS.TENANT_VIEW },
      { to: '/admin/website/announcements', label: I18N_KEYS.NAV_ANNOUNCEMENTS, permission: PERMISSIONS.TENANT_VIEW },
      { to: '/admin/website/loan-types', label: I18N_KEYS.NAV_LOAN_TYPES, permission: PERMISSIONS.TENANT_VIEW },
      { to: '/admin/website/pages', label: I18N_KEYS.NAV_WEBSITE_PAGES, permission: PERMISSIONS.TENANT_VIEW },
      { to: '/admin/settings', label: I18N_KEYS.NAV_SETTINGS, permission: PERMISSIONS.TENANT_UPDATE },
    ],
  },
];

function linkActiveClass(isActive: boolean) {
  return `mz-nav-item rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-white/[0.07] text-white'
      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
  }`;
}

function groupMatchesPath(group: NavGroup, pathname: string) {
  return group.items.some((item) => {
    if (item.to === '/admin/leads') {
      return pathname === '/admin/leads' || pathname.startsWith('/admin/leads/');
    }
    if (item.end) {
      return pathname === item.to;
    }
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
}

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    c2c: true,
    hrm: true,
    website: false,
  });

  const visibleGroups = useMemo(() => {
    if (!user) {
      return [];
    }
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.permission || user.permissions.includes(item.permission),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [user]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of navGroups) {
        if (groupMatchesPath(group, location.pathname)) {
          next[group.id] = true;
        }
      }
      return next;
    });
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const brand = user.tenant.brandName || 'MoneyZone';
  const logo = user.tenant.logoUrl || '/moneyzone-logo.png';

  return (
    <div className="flex min-h-screen">
      <aside className="relative flex w-[17.5rem] flex-col overflow-hidden bg-[var(--mz-sidebar)] px-4 py-6 text-white shadow-[12px_0_40px_-28px_rgba(12,22,36,0.55)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(500px 280px at 0% 0%, rgba(0,135,195,0.22), transparent 60%), radial-gradient(420px 260px at 100% 100%, rgba(198,33,39,0.16), transparent 55%)',
          }}
        />
        <div className="relative px-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 backdrop-blur-sm">
            <img src={logo} alt={brand} className="mx-auto h-16 w-auto max-w-full object-contain brightness-110" />
            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7ec8e6]">
              {brand}
            </p>
          </div>
        </div>

        <nav className="relative mt-7 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          <NavLink
            to={dashboardLink.to}
            end={dashboardLink.end}
            className={({ isActive }) => linkActiveClass(isActive)}
            data-active={location.pathname === '/admin' || location.pathname === '/app' ? 'true' : 'false'}
          >
            {t(dashboardLink.label)}
          </NavLink>

          {visibleGroups.map((group) => {
            const open = openGroups[group.id] ?? false;
            return (
              <div key={group.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7ec8e6] transition hover:bg-white/[0.04]"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id],
                    }))
                  }
                  aria-expanded={open}
                >
                  <span>{t(group.label)}</span>
                  <span className="text-[11px] text-slate-500">{open ? '–' : '+'}</span>
                </button>
                {open ? (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => linkActiveClass(isActive)}
                        data-active={
                          item.end
                            ? location.pathname === item.to
                              ? 'true'
                              : 'false'
                            : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                              ? 'true'
                              : 'false'
                        }
                      >
                        {t(item.label)}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="relative mt-4 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[var(--mz-sidebar-lift)] px-3.5 py-3.5">
            <p className="text-sm font-semibold text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{user.roleKeys.join(' · ')}</p>
            <p className="mt-2 text-[11px] font-medium text-[#f0a0a3]">
              Scope {user.accessScope || 'ALL'}
              {user.branch?.name ? ` · ${user.branch.name}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:border-[#C62127]/50 hover:bg-[#C62127]/10 hover:text-white"
            onClick={() => void signOut()}
          >
            {t(I18N_KEYS.AUTH_LOGOUT)}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-6 py-8 md:px-10 md:py-9">
        <div key={location.pathname} className="mz-rise mx-auto max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
