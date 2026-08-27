import { API_ROUTES } from '../shared';
import { request } from './api';

export type NamedRef = { id: string; name: string; code?: string };

export type LocationCity = {
  id: string;
  name: string;
  status: string;
  branches: Array<{ id: string; name: string; code: string; address?: string; status: string }>;
};
export type LocationState = {
  id: string;
  name: string;
  code: string;
  status: string;
  cities: LocationCity[];
};
export type LocationCountry = {
  id: string;
  name: string;
  code: string;
  status: string;
  states: LocationState[];
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  city: NamedRef | null;
  state: NamedRef | null;
  country: NamedRef | null;
};

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orgRole: 'MANAGER' | 'SUPERVISOR' | 'STAFF';
  status: string;
  joiningDate: string;
  dateOfBirth?: string | null;
  gender?: string;
  address?: string;
  role?: { id: string; name: string; minAge: number; orgRole: string } | null;
  branch: NamedRef | null;
  department: NamedRef | null;
  designation: NamedRef | null;
  manager: { id: string; name: string } | null;
  supervisor: { id: string; name: string } | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  notes: string;
  nextFollowUpAt: string | null;
  reminderAt?: string | null;
  reminderDone?: boolean;
  country: NamedRef | null;
  state: NamedRef | null;
  city: NamedRef | null;
  branch: NamedRef | null;
  assignedEmployee: { id: string; name: string } | null;
  history?: Array<{
    id: string;
    note: string;
    nextFollowUpAt: string | null;
    statusAfter: string | null;
    createdAt: string | null;
  }>;
};

export type LeaveRow = {
  id: string;
  status: string;
  reason: string;
  startDate: string;
  endDate: string;
  employee: { id: string; name: string; employeeCode: string } | null;
  leaveType: { id: string; name: string } | null;
};

export type AttendanceRow = {
  id: string;
  dateKey: string;
  clockInAt: string;
  clockOutAt: string | null;
  employee: { id: string; name: string; employeeCode: string } | null;
};

export function fetchSummary() {
  return request<{
    employees: number;
    leads: number;
    pendingLeaves: number;
    branches: number;
    dueReminders: number;
  }>(API_ROUTES.DASHBOARD_SUMMARY);
}

export function fetchLocationTree() {
  return request<LocationCountry[]>(API_ROUTES.LOCATIONS_TREE);
}

export function createCountry(input: { name: string; code: string }) {
  return request(API_ROUTES.LOCATIONS_COUNTRIES, { method: 'POST', body: JSON.stringify(input) });
}

export function createState(input: { countryId: string; name: string; code: string }) {
  return request(API_ROUTES.LOCATIONS_STATES, { method: 'POST', body: JSON.stringify(input) });
}

export function createCity(input: { stateId: string; name: string }) {
  return request(API_ROUTES.LOCATIONS_CITIES, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchBranches() {
  return request<Branch[]>(API_ROUTES.BRANCHES);
}

export function createBranch(input: { cityId: string; name: string; code: string; address?: string }) {
  return request(API_ROUTES.BRANCHES, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchDepartments() {
  return request<NamedRef[]>(API_ROUTES.HRM_DEPARTMENTS);
}

export function createDepartment(input: { name: string; code: string }) {
  return request(API_ROUTES.HRM_DEPARTMENTS, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchDesignations() {
  return request<NamedRef[]>(API_ROUTES.HRM_DESIGNATIONS);
}

export function createDesignation(input: { name: string; code: string }) {
  return request(API_ROUTES.HRM_DESIGNATIONS, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchEmployees(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<Employee[]>(`${API_ROUTES.HRM_EMPLOYEES}${query ? `?${query}` : ''}`);
}

export function createEmployee(input: Record<string, unknown>) {
  return request(API_ROUTES.HRM_EMPLOYEES, { method: 'POST', body: JSON.stringify(input) });
}

export function deactivateEmployee(id: string) {
  return request(`${API_ROUTES.HRM_EMPLOYEES}/${id}/deactivate`, { method: 'POST' });
}

export function fetchLeaveTypes() {
  return request<Array<{ id: string; name: string; daysAllowed: number }>>(API_ROUTES.HRM_LEAVE_TYPES);
}

export function createLeaveType(input: { name: string; daysAllowed: number }) {
  return request(API_ROUTES.HRM_LEAVE_TYPES, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchLeaves(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<LeaveRow[]>(`${API_ROUTES.HRM_LEAVES}${query ? `?${query}` : ''}`);
}

export function createLeave(input: Record<string, unknown>) {
  return request(API_ROUTES.HRM_LEAVES, { method: 'POST', body: JSON.stringify(input) });
}

export function decideLeave(id: string, action: 'approve' | 'reject') {
  return request(`${API_ROUTES.HRM_LEAVES}/${id}/${action}`, { method: 'POST' });
}

export function fetchAttendance() {
  return request<AttendanceRow[]>(API_ROUTES.HRM_ATTENDANCE);
}

export function clockAttendance(employeeId: string, action: 'clock-in' | 'clock-out') {
  return request(`${API_ROUTES.HRM_ATTENDANCE}/${action}`, {
    method: 'POST',
    body: JSON.stringify({ employeeId }),
  });
}

export function fetchLeads(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<Lead[]>(`${API_ROUTES.LEADS}${query ? `?${query}` : ''}`);
}

export function createLead(input: Record<string, unknown>) {
  return request(API_ROUTES.LEADS, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchLead(id: string) {
  return request<Lead>(`${API_ROUTES.LEADS}/${id}`);
}

export function fetchRoles() {
  return request<
    Array<{
      id: string;
      name: string;
      key: string;
      description: string;
      minAge: number;
      orgRole: 'MANAGER' | 'SUPERVISOR' | 'STAFF';
      permissions: string[];
    }>
  >(API_ROUTES.HRM_ROLES);
}

export function createRole(input: Record<string, unknown>) {
  return request(API_ROUTES.HRM_ROLES, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchReminders() {
  return request<Lead[]>(API_ROUTES.LEAD_REMINDERS);
}

export function completeReminder(id: string) {
  return request(`${API_ROUTES.LEADS}/${id}/reminders/complete`, { method: 'POST' });
}

export function updateBranding(input: Record<string, unknown>) {
  return request(API_ROUTES.TENANT_CURRENT, { method: 'PATCH', body: JSON.stringify(input) });
}

export function createFollowUp(
  id: string,
  input: { note: string; nextFollowUpAt?: string; reminderAt?: string; status?: string },
) {
  return request(`${API_ROUTES.LEADS}/${id}/follow-ups`, { method: 'POST', body: JSON.stringify(input) });
}

export function importLeads(files: Array<{ name: string; csvText: string }>) {
  return request<{
    batchId: string;
    files: Array<{
      fileName: string;
      created: number;
      skipped: number;
      errors: Array<{ row: number; message: string }>;
    }>;
  }>(`${API_ROUTES.LEADS}/import`, {
    method: 'POST',
    body: JSON.stringify({ files }),
  });
}
