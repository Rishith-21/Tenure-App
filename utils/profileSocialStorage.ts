import AsyncStorage from '@react-native-async-storage/async-storage';
import {SOCIAL_PLATFORMS} from '../constants/profileOptions';

const SOCIAL_KEY = '@tenure/profile_social';

export type ProfileSocialPlatformId =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'website';

export type ProfileSocialLinks = Partial<
  Record<ProfileSocialPlatformId, string>
>;

const PLATFORM_IDS = new Set(
  SOCIAL_PLATFORMS.map(p => p.id as ProfileSocialPlatformId),
);

function sanitize(raw: unknown): ProfileSocialLinks {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const out: ProfileSocialLinks = {};
  for (const [key, value] of Object.entries(raw)) {
    if (
      PLATFORM_IDS.has(key as ProfileSocialPlatformId) &&
      typeof value === 'string' &&
      value.trim()
    ) {
      out[key as ProfileSocialPlatformId] = value.trim();
    }
  }
  return out;
}

export async function loadProfileSocial(): Promise<ProfileSocialLinks> {
  const raw = await AsyncStorage.getItem(SOCIAL_KEY);
  if (!raw) {
    return {};
  }
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function saveProfileSocial(
  links: ProfileSocialLinks,
): Promise<void> {
  await AsyncStorage.setItem(SOCIAL_KEY, JSON.stringify(links));
}
