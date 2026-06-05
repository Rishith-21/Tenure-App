/** Display label on sent cards (e.g. "shopping partner"). */
export function formatPartnerLabel(categoryLabel: string): string {
  return categoryLabel
    .toLowerCase()
    .replace(/\s*mate\s*$/i, ' partner')
    .trim();
}

/** Stable display handle e.g. john v1835 */
export function deriveMateUsername(name: string, tenureId?: string): string {
  const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
  const suffix = (tenureId ?? '1835').replace(/\W/g, '').slice(-4) || '1835';
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}${suffix}`;
  }
  return `${parts[0] ?? 'user'}${suffix}`;
}
