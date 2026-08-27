import { I18N_KEYS } from '../shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { createBranch, fetchBranches, fetchLocationTree } from '../lib/modules-api';

export function BranchesPage() {
  const queryClient = useQueryClient();
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const branches = useQuery({ queryKey: ['branches'], queryFn: fetchBranches });
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const country = tree.data?.find((item) => item.id === countryId);
  const state = country?.states.find((item) => item.id === stateId);
  const cities = state?.cities ?? [];

  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const cityOptions = useMemo(() => cities, [cities]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_BRANCHES)}</h1>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setError(null);
            mutation.mutate(
              {
                cityId,
                name: String(form.get('name')),
                code: String(form.get('code')),
                address: String(form.get('address') || ''),
              },
              {
                onError: (err) => setError(translateMessage(err instanceof ApiError ? err.message : err)),
                onSuccess: () => event.currentTarget.reset(),
              },
            );
          }}
        >
          <select
            className={fieldClass}
            value={countryId}
            onChange={(event) => {
              setCountryId(event.target.value);
              setStateId('');
              setCityId('');
            }}
          >
            <option value="">{t(I18N_KEYS.LOCATION_COUNTRY)}</option>
            {(tree.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={stateId}
            onChange={(event) => {
              setStateId(event.target.value);
              setCityId('');
            }}
          >
            <option value="">{t(I18N_KEYS.LOCATION_STATE)}</option>
            {(country?.states ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select className={fieldClass} value={cityId} onChange={(event) => setCityId(event.target.value)}>
            <option value="">{t(I18N_KEYS.LOCATION_CITY)}</option>
            {cityOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="name" placeholder="Chennai HQ" className={fieldClass} required />
          <input name="code" placeholder="CHN" className={fieldClass} required />
          <input name="address" placeholder="Address" className={fieldClass} />
          <button type="submit" className={buttonClass} disabled={!cityId}>
            {t(I18N_KEYS.COMMON_CREATE)}
          </button>
        </form>
      </section>

      <section className={cardClass}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Name</th>
              <th>Code</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {(branches.data ?? []).map((branch) => (
              <tr key={branch.id} className="border-t border-slate-200">
                <td className="py-2">{branch.name}</td>
                <td>{branch.code}</td>
                <td>
                  {[branch.country?.name, branch.state?.name, branch.city?.name].filter(Boolean).join(' / ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
