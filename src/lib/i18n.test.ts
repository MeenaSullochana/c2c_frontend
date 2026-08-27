import { I18N_KEYS } from '../shared';
import { describe, expect, it } from 'vitest';
import { t, translateMessage } from './i18n';

describe('t', () => {
  it('returns the English catalog value for a known key', () => {
    expect(t(I18N_KEYS.PLATFORM_NAME)).toBe('MoneyZone');
  });

  it('falls back to the key when a locale has no translation yet', () => {
    expect(t(I18N_KEYS.INTEGRATION_CONNECTED, 'ta')).toBe(
      I18N_KEYS.INTEGRATION_CONNECTED,
    );
  });
});

describe('translateMessage', () => {
  it('does not treat a generic Error as a login failure', () => {
    expect(translateMessage(new Error('location.country_exists'))).toBe(
      'A country with this code already exists',
    );
  });
});
