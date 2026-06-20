import type {BackendProfile} from './api';

const PLACEHOLDER_NAME_PATTERN = /^user\s+\d{10}$/i;

/** True when onboarding-required fields are saved in the database. */
export function isProfileComplete(profile: BackendProfile | null): boolean {
  if (!profile) {
    return false;
  }

  const fullName = profile.fullName?.trim() ?? '';
  if (
    !fullName ||
    fullName.toLowerCase() === 'anonymous' ||
    PLACEHOLDER_NAME_PATTERN.test(fullName)
  ) {
    return false;
  }

  if (!profile.profilePhoto?.trim()) {
    return false;
  }

  if (
    !profile.country?.trim() ||
    !profile.state?.trim() ||
    !profile.district?.trim()
  ) {
    return false;
  }

  if (!profile.languages?.length) {
    return false;
  }

  if (!profile.categories?.length) {
    return false;
  }

  return true;
}
