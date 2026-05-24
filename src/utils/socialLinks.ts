export function normalizeSocialUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidSocialUrl(input: string): boolean {
  const url = normalizeSocialUrl(input);
  if (!url) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return url.length > 8;
  }
}
