import { I18N_KEYS } from '../shared';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, translateMessage } from '../lib/i18n';
import { updateBranding } from '../lib/modules-api';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const tenant = user?.tenant;

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0087C3]">Brand identity</p>
        <h1 className="mt-2 text-4xl font-bold">{t(I18N_KEYS.NAV_SETTINGS)}</h1>
        <p className="mt-2 text-sm text-slate-500">Admin can update MoneyZone name, logo, and contact details. The sidebar and login follow these values.</p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-600">Brand details saved.</p> : null}

      <section className={`${cardClass} max-w-2xl`}>
        <div className="mb-6 flex items-center gap-4">
          <img src={tenant.logoUrl || '/moneyzone-logo.png'} alt={tenant.brandName} className="h-20 w-auto max-w-[12rem] object-contain" />
          <div>
            <p className="text-2xl font-bold text-[#C62127]">{tenant.brandName}</p>
            <p className="text-sm text-[#0087C3]">{tenant.tagline}</p>
          </div>
        </div>
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setError(null);
            setSaved(false);
            try {
              const file = (event.currentTarget.elements.namedItem('logoFile') as HTMLInputElement).files?.[0];
              let logoUrl = String(form.get('logoUrl') || tenant.logoUrl);
              if (file) {
                if (file.size > 400_000) {
                  setError('Logo must be under 400KB');
                  return;
                }
                logoUrl = await readFile(file);
              }
              await updateBranding({
                name: String(form.get('name')),
                brandName: String(form.get('brandName')),
                tagline: String(form.get('tagline')),
                logoUrl,
                supportEmail: String(form.get('supportEmail')),
                supportPhone: String(form.get('supportPhone')),
                address: String(form.get('address')),
                website: String(form.get('website')),
              });
              await refreshUser();
              setSaved(true);
            } catch (err) {
              setError(translateMessage(err instanceof ApiError ? err.message : err));
            }
          }}
        >
          <input name="brandName" defaultValue={tenant.brandName} className={fieldClass} required />
          <input name="name" defaultValue={tenant.name} className={fieldClass} required />
          <input name="tagline" defaultValue={tenant.tagline} className={fieldClass} />
          <input name="logoUrl" defaultValue={tenant.logoUrl} className={fieldClass} />
          <input name="logoFile" type="file" accept="image/*" className="text-sm text-slate-500" />
          <input name="supportEmail" defaultValue={tenant.supportEmail} className={fieldClass} placeholder="Support email" />
          <input name="supportPhone" defaultValue={tenant.supportPhone} className={fieldClass} placeholder="Support phone" />
          <input name="address" defaultValue={tenant.address} className={fieldClass} placeholder="Address" />
          <input name="website" defaultValue={tenant.website} className={fieldClass} placeholder="Website" />
          <button type="submit" className={buttonClass}>
            {t(I18N_KEYS.COMMON_SAVE)}
          </button>
        </form>
      </section>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
