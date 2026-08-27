import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMe, login, logout as apiLogout, registerWorkspace, type PublicUser } from './api';
import { getAccessToken } from './auth-storage';

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  signIn: (input: { email: string; password: string; tenantSlug?: string }) => Promise<void>;
  signUp: (input: {
    tenantName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (input) => {
        const result = await login(input);
        setUser(result.user);
      },
      signUp: async (input) => {
        const result = await registerWorkspace(input);
        setUser(result.user);
      },
      signOut: async () => {
        await apiLogout();
        setUser(null);
      },
      refreshUser: async () => {
        setUser(await fetchMe());
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
