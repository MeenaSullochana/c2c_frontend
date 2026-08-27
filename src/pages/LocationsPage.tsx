import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import {
  createBranch,
  createCity,
  createCountry,
  createState,
  fetchEmployees,
  fetchLocationTree,
} from '../lib/modules-api';

export function LocationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canManageLocation = user?.permissions.includes(PERMISSIONS.LOCATION_MANAGE) ?? false;
  const canManageBranch = user?.permissions.includes(PERMISSIONS.BRANCH_MANAGE) ?? false;

  const countries = tree.data ?? [];
  const selectedCountry = countries.find((item) => item.id === countryId);
  const selectedState = selectedCountry?.states.find((item) => item.id === stateId);
  const selectedCity = selectedState?.cities.find((item) => item.id === cityId);
  const selectedBranch = selectedCity?.branches.find((item) => item.id === branchId);
  const branchStaff = useMemo(
    () => (employees.data ?? []).filter((item) => item.branch?.id === branchId),
    [employees.data, branchId],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['locations'] });
    void queryClient.invalidateQueries({ queryKey: ['branches'] });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Linked geography</p>
        <h1 className="font-display mt-2 text-4xl">{t(I18N_KEYS.NAV_LOCATIONS)}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Country unlocks states, states unlock cities, cities unlock branches, and each branch holds its manager, supervisors, and staff.
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <section className={cardClass}>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[#0087C3]">{t(I18N_KEYS.LOCATION_COUNTRY)}</h2>
          {canManageLocation ? (
            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                createCountry({ name: String(form.get('name')), code: String(form.get('code')) })
                  .then(() => {
                    event.currentTarget.reset();
                    invalidate();
                  })
                  .catch((err) => setError(translateMessage(err)));
              }}
            >
              <input name="name" placeholder="Country name" className={fieldClass} required minLength={2} />
              <input name="code" placeholder="Code e.g. IN" className={fieldClass} required minLength={2} maxLength={12} />
              <button type="submit" className={buttonClass}>
                Add
              </button>
            </form>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {countries.map((country) => (
              <li key={country.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    country.id === countryId ? 'bg-[#0087C3]/10 ring-1 ring-[#0087C3]/40' : 'bg-slate-50'
                  }`}
                  onClick={() => {
                    setCountryId(country.id);
                    setStateId('');
                    setCityId('');
                    setBranchId('');
                  }}
                >
                  {country.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[#0087C3]">{t(I18N_KEYS.LOCATION_STATE)}</h2>
          {canManageLocation ? (
            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!countryId) return;
                const form = new FormData(event.currentTarget);
                createState({ countryId, name: String(form.get('name')), code: String(form.get('code')) })
                  .then(() => {
                    event.currentTarget.reset();
                    invalidate();
                  })
                  .catch((err) => setError(translateMessage(err)));
              }}
            >
              <input name="name" placeholder="Tamil Nadu" className={fieldClass} required disabled={!countryId} />
              <input name="code" placeholder="TN" className={fieldClass} required disabled={!countryId} />
              <button type="submit" className={buttonClass} disabled={!countryId}>
                Add
              </button>
            </form>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {(selectedCountry?.states ?? []).map((state) => (
              <li key={state.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    state.id === stateId ? 'bg-[#0087C3]/10 ring-1 ring-[#0087C3]/40' : 'bg-slate-50'
                  }`}
                  onClick={() => {
                    setStateId(state.id);
                    setCityId('');
                    setBranchId('');
                  }}
                >
                  {state.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[#0087C3]">{t(I18N_KEYS.LOCATION_CITY)}</h2>
          {canManageLocation ? (
            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!stateId) return;
                const form = new FormData(event.currentTarget);
                createCity({ stateId, name: String(form.get('name')) })
                  .then(() => {
                    event.currentTarget.reset();
                    invalidate();
                  })
                  .catch((err) => setError(translateMessage(err)));
              }}
            >
              <input name="name" placeholder="Chennai" className={fieldClass} required disabled={!stateId} />
              <button type="submit" className={buttonClass} disabled={!stateId}>
                Add
              </button>
            </form>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {(selectedState?.cities ?? []).map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    city.id === cityId ? 'bg-[#0087C3]/10 ring-1 ring-[#0087C3]/40' : 'bg-slate-50'
                  }`}
                  onClick={() => {
                    setCityId(city.id);
                    setBranchId('');
                  }}
                >
                  {city.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[#0087C3]">{t(I18N_KEYS.NAV_BRANCHES)}</h2>
          {canManageBranch ? (
            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!cityId) return;
                const form = new FormData(event.currentTarget);
                createBranch({
                  cityId,
                  name: String(form.get('name')),
                  code: String(form.get('code')),
                  address: String(form.get('address') || ''),
                })
                  .then(() => {
                    event.currentTarget.reset();
                    invalidate();
                  })
                  .catch((err) => setError(translateMessage(err)));
              }}
            >
              <input name="name" placeholder="Chennai HQ" className={fieldClass} required disabled={!cityId} />
              <input name="code" placeholder="CHN" className={fieldClass} required disabled={!cityId} />
              <input name="address" placeholder="Address" className={fieldClass} disabled={!cityId} />
              <button type="submit" className={buttonClass} disabled={!cityId}>
                Add
              </button>
            </form>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {(selectedCity?.branches ?? []).map((branch) => (
              <li key={branch.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    branch.id === branchId ? 'bg-[#0087C3]/10 ring-1 ring-[#0087C3]/40' : 'bg-slate-50'
                  }`}
                  onClick={() => setBranchId(branch.id)}
                >
                  {branch.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[#0087C3]">Branch staff</h2>
          <p className="mt-2 text-xs text-slate-400">{selectedBranch?.name || 'Select a branch'}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {branchStaff.map((item) => (
              <li key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <p>
                  {item.firstName} {item.lastName}
                </p>
                <p className="text-xs text-[#0087C3]">
                  {item.role?.name || item.orgRole}
                </p>
              </li>
            ))}
          </ul>
          {branchId ? (
            <Link to={`/admin/employees?branchId=${branchId}`} className={`${buttonClass} mt-4 inline-block text-center`}>
              Create employee
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}
