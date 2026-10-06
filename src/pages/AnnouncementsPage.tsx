import { I18N_KEYS } from '../shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ImageFileField } from '../components/ImageFileField';
import { buttonClass, cardClass, fieldClass } from '../components/ui';
import { ApiError } from '../lib/api';
import { t, translateMessage } from '../lib/i18n';
import {
  createAnnouncement,
  fetchAnnouncements,
  fetchBirthdaysToday,
  fetchBranches,
  fetchLocationTree,
} from '../lib/modules-api';

export function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const announcements = useQuery({ queryKey: ['announcements'], queryFn: fetchAnnouncements });
  const birthdays = useQuery({ queryKey: ['birthdays-today'], queryFn: fetchBirthdaysToday });
  const tree = useQuery({ queryKey: ['locations'], queryFn: fetchLocationTree });
  const branches = useQuery({ queryKey: ['branches'], queryFn: fetchBranches });
  const [scope, setScope] = useState('ALL');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const country = tree.data?.find((item) => item.id === countryId);
  const state = country?.states.find((item) => item.id === stateId);

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[#0087C3]">Website / HR</p>
        <h1 className="mt-2 text-3xl font-semibold">{t(I18N_KEYS.NAV_ANNOUNCEMENTS)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Post wishes, leave notices, or posters to all staff or a selected state / city / branch.
        </p>
      </header>
      {error ? <p className="text-sm text-[#C62127]">{error}</p> : null}

      <section className={cardClass}>
        <h2 className="font-medium text-[#0087C3]">Today&apos;s birthdays</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(birthdays.data?.birthdays ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">No birthdays today</p>
          ) : (
            (birthdays.data?.birthdays ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#C62127]/15 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.photoUrl || '/default-avatar.svg'}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{item.wishCard.title}</p>
                    <p className="text-sm text-slate-500">{item.wishCard.body}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={cardClass}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            setError(null);
            createMutation.mutate(
              {
                title: String(form.get('title')),
                body: String(form.get('body') || ''),
                kind: String(form.get('kind') || 'GENERAL'),
                imageUrl: imageUrl || '',
                scope,
                stateId: scope === 'STATE' || scope === 'CITY' || scope === 'BRANCH' ? stateId || undefined : undefined,
                cityId: scope === 'CITY' || scope === 'BRANCH' ? cityId || undefined : undefined,
                branchId: scope === 'BRANCH' ? String(form.get('branchId') || '') || undefined : undefined,
              },
              {
                onSuccess: () => {
                  formEl.reset();
                  setImageUrl('');
                },
                onError: (err) => setError(translateMessage(err instanceof ApiError ? err.message : err)),
              },
            );
          }}
        >
          <input name="title" placeholder="Title" className={fieldClass} required />
          <select name="kind" className={fieldClass} defaultValue="GENERAL">
            <option value="GENERAL">General</option>
            <option value="WISHES">Wishes</option>
            <option value="LEAVE">Common leave</option>
            <option value="POSTER">Poster</option>
            <option value="BIRTHDAY">Birthday</option>
          </select>
          <select className={fieldClass} value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="ALL">Whole organization</option>
            <option value="STATE">Particular state / district</option>
            <option value="CITY">Particular city</option>
            <option value="BRANCH">Particular branch</option>
          </select>
          {scope !== 'ALL' ? (
            <>
              <select
                className={fieldClass}
                value={countryId}
                onChange={(e) => {
                  setCountryId(e.target.value);
                  setStateId('');
                  setCityId('');
                }}
              >
                <option value="">Country</option>
                {(tree.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                className={fieldClass}
                value={stateId}
                onChange={(e) => {
                  setStateId(e.target.value);
                  setCityId('');
                }}
              >
                <option value="">State / district</option>
                {(country?.states ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          {scope === 'CITY' || scope === 'BRANCH' ? (
            <select className={fieldClass} value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">City</option>
              {(state?.cities ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : null}
          {scope === 'BRANCH' ? (
            <select name="branchId" className={fieldClass} required>
              <option value="">Branch</option>
              {(branches.data ?? [])
                .filter((item) => !cityId || item.city?.id === cityId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          ) : null}
          <ImageFileField label="Poster / image (optional)" value={imageUrl} onChange={setImageUrl} />
          <textarea name="body" placeholder="Message" className={`${fieldClass} md:col-span-2`} rows={3} />
          <button type="submit" className={buttonClass}>
            Publish announcement
          </button>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {(announcements.data ?? []).map((item) => (
          <article key={item.id} className={cardClass}>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {item.kind} · {item.scope}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-800">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{item.body || '—'}</p>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="mt-3 max-h-40 rounded-xl object-cover" />
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
