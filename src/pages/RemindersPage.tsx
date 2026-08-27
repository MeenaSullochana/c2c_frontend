import { I18N_KEYS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { buttonClass, cardClass } from '../components/ui';
import { completeReminder, fetchReminders } from '../lib/modules-api';

export function RemindersPage() {
  const queryClient = useQueryClient();
  const reminders = useQuery({ queryKey: ['lead-reminders'], queryFn: fetchReminders });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Follow-up desk</p>
        <h1 className="font-display mt-2 text-4xl">{t(I18N_KEYS.NAV_REMINDERS)}</h1>
      </header>
      <section className="grid gap-4">
        {(reminders.data ?? []).map((lead) => (
          <article key={lead.id} className={`${cardClass} flex flex-wrap items-center justify-between gap-4`}>
            <div>
              <Link to={`/admin/leads/${lead.id}`} className="font-display text-2xl text-[#C62127]">
                {lead.name}
              </Link>
              <p className="mt-1 text-sm text-slate-500">
                {lead.branch?.name} · {lead.status} · {String(lead.reminderAt || lead.nextFollowUpAt || '').slice(0, 16)}
              </p>
            </div>
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                completeReminder(lead.id).then(() => {
                  void queryClient.invalidateQueries({ queryKey: ['lead-reminders'] });
                  void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
                })
              }
            >
              Mark done
            </button>
          </article>
        ))}
        {(reminders.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No reminders due.</p>
        ) : null}
      </section>
    </div>
  );
}
