import {create} from 'zustand';
import {dateToMateString} from '../utils/meetTime';

export const MAX_TENURE_SECONDS = 24 * 60 * 60;

export type ActiveTenureSession = {
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  fromDateTime: string;
  toDateTime: string;
  /** When the live tenure timer started (epoch ms). */
  startedAt: number;
  mateUserId: string;
  requestId: string;
  status: 'running' | 'pause_requested' | 'paused' | 'resume_requested' | 'ended';
  elapsedSec: number;
  hourlyRate?: number;
  lastActionBy?: string | null;
};

type ActiveSessionState = {
  session: ActiveTenureSession | null;
  startSession: (session: ActiveTenureSession) => void;
  updateSession: (updates: Partial<ActiveTenureSession>) => void;
  clearSession: () => void;
  restoreSession: (backendSession: any) => void;
};

const isoToMateString = (value?: string | number | null): string => {
  if (value == null) {
    return '';
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : dateToMateString(d);
};

export const useActiveSessionStore = create<ActiveSessionState>(set => ({
  session: null,

  startSession: session => set({session}),
  
  updateSession: updates => set(state => ({
    session: state.session ? { ...state.session, ...updates } : null
  })),

  clearSession: () => set({session: null}),

  restoreSession: backendSession => {
    if (!backendSession) {
      set({session: null});
      return;
    }
    
    set({
      session: {
        mateName: backendSession.mateName,
        mateTenureId: backendSession.mateTenureId,
        mateAvatar: backendSession.mateAvatar,
        fromDateTime: isoToMateString(backendSession.fromDateTime ?? backendSession.startedAt),
        toDateTime: isoToMateString(
          backendSession.toDateTime ?? backendSession.endedAt ?? backendSession.startedAt,
        ),
        startedAt: backendSession.startedAt,
        mateUserId: backendSession.mateUserId,
        requestId: backendSession.requestId,
        status: backendSession.status,
        elapsedSec: backendSession.elapsedSec,
        hourlyRate: backendSession.hourlyRate,
        lastActionBy: backendSession.lastActionBy,
      }
    });
  }
}));
