/** Trusted member: consistently positive reviews from completed mates. */
const TRUSTED_MIN_PERCENT = 75;
const TRUSTED_MIN_REVIEWS = 2;
const TRUSTED_HIGH_PERCENT = 85;

export function isTrustedMember(
  reviewPercent: number,
  reviewCount: number = 0,
): boolean {
  if (reviewCount >= TRUSTED_MIN_REVIEWS) {
    return reviewPercent >= TRUSTED_MIN_PERCENT;
  }
  return reviewCount >= 1 && reviewPercent >= TRUSTED_HIGH_PERCENT;
}

export function hasAadhaarVerification(
  aadhaarVerified: boolean | undefined,
): boolean {
  return aadhaarVerified === true;
}
