import { I18N_KEYS } from '../shared';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">
        {t(I18N_KEYS.COMMON_LOADING)}
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
