import {MATE_CATEGORIES} from '../../constants/mateCategories';

export type HourlyRateRange =
  | 'all'
  | 'under70'
  | '70to200'
  | '200to300'
  | 'custom';

export type SearchFilters = {
  district: string | null;
  category: string | null;
  gender: 'all' | 'male' | 'female';
  ageRange: 'all' | 'under30' | '30to45' | 'over45';
  hourlyRateRange: HourlyRateRange;
  customHourlyRateMin: number | null;
  customHourlyRateMax: number | null;
};

export const HOURLY_RATE_OPTIONS: {label: string; value: HourlyRateRange}[] = [
  {label: 'Any', value: 'all'},
  {label: 'Under ₹70', value: 'under70'},
  {label: '₹70 – 200', value: '70to200'},
  {label: '₹200 – 300', value: '200to300'},
  {label: 'Custom', value: 'custom'},
];

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  district: null,
  category: null,
  gender: 'all',
  ageRange: 'all',
  hourlyRateRange: 'all',
  customHourlyRateMin: null,
  customHourlyRateMax: null,
};

export const createDefaultSearchFilters = (): SearchFilters => ({
  district: null,
  category: null,
  gender: 'all',
  ageRange: 'all',
  hourlyRateRange: 'all',
  customHourlyRateMin: null,
  customHourlyRateMax: null,
});

const migrateHourlyRateRange = (range: string | undefined): HourlyRateRange => {
  switch (range) {
    case 'under50':
    case '50to70':
      return 'under70';
    case '70to100':
    case '100to200':
      return '70to200';
    case 'over300':
      return '200to300';
    case 'under70':
    case '70to200':
    case '200to300':
    case 'custom':
    case 'all':
      return range;
    default:
      return 'all';
  }
};

/** Collapse dropdown "all" sentinels to null for storage and filter counting. */
export const normalizeSearchFilters = (filters: SearchFilters): SearchFilters => {
  const hourlyRateRange = migrateHourlyRateRange(filters.hourlyRateRange);
  const customMin = filters.customHourlyRateMin ?? null;
  const customMax = filters.customHourlyRateMax ?? null;

  return {
    district:
      filters.district && filters.district !== 'all' ? filters.district : null,
    category:
      filters.category && filters.category !== 'all' ? filters.category : null,
    gender: filters.gender ?? 'all',
    ageRange: filters.ageRange ?? 'all',
    hourlyRateRange,
    customHourlyRateMin: hourlyRateRange === 'custom' ? customMin : null,
    customHourlyRateMax: hourlyRateRange === 'custom' ? customMax : null,
  };
};

export const matchesHourlyRate = (
  ratePerHour: number,
  filters: SearchFilters,
): boolean => {
  const {hourlyRateRange, customHourlyRateMin, customHourlyRateMax} = filters;

  switch (hourlyRateRange) {
    case 'all':
      return true;
    case 'under70':
      return ratePerHour < 70;
    case '70to200':
      return ratePerHour >= 70 && ratePerHour <= 200;
    case '200to300':
      return ratePerHour >= 200 && ratePerHour <= 300;
    case 'custom': {
      if (customHourlyRateMin != null && ratePerHour < customHourlyRateMin) {
        return false;
      }
      if (customHourlyRateMax != null && ratePerHour > customHourlyRateMax) {
        return false;
      }
      return true;
    }
    default:
      return true;
  }
};

/** Short label for results header when an hourly-rate filter is active. */
export const getHourlyRateFilterLabel = (
  filters: SearchFilters,
): string | null => {
  if (!isHourlyRateFilterActive(filters)) {
    return null;
  }
  if (filters.hourlyRateRange === 'custom') {
    const min = filters.customHourlyRateMin;
    const max = filters.customHourlyRateMax;
    if (min != null && max != null) {
      return `₹${min}–${max}/hr`;
    }
    if (min != null) {
      return `from ₹${min}/hr`;
    }
    if (max != null) {
      return `up to ₹${max}/hr`;
    }
    return null;
  }
  const preset = HOURLY_RATE_OPTIONS.find(o => o.value === filters.hourlyRateRange);
  return preset && preset.value !== 'all' ? preset.label : null;
};

export const isHourlyRateFilterActive = (filters: SearchFilters): boolean => {
  if (filters.hourlyRateRange === 'all') {
    return false;
  }
  if (filters.hourlyRateRange === 'custom') {
    return (
      filters.customHourlyRateMin != null || filters.customHourlyRateMax != null
    );
  }
  return true;
};

export const SEARCH_DISTRICTS = [
  {label: 'All districts', value: 'all'},
  {label: 'Dakshina Kannada', value: 'Dakshina Kannada'},
  {label: 'Udupi', value: 'Udupi'},
  {label: 'Bangalore Urban', value: 'Bangalore Urban'},
];

export const SEARCH_CATEGORY_OPTIONS = [
  {label: 'All categories', value: 'all'},
  ...MATE_CATEGORIES.map(c => ({label: c.label, value: c.id})),
];

export const getActiveFilterCount = (filters: SearchFilters): number =>
  [
    filters.district && filters.district !== 'all',
    filters.category && filters.category !== 'all',
    filters.gender !== 'all',
    filters.ageRange !== 'all',
    isHourlyRateFilterActive(filters),
  ].filter(Boolean).length;
