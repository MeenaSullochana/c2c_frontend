import { I18N_KEYS, type I18nKey, type SupportedLocale } from '../shared';

const dictionaries: Record<SupportedLocale, Partial<Record<I18nKey, string>>> = {
  en: {
    [I18N_KEYS.PLATFORM_NAME]: 'MoneyZone',
    [I18N_KEYS.PLATFORM_PHASE]: 'Financial Services',
    [I18N_KEYS.HEALTH_OK]: 'All systems operational',
    [I18N_KEYS.HEALTH_DEGRADED]: 'One or more dependencies are unavailable',
    [I18N_KEYS.HEALTH_TITLE]: 'API health',
    [I18N_KEYS.HEALTH_CHECKING]: 'Checking',
    [I18N_KEYS.HEALTH_CONNECTED]: 'Connected',
    [I18N_KEYS.HEALTH_UNAVAILABLE]: 'Unavailable',
    [I18N_KEYS.PLATFORM_PHASE1_INTRO]:
      'Core platform setup is in progress. Authentication, integrations, notifications, payments, HRM, and Lead Management follow in later phases.',
    [I18N_KEYS.PLATFORM_PHASE2_INTRO]:
      'Create a workspace, sign in, and manage tenant users. The API stores data in MongoDB.',
    [I18N_KEYS.AUTH_LOGIN]: 'Sign in',
    [I18N_KEYS.AUTH_REGISTER]: 'Create workspace',
    [I18N_KEYS.AUTH_LOGOUT]: 'Sign out',
    [I18N_KEYS.AUTH_EMAIL]: 'Email',
    [I18N_KEYS.AUTH_PASSWORD]: 'Password',
    [I18N_KEYS.AUTH_FIRST_NAME]: 'First name',
    [I18N_KEYS.AUTH_LAST_NAME]: 'Last name',
    [I18N_KEYS.AUTH_TENANT_NAME]: 'Workspace name',
    [I18N_KEYS.AUTH_TENANT_SLUG]: 'Workspace slug (optional)',
    [I18N_KEYS.AUTH_INVALID]: 'Email or password is incorrect',
    [I18N_KEYS.AUTH_API_UNREACHABLE]:
      'Cannot reach the API. Start the backend with npm run dev in the backend folder.',
    [I18N_KEYS.AUTH_FORBIDDEN]: 'You do not have permission for this action',
    [I18N_KEYS.AUTH_UNAUTHORIZED]: 'Please sign in again',
    [I18N_KEYS.REQUEST_FAILED]: 'The request failed. Try again.',
    [I18N_KEYS.VALIDATION_FAILED]: 'Check the name and code, then try again',
    [I18N_KEYS.LOCATION_COUNTRY_EXISTS]: 'A country with this code already exists',
    [I18N_KEYS.AUTH_EMAIL_TAKEN]: 'This email is already used in this workspace',
    [I18N_KEYS.AUTH_TENANT_REQUIRED]: 'Enter your workspace slug to continue',
    [I18N_KEYS.AUTH_HAVE_ACCOUNT]: 'Already have an account?',
    [I18N_KEYS.AUTH_NO_ACCOUNT]: 'Need a workspace?',
    [I18N_KEYS.DASHBOARD_TITLE]: 'Workspace',
    [I18N_KEYS.DASHBOARD_USERS]: 'Users',
    [I18N_KEYS.DASHBOARD_WORKSPACE]: 'Current workspace',
    [I18N_KEYS.NAV_DASHBOARD]: 'Dashboard',
    [I18N_KEYS.NAV_GROUP_C2C]: 'C2C',
    [I18N_KEYS.NAV_GROUP_HRM]: 'HRM',
    [I18N_KEYS.NAV_GROUP_WEBSITE]: 'Website',
    [I18N_KEYS.NAV_LOCATIONS]: 'Locations',
    [I18N_KEYS.NAV_BRANCHES]: 'Branches',
    [I18N_KEYS.NAV_EMPLOYEES]: 'Employees',
    [I18N_KEYS.NAV_ATTENDANCE]: 'Attendance',
    [I18N_KEYS.NAV_LEAVES]: 'Leave',
    [I18N_KEYS.NAV_PAYROLL]: 'Payroll',
    [I18N_KEYS.NAV_PAYSLIP]: 'Payslip',
    [I18N_KEYS.NAV_WORK_INFO]: 'Work info',
    [I18N_KEYS.NAV_LEADS]: 'Leads',
    [I18N_KEYS.NAV_C2C_DASHBOARD]: 'Calling dashboard',
    [I18N_KEYS.NAV_LEAD_IMPORT]: 'Import leads',
    [I18N_KEYS.NAV_ROLES]: 'Roles',
    [I18N_KEYS.NAV_REMINDERS]: 'Reminders',
    [I18N_KEYS.NAV_SETTINGS]: 'Brand settings',
    [I18N_KEYS.NAV_WEBSITE_BASIC]: 'Basic info',
    [I18N_KEYS.NAV_LOAN_TYPES]: 'Loan types',
    [I18N_KEYS.NAV_WEBSITE_PAGES]: 'Website pages',
    [I18N_KEYS.NAV_BANKS]: 'Banks',
    [I18N_KEYS.NAV_ENQUIRIES]: 'Enquiries',
    [I18N_KEYS.NAV_ANNOUNCEMENTS]: 'Announcements',
    [I18N_KEYS.MODULE_COMING_SOON]:
      'This module is ready in the menu. Full data screens will be added next.',
    [I18N_KEYS.COMMON_LOADING]: 'Loading',
    [I18N_KEYS.COMMON_NAME]: 'Name',
    [I18N_KEYS.COMMON_SLUG]: 'Slug',
    [I18N_KEYS.COMMON_ROLE]: 'Role',
    [I18N_KEYS.COMMON_SAVE]: 'Save',
    [I18N_KEYS.COMMON_CREATE]: 'Create',
    [I18N_KEYS.COMMON_FILTER]: 'Filter',
    [I18N_KEYS.COMMON_STATUS]: 'Status',
    [I18N_KEYS.COMMON_SEARCH]: 'Search',
    [I18N_KEYS.COMMON_PHONE]: 'Phone',
    [I18N_KEYS.LOCATION_COUNTRY]: 'Country',
    [I18N_KEYS.LOCATION_STATE]: 'State',
    [I18N_KEYS.LOCATION_CITY]: 'City',
    [I18N_KEYS.BRANCH_TITLE]: 'Branch',
    [I18N_KEYS.HRM_ORG_ROLE]: 'Org role',
    [I18N_KEYS.HRM_DEACTIVATE]: 'Deactivate',
    [I18N_KEYS.HRM_CLOCK_IN]: 'Clock in',
    [I18N_KEYS.HRM_CLOCK_OUT]: 'Clock out',
    [I18N_KEYS.HRM_LEAVE_APPROVE]: 'Approve',
    [I18N_KEYS.HRM_LEAVE_REJECT]: 'Reject',
    [I18N_KEYS.LEAD_FOLLOWUP]: 'Follow-up',
    [I18N_KEYS.LEAD_HISTORY]: 'Follow-up history',
    [I18N_KEYS.LEAD_IMPORT_NAME_REQUIRED]: 'Name is required',
    [I18N_KEYS.LEAD_IMPORT_LOCATION]: 'Country, state, city, or branch was not found',
    [I18N_KEYS.LEAD_IMPORT_OUT_OF_SCOPE]: 'This lead is outside your location scope',
    [I18N_KEYS.LEAD_IMPORT_BRANCH_REQUIRED]: 'Select a branch before importing',
  },
  ta: {},
  hi: {},
  ml: {},
  te: {},
  ar: {},
};

export function t(key: I18nKey, locale: SupportedLocale = 'en'): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

export function translateMessage(message: unknown): string {
  const text =
    typeof message === 'string'
      ? message
      : message instanceof Error
        ? message.message
        : I18N_KEYS.REQUEST_FAILED;
  if (text in dictionaries.en || Object.values(I18N_KEYS).includes(text as I18nKey)) {
    return t(text as I18nKey);
  }
  return text;
}
