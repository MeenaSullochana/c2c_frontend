import { I18N_KEYS } from '../shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ImageFileField } from '../components/ImageFileField';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { createBank, deleteBank, fetchBanks, updateBank } from '../lib/modules-api';

export function BanksPage() {
  const queryClient = useQueryClient();
  const banks = useQuery({ queryKey: ['banks'], queryFn: () => fetchBanks() });
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: createBank,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['banks'] }),
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Website</p>
        <h1 className="mt-2 text-3xl font-semibold">{t(I18N_KEYS.NAV_BANKS)}</h1>
        <p className="mt-2 text-sm text-slate-500">Create, edit, activate/deactivate partner banks for loan enquiries.</p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            setError(null);
            createMutation.mutate(
              {
                name: String(form.get('name')),
                code: String(form.get('code')),
                logoUrl: logoUrl || '',
                status: 'ACTIVE',
              },
              {
                onSuccess: () => {
                  formEl.reset();
                  setLogoUrl('');
                },
                onError: (err) => setError(translateMessage(err instanceof ApiError ? err.message : err)),
              },
            );
          }}
        >
          <input name="name" placeholder="Bank name" className={fieldClass} required />
          <input name="code" placeholder="Code (e.g. HDFC)" className={fieldClass} required />
          <ImageFileField label="Bank logo (optional)" value={logoUrl} onChange={setLogoUrl} />
          <button type="submit" className={buttonClass}>
            {t(I18N_KEYS.COMMON_CREATE)}
          </button>
        </form>
      </section>

      <section className={`${cardClass} overflow-x-auto`}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Name</th>
              <th>Code</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(banks.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {row.logoUrl ? (
                      <img src={row.logoUrl} alt="" className="h-8 w-8 rounded object-contain bg-slate-50" />
                    ) : null}
                    <span className="font-medium">{row.name}</span>
                  </div>
                </td>
                <td>{row.code}</td>
                <td>{row.status}</td>
                <td className="space-x-3 text-right">
                  <button
                    type="button"
                    className="text-sm font-semibold text-slate-600"
                    onClick={() => {
                      const name = window.prompt('Bank name', row.name);
                      if (!name?.trim()) return;
                      const code = window.prompt('Bank code', row.code);
                      if (!code?.trim()) return;
                      updateBank(row.id, { name: name.trim(), code: code.trim().toUpperCase() })
                        .then(() => void queryClient.invalidateQueries({ queryKey: ['banks'] }))
                        .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)));
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#0087C3]"
                    onClick={() =>
                      updateBank(row.id, { status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
                        .then(() => void queryClient.invalidateQueries({ queryKey: ['banks'] }))
                        .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
                    }
                  >
                    {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#C62127]"
                    onClick={() =>
                      deleteBank(row.id)
                        .then(() => void queryClient.invalidateQueries({ queryKey: ['banks'] }))
                        .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
