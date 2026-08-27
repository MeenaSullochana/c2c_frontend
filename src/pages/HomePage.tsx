import { I18N_KEYS } from '../shared';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { t } from '../lib/i18n';
import { LoginPage } from './LoginPage';

export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">
        {t(I18N_KEYS.COMMON_LOADING)}
      </main>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return <LoginPage />;
}
