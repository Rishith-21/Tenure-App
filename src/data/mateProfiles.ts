import {SearchMateUser, MOCK_SEARCH_USERS} from './mockSearchResults';

export type MatePublicProfile = SearchMateUser & {
  birthYear: number;
  location: string;
  languages: string[];
  bio: string;
  availableTime: string;
  availableDays: string[];
  reviewPercent: number;
  reviewCount: number;
  social: {
    youtube?: string;
    instagram?: string;
    website?: string;
  };
};

const PROFILE_DETAILS: Record<string, Partial<MatePublicProfile>> = {
  u1: {
    birthYear: 1999,
    bio: 'I am good person',
    availableTime: '05:30 PM – 05:30 PM',
    availableDays: ['SUN', 'WED', 'SAT'],
    reviewPercent: 69,
    reviewCount: 2,
    languages: ['Kannada', 'English'],
    location: 'India, karnataka, udupi, 576111',
    social: {youtube: true, instagram: true},
  },
  u2: {
    birthYear: 1994,
    bio: 'Movie buff and great company for city outings.',
    availableTime: '06:00 PM – 09:00 PM',
    availableDays: ['FRI', 'SAT'],
    reviewPercent: 82,
    reviewCount: 5,
    languages: ['Kannada', 'English', 'Tulu'],
    location: 'India, karnataka, udupi, 576111',
    social: {youtube: true, instagram: true, website: true},
  },
  u3: {
    birthYear: 1999,
    bio: 'hi i am here i will help you',
    availableTime: '05:30 PM – 05:30 PM',
    availableDays: ['MON', 'TUE', 'THU'],
    reviewPercent: 71,
    reviewCount: 3,
    languages: ['Kannada', 'English'],
    location: 'India, karnataka, udupi, 576111',
    social: {instagram: true},
  },
  u4: {
    birthYear: 1992,
    bio: 'Reliable hospital and home visit support.',
    availableTime: '08:00 AM – 06:00 PM',
    availableDays: ['SUN', 'MON', 'WED', 'FRI'],
    reviewPercent: 91,
    reviewCount: 8,
    languages: ['Kannada', 'Tulu'],
    location: 'India, karnataka, mangalore, 575001',
    social: {website: true},
  },
  u5: {
    birthYear: 1997,
    bio: 'Travel and food mate across coastal Karnataka.',
    availableTime: '04:00 PM – 08:00 PM',
    availableDays: ['SAT', 'SUN'],
    reviewPercent: 75,
    reviewCount: 4,
    languages: ['Kannada', 'English', 'Tulu'],
    location: 'India, karnataka, belman, 576111',
    social: {youtube: true, website: true},
  },
  'u-duck': {
    birthYear: 1999,
    bio: 'I am good person',
    availableTime: '05:30 PM TO PM 05:30',
    availableDays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    reviewPercent: 69,
    reviewCount: 2,
    languages: ['Kannada', 'English', 'Tulu'],
    location: 'India, karnataka, udupi, 576111',
    social: {youtube: true, instagram: true, website: true},
  },
  u6: {
    birthYear: 1999,
    bio: 'Shopping partner and pub meet specialist.',
    availableTime: '05:30 PM – 11:00 PM',
    availableDays: ['THU', 'FRI', 'SAT'],
    reviewPercent: 68,
    reviewCount: 2,
    languages: ['Kannada', 'English'],
    location: 'India, karnataka, udupi, 576111',
    social: {instagram: true, website: true},
  },
};

const DUCK_USER: SearchMateUser = {
  id: 'u-duck',
  name: 'Duck',
  tenureId: 'TGR456H',
  categories: ['Shopping Mate'],
  ratePerHour: 50,
  avatar: 'https://i.pravatar.cc/150?img=20',
  district: 'Udupi',
  gender: 'male',
  age: 27,
};

export const getMateProfile = (userId: string): MatePublicProfile | null => {
  const base =
    MOCK_SEARCH_USERS.find(u => u.id === userId) ??
    (userId === 'u-duck' ? DUCK_USER : undefined);
  if (!base) {
    return null;
  }

  const extra = PROFILE_DETAILS[userId] ?? {};

  return {
    ...base,
    birthYear: extra.birthYear ?? 1999,
    location: extra.location ?? `India, karnataka, ${base.district.toLowerCase()}`,
    languages: extra.languages ?? ['Kannada', 'English'],
    bio: extra.bio ?? 'Available for mate requests.',
    availableTime: extra.availableTime ?? '05:30 PM – 05:30 PM',
    availableDays: extra.availableDays ?? ['SUN', 'SAT'],
    reviewPercent: extra.reviewPercent ?? 70,
    reviewCount: extra.reviewCount ?? 1,
    social: extra.social ?? {},
  };
};

export const getRoleLabel = (categories: string[]) => {
  const primary = categories[0] ?? 'Mate';
  return primary.replace(' Mate', ' Partner');
};

/** Build profile view for a request when mate id is missing from search mocks. */
export const getMateProfileFromRequest = (
  mateUserId: string | undefined,
  mateName: string,
  mateTenureId: string,
  mateAvatar: string,
  categoryLabel: string,
  location: string,
): MatePublicProfile | null => {
  if (mateUserId) {
    const profile = getMateProfile(mateUserId);
    if (profile) {
      return profile;
    }
  }
  return {
    id: mateUserId ?? 'unknown',
    name: mateName,
    tenureId: mateTenureId,
    categories: [categoryLabel],
    ratePerHour: 50,
    avatar: mateAvatar,
    district: 'Udupi',
    gender: 'male',
    age: 28,
    birthYear: 1999,
    location,
    languages: ['Kannada', 'English'],
    bio: 'Available for mate requests.',
    availableTime: '05:30 PM – 05:30 PM',
    availableDays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    reviewPercent: 70,
    reviewCount: 1,
    social: {},
  };
};
