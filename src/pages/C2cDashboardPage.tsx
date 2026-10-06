import { I18N_KEYS, LEAD_STATUS_LABELS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cardClass, fieldClass, tableClass } from '../components/ui';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';
import {
  filterBranchesForScope,
  filterCountriesForScope,
  getLocationScopeLocks,
  resolveScopedCountryId,
} from '../lib/location-scope';
import { fetchBranches, fetchC2cDashboard, fetchLocationTree } from '../lib/modules-api';

const statuses = [
  'NOT_CALLED',
  'CALLED_NOT_CONTACTED',
  'CONTACTED_NOT_INTERESTED',
  'CONTACTED_FOLLOWUP',
  'CONTACTED_NOT_ELIGIBLE',
  'CONTACTED_INTERESTED',
  'LOGIN',
  'DISBURSED',
  'RNR',
];

export function C2cDashboardPage() {
  const { user } = useAuth();
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const branches = useQuery({ queryKey: ['branches'], queryFn: fetchBranches });
  const locks = useMemo(() => getLocationScopeLocks(user), [user]);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [rsm, setRsm] = useState('');
  const [team, setTeam] = useState('');
  const [bdoCode, setBdoCode] = useState('');
  const [loanType, setLoanType] = useState('');
  const [scopeReady, setScopeReady] = useState(locks.scope === 'ALL');

  useEffect(() => {
    if (locks.scope === 'ALL') {
      setScopeReady(true);
      return;
    }
    if (!tree.data) return;

    const nextCountry = resolveScopedCountryId(tree.data, locks);
    const nextState = locks.stateId;
    const nextCity = locks.lockCity ? locks.cityId : '';
    const nextBranch = locks.lockBranch ? locks.branchId : '';

    setCountryId(nextCountry);
    setStateId(nextState);
    setCityId(nextCity);
    setBranchId(nextBranch);
    setScopeReady(Boolean(nextCountry || nextState || !locks.lockState));
  }, [locks, tree.data]);

  const params = useMemo(() => {
    const next: Record<string, string> = {};
    if (from) next.from = from;
    if (to) next.to = to;
    if (countryId) next.countryId = countryId;
    if (stateId) next.stateId = stateId;
    if (cityId) next.cityId = cityId;
    if (branchId) next.branchId = branchId;
    if (status) next.status = status;
    if (campaignName) next.campaignName = campaignName;
    if (rsm) next.rsm = rsm;
    if (team) next.team = team;
    if (bdoCode) next.bdoCode = bdoCode;
    if (loanType) next.loanType = loanType;
    return next;
  }, [
    from,
    to,
    countryId,
    stateId,
    cityId,
    branchId,
    status,
    campaignName,
    rsm,
    team,
    bdoCode,
    loanType,
  ]);

  const dashboard = useQuery({
    queryKey: ['c2c-dashboard', params],
    queryFn: () => fetchC2cDashboard(params),
    enabled: scopeReady,
  });

  const data = dashboard.data;
  const scopedCountries = filterCountriesForScope(tree.data, locks);
  const country = scopedCountries.find((item) => item.id === countryId);
  const state = country?.states.find((item) => item.id === stateId);
  const cityOptions = state?.cities ?? [];
  const branchOptions = filterBranchesForScope(branches.data, locks, { countryId, stateId, cityId });

  const kpis = [
    { label: 'LEADS', value: data?.kpis.leads ?? 0 },
    { label: 'CALLED', value: data?.kpis.called ?? 0 },
    { label: '%_CALLED', value: `${data?.kpis.percentCalled ?? 0}%` },
    { label: 'CONNECTED', value: data?.kpis.connected ?? 0 },
    { label: '%_CONNECTED', value: `${data?.kpis.percentConnected ?? 0}%` },
  ];

  const lockedSelectClass = `${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`;

  const locationRows =
    data?.locations ??
    (data?.teams ?? []).map((row) => ({
      location: row.team,
      leads: row.leads,
      statuses: row.statuses,
    }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0087C3]">C2C</p>
        <h1 className="mt-2 text-4xl font-bold">{t(I18N_KEYS.NAV_C2C_DASHBOARD)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Scope: <span className="font-semibold text-[#C62127]">{data?.scope || user?.accessScope || 'ALL'}</span>
          {user?.country?.name ? ` · ${user.country.name}` : ''}
          {user?.state?.name ? ` · ${user.state.name}` : ''}
          {user?.city?.name ? ` · ${user.city.name}` : ''}
          {user?.branch?.name ? ` · ${user.branch.name}` : ''}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cardClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#C62127]">{kpi.value}</p>
          </div>
        ))}
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-[#0087C3]">Call outcomes</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {(data?.outcome ?? []).map((item) => (
            <li key={item.status}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="shrink-0 text-sm">
                  <span className="font-semibold text-[#C62127]">{item.count}</span>
                  <span className="ml-2 text-slate-400">{item.percent}%</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0087C3]"
                  style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardClass} grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}>
        <input
          type="date"
          className={fieldClass}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className={fieldClass}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          title="To date"
        />
        <select
          className={lockedSelectClass}
          value={countryId}
          disabled={locks.lockCountry}
          onChange={(e) => {
            setCountryId(e.target.value);
            setStateId('');
            setCityId('');
            setBranchId('');
          }}
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
          value={stateId}
          disabled={locks.lockState}
          onChange={(e) => {
            setStateId(e.target.value);
            setCityId('');
            setBranchId('');
          }}
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
          value={cityId}
          disabled={locks.lockCity}
          onChange={(e) => {
            setCityId(e.target.value);
            setBranchId('');
          }}
        >
          <option value="">{t(I18N_KEYS.LOCATION_CITY)}</option>
          {cityOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={lockedSelectClass}
          value={branchId}
          disabled={locks.lockBranch}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <option value="">{t(I18N_KEYS.BRANCH_TITLE)}</option>
          {branchOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t(I18N_KEYS.COMMON_STATUS)}</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {LEAD_STATUS_LABELS[item] ?? item}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={campaignName} onChange={(e) => setCampaignName(e.target.value)}>
          <option value="">All campaigns</option>
          {(data?.filters.campaigns ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={rsm} onChange={(e) => setRsm(e.target.value)}>
          <option value="">RSM (CSV)</option>
          {(data?.filters.rsms ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">All teams</option>
          {(data?.filters.teams ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={bdoCode} onChange={(e) => setBdoCode(e.target.value)}>
          <option value="">All BDO</option>
          {(data?.filters.bdoCodes ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={loanType} onChange={(e) => setLoanType(e.target.value)}>
          <option value="">All loan types</option>
          {(data?.filters.loanTypes ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      <section className={`${cardClass} overflow-x-auto`}>
        <h2 className="text-lg font-semibold text-[#0087C3]">Campaign performance</h2>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Campaign</th>
              <th>Leads</th>
              <th>Called</th>
              <th>% Called</th>
              <th>Connected</th>
              <th>% Connected</th>
            </tr>
          </thead>
          <tbody>
            {(data?.campaigns ?? []).map((row) => (
              <tr key={row.campaignName} className="border-t border-slate-200">
                <td className="py-2 font-medium">{row.campaignName}</td>
                <td>{row.leads}</td>
                <td>{row.called}</td>
                <td>{row.percentCalled}%</td>
                <td>{row.connected}</td>
                <td>{row.percentConnected}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-[#0087C3]">Hourly calling monitor</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {(data?.hourly ?? []).map((row) => (
            <div key={row.hour} className="rounded-xl bg-slate-50 px-3 py-3 text-center">
              <p className="text-xs text-slate-500">
                {row.hour}:00–{row.hour + 1}:00
              </p>
              <p className="mt-1 text-xl font-bold text-[#0087C3]">{row.called}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardClass} overflow-x-auto`}>
        <h2 className="text-lg font-semibold text-[#0087C3]">Location / Branch status split</h2>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Location / Branch</th>
              <th>Leads</th>
              <th>NOT CALLED</th>
              <th>Not Contacted</th>
              <th>Not Interested</th>
              <th>Followup</th>
              <th>Login</th>
            </tr>
          </thead>
          <tbody>
            {(locationRows ?? []).map((row) => (
              <tr key={row.location} className="border-t border-slate-200">
                <td className="py-2 font-medium">{row.location}</td>
                <td>{row.leads}</td>
                <td>{(row.statuses.NOT_CALLED ?? 0) + (row.statuses.NEW ?? 0)}</td>
                <td>{row.statuses.CALLED_NOT_CONTACTED ?? 0}</td>
                <td>{(row.statuses.CONTACTED_NOT_INTERESTED ?? 0) + (row.statuses.LOST ?? 0)}</td>
                <td>{(row.statuses.CONTACTED_FOLLOWUP ?? 0) + (row.statuses.FOLLOW_UP ?? 0)}</td>
                <td>{row.statuses.LOGIN ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${cardClass} overflow-x-auto`}>
        <h2 className="text-lg font-semibold text-[#0087C3]">Executive calling detail</h2>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Customer</th>
              <th>Phone</th>
              <th>Campaign</th>
              <th>Called</th>
              <th>Connected</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent ?? []).map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="py-2">
                  <Link className="font-medium text-[#0087C3]" to={`/admin/leads/${row.id}`}>
                    {row.name}
                  </Link>
                </td>
                <td>{row.phone}</td>
                <td>{row.campaignName}</td>
                <td>{row.called ? 'Y' : 'N'}</td>
                <td>{row.connected ? 'Y' : 'N'}</td>
                <td>{row.statusLabel || LEAD_STATUS_LABELS[row.status] || row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
