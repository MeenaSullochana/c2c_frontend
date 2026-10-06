import { I18N_KEYS } from '../shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { fetchBranches, importLeads } from '../lib/modules-api';

type ImportResult = {
  batchId: string;
  files: Array<{
    fileName: string;
    created: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
  }>;
};

export function LeadImportPage() {
  const branches = useQuery({ queryKey: ['branches'], queryFn: fetchBranches });
  const [branchId, setBranchId] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedBranch = (branches.data ?? []).find((item) => item.id === branchId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_LEAD_IMPORT)}</h1>
      <p className="text-sm text-slate-500">
        Select a branch first — country, state, and city are applied automatically. Upload CSV columns:
        customer_name (or customername), phone (or phoneno), campaign_name, called (Y/N), connected (Y/N),
        status. Optional: loan_type, rsm, team, bdo_code, email, notes. CSV country/state/city/branch can
        override the selected branch when all are present.
      </p>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!branchId) {
              setError(t(I18N_KEYS.LEAD_IMPORT_BRANCH_REQUIRED));
              return;
            }
            const input = event.currentTarget.elements.namedItem('files') as HTMLInputElement;
            const files = Array.from(input.files ?? []);
            if (files.length === 0) {
              return;
            }
            setBusy(true);
            setError(null);
            try {
              const payload = await Promise.all(
                files.map(async (file) => ({ name: file.name, csvText: await file.text() })),
              );
              setResult(await importLeads(payload, branchId));
            } catch (err) {
              setError(translateMessage(err instanceof ApiError ? err.message : err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className={fieldClass}
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              required
            >
              <option value="">{t(I18N_KEYS.BRANCH_TITLE)}</option>
              {(branches.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {selectedBranch ? (
                <p>
                  {[selectedBranch.country?.name, selectedBranch.state?.name, selectedBranch.city?.name]
                    .filter(Boolean)
                    .join(' · ') || 'Location will apply from this branch'}
                </p>
              ) : (
                <p className="text-slate-400">Country / state / city appear after you pick a branch</p>
              )}
            </div>
          </div>
          <input name="files" type="file" accept=".csv,text/csv" multiple className="text-sm" />
          <div className="flex items-center gap-4">
            <button type="submit" className={buttonClass} disabled={busy || !branchId}>
              {busy ? t(I18N_KEYS.COMMON_LOADING) : t(I18N_KEYS.NAV_LEAD_IMPORT)}
            </button>
            <a href="/lead-import-template.csv" className="text-sm text-[#0087C3]">
              Download template
            </a>
          </div>
        </form>
      </section>

      {result ? (
        <section className={cardClass}>
          <p className="text-sm text-slate-400">Batch {result.batchId}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {result.files.map((file) => (
              <li key={file.fileName} className="rounded-lg bg-slate-50 p-4">
                <p>
                  {file.fileName}: created {file.created}, skipped {file.skipped}
                </p>
                {file.errors.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-[#C62127]">
                    {file.errors.map((item) => (
                      <li key={`${file.fileName}-${item.row}`}>
                        Row {item.row}: {translateMessage(item.message)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
