export type MateCategory = {
  id: string;
  label: string;
};

/** Mate types shown on search browse + filter. */
export const MATE_CATEGORIES: MateCategory[] = [
  {id: 'shopping', label: 'Shopping Mate'},
  {id: 'movie', label: 'Movie Mate'},
  {id: 'timepass', label: 'Time Pass Mate'},
  {id: 'hospital', label: 'Hospital Mate'},
  {id: 'talking', label: 'Talking Mate'},
  {id: 'travel', label: 'Travel Mate'},
  {id: 'home', label: 'Home Mate'},
  {id: 'children', label: 'Children Care Mate'},
  {id: 'food', label: 'Food Mate'},
  {id: 'pub', label: 'Pub Mate'},
  {id: 'vlog', label: 'Vlog Mate'},
  {id: 'language', label: 'Language Mate'},
  {id: 'day', label: 'Day Mate'},
  {id: 'other', label: 'Other'},
];

export const PRIMARY_MATE_COUNT = 7;
