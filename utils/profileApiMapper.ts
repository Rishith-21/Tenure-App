import type {BackendProfile, ProfileUpsertInput} from './api';
import type {ProfileSocialLinks} from './profileSocialStorage';
import {calculateAgeFromDob} from './ageFromDob';

export type ComfortZone = {
  preferredPlaces: string;
  travelRange: string;
  comfortableWith: string;
  notComfortableWith: string;
};

export type ViewProfileData = {
  name: string;
  dob: string | null;
  age: number | null;
  location: string;
  tenureId: string;
  avatar: string | null;
  rate: string | null;
  categories: string[];
  vibes: string[];
  languages: string[];
  professions: string[];
  vehicles: string[];
  interests: string[];
  about: string;
  days: string[];
  timeRange: string;
  bestTime: string;
  ratingValue: number | null;
  reviewCount: number;
  phoneVerified: boolean;
  emailVerified: boolean;
  aadhaarVerified: boolean;
  photoVerified: boolean;
  comfort: ComfortZone | null;
  joinedAt: string | null;
  profileCreatedAt: string | null;
};

function formatLocation(profile: BackendProfile): string {
  const parts = [profile.district, profile.state].filter(Boolean);
  return parts.join(', ');
}

function mapComfort(profile: BackendProfile): ComfortZone | null {
  if (
    !profile.comfortPreferredPlaces &&
    !profile.comfortTravelRange &&
    !profile.comfortWith &&
    !profile.comfortNotWith
  ) {
    return null;
  }
  return {
    preferredPlaces: profile.comfortPreferredPlaces || '',
    travelRange: profile.comfortTravelRange || '',
    comfortableWith: profile.comfortWith || '',
    notComfortableWith: profile.comfortNotWith || '',
  };
}

export function mapApiProfileToView(
  profile: BackendProfile | null,
  phone: string | null,
  joinedAt: string | null,
): ViewProfileData {
  if (!profile) {
    return {
      name: '',
      dob: null,
      age: null,
      location: '',
      tenureId: '',
      avatar: null,
      rate: null,
      categories: [],
      vibes: [],
      languages: [],
      professions: [],
      vehicles: [],
      interests: [],
      about: '',
      days: [],
      timeRange: '',
      bestTime: '',
      ratingValue: null,
      reviewCount: 0,
      phoneVerified: Boolean(phone),
      emailVerified: false,
      aadhaarVerified: false,
      photoVerified: false,
      comfort: null,
      joinedAt,
      profileCreatedAt: null,
    };
  }

  return {
    name: profile.fullName?.trim() || '',
    dob: profile.dob ?? null,
    age: calculateAgeFromDob(profile.dob),
    location: formatLocation(profile),
    tenureId: profile.tenureId || '',
    avatar: profile.profilePhoto || null,
    rate: profile.hourlyRate != null ? String(profile.hourlyRate) : null,
    categories: profile.categories ?? [],
    vibes: profile.vibes ?? [],
    languages: profile.languages ?? [],
    professions: profile.professions ?? [],
    vehicles: profile.vehicles ?? [],
    interests: profile.interests ?? [],
    about: profile.about ?? '',
    days: profile.availableDays ?? [],
    timeRange: profile.availableTimeRange ?? '',
    bestTime: profile.bestTime ?? '',
    ratingValue: null,
    reviewCount: 0,
    phoneVerified: Boolean(phone),
    emailVerified: false,
    aadhaarVerified: profile.aadhaarVerified ?? false,
    photoVerified: Boolean(profile.profilePhoto),
    comfort: mapComfort(profile),
    joinedAt,
    profileCreatedAt: profile.createdAt ?? null,
  };
}

type BuildPayloadState = {
  profileName: string;
  profileImage: string;
  hourlyRate: string;
  location: string;
  categories: string[];
  about: string;
  vibes: string[];
  professions: string[];
  vehicles: string[];
  interests: string[];
  days: string[];
  timeRange: string;
  bestTime: string;
  aadhaarVerified: boolean;
  aadhaarMasked: string;
  comfort: ComfortZone | null;
  socialLinks?: ProfileSocialLinks;
};

export function buildProfileUpsertPayload(
  state: BuildPayloadState,
  backendProfile: BackendProfile | null,
): ProfileUpsertInput {
  const districtVal =
    state.location.split(',')[0]?.trim() ||
    backendProfile?.district ||
    'Bangalore';
  const stateVal =
    state.location.split(',')[1]?.trim() ||
    backendProfile?.state ||
    'Karnataka';
  const parsedRate = parseFloat(state.hourlyRate);
  const hourlyRate = Number.isFinite(parsedRate) ? parsedRate : null;

  return {
    fullName: state.profileName.trim() || backendProfile?.fullName || 'Anonymous',
    profilePhoto: state.profileImage || backendProfile?.profilePhoto || null,
    hourlyRate,
    district: districtVal,
    state: stateVal,
    dob: backendProfile?.dob || new Date('2000-01-01').toISOString(),
    gender: backendProfile?.gender || 'Other',
    country: backendProfile?.country || 'India',
    pinCode: backendProfile?.pinCode || '560001',
    languages:
      backendProfile?.languages && backendProfile.languages.length > 0
        ? backendProfile.languages
        : ['English'],
    categories: state.categories,
    about: state.about.trim() || null,
    vibes: state.vibes,
    professions: state.professions,
    vehicles: state.vehicles,
    interests: state.interests,
    availableDays: state.days,
    availableTimeRange: state.timeRange || null,
    bestTime: state.bestTime || null,
    comfortPreferredPlaces: state.comfort?.preferredPlaces || null,
    comfortTravelRange: state.comfort?.travelRange || null,
    comfortWith: state.comfort?.comfortableWith || null,
    comfortNotWith: state.comfort?.notComfortableWith || null,
    aadhaarVerified: state.aadhaarVerified,
    aadhaarMasked: state.aadhaarMasked || null,
    instagram: state.socialLinks?.instagram?.trim() || null,
    facebook: state.socialLinks?.facebook?.trim() || null,
    youtube: state.socialLinks?.youtube?.trim() || null,
    website: state.socialLinks?.website?.trim() || null,
  };
}
