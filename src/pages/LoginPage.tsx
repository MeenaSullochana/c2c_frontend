import { I18N_KEYS } from '../shared';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { useState } from 'react';
import { buttonClass, fieldClass } from '../components/ui';

type FormValues = {
  email: string;
  password: string;
  tenantSlug: string;
};

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    defaultValues: {
      email: 'owner@acme.test',
      password: 'Password123!',
      tenantSlug: 'acme-hr',
    },
  });

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 10% 20%, rgba(0,135,195,0.18), transparent 55%), radial-gradient(800px 480px at 90% 10%, rgba(198,33,39,0.14), transparent 50%), linear-gradient(135deg, #0b1622 0%, #122033 48%, #0c1624 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 px-6 py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <div className="mz-rise max-w-xl text-white lg:flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7ec8e6]">MoneyZone</p>
          <h1 className="font-display mt-4 text-5xl leading-[1.05] md:text-6xl">
            Financial services,
            <span className="block text-[#f2b6b8]">quietly powerful.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">
            Sign in to your workspace for leads, payroll, branch teams, and calling desks — scoped to your role.
          </p>
        </div>

        <div className="mz-rise-delay w-full max-w-md rounded-[1.75rem] border border-white/15 bg-white/95 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:flex-none">
          <img
            src="/moneyzone-logo.png"
            alt="MoneyZone Financial Services"
            className="mx-auto h-24 w-auto object-contain"
          />
          <form
            className="mt-7 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setError(null);
              try {
                await signIn({
                  email: values.email,
                  password: values.password,
                  tenantSlug: values.tenantSlug || undefined,
                });
                navigate('/admin');
              } catch (err) {
                setError(translateMessage(err instanceof ApiError ? err.message : I18N_KEYS.AUTH_INVALID));
              }
            })}
          >
            <label className="block text-sm text-slate-600">
              {t(I18N_KEYS.AUTH_EMAIL)}
              <input type="email" className={`${fieldClass} mt-1.5`} {...form.register('email', { required: true })} />
            </label>
            <label className="block text-sm text-slate-600">
              {t(I18N_KEYS.AUTH_PASSWORD)}
              <input
                type="password"
                className={`${fieldClass} mt-1.5`}
                {...form.register('password', { required: true, minLength: 8 })}
              />
            </label>
            <label className="block text-sm text-slate-600">
              {t(I18N_KEYS.AUTH_TENANT_SLUG)}
              <input className={`${fieldClass} mt-1.5`} {...form.register('tenantSlug')} />
            </label>
            {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}
            <button type="submit" className={`${buttonClass} w-full`} disabled={form.formState.isSubmitting}>
              {t(I18N_KEYS.AUTH_LOGIN)}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            {t(I18N_KEYS.AUTH_NO_ACCOUNT)}{' '}
            <Link className="font-semibold text-[#0087C3]" to="/register">
              {t(I18N_KEYS.AUTH_REGISTER)}
            </Link>
          </p>
          <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-left text-[11px] leading-relaxed text-slate-500">
            Demo · password <span className="font-semibold text-slate-700">Password123!</span> · slug{' '}
            <span className="font-semibold text-slate-700">acme-hr</span>
            <br />
            owner@acme.test · vadapalani.sales@acme.test · vadapalani.accounts@acme.test
          </p>
        </div>
      </section>
    </main>
  );
}
