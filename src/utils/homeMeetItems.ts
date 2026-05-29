import {ActiveTenureSession} from '../store/activeSessionStore';
import {MateRequest} from '../types/mateRequest';
import {
  extractMeetDateLabel,
  formatElapsedHMS,
  formatMeetRange,
} from './meetTime';
import {getMeetCoordinate, MapCoordinate} from './meetMapCoords';

export type HomeMeetItem = {
  id: string;
  kind: 'active' | 'request';
  request?: MateRequest;
  mateName: string;
  mateAvatar: string;
  mateTenureId: string;
  categoryLabel: string;
  dateLabel: string;
  coordinate: MapCoordinate;
  pillLabel: string;
  caption?: string;
  isLive?: boolean;
  timerText?: string;
};

const incomingCaption = (req: MateRequest) =>
  req.requesterPronoun === 'he' ? 'He requested' : 'She requested';

export function buildHomeMeetItems(
  activeSession: ActiveTenureSession | null,
  received: MateRequest[],
  sent: MateRequest[],
  elapsedSec: number,
): HomeMeetItem[] {
  const items: HomeMeetItem[] = [];

  if (activeSession) {
    items.push({
      id: 'active-tenure',
      kind: 'active',
      mateName: activeSession.mateName,
      mateAvatar: activeSession.mateAvatar,
      mateTenureId: activeSession.mateTenureId,
      categoryLabel: 'Live tenure',
      dateLabel: formatMeetRange(
        activeSession.fromDateTime,
        activeSession.toDateTime,
      ),
      coordinate: getMeetCoordinate('active-swan'),
      pillLabel: 'LIVE',
      isLive: true,
      timerText: formatElapsedHMS(elapsedSec),
    });
  }

  const confirmedReceived = received.filter(r => r.status === 'confirmed');
  const confirmedSent = sent.filter(r => r.status === 'confirmed');
  const pendingReceived = received.filter(r => r.status === 'pending');
  const pendingSent = sent.filter(r => r.status === 'pending');

  // 2) Confirmed (both directions)
  for (const req of confirmedSent) {
    items.push({
      id: req.id,
      kind: 'request',
      request: req,
      mateName: req.mateName,
      mateAvatar: req.mateAvatar,
      mateTenureId: req.mateTenureId,
      categoryLabel: req.categoryLabel,
      dateLabel: extractMeetDateLabel(req.fromDateTime),
      coordinate: getMeetCoordinate(req.id, req),
      pillLabel: 'CONFIRMED',
      caption: 'You requested',
    });
  }

  for (const req of confirmedReceived) {
    items.push({
      id: req.id,
      kind: 'request',
      request: req,
      mateName: req.mateName,
      mateAvatar: req.mateAvatar,
      mateTenureId: req.mateTenureId,
      categoryLabel: req.categoryLabel,
      dateLabel: extractMeetDateLabel(req.fromDateTime),
      coordinate: getMeetCoordinate(req.id, req),
      pillLabel: 'CONFIRMED',
      caption: incomingCaption(req),
    });
  }

  // 3) Yet to be confirmed by me (incoming pending)
  for (const req of pendingReceived) {
    items.push({
      id: req.id,
      kind: 'request',
      request: req,
      mateName: req.mateName,
      mateAvatar: req.mateAvatar,
      mateTenureId: req.mateTenureId,
      categoryLabel: req.categoryLabel,
      dateLabel: extractMeetDateLabel(req.fromDateTime),
      coordinate: getMeetCoordinate(req.id, req),
      pillLabel: 'CONFIRM?',
      caption: incomingCaption(req),
    });
  }

  // 4) Waiting for other person to confirm (sent pending)
  for (const req of pendingSent) {
    items.push({
      id: req.id,
      kind: 'request',
      request: req,
      mateName: req.mateName,
      mateAvatar: req.mateAvatar,
      mateTenureId: req.mateTenureId,
      categoryLabel: req.categoryLabel,
      dateLabel: extractMeetDateLabel(req.fromDateTime),
      coordinate: getMeetCoordinate(req.id, req),
      pillLabel: 'WAITING',
      caption: 'You requested',
    });
  }

  return items;
}
