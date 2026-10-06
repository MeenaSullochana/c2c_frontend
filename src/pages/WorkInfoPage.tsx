import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  cardClass,
  pageEyebrowClass,
  pageLeadClass,
  pageTitleClass,
  tableClass,
  tdClass,
  thClass,
} from '../components/ui';
import { t } from '../lib/i18n';
import { fetchWorkInfo } from '../lib/modules-api';

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function WorkInfoPage() {
  const work = useQuery({ queryKey: ['work-info'], queryFn: fetchWorkInfo });

  return (
    <div className="space-y-7">
      <header>
        <p className={pageEyebrowClass}>HRM</p>
        <h1 className={pageTitleClass}>{t(I18N_KEYS.NAV_WORK_INFO)}</h1>
        <p className={pageLeadClass}>
          Role, branch, salary, and work history for each employee in your access scope. Click a person to open their
          full profile.
        </p>
      </header>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-sm font-medium text-slate-700">Team roster</p>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          {work.isLoading ? <p className="px-4 py-6 text-sm text-slate-400">Loading…</p> : null}
          {work.error ? <p className="px-4 py-6 text-sm text-[#C62127]">Failed to load work info</p> : null}
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} pl-4 pt-4`}>Code</th>
                <th className={`${thClass} pt-4`}>Name</th>
                <th className={`${thClass} pt-4`}>Org role</th>
                <th className={`${thClass} pt-4`}>Branch</th>
                <th className={`${thClass} pt-4`}>Net salary</th>
                <th className={`${thClass} pt-4`}>Leaves</th>
                <th className={`${thClass} pt-4`} />
              </tr>
            </thead>
            <tbody>
              {(work.data ?? []).map((row) => (
                <tr key={row.id} className="border-t border-slate-50 transition hover:bg-[#0087C3]/[0.03]">
                  <td className={`${tdClass} pl-4 font-semibold text-slate-800`}>{row.employeeCode}</td>
                  <td className={tdClass}>
                    <Link className="font-medium text-[#0087C3] hover:underline" to={`/admin/work-info/${row.id}`}>
                      {row.name}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {row.orgRole}
                    </span>
                  </td>
                  <td className={tdClass}>{row.branch?.name ?? '—'}</td>
                  <td className={`${tdClass} font-medium text-slate-800`}>{inr(row.netSalary)}</td>
                  <td className={tdClass}>{row.leaveRequests}</td>
                  <td className={tdClass}>
                    <Link
                      to={`/admin/work-info/${row.id}`}
                      className="text-sm font-semibold text-[#0087C3] transition hover:text-[#066a98]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!work.isLoading && (work.data?.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400">No employees in scope.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
