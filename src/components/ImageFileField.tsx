import { useState } from 'react';
import { fieldClass } from './ui';
import { ApiError } from '../lib/api';
import { uploadImage } from '../lib/modules-api';
import { translateMessage } from '../lib/i18n';

type Props = {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
};

export function ImageFileField({ label = 'Image', value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm text-slate-500">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className={`${fieldClass} mt-1 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm`}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setError(null);
            setUploading(true);
            uploadImage(file)
              .then((res) => onChange(res.url))
              .catch((err) => setError(translateMessage(err instanceof ApiError ? err.message : err)))
              .finally(() => setUploading(false));
          }}
        />
      </label>
      {uploading ? <p className="text-xs text-slate-400">Uploading…</p> : null}
      {error ? <p className="text-xs text-[#C62127]">{error}</p> : null}
      {value ? (
        <img src={value} alt="" className="mt-1 h-16 w-16 rounded-xl object-cover bg-slate-100" />
      ) : (
        <p className="text-xs text-slate-400">No file selected — default image will be used where applicable.</p>
      )}
    </div>
  );
}
