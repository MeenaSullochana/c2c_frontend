import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  cardClass,
  pageEyebrowClass,
  pageLeadClass,
  pageTitleClass,
} from '../components/ui';
import { t } from '../lib/i18n';
import { fetchPayslip } from '../lib/modules-api';

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function PayslipDetailPage() {
  const { id = '' } = useParams();
  const payslip = useQuery({
    queryKey: ['payslip', id],
    queryFn: () => fetchPayslip(id),
    enabled: Boolean(id),
  });
  const data = payslip.data;

  if (payslip.isLoading) {
    return <p className="text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Payslip not found</p>
        <Link to="/admin/payslip" className="text-sm font-semibold text-[#0087C3]">
          Back to payslips
        </Link>
      </div>
    );
  }

  const gross = data.basicSalary + data.hra + data.allowances;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={pageEyebrowClass}>HRM / Payslip</p>
          <h1 className={pageTitleClass}>{data.periodKey}</h1>
          <p className={pageLeadClass}>
            {data.employee.name} · {data.employee.employeeCode}
            {data.employee.branch?.name ? ` · ${data.employee.branch.name}` : ''}
          </p>
        </div>
        <Link
          to="/admin/payslip"
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
        >
          Back
        </Link>
      </header>

      <section className={`${cardClass} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        <Info label="Employee" value={data.employee.name} />
        <Info label="Code" value={data.employee.employeeCode} />
        <Info label="Org role" value={data.employee.orgRole || '—'} />
        <Info label="Branch" value={data.employee.branch?.name || '—'} />
        <Info label="Email" value={data.employee.email || '—'} />
        <Info label="Phone" value={data.employee.phone || '—'} />
        <Info
          label="Status"
          value={data.status}
          accent={data.status === 'PAID'}
        />
        <Info
          label="Paid at"
          value={data.paidAt ? new Date(data.paidAt).toLocaleString() : '—'}
        />
        <Info
          label="Period"
          value={data.periodKey}
        />
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-[#0c1624]">Earnings & deductions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Basic" value={inr(data.basicSalary)} />
          <Info label="HRA" value={inr(data.hra)} />
          <Info label="Allowances" value={inr(data.allowances)} />
          <Info label="Gross" value={inr(gross)} />
          <Info label="Deductions" value={inr(data.deductions)} />
          <Info label="Net pay" value={inr(data.netPay)} accent />
        </div>
        {data.employee.id ? (
          <p className="mt-6 text-sm">
            <Link className="font-semibold text-[#0087C3]" to={`/admin/work-info/${data.employee.id}`}>
              View full work info →
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        accent
          ? 'border-[#C62127]/15 bg-[linear-gradient(135deg,rgba(198,33,39,0.06),rgba(255,255,255,0.9))]'
          : 'border-slate-100 bg-slate-50/80'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-1.5 text-sm font-semibold ${accent ? 'text-[#C62127]' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}
