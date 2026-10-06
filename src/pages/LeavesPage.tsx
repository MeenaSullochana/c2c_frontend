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
  const selfEmployeeId = user?.employeeId ?? '';

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['leaves'] });
    void queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_LEAVES)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {canManage
            ? 'Managers see leave for their branch / team reports and can approve or reject.'
            : 'Apply leave for yourself. Your manager will review pending requests.'}
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <div className="grid gap-6 lg:grid-cols-2">
          {canManage ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const formEl = event.currentTarget;
                const form = new FormData(formEl);
                createLeaveType({
                  name: String(form.get('name')),
                  daysAllowed: Number(form.get('daysAllowed')),
                })
                  .then(() => {
                    formEl.reset();
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
              const formEl = event.currentTarget;
              const form = new FormData(formEl);
              setError(null);
              const employeeId = canManage
                ? String(form.get('employeeId') || selfEmployeeId)
                : selfEmployeeId;
              if (!employeeId) {
                setError('Your login is not linked to an employee profile');
                return;
              }
              createLeave({
                employeeId,
                leaveTypeId: String(form.get('leaveTypeId')),
                startDate: String(form.get('startDate')),
                endDate: String(form.get('endDate')),
                reason: String(form.get('reason')),
              })
                .then(() => {
                  formEl.reset();
                  refresh();
                })
                .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
            }}
          >
            <p className="text-sm text-slate-400">Apply leave</p>
            {canManage ? (
              <select name="employeeId" className={fieldClass} defaultValue={selfEmployeeId} required>
                <option value="">Employee (your reports)</option>
                {(employees.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.firstName} {item.lastName}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Applying as: {user?.firstName} {user?.lastName}
              </p>
            )}
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
            <button type="submit" className={buttonClass} disabled={!canManage && !selfEmployeeId}>
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
                        className="text-emerald-600"
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
