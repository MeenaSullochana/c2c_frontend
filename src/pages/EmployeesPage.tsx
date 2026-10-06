import { I18N_KEYS, PERMISSIONS } from '../shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ImageFileField } from '../components/ImageFileField';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import {
  createDepartment,
  createDesignation,
  createEmployee,
  deactivateEmployee,
  fetchDepartments,
  fetchDesignations,
  fetchEmployees,
  fetchLocationTree,
  fetchRoles,
} from '../lib/modules-api';

export function EmployeesPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const departments = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments });
  const designations = useQuery({ queryKey: ['designations'], queryFn: fetchDesignations });
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: Boolean(user?.permissions.includes(PERMISSIONS.ROLE_VIEW) || user?.permissions.includes(PERMISSIONS.HRM_EMPLOYEE_CREATE)),
  });
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [branchId, setBranchId] = useState(params.get('branchId') ?? '');
  const [roleId, setRoleId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId || !tree.data) {
      return;
    }
    for (const country of tree.data) {
      for (const state of country.states) {
        for (const city of state.cities) {
          if (city.branches.some((branch) => branch.id === branchId)) {
            setCountryId(country.id);
            setStateId(state.id);
            setCityId(city.id);
            return;
          }
        }
      }
    }
  }, [branchId, tree.data]);

  const canCreate = user?.permissions.includes(PERMISSIONS.HRM_EMPLOYEE_CREATE) ?? false;
  const canDeactivate = user?.permissions.includes(PERMISSIONS.HRM_EMPLOYEE_DEACTIVATE) ?? false;

  const selectedRole = (roles.data ?? []).find((item) => item.id === roleId);
  const orgRole = selectedRole?.orgRole ?? 'EXECUTIVE';
  const country = tree.data?.find((item) => item.id === countryId);
  const state = country?.states.find((item) => item.id === stateId);
  const city = state?.cities.find((item) => item.id === cityId);
  const branchEmployees = useMemo(
    () => (employees.data ?? []).filter((item) => item.branch?.id === branchId && item.status === 'ACTIVE'),
    [employees.data, branchId],
  );
  const managers = branchEmployees.filter((item) =>
    ['BRANCH_HEAD', 'MANAGER', 'LOCATION_HEAD', 'HEAD'].includes(item.orgRole),
  );
  const supervisors = branchEmployees.filter((item) =>
    ['SALES_MANAGER', 'SUPERVISOR', 'COORDINATOR_HEAD', 'BRANCH_HEAD', 'MANAGER'].includes(item.orgRole),
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
    void queryClient.invalidateQueries({ queryKey: ['departments'] });
    void queryClient.invalidateQueries({ queryKey: ['designations'] });
  };

  const createMutation = useMutation({ mutationFn: createEmployee, onSuccess: refresh });
  const deactivateMutation = useMutation({ mutationFn: deactivateEmployee, onSuccess: refresh });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Human capital</p>
        <h1 className="font-display mt-2 text-4xl">{t(I18N_KEYS.NAV_EMPLOYEES)}</h1>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      {canCreate ? (
        <section className={cardClass}>
          <div className="grid gap-3 md:grid-cols-2">
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                createDepartment({ name: String(form.get('name')), code: String(form.get('code')) })
                  .then(() => {
                    event.currentTarget.reset();
                    refresh();
                  })
                  .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
              }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Department</p>
              <input name="name" placeholder="Sales" className={fieldClass} required />
              <input name="code" placeholder="SALES" className={fieldClass} required />
              <button type="submit" className={buttonClass}>
                {t(I18N_KEYS.COMMON_CREATE)}
              </button>
            </form>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                createDesignation({ name: String(form.get('name')), code: String(form.get('code')) })
                  .then(() => {
                    event.currentTarget.reset();
                    refresh();
                  })
                  .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
              }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Designation</p>
              <input name="name" placeholder="Executive" className={fieldClass} required />
              <input name="code" placeholder="EXE" className={fieldClass} required />
              <button type="submit" className={buttonClass}>
                {t(I18N_KEYS.COMMON_CREATE)}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {canCreate ? (
        <section className={cardClass}>
          <h2 className="font-display text-2xl">Create employee</h2>
          <form
            className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formEl = event.currentTarget;
              const form = new FormData(formEl);
              setError(null);
              createMutation.mutate(
                {
                  employeeCode: String(form.get('employeeCode')),
                  firstName: String(form.get('firstName')),
                  lastName: String(form.get('lastName')),
                  email: String(form.get('email')),
                  phone: String(form.get('phone')),
                  gender: String(form.get('gender') || ''),
                  address: String(form.get('address') || ''),
                  dateOfBirth: String(form.get('dateOfBirth')),
                  photoUrl: photoUrl || '',
                  workFromHome: form.get('workFromHome') === 'on',
                  branchId,
                  departmentId: String(form.get('departmentId')),
                  designationId: String(form.get('designationId')),
                  roleId: roleId || undefined,
                  orgRole,
                  managerId: String(form.get('managerId') || '') || null,
                  supervisorId: String(form.get('supervisorId') || '') || null,
                  joiningDate: String(form.get('joiningDate')),
                },
                {
                  onError: (err) => setError(translateMessage(err instanceof ApiError ? err.message : err)),
                  onSuccess: () => {
                    formEl.reset();
                    setRoleId('');
                    setPhotoUrl('');
                  },
                },
              );
            }}
          >
            <select className={fieldClass} value={countryId} onChange={(event) => {
              setCountryId(event.target.value);
              setStateId('');
              setCityId('');
              setBranchId('');
            }}>
              <option value="">Country</option>
              {(tree.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select className={fieldClass} value={stateId} onChange={(event) => {
              setStateId(event.target.value);
              setCityId('');
              setBranchId('');
            }}>
              <option value="">State</option>
              {(country?.states ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select className={fieldClass} value={cityId} onChange={(event) => {
              setCityId(event.target.value);
              setBranchId('');
            }}>
              <option value="">City</option>
              {(state?.cities ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select className={fieldClass} value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
              <option value="">Branch</option>
              {(city?.branches ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select className={fieldClass} value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
              <option value="">Role</option>
              {(roles.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.orgRole}
                </option>
              ))}
            </select>
            <input name="employeeCode" placeholder="EMP-001" className={fieldClass} required />
            <input name="firstName" placeholder="First name" className={fieldClass} required />
            <input name="lastName" placeholder="Last name" className={fieldClass} required />
            <input name="email" type="email" placeholder="Email" className={fieldClass} required />
            <input name="phone" placeholder="Phone" className={fieldClass} />
            <label className="text-sm text-slate-500">
              Date of birth
              <input name="dateOfBirth" type="date" className={`${fieldClass} mt-1`} required />
            </label>
            <ImageFileField label="Profile photo (optional)" value={photoUrl} onChange={setPhotoUrl} />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input name="workFromHome" type="checkbox" className="rounded border-slate-300" />
              Work from home
            </label>
            <select name="gender" className={fieldClass}>
              <option value="">Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <input name="address" placeholder="Address" className={fieldClass} />
            <select name="departmentId" className={fieldClass} required>
              <option value="">Department</option>
              {(departments.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select name="designationId" className={fieldClass} required>
              <option value="">Designation</option>
              {(designations.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {orgRole !== 'BRANCH_HEAD' && orgRole !== 'MANAGER' && orgRole !== 'HEAD' && orgRole !== 'REGIONAL_HEAD' && orgRole !== 'LOCATION_HEAD' ? (
              <select
                name="managerId"
                className={fieldClass}
                required={orgRole === 'SALES_MANAGER' || orgRole === 'SUPERVISOR'}
              >
                <option value="">Manager</option>
                {managers.map((item) => (
                  <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>
                ))}
              </select>
            ) : null}
            {orgRole === 'EXECUTIVE' || orgRole === 'STAFF' || orgRole === 'COORDINATOR' ? (
              <select name="supervisorId" className={fieldClass} required>
                <option value="">Supervisor</option>
                {supervisors.map((item) => (
                  <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>
                ))}
              </select>
            ) : null}
            <input name="joiningDate" type="date" className={fieldClass} required />
            <button type="submit" className={buttonClass} disabled={!branchId || !roleId}>
              {t(I18N_KEYS.COMMON_CREATE)}
            </button>
          </form>
          {selectedRole ? (
            <p className="mt-3 text-xs text-slate-500">
              Role {selectedRole.name} maps to {selectedRole.orgRole}.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={cardClass}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Code</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Role</th>
              <th>WFH</th>
              <th>Reports</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(employees.data ?? []).map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="py-3">{item.employeeCode}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <img
                      src={item.photoUrl || '/default-avatar.svg'}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover bg-slate-100"
                    />
                    <span>
                      {item.firstName} {item.lastName}
                    </span>
                  </div>
                </td>
                <td>{item.branch?.name}</td>
                <td>{item.role?.name || item.orgRole}</td>
                <td>{item.workFromHome ? 'Yes' : 'No'}</td>
                <td>{item.supervisor?.name || item.manager?.name || '—'}</td>
                <td>{item.status}</td>
                <td>
                  {canDeactivate && item.status === 'ACTIVE' ? (
                    <button type="button" className="text-[#C62127]" onClick={() => deactivateMutation.mutate(item.id)}>
                      {t(I18N_KEYS.HRM_DEACTIVATE)}
                    </button>
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
