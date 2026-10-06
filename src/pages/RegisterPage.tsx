import { I18N_KEYS } from '../shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { buttonClass, fieldClass } from '../components/ui';

type FormValues = {
  tenantName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    defaultValues: {
      tenantName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 90% 15%, rgba(0,135,195,0.16), transparent 55%), radial-gradient(700px 420px at 10% 80%, rgba(198,33,39,0.12), transparent 50%), linear-gradient(160deg, #0b1622 0%, #122033 100%)',
        }}
      />
      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-col justify-center px-6 py-14">
        <div className="mz-rise rounded-[1.75rem] border border-white/15 bg-white/95 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <img
            src="/moneyzone-logo.png"
            alt="MoneyZone Financial Services"
            className="mx-auto h-20 w-auto object-contain"
          />
          <h1 className="font-display mt-4 text-center text-3xl text-[#0c1624]">{t(I18N_KEYS.AUTH_REGISTER)}</h1>
          <p className="mt-2 text-center text-sm text-slate-500">{t(I18N_KEYS.PLATFORM_PHASE2_INTRO)}</p>
          <form
            className="mt-7 space-y-3.5"
            onSubmit={form.handleSubmit(async (values) => {
              setError(null);
              try {
                await signUp(values);
                navigate('/admin');
              } catch (err) {
                setError(translateMessage(err instanceof ApiError ? err.message : err));
              }
            })}
          >
            <input className={fieldClass} placeholder={t(I18N_KEYS.AUTH_TENANT_NAME)} {...form.register('tenantName', { required: true })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={fieldClass} placeholder={t(I18N_KEYS.AUTH_FIRST_NAME)} {...form.register('firstName', { required: true })} />
              <input className={fieldClass} placeholder={t(I18N_KEYS.AUTH_LAST_NAME)} {...form.register('lastName', { required: true })} />
            </div>
            <input
              type="email"
              className={fieldClass}
              placeholder={t(I18N_KEYS.AUTH_EMAIL)}
              {...form.register('email', { required: true })}
            />
            <input
              type="password"
              className={fieldClass}
              placeholder={t(I18N_KEYS.AUTH_PASSWORD)}
              {...form.register('password', { required: true, minLength: 8 })}
            />
            {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}
            <button type="submit" className={`${buttonClass} w-full`} disabled={form.formState.isSubmitting}>
              {t(I18N_KEYS.AUTH_REGISTER)}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link className="font-semibold text-[#0087C3]" to="/login">
              {t(I18N_KEYS.AUTH_LOGIN)}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
