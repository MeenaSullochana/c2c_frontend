import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import {
  cardClass,
  pageEyebrowClass,
  pageLeadClass,
  pageTitleClass,
  statCardClass,
  tableClass,
  tdClass,
  thClass,
} from '../components/ui';
import { t } from '../lib/i18n';
import { fetchPayroll } from '../lib/modules-api';

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function PayrollPage() {
  const payroll = useQuery({ queryKey: ['payroll'], queryFn: fetchPayroll });
  const data = payroll.data;

  return (
    <div className="space-y-7">
      <header>
        <p className={pageEyebrowClass}>HRM</p>
        <h1 className={pageTitleClass}>{t(I18N_KEYS.NAV_PAYROLL)}</h1>
        <p className={pageLeadClass}>Branch-wise salary totals from structure and payslip runs in your scope.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Employees" value={String(data?.totals.employees ?? 0)} />
        <Stat label="Monthly net payroll" value={inr(data?.totals.monthlySalary ?? 0)} emphasize />
        <Stat label="Payslip rows" value={String(data?.totals.payslips ?? 0)} />
      </div>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-xl text-[#0c1624]">By branch</h2>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          {payroll.isLoading ? <p className="px-4 py-6 text-sm text-slate-400">Loading…</p> : null}
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} pl-4 pt-4`}>Branch</th>
                <th className={`${thClass} pt-4`}>Employees</th>
                <th className={`${thClass} pt-4`}>Monthly net</th>
                <th className={`${thClass} pt-4`}>Payslips</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byBranch ?? []).map((row) => (
                <tr key={row.branch} className="border-t border-slate-50 transition hover:bg-[#0087C3]/[0.03]">
                  <td className={`${tdClass} pl-4 font-semibold text-slate-800`}>{row.branch}</td>
                  <td className={tdClass}>{row.employees}</td>
                  <td className={`${tdClass} font-medium`}>{inr(row.monthlySalary)}</td>
                  <td className={tdClass}>{row.payslipCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-xl text-[#0c1624]">Employee salary calculation</h2>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} pl-4 pt-4`}>Employee</th>
                <th className={`${thClass} pt-4`}>Role</th>
                <th className={`${thClass} pt-4`}>Branch</th>
                <th className={`${thClass} pt-4`}>Basic</th>
                <th className={`${thClass} pt-4`}>HRA</th>
                <th className={`${thClass} pt-4`}>Allowances</th>
                <th className={`${thClass} pt-4`}>Deductions</th>
                <th className={`${thClass} pt-4`}>Net</th>
              </tr>
            </thead>
            <tbody>
              {(data?.employees ?? []).map((row) => (
                <tr key={row.id} className="border-t border-slate-50 transition hover:bg-[#0087C3]/[0.03]">
                  <td className={`${tdClass} pl-4`}>
                    <div className="font-semibold text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-400">{row.employeeCode}</div>
                  </td>
                  <td className={tdClass}>{row.orgRole}</td>
                  <td className={tdClass}>{row.branch?.name ?? '—'}</td>
                  <td className={tdClass}>{inr(row.basicSalary)}</td>
                  <td className={tdClass}>{inr(row.hra)}</td>
                  <td className={tdClass}>{inr(row.allowances)}</td>
                  <td className={tdClass}>{inr(row.deductions)}</td>
                  <td className={`${tdClass} font-semibold text-[#C62127]`}>{inr(row.netSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={statCardClass}>
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${
          emphasize ? 'bg-[#C62127]/[0.07]' : 'bg-[#0087C3]/[0.06]'
        }`}
      />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`font-display relative mt-3 text-3xl ${emphasize ? 'text-[#C62127]' : 'text-[#0c1624]'}`}>
        {value}
      </p>
    </div>
  );
}
