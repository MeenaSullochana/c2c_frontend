import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { buttonClass, cardClass, fieldClass, ghostButtonClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { clockAttendance, fetchAttendance, fetchEmployees } from '../lib/modules-api';

export function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const attendance = useQuery({ queryKey: ['attendance'], queryFn: fetchAttendance });
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const canManage = user?.permissions.includes(PERMISSIONS.HRM_ATTENDANCE_MANAGE) ?? false;
  const selfEmployeeId = user?.employeeId ?? '';
  const [employeeId, setEmployeeId] = useState(selfEmployeeId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage && selfEmployeeId) {
      setEmployeeId(selfEmployeeId);
    }
  }, [canManage, selfEmployeeId]);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['attendance'] });
  const targetId = canManage ? employeeId : selfEmployeeId;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_ATTENDANCE)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {canManage
            ? 'Clock and view attendance for employees in your scope (branch / team reports).'
            : 'Clock in / out for yourself. You only see your own attendance.'}
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={`${cardClass} flex flex-wrap items-end gap-3`}>
        {canManage ? (
          <select
            className={`${fieldClass} max-w-xs`}
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          >
            <option value="">Employee (your reports)</option>
            {(employees.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {user?.firstName} {user?.lastName}
          </p>
        )}
        <button
          type="button"
          className={buttonClass}
          disabled={!targetId}
          onClick={() =>
            clockAttendance(targetId, 'clock-in')
              .then(refresh)
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
          }
        >
          {t(I18N_KEYS.HRM_CLOCK_IN)}
        </button>
        <button
          type="button"
          className={ghostButtonClass}
          disabled={!targetId}
          onClick={() =>
            clockAttendance(targetId, 'clock-out')
              .then(refresh)
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
          }
        >
          {t(I18N_KEYS.HRM_CLOCK_OUT)}
        </button>
      </section>

      <section className={cardClass}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Employee</th>
              <th>Date</th>
              <th>In</th>
              <th>Out</th>
            </tr>
          </thead>
          <tbody>
            {(attendance.data ?? []).map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="py-2">{item.employee?.name}</td>
                <td>{item.dateKey}</td>
                <td>{new Date(item.clockInAt).toLocaleTimeString()}</td>
                <td>{item.clockOutAt ? new Date(item.clockOutAt).toLocaleTimeString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
