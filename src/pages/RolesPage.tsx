import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { createRole, fetchRoles } from '../lib/modules-api';

const permissionOptions = Object.values(PERMISSIONS);

export function RolesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const roles = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
  const [error, setError] = useState<string | null>(null);
  const canManage = user?.permissions.includes(PERMISSIONS.ROLE_MANAGE) ?? false;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Access control</p>
        <h1 className="font-display mt-2 text-4xl">{t(I18N_KEYS.NAV_ROLES)}</h1>
        <p className="mt-2 text-sm text-slate-500">Create roles with a minimum age and permission set. Employee assignment is checked against date of birth.</p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      {canManage ? (
        <section className={cardClass}>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const selected = permissionOptions.filter((key) => form.getAll('permissions').includes(key));
              createRole({
                name: String(form.get('name')),
                minAge: Number(form.get('minAge')),
                orgRole: String(form.get('orgRole')),
                description: String(form.get('description') || ''),
                permissions: selected,
              })
                .then(() => {
                  event.currentTarget.reset();
                  void queryClient.invalidateQueries({ queryKey: ['roles'] });
                })
                .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
            }}
          >
            <input name="name" placeholder="Relationship manager" className={fieldClass} required />
            <input name="minAge" type="number" min={16} defaultValue={21} className={fieldClass} required />
            <select name="orgRole" className={fieldClass} required>
              <option value="MANAGER">Manager</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="STAFF">Staff</option>
            </select>
            <input name="description" placeholder="Description" className={fieldClass} />
            <div className="md:col-span-2 grid max-h-48 grid-cols-2 gap-2 overflow-auto rounded-2xl bg-slate-50 p-3 text-xs">
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

      <section className="grid gap-4 md:grid-cols-2">
        {(roles.data ?? []).map((role) => (
          <article key={role.id} className={cardClass}>
            <p className="text-xs uppercase tracking-[0.18em] text-[#0087C3]">{role.orgRole}</p>
            <h2 className="font-display mt-1 text-2xl">{role.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{role.description || 'No description'}</p>
            <p className="mt-3 text-sm text-[#C62127]">Minimum age {role.minAge}</p>
            <p className="mt-2 text-xs text-slate-400">{role.permissions.length} permissions</p>
          </article>
        ))}
      </section>
    </div>
  );
}
