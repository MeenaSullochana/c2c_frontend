import type { I18nKey } from '../shared';
import { cardClass } from '../components/ui';
import { t } from '../lib/i18n';
import { I18N_KEYS } from '../shared';

type Props = {
  titleKey: I18nKey;
  groupLabel: string;
  description?: string;
};

export function ModulePlaceholderPage({ titleKey, groupLabel, description }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0087C3]">{groupLabel}</p>
        <h1 className="mt-2 text-4xl font-bold">{t(titleKey)}</h1>
      </header>
      <section className={`${cardClass} max-w-2xl`}>
        <p className="text-sm text-slate-600">{description || t(I18N_KEYS.MODULE_COMING_SOON)}</p>
      </section>
    </div>
  );
}
