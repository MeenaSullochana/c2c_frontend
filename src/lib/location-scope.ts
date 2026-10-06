import type { PublicUser } from './api';
import type { Branch, LocationCountry } from './modules-api';

export type LocationScopeLocks = {
  scope: string;
  lockCountry: boolean;
  lockState: boolean;
  lockCity: boolean;
  lockBranch: boolean;
  countryId: string;
  stateId: string;
  cityId: string;
  branchId: string;
};

export function getLocationScopeLocks(user: PublicUser | null | undefined): LocationScopeLocks {
  const scope = user?.accessScope || 'ALL';
  const lockCountry = scope !== 'ALL';
  const lockState = scope !== 'ALL';
  const lockCity = scope === 'CITY' || scope === 'BRANCH' || scope === 'TEAM' || scope === 'SELF';
  const lockBranch = scope === 'BRANCH' || scope === 'TEAM' || scope === 'SELF';

  return {
    scope,
    lockCountry,
    lockState,
    lockCity,
    lockBranch,
    countryId: user?.country?.id ?? '',
    stateId: user?.state?.id ?? '',
    cityId: user?.city?.id ?? '',
    branchId: user?.branch?.id ?? '',
  };
}

/** Resolve country id from tree when auth user only has state. */
export function resolveScopedCountryId(
  tree: LocationCountry[] | undefined,
  locks: LocationScopeLocks,
): string {
  if (locks.countryId) return locks.countryId;
  if (!locks.stateId || !tree?.length) return '';
  return tree.find((country) => country.states.some((state) => state.id === locks.stateId))?.id ?? '';
}

export function filterCountriesForScope(
  tree: LocationCountry[] | undefined,
  locks: LocationScopeLocks,
): LocationCountry[] {
  const countries = tree ?? [];
  if (!locks.lockCountry) return countries;
  const countryId = resolveScopedCountryId(countries, locks);
  if (!countryId) return countries;
  return countries
    .filter((country) => country.id === countryId)
    .map((country) => ({
      ...country,
      states: locks.lockState && locks.stateId
        ? country.states
            .filter((state) => state.id === locks.stateId)
            .map((state) => ({
              ...state,
              cities: locks.lockCity && locks.cityId
                ? state.cities.filter((city) => city.id === locks.cityId)
                : state.cities,
            }))
        : country.states,
    }));
}

export function filterBranchesForScope(
  branches: Branch[] | undefined,
  locks: LocationScopeLocks,
  selected: { countryId: string; stateId: string; cityId: string },
): Branch[] {
  return (branches ?? []).filter((item) => {
    if (locks.lockBranch && locks.branchId) return item.id === locks.branchId;
    if (selected.cityId && item.city?.id !== selected.cityId) return false;
    if (selected.stateId && item.state?.id !== selected.stateId) return false;
    if (selected.countryId && item.country?.id !== selected.countryId) return false;
    if (locks.lockCity && locks.cityId && item.city?.id !== locks.cityId) return false;
    if (locks.lockState && locks.stateId && item.state?.id !== locks.stateId) return false;
    return true;
  });
}
