import type {DiscoverMateApi} from './api';
import type {SearchMateUser} from '../data/mockSearchResults';
import type {MatePublicProfile} from '../data/mateProfiles';
import type {SearchFilters} from '../components/search/searchFilterConfig';
import {calculateAgeFromDob} from './ageFromDob';

function mapGender(gender: string | null): 'male' | 'female' {
  const value = (gender ?? '').trim().toLowerCase();
  if (value === 'woman' || value === 'female') {
    return 'female';
  }
  return 'male';
}

export function mapDiscoverMateToSearchUser(mate: DiscoverMateApi): SearchMateUser {
  return {
    id: mate.userId,
    name: mate.fullName,
    tenureId: mate.tenureId,
    categories: mate.categories,
    ratePerHour: mate.hourlyRate ?? 0,
    avatar: mate.profilePhoto ?? '',
    district: mate.district,
    gender: mapGender(mate.gender),
    age: calculateAgeFromDob(mate.dob) ?? 0,
    rating: mate.aadhaarVerified ? 4.8 : undefined,
    isNew: false,
  };
}

export function mapDiscoverMateToPublicProfile(
  mate: DiscoverMateApi,
): MatePublicProfile {
  const birthYear = new Date(mate.dob).getFullYear();
  return {
    ...mapDiscoverMateToSearchUser(mate),
    birthYear,
    location: [mate.district, mate.state].filter(Boolean).join(', '),
    languages: mate.languages ?? [],
    professions: [],
    vehicles: [],
    bio: mate.about ?? '',
    availableTime: '',
    availableDays: [],
    reviewPercent: 0,
    reviewCount: 0,
    aadhaarVerified: mate.aadhaarVerified,
    social: {},
  };
}

export function buildDiscoverQueryParams(
  query: string,
  filters: SearchFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) {
    params.set('q', trimmed);
  }
  if (filters.district) {
    params.set('district', filters.district);
  }
  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.gender !== 'all') {
    params.set('gender', filters.gender);
  }
  if (filters.ageRange !== 'all') {
    params.set('ageRange', filters.ageRange);
  }
  if (filters.hourlyRateRange !== 'all') {
    params.set('hourlyRateRange', filters.hourlyRateRange);
  }
  if (filters.customHourlyRateMin != null) {
    params.set('customHourlyRateMin', String(filters.customHourlyRateMin));
  }
  if (filters.customHourlyRateMax != null) {
    params.set('customHourlyRateMax', String(filters.customHourlyRateMax));
  }
  return params;
}
