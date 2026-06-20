export type SearchMateUser = {
  id: string;
  name: string;
  tenureId: string;
  categories: string[];
  ratePerHour: number;
  avatar: string;
  district: string;
  gender: 'male' | 'female';
  age: number;
  rating?: number;
  isNew?: boolean;
};

/** Populated from the search API when companion discovery is live. */
export const MOCK_SEARCH_USERS: SearchMateUser[] = [];
