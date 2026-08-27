import { I18N_KEYS } from '../shared';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass } from '../components/ui';

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <section className={cardClass}>
        <img src="/moneyzone-logo.png" alt="MoneyZone Financial Services" className="mx-auto h-32 w-auto object-contain" />
        <form
          className="mt-8 space-y-4"
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
            <input type="email" className={`${fieldClass} mt-1`} {...form.register('email', { required: true })} />
          </label>
          <label className="block text-sm text-slate-600">
            {t(I18N_KEYS.AUTH_PASSWORD)}
            <input type="password" className={`${fieldClass} mt-1`} {...form.register('password', { required: true, minLength: 8 })} />
          </label>
          <label className="block text-sm text-slate-600">
            {t(I18N_KEYS.AUTH_TENANT_SLUG)}
            <input className={`${fieldClass} mt-1`} {...form.register('tenantSlug')} />
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
      </section>
    </main>
  );
}
