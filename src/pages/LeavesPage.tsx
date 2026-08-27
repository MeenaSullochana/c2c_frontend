import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { createLeave, createLeaveType, decideLeave, fetchEmployees, fetchLeaveTypes, fetchLeaves } from '../lib/modules-api';

export function LeavesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const leaves = useQuery({ queryKey: ['leaves'], queryFn: () => fetchLeaves() });
  const types = useQuery({ queryKey: ['leave-types'], queryFn: fetchLeaveTypes });
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const [error, setError] = useState<string | null>(null);
  const canManage = user?.permissions.includes(PERMISSIONS.HRM_LEAVE_MANAGE) ?? false;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['leaves'] });
    void queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_LEAVES)}</h1>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <div className="grid gap-6 lg:grid-cols-2">
          {canManage ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                createLeaveType({
                  name: String(form.get('name')),
                  daysAllowed: Number(form.get('daysAllowed')),
                })
                  .then(() => {
                    event.currentTarget.reset();
                    refresh();
                  })
                  .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
              }}
            >
              <p className="text-sm text-slate-400">Leave type</p>
              <input name="name" placeholder="Casual Leave" className={fieldClass} required />
              <input name="daysAllowed" type="number" min={1} defaultValue={12} className={fieldClass} required />
              <button type="submit" className={buttonClass}>
                {t(I18N_KEYS.COMMON_CREATE)}
              </button>
            </form>
          ) : null}

          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setError(null);
              createLeave({
                employeeId: String(form.get('employeeId')),
                leaveTypeId: String(form.get('leaveTypeId')),
                startDate: String(form.get('startDate')),
                endDate: String(form.get('endDate')),
                reason: String(form.get('reason')),
              })
                .then(() => {
                  event.currentTarget.reset();
                  refresh();
                })
                .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
            }}
          >
            <p className="text-sm text-slate-400">Apply leave</p>
            <select name="employeeId" className={fieldClass} required>
              <option value="">Employee</option>
              {(employees.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
            <select name="leaveTypeId" className={fieldClass} required>
              <option value="">Type</option>
              {(types.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input name="startDate" type="date" className={fieldClass} required />
            <input name="endDate" type="date" className={fieldClass} required />
            <input name="reason" placeholder="Reason" className={fieldClass} required />
            <button type="submit" className={buttonClass}>
              {t(I18N_KEYS.COMMON_CREATE)}
            </button>
          </form>
        </div>
      </section>

      <section className={cardClass}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(leaves.data ?? []).map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="py-2">{item.employee?.name}</td>
                <td>{item.leaveType?.name}</td>
                <td>
                  {String(item.startDate).slice(0, 10)} → {String(item.endDate).slice(0, 10)}
                </td>
                <td>{item.status}</td>
                <td className="space-x-3">
                  {canManage && item.status === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        className="text-emerald-300"
                        onClick={() =>
                          decideLeave(item.id, 'approve')
                            .then(refresh)
                            .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
                        }
                      >
                        {t(I18N_KEYS.HRM_LEAVE_APPROVE)}
                      </button>
                      <button
                        type="button"
                        className="text-[#C62127]"
                        onClick={() =>
                          decideLeave(item.id, 'reject')
                            .then(refresh)
                            .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
                        }
                      >
                        {t(I18N_KEYS.HRM_LEAVE_REJECT)}
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
