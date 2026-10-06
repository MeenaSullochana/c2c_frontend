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
  orgRole: string;
  status: string;
  joiningDate: string;
  dateOfBirth?: string | null;
  gender?: string;
  address?: string;
  photoUrl?: string;
  workFromHome?: boolean;
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
  campaignName?: string;
  loanType?: string;
  loanAmount?: number;
  bankId?: string | null;
  bank?: { id: string; name: string; code?: string } | null;
  rsm?: string;
  team?: string;
  bdoCode?: string;
  called?: boolean;
  connected?: boolean;
  calledAt?: string | null;
  status: string;
  notes: string;
  loginRemarks?: string;
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

export type C2cDashboard = {
  scope: string;
  kpis: {
    leads: number;
    called: number;
    percentCalled: number;
    connected: number;
    percentConnected: number;
  };
  campaigns: Array<{
    campaignName: string;
    leads: number;
    called: number;
    connected: number;
    percentCalled: number;
    percentConnected: number;
    statuses: Record<string, number>;
  }>;
  locations?: Array<{ location: string; leads: number; statuses: Record<string, number> }>;
  teams?: Array<{ team: string; leads: number; statuses: Record<string, number> }>;
  outcome: Array<{ status: string; label: string; count: number; percent: number }>;
  hourly: Array<{ hour: number; called: number }>;
  recent: Array<{
    id: string;
    name: string;
    phone: string;
    campaignName: string;
    called: boolean;
    connected: boolean;
    status: string;
    statusLabel: string;
    team: string;
    rsm: string;
  }>;
  filters: {
    campaigns: string[];
    rsms: string[];
    teams: string[];
    bdoCodes: string[];
    loanTypes: string[];
    statuses: string[];
    regionalLeads: Array<{
      id: string;
      name: string;
      orgRole: string;
      branchId: string;
      cityId: string;
      stateId: string;
      countryId: string;
    }>;
    salesManagers: Array<{
      id: string;
      name: string;
      orgRole: string;
      branchId: string;
      cityId: string;
      stateId: string;
      countryId: string;
    }>;
  };
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
    accessScope?: string;
  }>(API_ROUTES.DASHBOARD_SUMMARY);
}

export function fetchC2cDashboard(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<C2cDashboard>(`${API_ROUTES.C2C_DASHBOARD}${query ? `?${query}` : ''}`);
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

export type WorkInfoRow = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  orgRole: string;
  branch: NamedRef | null;
  joiningDate?: string | null;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  leaveRequests: number;
};

export type WorkInfoDetail = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  orgRole: string;
  status: string;
  joiningDate?: string | null;
  dateOfBirth?: string | null;
  branch: NamedRef | null;
  department: NamedRef | null;
  designation: NamedRef | null;
  manager: { id: string; name: string } | null;
  supervisor: { id: string; name: string } | null;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  workHistory: Array<{
    id: string;
    eventType: string;
    title: string;
    detail: string;
    fromDate: string;
    toDate: string | null;
    orgRole: string;
    branch: NamedRef | null;
    designation: NamedRef | null;
  }>;
  payslips: Array<{
    id: string;
    periodKey: string;
    status: string;
    basicSalary: number;
    hra: number;
    allowances: number;
    deductions: number;
    netPay: number;
    paidAt: string | null;
  }>;
  leaves: Array<{
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
  }>;
  attendance: Array<{
    id: string;
    dateKey: string;
    clockInAt: string;
    clockOutAt: string | null;
  }>;
};

export type PayslipRow = {
  id: string;
  periodKey: string;
  status: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paidAt: string | null;
  employee: {
    id: string;
    name: string;
    employeeCode: string;
    branch: NamedRef | null;
    orgRole?: string;
  } | null;
};

export type PayslipDetail = {
  id: string;
  periodKey: string;
  status: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paidAt: string | null;
  createdAt: string | null;
  employee: {
    id: string;
    name: string;
    employeeCode: string;
    email: string;
    phone: string;
    orgRole?: string;
    branch: NamedRef | null;
    joiningDate?: string | null;
  };
};

