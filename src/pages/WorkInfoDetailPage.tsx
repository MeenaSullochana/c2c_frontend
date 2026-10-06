import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
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
import { fetchWorkInfoDetail } from '../lib/modules-api';

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function WorkInfoDetailPage() {
  const { id = '' } = useParams();
  const detail = useQuery({
    queryKey: ['work-info', id],
    queryFn: () => fetchWorkInfoDetail(id),
    enabled: Boolean(id),
  });
  const data = detail.data;

  if (detail.isLoading) {
    return <p className="text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Employee not found</p>
        <Link to="/admin/work-info" className="text-sm font-semibold text-[#0087C3]">
          Back to work info
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={pageEyebrowClass}>HRM / Work info</p>
          <h1 className={pageTitleClass}>{data.name}</h1>
          <p className={pageLeadClass}>
            {data.employeeCode} · {data.orgRole} · {data.branch?.name ?? 'Unassigned'}
          </p>
        </div>
        <Link
          to="/admin/work-info"
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
        >
          Back
        </Link>
      </header>

      <section className={`${cardClass} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
        <Info label="Email" value={data.email} />
        <Info label="Phone" value={data.phone || '—'} />
        <Info label="Status" value={data.status} />
        <Info label="Gender" value={data.gender || '—'} />
        <Info label="Date of birth" value={formatDate(data.dateOfBirth)} />
        <Info label="Joining date" value={formatDate(data.joiningDate)} />
        <Info label="Department" value={data.department?.name || '—'} />
        <Info label="Designation" value={data.designation?.name || '—'} />
        <Info label="Branch" value={data.branch?.name || '—'} />
        <Info label="Manager" value={data.manager?.name || '—'} />
        <Info label="Supervisor" value={data.supervisor?.name || '—'} />
        <Info label="Address" value={data.address || '—'} />
      </section>

      <section className={`${cardClass} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
        <Info label="Basic" value={inr(data.basicSalary)} />
        <Info label="HRA" value={inr(data.hra)} />
        <Info label="Allowances" value={inr(data.allowances)} />
        <Info label="Deductions" value={inr(data.deductions)} />
        <Info label="Gross" value={inr(data.grossSalary)} />
        <Info label="Net salary" value={inr(data.netSalary)} accent />
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-[#0c1624]">Work history</h2>
        <ol className="mt-4 space-y-3">
          {data.workHistory.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <span className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-500">
                  {item.eventType}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.detail || '—'}</p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDate(item.fromDate)}
                {item.toDate ? ` → ${formatDate(item.toDate)}` : ''}
                {item.branch?.name ? ` · ${item.branch.name}` : ''}
                {item.orgRole ? ` · ${item.orgRole}` : ''}
                {item.designation?.name ? ` · ${item.designation.name}` : ''}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#0c1624]">Payslips</h2>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} pl-4 pt-4`}>Period</th>
                <th className={`${thClass} pt-4`}>Net pay</th>
                <th className={`${thClass} pt-4`}>Status</th>
                <th className={`${thClass} pt-4`} />
              </tr>
            </thead>
            <tbody>
              {data.payslips.map((row) => (
                <tr key={row.id} className="border-t border-slate-50">
                  <td className={`${tdClass} pl-4 font-medium`}>{row.periodKey}</td>
                  <td className={tdClass}>{inr(row.netPay)}</td>
                  <td className={tdClass}>{row.status}</td>
                  <td className={tdClass}>
                    <Link className="text-sm font-semibold text-[#0087C3]" to={`/admin/payslip/${row.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.payslips.length === 0 ? <p className="px-4 py-6 text-sm text-slate-400">No payslips</p> : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-[#0c1624]">Leave history</h2>
          </div>
          <ul className="space-y-2 p-4">
            {data.leaves.length === 0 ? (
              <li className="text-sm text-slate-400">No leave records</li>
            ) : (
              data.leaves.map((row) => (
                <li key={row.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">
                    {row.leaveType} · {row.status}
                  </p>
                  <p className="text-slate-500">
                    {formatDate(row.startDate)} → {formatDate(row.endDate)}
                  </p>
                  <p className="text-slate-500">{row.reason}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-[#0c1624]">Attendance history</h2>
          </div>
          <ul className="space-y-2 p-4">
            {data.attendance.length === 0 ? (
              <li className="text-sm text-slate-400">No attendance records</li>
            ) : (
              data.attendance.map((row) => (
                <li key={row.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">{row.dateKey}</p>
                  <p className="text-slate-500">
                    In {formatDateTime(row.clockInAt)} · Out {formatDateTime(row.clockOutAt)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
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
