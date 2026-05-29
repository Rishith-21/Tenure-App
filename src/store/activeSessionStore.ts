import {create} from 'zustand';

export const MAX_TENURE_SECONDS = 24 * 60 * 60;

export type ActiveTenureSession = {
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  fromDateTime: string;
  toDateTime: string;
  /** When the live tenure timer started (epoch ms). */
  startedAt: number;
};

type ActiveSessionState = {
  session: ActiveTenureSession | null;
  startSession: (session: ActiveTenureSession) => void;
  clearSession: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>(set => ({
  session: null,

  startSession: session => set({session}),
  clearSession: () => set({session: null}),
}));
