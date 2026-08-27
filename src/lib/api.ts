import { API_ROUTES } from '../shared';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth-storage';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export type HealthResponse = {
  status: 'ok' | 'error';
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; message?: string }>;
};

export type PublicUser = {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  locale: string;
  roleKeys: string[];
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    locale: string;
    brandName: string;
    tagline: string;
    logoUrl: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    website: string;
  };
};

export type AuthResponse = {
  user: PublicUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as { message?: string | string[] };
  if (Array.isArray(body.message)) {
    return body.message[0] ?? 'request.failed';
  }
  return body.message ?? 'request.failed';
}

export async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('auth.api_unreachable', 0);
  }

  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>(API_ROUTES.HEALTH, {}, false);
}

export async function registerWorkspace(input: {
  tenantName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>(API_ROUTES.AUTH_REGISTER, {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result;
}

export async function login(input: {
  email: string;
  password: string;
  tenantSlug?: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>(API_ROUTES.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result;
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const tokens = await request<AuthResponse['tokens']>(API_ROUTES.AUTH_REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false);
    setTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await request(API_ROUTES.AUTH_LOGOUT, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false);
    }
  } finally {
    clearTokens();
  }
}

export async function fetchMe(): Promise<PublicUser> {
  return request<PublicUser>(API_ROUTES.AUTH_ME);
}

export async function fetchUsers(): Promise<PublicUser[]> {
  return request<PublicUser[]>(API_ROUTES.USERS);
}
