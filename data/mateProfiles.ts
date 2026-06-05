import {SearchMateUser, MOCK_SEARCH_USERS} from './mockSearchResults';

export type MateVehicle = {
  id: string;
  label: string;
  /** e.g. "Honda City · White" */
  detail?: string;
};

export type MatePublicProfile = SearchMateUser & {
  birthYear: number;
  location: string;
  languages: string[];
  professions: string[];
  vehicles: MateVehicle[];
  bio: string;
  availableTime: string;
  availableDays: string[];
  reviewPercent: number;
  reviewCount: number;
  /** True after Aadhaar identity verification on Tenure. */
  aadhaarVerified?: boolean;
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
    professions: ['Student'],
    vehicles: [{id: 'bike', label: 'Bike'}],
    location: 'India, karnataka, udupi, 576111',
    social: {
      instagram: 'https://instagram.com/johnvignesh',
      youtube: 'https://youtube.com/@johnvignesh',
    },
  },
  u2: {
    birthYear: 1994,
    bio: 'Movie buff and great company for city outings.',
    availableTime: '06:00 PM – 09:00 PM',
    availableDays: ['FRI', 'SAT'],
    reviewPercent: 82,
    reviewCount: 5,
    aadhaarVerified: true,
    languages: ['Kannada', 'English', 'Tulu'],
    professions: ['Content creator', 'Teacher'],
    vehicles: [
      {id: 'car', label: 'Car', detail: 'Honda City · White'},
    ],
    location: 'India, karnataka, udupi, 576111',
    social: {
      instagram: 'https://instagram.com/prabas',
      youtube: 'https://youtube.com/@prabas',
      website: 'https://prabas.studio',
    },
  },
  u3: {
    birthYear: 1999,
    bio: 'hi i am here i will help you',
    availableTime: '05:30 PM – 05:30 PM',
    availableDays: ['MON', 'TUE', 'THU'],
    reviewPercent: 71,
    reviewCount: 3,
    languages: ['Kannada', 'English'],
    professions: ['Engineer'],
    vehicles: [{id: 'bike', label: 'Bike'}],
    location: 'India, karnataka, udupi, 576111',
    social: {
      instagram: 'https://instagram.com/eagle_mate',
    },
  },
  u4: {
    birthYear: 1992,
    bio: 'Reliable hospital and home visit support.',
    availableTime: '08:00 AM – 06:00 PM',
    availableDays: ['SUN', 'MON', 'WED', 'FRI'],
    reviewPercent: 91,
    reviewCount: 8,
    aadhaarVerified: true,
    languages: ['Kannada', 'Tulu'],
    professions: ['Doctor', 'Fitness trainer'],
    vehicles: [
      {id: 'car', label: 'Car', detail: 'SUV · Silver'},
    ],
    location: 'India, karnataka, mangalore, 575001',
    social: {
      website: 'https://dranita-care.in',
    },
  },
  u5: {
    birthYear: 1997,
    bio: 'Travel and food mate across coastal Karnataka.',
    availableTime: '04:00 PM – 08:00 PM',
    availableDays: ['SAT', 'SUN'],
    reviewPercent: 75,
    reviewCount: 4,
    languages: ['Kannada', 'English', 'Tulu'],
    professions: ['Business owner'],
    vehicles: [
      {id: 'car', label: 'Car', detail: 'Sedan · Black'},
      {id: 'bike', label: 'Bike'},
    ],
    location: 'India, karnataka, belman, 576111',
    social: {
      youtube: 'https://youtube.com/@coastalmates',
      website: 'https://coastalmates.in',
    },
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
    social: {
      instagram: 'https://instagram.com/ducktenure',
      youtube: 'https://youtube.com/@ducktenure',
      website: 'https://duck.dev',
    },
  },
  u6: {
    birthYear: 1999,
    bio: 'Shopping partner and pub meet specialist.',
    availableTime: '05:30 PM – 11:00 PM',
    availableDays: ['THU', 'FRI', 'SAT'],
    reviewPercent: 68,
    reviewCount: 2,
    languages: ['Kannada', 'English'],
    professions: ['Designer'],
    vehicles: [{id: 'car', label: 'Car', detail: 'Compact · Grey'}],
    location: 'India, karnataka, udupi, 576111',
    social: {
      instagram: 'https://instagram.com/designmate_udupi',
      website: 'https://designmate.in',
    },
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
    professions: extra.professions ?? [],
    vehicles: extra.vehicles ?? [],
    bio: extra.bio ?? 'Available for mate requests.',
    availableTime: extra.availableTime ?? '05:30 PM – 05:30 PM',
    availableDays: extra.availableDays ?? ['SUN', 'SAT'],
    reviewPercent: extra.reviewPercent ?? 70,
    reviewCount: extra.reviewCount ?? 1,
    aadhaarVerified: extra.aadhaarVerified ?? false,
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
    professions: [],
    vehicles: [],
    bio: 'Available for mate requests.',
    availableTime: '05:30 PM – 05:30 PM',
    availableDays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    reviewPercent: 70,
    reviewCount: 1,
    aadhaarVerified: false,
    social: {},
  };
};
