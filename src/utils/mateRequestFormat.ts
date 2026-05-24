/** Display format used on mate request sheet (e.g. 12-07-2026 11:30 am). */
export function formatMateDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

export function defaultMateRequestTimes() {
  const from = new Date();
  const to = new Date(from.getTime() + 2 * 60 * 60 * 1000);
  return {
    from: formatMateDateTime(from),
    to: formatMateDateTime(to),
  };
}
