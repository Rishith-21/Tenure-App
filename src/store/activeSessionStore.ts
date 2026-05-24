import {create} from 'zustand';

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

const DEMO_STARTED_AT =
  Date.now() - (14 * 3600 + 43 * 60 + 8) * 1000;

export const useActiveSessionStore = create<ActiveSessionState>(set => ({
  session: {
    mateName: 'Swan',
    mateTenureId: 'FGR45IH',
    mateAvatar: 'https://i.pravatar.cc/150?img=12',
    fromDateTime: '26-10-2026 10:30 pm',
    toDateTime: '27-10-2026 08:23 am',
    startedAt: DEMO_STARTED_AT,
  },

  startSession: session => set({session}),
  clearSession: () => set({session: null}),
}));
