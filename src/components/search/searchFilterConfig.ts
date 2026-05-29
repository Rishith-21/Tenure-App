import {MATE_CATEGORIES} from '../../constants/mateCategories';
import {SearchFilters} from './SearchFilterModal';

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  district: null,
  category: null,
  gender: 'all',
  ageRange: 'all',
};

export const SEARCH_DISTRICTS = [
  {label: 'All districts', value: 'all'},
  {label: 'Dakshina Kannada', value: 'Dakshina Kannada'},
  {label: 'Udupi', value: 'Udupi'},
  {label: 'Bangalore Urban', value: 'Bangalore Urban'},
];

export const SEARCH_CATEGORY_OPTIONS = [
  {label: 'All categories', value: 'all'},
  ...MATE_CATEGORIES.map(c => ({label: c.label, value: c.label})),
];

export const getActiveFilterCount = (filters: SearchFilters): number =>
  [
    filters.district && filters.district !== 'all',
    filters.category && filters.category !== 'all',
    filters.gender !== 'all',
    filters.ageRange !== 'all',
  ].filter(Boolean).length;
