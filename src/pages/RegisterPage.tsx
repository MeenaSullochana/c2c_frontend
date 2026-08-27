import { I18N_KEYS } from '../shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { buttonClass, cardClass, fieldClass } from '../components/ui';

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <section className={cardClass}>
      <img src="/moneyzone-logo.png" alt="MoneyZone Financial Services" className="mx-auto h-24 w-auto object-contain" />
      <h1 className="mt-4 text-center text-3xl font-bold">{t(I18N_KEYS.AUTH_REGISTER)}</h1>
      <p className="mt-2 text-center text-slate-500">{t(I18N_KEYS.PLATFORM_PHASE2_INTRO)}</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          try {
            await signUp(values);
            navigate('/admin');
          } catch (err) {
            setError(
              translateMessage(err instanceof ApiError ? err.message : I18N_KEYS.AUTH_INVALID),
            );
          }
        })}
      >
        <label className="block text-sm text-slate-600">
          {t(I18N_KEYS.AUTH_TENANT_NAME)}
          <input
            className={`${fieldClass} mt-1`}
            {...form.register('tenantName', { required: true, minLength: 2 })}
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t(I18N_KEYS.AUTH_FIRST_NAME)}
          <input
            className={`${fieldClass} mt-1`}
            {...form.register('firstName', { required: true })}
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t(I18N_KEYS.AUTH_LAST_NAME)}
          <input
            className={`${fieldClass} mt-1`}
            {...form.register('lastName', { required: true })}
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t(I18N_KEYS.AUTH_EMAIL)}
          <input
            type="email"
            className={`${fieldClass} mt-1`}
            {...form.register('email', { required: true })}
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t(I18N_KEYS.AUTH_PASSWORD)}
          <input
            type="password"
            className={`${fieldClass} mt-1`}
            {...form.register('password', { required: true, minLength: 8 })}
          />
        </label>
        {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}
        <button
          type="submit"
          className={`${buttonClass} w-full`}
          disabled={form.formState.isSubmitting}
        >
          {t(I18N_KEYS.AUTH_REGISTER)}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {t(I18N_KEYS.AUTH_HAVE_ACCOUNT)}{' '}
        <Link className="font-semibold text-[#0087C3]" to="/login">
          {t(I18N_KEYS.AUTH_LOGIN)}
        </Link>
      </p>
      </section>
    </main>
  );
}
