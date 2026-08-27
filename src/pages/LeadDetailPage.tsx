import { I18N_KEYS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { createFollowUp, fetchLead } from '../lib/modules-api';
import { useState } from 'react';

const statuses = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'WON', 'LOST'];

export function LeadDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ['lead', id], queryFn: () => fetchLead(id), enabled: Boolean(id) });
  const [error, setError] = useState<string | null>(null);
  const data = lead.data;

  if (!data) {
    return <p className="text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-400">{data.branch?.name}</p>
        <h1 className="mt-1 text-3xl font-semibold">{data.name}</h1>
        <p className="mt-2 text-slate-300">
          {data.email || '—'} · {data.phone || '—'} · {data.status}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {[data.country?.name, data.state?.name, data.city?.name].filter(Boolean).join(' / ')}
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <h2 className="font-medium">{t(I18N_KEYS.LEAD_FOLLOWUP)}</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setError(null);
            createFollowUp(id, {
              note: String(form.get('note')),
              nextFollowUpAt: String(form.get('nextFollowUpAt') || '') || undefined,
              reminderAt: String(form.get('reminderAt') || '') || undefined,
              status: String(form.get('status') || '') || undefined,
            })
              .then(() => {
                event.currentTarget.reset();
                void queryClient.invalidateQueries({ queryKey: ['lead', id] });
                void queryClient.invalidateQueries({ queryKey: ['leads'] });
              })
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
          }}
        >
          <textarea name="note" placeholder="Call notes" className={`${fieldClass} md:col-span-2`} required />
          <input name="nextFollowUpAt" type="datetime-local" className={fieldClass} />
          <input name="reminderAt" type="datetime-local" className={fieldClass} />
          <select name="status" className={fieldClass} defaultValue={data.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonClass}>
            {t(I18N_KEYS.COMMON_SAVE)}
          </button>
        </form>
      </section>

      <section className={cardClass}>
        <h2 className="font-medium">{t(I18N_KEYS.LEAD_HISTORY)}</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {(data.history ?? []).map((item) => (
            <li key={item.id} className="rounded-lg bg-slate-50 p-4">
              <p>{item.note}</p>
              <p className="mt-1 text-slate-500">
                {item.statusAfter} · {item.nextFollowUpAt ? String(item.nextFollowUpAt).slice(0, 16) : 'no next date'} ·{' '}
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
