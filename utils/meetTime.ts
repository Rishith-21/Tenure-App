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

function isSameMeetDay(from: string, to: string): boolean {
  return extractMeetDateLabel(from) === extractMeetDateLabel(to);
}

/** Time portion of a mate datetime string (e.g. "2:00 pm"). */
export function formatMeetTimeOnly(dateTime: string): string {
  const d = parseMateDateTime(dateTime);
  if (d) {
    return formatTime12h(d);
  }
  const match = dateTime.trim().match(/^\d{1,2}-\d{1,2}-\d{4}\s+(.+)$/i);
  return match?.[1] ?? dateTime;
}

export type MeetFromToLabels = {
  sameDay: boolean;
  date: string;
  from: string;
  to: string;
};

/** Structured labels for From / To UI rows. */
export function formatMeetFromTo(from: string, to: string): MeetFromToLabels {
  const sameDay = isSameMeetDay(from, to);
  const date = extractMeetDateLabel(from);
  return {
    sameDay,
    date,
    from: sameDay ? formatMeetTimeOnly(from) : from,
    to: sameDay ? formatMeetTimeOnly(to) : to,
  };
}

/** Compact one-line schedule (cards, map labels). */
export function formatMeetRange(from: string, to: string): string {
  const {sameDay, date, from: fromLabel, to: toLabel} = formatMeetFromTo(
    from,
    to,
  );
  if (sameDay) {
    if (fromLabel === toLabel) {
      return `${date} · ${fromLabel}`;
    }
    return `${date} · ${fromLabel} – ${toLabel}`;
  }
  return `From: ${fromLabel} · To: ${toLabel}`;
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

export function isMeetToday(dateTime: string): boolean {
  const d = parseMateDateTime(dateTime);
  if (!d) {
    return false;
  }
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/** Section header in Home drawer — "Today" or dd-mm-yyyy */
export function meetSectionLabel(dateTime: string): string {
  if (isMeetToday(dateTime)) {
    return 'Today';
  }
  return extractMeetDateLabel(dateTime);
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

export function formatMateDateOnly(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function mergeDatePart(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

export function mergeTimePart(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

/** 12-hour time label without relying on Intl locale support. */
export function formatTime12h(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
