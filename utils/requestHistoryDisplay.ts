import {MateRequest} from '../types/mateRequest';
import {formatMeetRange} from './meetTime';

export function historyStatusLabel(status: MateRequest['status']): string {
  switch (status) {
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    case 'declined':
      return 'Declined';
    default:
      return 'Past';
  }
}

export function historyDirectionLabel(
  direction: MateRequest['direction'],
): 'Sent' | 'Incoming' {
  return direction === 'sent' ? 'Sent' : 'Incoming';
}

export function historyCardSubtitle(request: MateRequest): string {
  if (request.expiresInDays) {
    return `Expired in ${request.expiresInDays} days`;
  }
  if (request.fromDateTime) {
    const range = formatMeetRange(request.fromDateTime, request.toDateTime);
    return `${request.categoryLabel} · ${range}`;
  }
  return request.categoryLabel;
}

export function collectHistoryRequests(
  archivedSent: MateRequest[],
  archivedReceived: MateRequest[],
  sent: MateRequest[],
  received: MateRequest[],
): MateRequest[] {
  return [
    ...archivedSent,
    ...archivedReceived,
    ...sent.filter(r => r.status === 'expired'),
    ...received.filter(r => r.status === 'expired'),
  ];
}
