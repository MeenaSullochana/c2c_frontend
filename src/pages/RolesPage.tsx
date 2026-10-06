import { I18N_KEYS, ORG_ROLE_LABELS, ORG_ROLE_SCOPE, ORG_ROLES, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  buttonClass,
  cardClass,
  fieldClass,
  ghostButtonClass,
  pageEyebrowClass,
  pageLeadClass,
  pageTitleClass,
  tableClass,
  tdClass,
  thClass,
} from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { createRole, fetchRoles } from '../lib/modules-api';

const permissionOptions = Object.values(PERMISSIONS);
const selectableRoles = ORG_ROLES.filter((role) => !['MANAGER', 'SUPERVISOR', 'STAFF'].includes(role));
const PAGE_SIZES = [6, 12, 24, 48] as const;

type RoleRow = {
  id: string;
  name: string;
  key: string;
  description: string;
  orgRole: string;
  permissions: string[];
};

function exportRolesCsv(rows: RoleRow[], filename: string) {
  const header = ['Name', 'Key', 'Org role', 'Data scope', 'Description', 'Permissions count', 'Permissions'];
  const lines = rows.map((row) => {
    const scope = ORG_ROLE_SCOPE[row.orgRole as keyof typeof ORG_ROLE_SCOPE] ?? 'SELF';
    const cells = [
      row.name,
      row.key,
      ORG_ROLE_LABELS[row.orgRole as keyof typeof ORG_ROLE_LABELS] ?? row.orgRole,
      scope,
      row.description || '',
      String(row.permissions.length),
      row.permissions.join('; '),
    ];
    return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
  });
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function RolesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const roles = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(12);
  const [selected, setSelected] = useState<RoleRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const canManage = user?.permissions.includes(PERMISSIONS.ROLE_MANAGE) ?? false;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (roles.data ?? []).filter((role) => {
      if (orgFilter !== 'ALL' && role.orgRole !== orgFilter) return false;
      if (!q) return true;
      return (
        role.name.toLowerCase().includes(q) ||
        role.key.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.orgRole.toLowerCase().includes(q) ||
        role.permissions.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [roles.data, search, orgFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={pageEyebrowClass}>Access control</p>
          <h1 className={pageTitleClass}>{t(I18N_KEYS.NAV_ROLES)}</h1>
          <p className={pageLeadClass}>
            Head → Regional → Location → Branch → Sales Manager → Executive / Accounts / Coordinator. Login data
            follows each role&apos;s data scope.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={ghostButtonClass}
            onClick={() =>
              exportRolesCsv(filtered, `roles-${orgFilter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`)
            }
            disabled={filtered.length === 0}
          >
            Export CSV
          </button>
          {canManage ? (
            <button type="button" className={buttonClass} onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Hide form' : 'New role'}
            </button>
          ) : null}
        </div>
      </header>

      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      {canManage && showCreate ? (
        <section className={`${cardClass} mz-rise`}>
          <h2 className="font-display text-xl text-[#0c1624]">Create role</h2>
          <form
            className="mt-4 grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const formEl = event.currentTarget;
              const form = new FormData(formEl);
              const selectedPerms = permissionOptions.filter((key) => form.getAll('permissions').includes(key));
              createRole({
                name: String(form.get('name')),
                orgRole: String(form.get('orgRole')),
                description: String(form.get('description') || ''),
                permissions: selectedPerms,
              })
                .then(() => {
                  formEl.reset();
                  setError(null);
                  setShowCreate(false);
                  void queryClient.invalidateQueries({ queryKey: ['roles'] });
                })
                .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
            }}
          >
            <input name="name" placeholder="TN Regional Head" className={fieldClass} required />
            <select name="orgRole" className={fieldClass} required defaultValue="BRANCH_HEAD">
              {selectableRoles.map((role) => (
                <option key={role} value={role}>
                  {ORG_ROLE_LABELS[role]} · scope {ORG_ROLE_SCOPE[role]}
                </option>
              ))}
            </select>
            <input name="description" placeholder="Description" className={`${fieldClass} md:col-span-2`} />
            <div className="md:col-span-2 grid max-h-48 grid-cols-2 gap-2 overflow-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
              {permissionOptions.map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" name="permissions" value={permission} />
                  {permission}
                </label>
              ))}
            </div>
            <button type="submit" className={buttonClass}>
              {t(I18N_KEYS.COMMON_CREATE)}
            </button>
          </form>
        </section>
      ) : null}

      <section className={cardClass}>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Search
            <input
              className={`${fieldClass} mt-1.5`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name, key, permission…"
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Org role
            <select
              className={`${fieldClass} mt-1.5`}
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All roles</option>
              {selectableRoles.map((role) => (
                <option key={role} value={role}>
                  {ORG_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Per page
            <select
              className={`${fieldClass} mt-1.5`}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Showing {pageRows.length} of {filtered.length} role{filtered.length === 1 ? '' : 's'}
          {orgFilter === 'ALL' ? ' (all list)' : ''}
        </p>
      </section>

      <section className={`${cardClass} overflow-hidden p-0`}>
        <div className="overflow-x-auto">
          {roles.isLoading ? <p className="px-6 py-8 text-sm text-slate-400">Loading…</p> : null}
          <table className={tableClass}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className={`${thClass} pl-6 pt-4`}>Role</th>
                <th className={`${thClass} pt-4`}>Org level</th>
                <th className={`${thClass} pt-4`}>Data scope</th>
                <th className={`${thClass} pt-4`}>Permissions</th>
                <th className={`${thClass} pt-4 pr-6`} />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((role) => (
                <tr
                  key={role.id}
                  className="cursor-pointer border-t border-slate-50 transition hover:bg-[#0087C3]/[0.04]"
                  onClick={() => setSelected(role)}
                >
                  <td className={`${tdClass} pl-6`}>
                    <div className="font-semibold text-slate-800">{role.name}</div>
                    <div className="text-xs text-slate-400">{role.key}</div>
                  </td>
                  <td className={tdClass}>
                    {ORG_ROLE_LABELS[role.orgRole as keyof typeof ORG_ROLE_LABELS] ?? role.orgRole}
                  </td>
                  <td className={tdClass}>
                    <span className="rounded-lg bg-[#0087C3]/10 px-2 py-1 text-xs font-semibold text-[#0087C3]">
                      {ORG_ROLE_SCOPE[role.orgRole as keyof typeof ORG_ROLE_SCOPE] ?? 'SELF'}
                    </span>
                  </td>
                  <td className={tdClass}>{role.permissions.length}</td>
                  <td className={`${tdClass} pr-6`}>
                    <span className="text-sm font-semibold text-[#0087C3]">View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!roles.isLoading && pageRows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400">No roles match this filter.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={ghostButtonClass}
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className={ghostButtonClass}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#0c1624]/45 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <article
            className={`${cardClass} mz-rise max-h-[88vh] w-full max-w-2xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={pageEyebrowClass}>Role detail</p>
                <h2 className="font-display mt-1 text-3xl text-[#0c1624]">{selected.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.key}</p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Detail label="Org level" value={ORG_ROLE_LABELS[selected.orgRole as keyof typeof ORG_ROLE_LABELS] ?? selected.orgRole} />
              <Detail
                label="Data scope"
                value={ORG_ROLE_SCOPE[selected.orgRole as keyof typeof ORG_ROLE_SCOPE] ?? 'SELF'}
              />
              <Detail label="Permissions" value={String(selected.permissions.length)} />
              <Detail label="Description" value={selected.description || 'No description'} />
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Full permission list
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {selected.permissions.length === 0 ? (
                  <li className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-400">No permissions assigned</li>
                ) : (
                  selected.permissions.map((perm) => (
                    <li
                      key={perm}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      {perm}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => exportRolesCsv([selected], `role-${selected.key}.csv`)}
              >
                Export this role
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
