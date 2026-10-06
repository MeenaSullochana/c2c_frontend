import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cardClass,
  fieldClass,
  pageEyebrowClass,
  pageLeadClass,
  pageTitleClass,
  tableClass,
  tdClass,
  thClass,
} from '../components/ui';
import { t } from '../lib/i18n';
import { fetchPayslips } from '../lib/modules-api';

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function PayslipPage() {
  const [period, setPeriod] = useState('');
  const payslips = useQuery({
    queryKey: ['payslips', period],
    queryFn: () => fetchPayslips(period ? { period } : {}),
  });

  return (
    <div className="space-y-7">
      <header>
        <p className={pageEyebrowClass}>HRM</p>
        <h1 className={pageTitleClass}>{t(I18N_KEYS.NAV_PAYSLIP)}</h1>
        <p className={pageLeadClass}>
          Generated payslips (Aug paid / Sep draft) for staff in your access scope. Click a row to view the full slip.
        </p>
      </header>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Period
        </label>
        <select className={fieldClass} value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="">All periods</option>
          <option value="2026-08">2026-08</option>
          <option value="2026-09">2026-09</option>
        </select>
      </div>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="overflow-x-auto px-2 pb-2">
          {payslips.isLoading ? <p className="px-4 py-6 text-sm text-slate-400">Loading…</p> : null}
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} pl-4 pt-4`}>Period</th>
                <th className={`${thClass} pt-4`}>Employee</th>
                <th className={`${thClass} pt-4`}>Branch</th>
                <th className={`${thClass} pt-4`}>Basic</th>
                <th className={`${thClass} pt-4`}>Deductions</th>
                <th className={`${thClass} pt-4`}>Net pay</th>
                <th className={`${thClass} pt-4`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(payslips.data ?? []).map((row) => (
                <tr key={row.id} className="border-t border-slate-50 transition hover:bg-[#0087C3]/[0.03]">
                  <td className={`${tdClass} pl-4 font-semibold text-slate-800`}>
                    <Link className="text-[#0087C3] hover:underline" to={`/admin/payslip/${row.id}`}>
                      {row.periodKey}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    {row.employee?.id ? (
                      <Link className="font-medium text-[#0087C3] hover:underline" to={`/admin/work-info/${row.employee.id}`}>
                        {row.employee.name}
                      </Link>
                    ) : (
                      <div className="font-medium text-slate-800">{row.employee?.name ?? '—'}</div>
                    )}
                    <div className="text-xs text-slate-400">{row.employee?.employeeCode}</div>
                  </td>
                  <td className={tdClass}>{row.employee?.branch?.name ?? '—'}</td>
                  <td className={tdClass}>{inr(row.basicSalary)}</td>
                  <td className={tdClass}>{inr(row.deductions)}</td>
                  <td className={`${tdClass} font-semibold text-slate-800`}>{inr(row.netPay)}</td>
                  <td className={tdClass}>
                    <span
                      className={
                        row.status === 'PAID'
                          ? 'rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
                          : 'rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payslips.isLoading && (payslips.data?.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400">No payslips found.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
