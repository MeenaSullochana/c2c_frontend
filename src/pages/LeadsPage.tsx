import { I18N_KEYS, LEAD_STATUS_LABELS, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import {
  filterBranchesForScope,
  filterCountriesForScope,
  getLocationScopeLocks,
  resolveScopedCountryId,
} from '../lib/location-scope';
import { createLead, fetchBranches, fetchEmployees, fetchLeads, fetchLocationTree } from '../lib/modules-api';

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

export function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const branches = useQuery({ queryKey: ['branches'], queryFn: fetchBranches });
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const locks = useMemo(() => getLocationScopeLocks(user), [user]);
  const [filters, setFilters] = useState({
    q: '',
    countryId: '',
    stateId: '',
    cityId: '',
    branchId: '',
    status: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [createBranchId, setCreateBranchId] = useState('');
  const canCreate = user?.permissions.includes(PERMISSIONS.LEAD_CREATE) ?? false;

  useEffect(() => {
    if (locks.scope === 'ALL' || !tree.data) return;
    const nextCountry = resolveScopedCountryId(tree.data, locks);
    setFilters((current) => ({
      ...current,
      countryId: nextCountry || current.countryId,
      stateId: locks.stateId || current.stateId,
      cityId: locks.lockCity ? locks.cityId : current.cityId,
      branchId: locks.lockBranch ? locks.branchId : current.branchId,
    }));
    if (locks.lockBranch && locks.branchId) {
      setCreateBranchId(locks.branchId);
    }
  }, [locks, tree.data]);

  const activeFilters = useMemo(() => {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  }, [filters]);

  const leads = useQuery({
    queryKey: ['leads', activeFilters],
    queryFn: () => fetchLeads(activeFilters),
  });

  const scopedCountries = filterCountriesForScope(tree.data, locks);
  const country = scopedCountries.find((item) => item.id === filters.countryId);
  const state = country?.states.find((item) => item.id === filters.stateId);
  const branchOptions = filterBranchesForScope(branches.data, locks, {
    countryId: filters.countryId,
    stateId: filters.stateId,
    cityId: filters.cityId,
  });
  const createBranchOptions = filterBranchesForScope(branches.data, locks, {
    countryId: locks.countryId || filters.countryId,
    stateId: locks.stateId || filters.stateId,
    cityId: locks.cityId || filters.cityId,
  });
  const selectedBranch = createBranchOptions.find((item) => item.id === createBranchId);
  const lockedSelectClass = `${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_LEADS)}</h1>
        <Link to="/admin/leads/import" className="text-sm text-sky-300">
          {t(I18N_KEYS.NAV_LEAD_IMPORT)}
        </Link>
      </div>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={`${cardClass} grid gap-3 md:grid-cols-3 lg:grid-cols-6`}>
        <input
          className={fieldClass}
          placeholder={t(I18N_KEYS.COMMON_SEARCH)}
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />
        <select
          className={lockedSelectClass}
          value={filters.countryId}
          disabled={locks.lockCountry}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              countryId: event.target.value,
              stateId: '',
              cityId: '',
              branchId: '',
            }))
          }
        >
          <option value="">{t(I18N_KEYS.LOCATION_COUNTRY)}</option>
          {scopedCountries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={lockedSelectClass}
          value={filters.stateId}
          disabled={locks.lockState}
          onChange={(event) =>
            setFilters((current) => ({ ...current, stateId: event.target.value, cityId: '', branchId: '' }))
          }
        >
          <option value="">{t(I18N_KEYS.LOCATION_STATE)}</option>
          {(country?.states ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={lockedSelectClass}
          value={filters.cityId}
          disabled={locks.lockCity}
          onChange={(event) =>
            setFilters((current) => ({ ...current, cityId: event.target.value, branchId: '' }))
          }
        >
          <option value="">{t(I18N_KEYS.LOCATION_CITY)}</option>
          {(state?.cities ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={lockedSelectClass}
          value={filters.branchId}
          disabled={locks.lockBranch}
          onChange={(event) => setFilters((current) => ({ ...current, branchId: event.target.value }))}
        >
          <option value="">{t(I18N_KEYS.BRANCH_TITLE)}</option>
          {branchOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="">{t(I18N_KEYS.COMMON_STATUS)}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABELS[status] ?? status}
            </option>
          ))}
        </select>
      </section>

      {canCreate ? (
        <section className={cardClass}>
          <form
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formEl = event.currentTarget;
              const form = new FormData(formEl);
              setError(null);
              createLead({
                name: String(form.get('name')),
                email: String(form.get('email')),
                phone: String(form.get('phone')),
                source: String(form.get('source') || 'manual'),
                countryId: selectedBranch?.country?.id,
                stateId: selectedBranch?.state?.id,
                cityId: selectedBranch?.city?.id,
                branchId: String(form.get('branchId')),
                assignedEmployeeId: String(form.get('assignedEmployeeId') || '') || null,
                notes: String(form.get('notes') || ''),
              })
                .then(() => {
                  formEl.reset();
                  if (!locks.lockBranch) {
                    setCreateBranchId('');
                  }
                  void queryClient.invalidateQueries({ queryKey: ['leads'] });
                })
                .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
            }}
          >
            <input name="name" placeholder="Lead name" className={fieldClass} required />
            <input name="email" type="email" placeholder="Email" className={fieldClass} />
            <input name="phone" placeholder="Phone" className={fieldClass} />
            <input name="source" placeholder="Source" className={fieldClass} />
            <select
              name="branchId"
              className={lockedSelectClass}
              value={createBranchId}
              disabled={locks.lockBranch}
              onChange={(event) => setCreateBranchId(event.target.value)}
            >
              <option value="">Branch</option>
              {createBranchOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select name="assignedEmployeeId" className={fieldClass}>
              <option value="">Assignee</option>
              {(employees.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Notes" className={fieldClass} />
            <button type="submit" className={buttonClass} disabled={!createBranchId}>
              {t(I18N_KEYS.COMMON_CREATE)}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">Leads are stored against the selected branch location.</p>
        </section>
      ) : null}

      <section className={cardClass}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Customer</th>
              <th>Campaign</th>
              <th>Called</th>
              <th>Connected</th>
              <th>Status</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {(leads.data ?? []).map((lead) => (
              <tr key={lead.id} className="border-t border-slate-200">
                <td className="py-2">
                  <Link to={`/admin/leads/${lead.id}`} className="text-[#0087C3]">
                    {lead.name}
                  </Link>
                  <p className="text-xs text-slate-400">{lead.phone || '—'}</p>
                </td>
                <td>{lead.campaignName || lead.source || '—'}</td>
                <td>{lead.called ? 'Y' : 'N'}</td>
                <td>{lead.connected ? 'Y' : 'N'}</td>
                <td>{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</td>
                <td>{lead.branch?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
