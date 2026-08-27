import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../lib/api';
import { t } from '../lib/i18n';

export function StatusPage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  const ok = health.data?.status === 'ok';

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-[#0087C3]">
          {t(I18N_KEYS.PLATFORM_PHASE)}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{t(I18N_KEYS.PLATFORM_NAME)}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {t(I18N_KEYS.PLATFORM_PHASE1_INTRO)}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t(I18N_KEYS.HEALTH_TITLE)}</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              health.isLoading
                ? 'bg-slate-100 text-slate-600'
                : ok
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-[#C62127]'
            }`}
          >
            {health.isLoading
              ? t(I18N_KEYS.HEALTH_CHECKING)
              : ok
                ? t(I18N_KEYS.HEALTH_CONNECTED)
                : t(I18N_KEYS.HEALTH_UNAVAILABLE)}
          </span>
        </div>
        <p className="mt-3 text-slate-600">
          {ok ? t(I18N_KEYS.HEALTH_OK) : t(I18N_KEYS.HEALTH_DEGRADED)}
        </p>
        {health.data?.info ? (
          <ul className="mt-4 grid gap-2 text-sm text-slate-400">
            {Object.entries(health.data.info).map(([name, value]) => (
              <li key={name} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{name}</span>
                <span>{value.status}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
