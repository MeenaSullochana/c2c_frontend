import { I18N_KEYS } from '../shared';
import { useState } from 'react';
import { buttonClass, cardClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { importLeads } from '../lib/modules-api';

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
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t(I18N_KEYS.NAV_LEAD_IMPORT)}</h1>
      <p className="text-sm text-slate-400">
        Upload one or more CSV files. Columns: name, email, phone, source, country, state, city, branch, notes.
        Country/state/branch can be name or code. City and branch must already exist for that location.
      </p>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
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
              setResult(await importLeads(payload));
            } catch (err) {
              setError(translateMessage(err instanceof ApiError ? err.message : err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <input name="files" type="file" accept=".csv,text/csv" multiple className="text-sm" />
          <div className="flex items-center gap-4">
            <button type="submit" className={buttonClass} disabled={busy}>
              {busy ? t(I18N_KEYS.COMMON_LOADING) : t(I18N_KEYS.NAV_LEAD_IMPORT)}
            </button>
            <a href="/lead-import-template.csv" className="text-sm text-sky-300">
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
