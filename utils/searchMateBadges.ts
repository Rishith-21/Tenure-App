import {getMateProfile} from '../data/mateProfiles';
import {hasAadhaarVerification} from './mateProfileBadges';

export function isSearchMateVerified(userId: string): boolean {
  const profile = getMateProfile(userId);
  if (!profile) {
    return false;
  }
  return hasAadhaarVerification(profile.aadhaarVerified);
}