export type PayrollSummary = {
  totals: { employees: number; monthlySalary: number; payslips: number };
  byBranch: Array<{ branch: string; employees: number; monthlySalary: number; payslipCount: number }>;
  employees: WorkInfoRow[];
};

export function fetchWorkInfo() {
  return request<WorkInfoRow[]>(API_ROUTES.HRM_WORK_INFO);
}

export function fetchWorkInfoDetail(id: string) {
  return request<WorkInfoDetail>(`${API_ROUTES.HRM_WORK_INFO}/${id}`);
}

export function fetchPayroll() {
  return request<PayrollSummary>(API_ROUTES.HRM_PAYROLL);
}

export function fetchPayslips(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<PayslipRow[]>(`${API_ROUTES.HRM_PAYSLIPS}${query ? `?${query}` : ''}`);
}

export function fetchPayslip(id: string) {
  return request<PayslipDetail>(`${API_ROUTES.HRM_PAYSLIPS}/${id}`);
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
      orgRole: string;
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
  input: { note: string; nextFollowUpAt?: string; reminderAt?: string; status?: string; remarks?: string },
) {
  return request(`${API_ROUTES.LEADS}/${id}/follow-ups`, { method: 'POST', body: JSON.stringify(input) });
}

export function importLeads(files: Array<{ name: string; csvText: string }>, branchId: string) {
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
    body: JSON.stringify({ branchId, files }),
  });
}

export async function uploadImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('upload.read_failed'));
    reader.readAsDataURL(file);
  });
  return request<{ url: string; fileName: string; size: number; mimeType: string }>(API_ROUTES.UPLOADS_IMAGE, {
    method: 'POST',
    body: JSON.stringify({ dataUrl, fileName: file.name }),
  });
}

export type BankRow = { id: string; name: string; code: string; logoUrl: string; status: string };

export function fetchBanks(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<BankRow[]>(`${API_ROUTES.WEBSITE_BANKS}${query ? `?${query}` : ''}`);
}

export function fetchPublicBanks(tenantSlug = 'acme-hr') {
  return request<BankRow[]>(`${API_ROUTES.WEBSITE_BANKS_PUBLIC}?tenantSlug=${encodeURIComponent(tenantSlug)}`);
}

export function createBank(input: { name: string; code: string; logoUrl?: string; status?: string }) {
  return request<BankRow>(API_ROUTES.WEBSITE_BANKS, { method: 'POST', body: JSON.stringify(input) });
}

export function updateBank(id: string, input: Partial<{ name: string; code: string; logoUrl: string; status: string }>) {
  return request<BankRow>(`${API_ROUTES.WEBSITE_BANKS}/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteBank(id: string) {
  return request(`${API_ROUTES.WEBSITE_BANKS}/${id}`, { method: 'DELETE' });
}

export function fetchEnquiries() {
  return request<
    Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      loanType: string;
      loanAmount: number;
      bank: NamedRef | null;
      message: string;
      status: string;
      createdAt: string | null;
    }>
  >(API_ROUTES.WEBSITE_ENQUIRIES);
}

export function createEnquiry(input: Record<string, unknown>) {
  return request(API_ROUTES.WEBSITE_ENQUIRIES, { method: 'POST', body: JSON.stringify(input) });
}

export function createPublicEnquiry(input: Record<string, unknown>) {
  return request(API_ROUTES.WEBSITE_ENQUIRIES_PUBLIC, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchAnnouncements() {
  return request<
    Array<{
      id: string;
      title: string;
      body: string;
      kind: string;
      imageUrl: string;
      scope: string;
      status: string;
      createdAt: string | null;
    }>
  >(API_ROUTES.WEBSITE_ANNOUNCEMENTS);
}

export function createAnnouncement(input: Record<string, unknown>) {
  return request(API_ROUTES.WEBSITE_ANNOUNCEMENTS, { method: 'POST', body: JSON.stringify(input) });
}

export function fetchBirthdaysToday() {
  return request<{
    date: string;
    birthdays: Array<{
      id: string;
      name: string;
      employeeCode: string;
      photoUrl: string;
      wishCard: { title: string; body: string };
    }>;
  }>(API_ROUTES.WEBSITE_BIRTHDAYS);
}
