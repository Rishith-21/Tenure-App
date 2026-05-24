import {formatMateDateTime} from './mateRequestFormat';

/** Parse "12-07-2026 11:30 am" style strings. */
export function parseMateDateTime(value: string): Date | null {
  const m = value.trim().match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i,
  );
  if (!m) {
    return null;
  }
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  let hour = Number(m[4]);
  const minute = Number(m[5]);
  const ampm = m[6].toLowerCase();
  if (ampm === 'pm' && hour < 12) {
    hour += 12;
  }
  if (ampm === 'am' && hour === 12) {
    hour = 0;
  }
  const d = new Date(year, month, day, hour, minute);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calcMeetDurationMinutes(
  from: string,
  to: string,
): number | null {
  const start = parseMateDateTime(from);
  const end = parseMateDateTime(to);
  if (!start || !end) {
    return null;
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    return null;
  }
  return Math.round(diffMs / 60000);
}

export function formatDurationHuman(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) {
    return `${h} hr`;
  }
  return `${h} hr ${m} min`;
}

export function formatMeetRange(from: string, to: string): string {
  return `${from} To ${to}`;
}

/** HH:MM:SS for tenure timer display */
export function formatElapsedHMS(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function getElapsedSecondsSince(startedAtMs: number): number {
  return Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
}

export function extractMeetDateLabel(dateTime: string): string {
  const d = parseMateDateTime(dateTime);
  if (!d) {
    return dateTime.split(' ')[0] ?? dateTime;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function defaultMateRequestDatePair(): {from: Date; to: Date} {
  const from = new Date();
  const to = new Date(from.getTime() + 2 * 60 * 60 * 1000);
  return {from, to};
}

export function dateToMateString(date: Date): string {
  return formatMateDateTime(date);
}

/** 12-hour time label without relying on Intl locale support. */
export function formatTime12h(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
