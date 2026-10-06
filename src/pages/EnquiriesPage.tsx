import { I18N_KEYS, LOAN_TYPE_LABELS, LOAN_TYPES } from '../shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { buttonClass, cardClass, fieldClass, tableClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import { createEnquiry, fetchBanks, fetchEnquiries } from '../lib/modules-api';

export function EnquiriesPage() {
  const queryClient = useQueryClient();
  const enquiries = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries });
  const banks = useQuery({ queryKey: ['banks', 'ACTIVE'], queryFn: () => fetchBanks({ status: 'ACTIVE' }) });
  const [loanType, setLoanType] = useState('PL');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: createEnquiry,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['enquiries'] }),
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Website</p>
        <h1 className="mt-2 text-3xl font-semibold">{t(I18N_KEYS.NAV_ENQUIRIES)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Loan enquiry form — loan amount and bank are required for loan requests.
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            setError(null);
            createMutation.mutate(
              {
                name: String(form.get('name')),
                email: String(form.get('email') || ''),
                phone: String(form.get('phone')),
                loanType,
                loanAmount: Number(form.get('loanAmount') || 0),
                bankId: String(form.get('bankId') || '') || undefined,
                message: String(form.get('message') || ''),
              },
              {
                onSuccess: () => formEl.reset(),
                onError: (err) => setError(translateMessage(err instanceof ApiError ? err.message : err)),
              },
            );
          }}
        >
          <input name="name" placeholder="Customer name" className={fieldClass} required />
          <input name="phone" placeholder="Phone" className={fieldClass} required />
          <input name="email" type="email" placeholder="Email" className={fieldClass} />
          <select className={fieldClass} value={loanType} onChange={(e) => setLoanType(e.target.value)} required>
            {LOAN_TYPES.map((item) => (
              <option key={item} value={item}>
                {LOAN_TYPE_LABELS[item] ?? item}
              </option>
            ))}
          </select>
          <input name="loanAmount" type="number" min={0} placeholder="Loan amount" className={fieldClass} required />
          <select name="bankId" className={fieldClass} required>
            <option value="">Select bank</option>
            {(banks.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="message" placeholder="Message / notes" className={`${fieldClass} lg:col-span-2`} />
          <button type="submit" className={buttonClass}>
            Submit enquiry
          </button>
        </form>
      </section>

      <section className={`${cardClass} overflow-x-auto`}>
        <table className={tableClass}>
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Customer</th>
              <th>Loan</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(enquiries.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="py-2">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.phone}</p>
                </td>
                <td>{LOAN_TYPE_LABELS[row.loanType] ?? row.loanType}</td>
                <td>{row.loanAmount ? `₹${row.loanAmount.toLocaleString('en-IN')}` : '—'}</td>
                <td>{row.bank?.name ?? '—'}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
