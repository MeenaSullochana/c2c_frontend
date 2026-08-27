import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchHealth, fetchUsers } from '../lib/api';
import { fetchReminders, fetchSummary } from '../lib/modules-api';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';
import { cardClass } from '../components/ui';

export function DashboardPage() {
  const { user } = useAuth();
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, refetchInterval: 15_000 });
  const summary = useQuery({ queryKey: ['dashboard-summary'], queryFn: fetchSummary });
  const reminders = useQuery({
    queryKey: ['lead-reminders'],
    queryFn: fetchReminders,
    enabled: user?.permissions.includes(PERMISSIONS.LEAD_VIEW) ?? false,
  });
  const canViewUsers = user?.permissions.includes(PERMISSIONS.USER_VIEW) ?? false;
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled: canViewUsers });
  const ok = health.data?.status === 'ok';

  if (!user) {
    return null;
  }

  const cards = [
    { label: t(I18N_KEYS.NAV_EMPLOYEES), value: summary.data?.employees ?? 0 },
    { label: t(I18N_KEYS.NAV_LEADS), value: summary.data?.leads ?? 0 },
    { label: t(I18N_KEYS.NAV_REMINDERS), value: summary.data?.dueReminders ?? 0 },
    { label: t(I18N_KEYS.NAV_BRANCHES), value: summary.data?.branches ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">{user.tenant.brandName}</p>
        <h1 className="font-display mt-2 text-5xl">{t(I18N_KEYS.DASHBOARD_TITLE)}</h1>
        <p className="mt-3 text-slate-500">
          {user.firstName} {user.lastName} · {user.email}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={cardClass}>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="font-display mt-2 text-4xl text-[#C62127]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{t(I18N_KEYS.NAV_REMINDERS)}</h2>
          <Link to="/admin/reminders" className="text-sm text-[#0087C3]">
            Open desk
          </Link>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {(reminders.data ?? []).slice(0, 5).map((lead) => (
            <li key={lead.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
              <Link to={`/admin/leads/${lead.id}`}>{lead.name}</Link>
              <span className="text-slate-400">{String(lead.reminderAt || lead.nextFollowUpAt || '').slice(0, 16)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{t(I18N_KEYS.HEALTH_TITLE)}</h2>
          <span className={`rounded-full px-3 py-1 text-sm ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-[#C62127]'}`}>
            {ok ? t(I18N_KEYS.HEALTH_CONNECTED) : t(I18N_KEYS.HEALTH_UNAVAILABLE)}
          </span>
        </div>
      </section>

      {canViewUsers ? (
        <section className={cardClass}>
          <h2 className="font-display text-2xl">{t(I18N_KEYS.DASHBOARD_USERS)}</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {(users.data ?? []).map((item) => (
              <li key={item.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>
                  {item.firstName} {item.lastName}
                </span>
                <span>{item.email}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
