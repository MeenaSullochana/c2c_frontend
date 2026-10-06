import { I18N_KEYS, LEAD_STATUS_LABELS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { createFollowUp, fetchLead } from '../lib/modules-api';
import { useState } from 'react';

const statuses = [
  'NOT_CALLED',
  'CALLED_NOT_CONTACTED',
  'CONTACTED_NOT_INTERESTED',
  'CONTACTED_FOLLOWUP',
  'CONTACTED_NOT_ELIGIBLE',
  'CONTACTED_INTERESTED',
  'LOGIN',
  'LOGIN_APPROVED',
  'LOGIN_REJECTED',
  'DISBURSED',
  'RNR',
];

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function LeadDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ['lead', id], queryFn: () => fetchLead(id), enabled: Boolean(id) });
  const [error, setError] = useState<string | null>(null);
  const data = lead.data;

  if (lead.isLoading) {
    return <p className="text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>;
  }

  if (!data) {
    return <p className="text-slate-400">Lead not found</p>;
  }

  const location = [data.country?.name, data.state?.name, data.city?.name, data.branch?.name]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-400">{location || data.branch?.name || '—'}</p>
        <h1 className="mt-1 text-3xl font-semibold">{data.name}</h1>
        <p className="mt-2 text-slate-600">
          {data.phone || '—'} · {data.campaignName || data.source || '—'} ·{' '}
          {LEAD_STATUS_LABELS[data.status] ?? data.status}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Called: {data.called ? 'Y' : 'N'} · Connected: {data.connected ? 'Y' : 'N'} · Loan:{' '}
          {data.loanType || 'PL'}
          {data.loanAmount ? ` · ₹${Number(data.loanAmount).toLocaleString('en-IN')}` : ''}
          {data.bank?.name ? ` · ${data.bank.name}` : ''}
        </p>
        {data.loginRemarks ? (
          <p className="mt-1 text-sm text-amber-700">Login remarks: {data.loginRemarks}</p>
        ) : null}
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={`${cardClass} grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm`}>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
          <p className="mt-1 font-medium">{data.email || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
          <p className="mt-1 font-medium">{data.phone || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Campaign</p>
          <p className="mt-1 font-medium">{data.campaignName || data.source || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Country / State / City</p>
          <p className="mt-1 font-medium">
            {[data.country?.name, data.state?.name, data.city?.name].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Branch</p>
          <p className="mt-1 font-medium">{data.branch?.name || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Assignee</p>
          <p className="mt-1 font-medium">{data.assignedEmployee?.name || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Regional lead (RSM)</p>
          <p className="mt-1 font-medium">{data.rsm || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Team</p>
          <p className="mt-1 font-medium">{data.team || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">BDO</p>
          <p className="mt-1 font-medium">{data.bdoCode || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Called at</p>
          <p className="mt-1 font-medium">{formatDateTime(data.calledAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Next follow-up</p>
          <p className="mt-1 font-medium">{formatDateTime(data.nextFollowUpAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Reminder</p>
          <p className="mt-1 font-medium">{formatDateTime(data.reminderAt)}</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
          <p className="mt-1 font-medium whitespace-pre-wrap">{data.notes || '—'}</p>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-medium">{t(I18N_KEYS.LEAD_FOLLOWUP)}</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            const status = String(form.get('status') || '') || undefined;
            const remarks = String(form.get('remarks') || '').trim();
            setError(null);
            if ((status === 'LOGIN_APPROVED' || status === 'LOGIN_REJECTED') && !remarks) {
              setError('Remarks are required for login approved / rejected');
              return;
            }
            createFollowUp(id, {
              note: String(form.get('note')),
              nextFollowUpAt: String(form.get('nextFollowUpAt') || '') || undefined,
              reminderAt: String(form.get('reminderAt') || '') || undefined,
              status,
              remarks: remarks || undefined,
            })
              .then(() => {
                formEl.reset();
                void queryClient.invalidateQueries({ queryKey: ['lead', id] });
                void queryClient.invalidateQueries({ queryKey: ['leads'] });
              })
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
          }}
        >
          <textarea name="note" placeholder="Call notes" className={`${fieldClass} md:col-span-2`} required />
          <label className="text-sm text-slate-500">
            Next follow-up
            <input name="nextFollowUpAt" type="datetime-local" className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm text-slate-500">
            Reminder
            <input name="reminderAt" type="datetime-local" className={`${fieldClass} mt-1`} />
          </label>
          <select name="status" className={fieldClass} defaultValue={data.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
          <textarea
            name="remarks"
            placeholder="Remarks (required for Login Approved / Rejected)"
            className={fieldClass}
          />
          <button type="submit" className={buttonClass}>
            {t(I18N_KEYS.COMMON_SAVE)}
          </button>
        </form>
      </section>

      <section className={cardClass}>
        <h2 className="font-medium">{t(I18N_KEYS.LEAD_HISTORY)}</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {(data.history ?? []).length === 0 ? (
            <li className="rounded-lg bg-slate-50 p-4 text-slate-500">No follow-ups yet</li>
          ) : (
            (data.history ?? []).map((item) => (
              <li key={item.id} className="rounded-lg bg-slate-50 p-4">
                <p className="font-medium">{item.note}</p>
                <p className="mt-2 text-slate-500">
                  Status: {item.statusAfter ? LEAD_STATUS_LABELS[item.statusAfter] ?? item.statusAfter : '—'}
                </p>
                <p className="mt-1 text-slate-500">
                  Next follow-up: {formatDateTime(item.nextFollowUpAt)} · Logged:{' '}
                  {formatDateTime(item.createdAt)}
                </p>
              </li>
            ))
          )}
        </ol>
      </section>
    </div>
  );
}
