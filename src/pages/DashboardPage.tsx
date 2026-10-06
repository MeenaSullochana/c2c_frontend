import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchHealth, fetchUsers } from '../lib/api';
import { fetchReminders, fetchSummary } from '../lib/modules-api';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';
import { cardClass, pageEyebrowClass, pageLeadClass, pageTitleClass, statCardClass } from '../components/ui';

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
        <p className={pageEyebrowClass}>{user.tenant.brandName}</p>
        <h1 className={pageTitleClass}>{t(I18N_KEYS.DASHBOARD_TITLE)}</h1>
        <p className={pageLeadClass}>
          {user.firstName} {user.lastName} · {user.email}
          {user.accessScope ? ` · Scope ${user.accessScope}` : ''}
          {user.branch?.name ? ` · ${user.branch.name}` : ''}
        </p>
        {user.permissions.includes(PERMISSIONS.LEAD_VIEW) ? (
          <Link
            to="/admin/c2c"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0087C3] transition hover:text-[#066a98]"
          >
            Open C2C calling dashboard
            <span aria-hidden>→</span>
          </Link>
        ) : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`${statCardClass} mz-rise`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0087C3]/[0.06]" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {card.label}
            </p>
            <p className="font-display relative mt-3 text-4xl text-[#C62127]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className={`${cardClass} mz-rise-delay`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-[#0c1624]">{t(I18N_KEYS.NAV_REMINDERS)}</h2>
          <Link to="/admin/reminders" className="text-sm font-medium text-[#0087C3]">
            Open desk
          </Link>
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          {(reminders.data ?? []).slice(0, 5).map((lead) => (
            <li
              key={lead.id}
              className="flex justify-between rounded-2xl border border-slate-100/80 bg-slate-50/70 px-3.5 py-2.5 transition hover:border-[#0087C3]/20 hover:bg-[#0087C3]/[0.04]"
            >
              <Link className="font-medium text-slate-800" to={`/admin/leads/${lead.id}`}>
                {lead.name}
              </Link>
              <span className="text-slate-400">
                {String(lead.reminderAt || lead.nextFollowUpAt || '').slice(0, 16)}
              </span>
            </li>
          ))}
          {(reminders.data?.length ?? 0) === 0 ? (
            <li className="rounded-2xl bg-slate-50/80 px-3.5 py-4 text-slate-400">No reminders due.</li>
          ) : null}
        </ul>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-[#0c1624]">{t(I18N_KEYS.HEALTH_TITLE)}</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-[#C62127]'
            }`}
          >
            {ok ? t(I18N_KEYS.HEALTH_OK) : t(I18N_KEYS.HEALTH_DEGRADED)}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {health.isLoading
            ? t(I18N_KEYS.HEALTH_CHECKING)
            : ok
              ? t(I18N_KEYS.HEALTH_CONNECTED)
              : t(I18N_KEYS.HEALTH_UNAVAILABLE)}
        </p>
      </section>

      {canViewUsers ? (
        <section className={cardClass}>
          <h2 className="font-display text-2xl text-[#0c1624]">Users</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {(users.data ?? []).slice(0, 8).map((row) => (
              <li key={row.id} className="flex justify-between border-b border-slate-100 py-2 last:border-0">
                <span>
                  {row.firstName} {row.lastName}
                </span>
                <span className="text-slate-400">{row.email}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
