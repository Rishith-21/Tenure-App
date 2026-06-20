/**
 * Full years between date of birth and today (or a reference date).
 * Accounts for whether the birthday has occurred this year.
 */
export function calculateAgeFromDob(
  dob: string | Date | null | undefined,
  referenceDate: Date = new Date(),
): number | null {
  if (!dob) {
    return null;
  }

  const birth = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

/** Display label for profile headers, e.g. "39 yr". */
export function formatAgeYears(age: number | null | undefined): string | null {
  if (age == null || !Number.isFinite(age)) {
    return null;
  }
  return `${age} yr`;
}
