import { I18N_KEYS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass, ghostButtonClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { clockAttendance, fetchAttendance, fetchEmployees } from '../lib/modules-api';

export function AttendancePage() {
  const queryClient = useQueryClient();
  const attendance = useQuery({ queryKey: ['attendance'], queryFn: fetchAttendance });
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['attendance'] });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_ATTENDANCE)}</h1>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={`${cardClass} flex flex-wrap items-end gap-3`}>
        <select className={`${fieldClass} max-w-xs`} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          <option value="">Employee</option>
          {(employees.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.firstName} {item.lastName}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={buttonClass}
          disabled={!employeeId}
          onClick={() =>
            clockAttendance(employeeId, 'clock-in')
              .then(refresh)
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
          }
        >
          {t(I18N_KEYS.HRM_CLOCK_IN)}
        </button>
        <button
          type="button"
          className={ghostButtonClass}
          disabled={!employeeId}
          onClick={() =>
            clockAttendance(employeeId, 'clock-out')
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
