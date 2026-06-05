import {VEHICLE_OPTIONS} from '../constants/profileOptions';
import type {MateVehicle} from '../data/mateProfiles';

export function formatMateShortMeta(
  gender: 'male' | 'female',
  age: number,
): string {
  const g = gender === 'male' ? 'Male' : 'Female';
  return `${g}, ${age}`;
}

export function vehicleIconFor(id: string): string {
  return VEHICLE_OPTIONS.find(v => v.id === id)?.icon ?? '🚗';
}

export function formatVehicleLine(vehicle: MateVehicle): string {
  if (vehicle.detail?.trim()) {
    return vehicle.detail.trim();
  }
  return vehicle.label;
}

export function formatMateTypesLine(categories: string[]): string {
  return categories.join(' • ');
}

export function formatAvailabilityDays(days: string[]): string {
  return days.join(', ');
}

/** Compact label for trust metric strip. */
export function formatShortAvailDays(days: string[]): string {
  if (!days.length) {
    return '—';
  }
  const sorted = [...days];
  if (
    sorted.length === 2 &&
    sorted.includes('SAT') &&
    sorted.includes('SUN')
  ) {
    return 'Sat–Sun';
  }
  if (sorted.length <= 3) {
    return sorted.join(', ');
  }
  return `${sorted.length} days`;
}

/** Short location for profile hero (district-first). */
export function formatProfileLocation(
  district: string,
  fullLocation?: string,
): string {
  if (district?.trim()) {
    return district.trim();
  }
  if (!fullLocation?.trim()) {
    return '';
  }
  const parts = fullLocation.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(1, 3).join(', ');
  }
  return fullLocation;
}

export function formatAvailabilityHint(days: string[]): string | null {
  if (!days.length) {
    return null;
  }
  const hasSat = days.includes('SAT');
  const hasSun = days.includes('SUN');
  if (hasSat && hasSun && days.length <= 3) {
    return 'Available this weekend';
  }
  if (days.length >= 5) {
    return 'Available most days';
  }
  const label = formatAvailabilityDays(days);
  return `Available ${label}`;
}

export type ComfortZoneItem = {label: string; value: string};

/** Comfort zone rows derived only from existing profile fields. */
export function buildComfortZoneItems(profile: {
  categories: string[];
  location: string;
  district: string;
  availableTime: string;
  availableDays: string[];
  vehicles: MateVehicle[];
}): ComfortZoneItem[] {
  const items: ComfortZoneItem[] = [];

  if (profile.categories.length > 0) {
    items.push({
      label: 'Best for',
      value: profile.categories.join(', '),
    });
  }

  const area = formatProfileLocation(profile.district, profile.location);
  if (area) {
    items.push({label: 'Meet area', value: area});
  }

  if (profile.vehicles.length > 0) {
    items.push({
      label: 'Getting around',
      value: profile.vehicles.map(v => formatVehicleLine(v)).join(' · '),
    });
  }

  if (profile.availableTime && profile.availableDays.length > 0) {
    items.push({
      label: 'Best time to request',
      value: `${profile.availableTime}, ${formatAvailabilityDays(profile.availableDays)}`,
    });
  }

  return items;
}
