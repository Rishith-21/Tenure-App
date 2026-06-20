import {MateTypeItem} from './MateTypeCard';

export const BROWSE_MATE_TYPES: MateTypeItem[] = [
  {
    id: 'travel',
    label: 'Travel Buddy',
    subtitle: 'Trips & getaways',
    badge: 'TR',
    filterCategoryId: 'travel',
  },
  {
    id: 'coffee',
    label: 'Coffee Mate',
    subtitle: 'Cafés & chats',
    badge: 'CF',
    filterCategoryId: 'talking',
  },
  {
    id: 'movie',
    label: 'Movie Mate',
    subtitle: 'Cinema & OTT',
    badge: 'MV',
    filterCategoryId: 'movie',
  },
  {
    id: 'walk',
    label: 'City Walk',
    subtitle: 'Explore together',
    badge: 'CW',
    filterCategoryId: 'day',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    subtitle: 'Malls & markets',
    badge: 'SH',
    filterCategoryId: 'shopping',
  },
  {
    id: 'events',
    label: 'Events',
    subtitle: 'Concerts & meets',
    badge: 'EV',
    filterCategoryId: 'day',
  },
  {
    id: 'food',
    label: 'Food Partner',
    subtitle: 'Dining out',
    badge: 'FD',
    filterCategoryId: 'food',
  },
  {
    id: 'hospital',
    label: 'Hospital',
    subtitle: 'Visit support',
    badge: 'HP',
    filterCategoryId: 'hospital',
  },
  {
    id: 'guide',
    label: 'Local Guide',
    subtitle: 'City tips',
    badge: 'LG',
    filterCategoryId: 'language',
  },
];

/** Shown in the horizontal quick-pick row */
export const FEATURED_MATE_TYPE_IDS = [
  'travel',
  'coffee',
  'movie',
  'shopping',
  'food',
  'walk',
];

export type SuggestedItem = {
  id: string;
  title: string;
  subtitle: string;
  query: string;
  filterCategoryId?: string;
};

export const SUGGESTED_SEARCHES: SuggestedItem[] = [
  {
    id: 's1',
    title: 'Coffee Mate near Mitte',
    subtitle: '3 mates available this afternoon',
    query: '',
    filterCategoryId: 'talking',
  },
  {
    id: 's2',
    title: 'Travel Buddy available today',
    subtitle: 'Weekend trips & airport runs',
    query: '',
    filterCategoryId: 'travel',
  },
  {
    id: 's3',
    title: 'Movie Mate this evening',
    subtitle: 'New releases & OTT watch',
    query: '',
    filterCategoryId: 'movie',
  },
];

/** Chips with real client-side filter behavior on mock data */
export const QUICK_FILTER_CHIPS = [
  {id: 'available', label: 'Available now'},
  {id: 'verified', label: 'Verified'},
  {id: 'under50', label: 'Under ₹50/hr'},
] as const;

export type QuickFilterId = (typeof QUICK_FILTER_CHIPS)[number]['id'];

/** Default district for "Near me" mock */
export const NEAR_ME_DISTRICT = 'Dakshina Kannada';
