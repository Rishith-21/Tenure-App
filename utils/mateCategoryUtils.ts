import {MATE_CATEGORIES} from '../constants/mateCategories';

/** Resolve a stored category id/label/alias to its canonical id. */
export function resolveMateCategoryId(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const lower = value.trim().toLowerCase();
  const direct = MATE_CATEGORIES.find(
    category => category.id === lower || category.label.toLowerCase() === lower,
  );
  return direct?.id ?? null;
}

export function getMateCategoryLabel(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const id = resolveMateCategoryId(value);
  if (id) {
    return MATE_CATEGORIES.find(category => category.id === id)?.label ?? value;
  }

  return value;
}
