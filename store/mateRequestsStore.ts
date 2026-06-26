import {create} from 'zustand';
import {MateRequest} from '../types/mateRequest';
import {deriveMateUsername} from '../utils/requestLabels';
import {dateToMateString, parseMateDateTime} from '../utils/meetTime';
import {
  sendMateRequest,
  fetchMateRequests,
  updateMateRequestStatus,
  ApiMateRequest,
} from '../utils/api';

/** Mate display string ("20-06-2026 4:00 pm") → ISO for the backend. */
const mateStringToIso = (value: string): string => {
  const parsed = parseMateDateTime(value);
  if (parsed) {
    return parsed.toISOString();
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? value : fallback.toISOString();
};

/** Backend ISO string → mate display string for the UI. */
const isoToMateString = (value: string): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateToMateString(d);
};

const genderToPronoun = (
  gender?: string | null,
): MateRequest['requesterPronoun'] => {
  const normalized = (gender ?? '').trim().toLowerCase();
  if (normalized === 'man' || normalized === 'male') {
    return 'he';
  }
  if (normalized === 'woman' || normalized === 'female') {
    return 'she';
  }
  return 'they';
};

type AddSentPayload = {
  mateUserId: string;
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  categoryId: string;
  categoryLabel: string;
  meetLocation: string;
  fromDateTime: string;
  toDateTime: string;
};

type MateRequestsState = {
  received: MateRequest[];
  sent: MateRequest[];
  archivedReceived: MateRequest[];
  archivedSent: MateRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  addSentRequest: (payload: AddSentPayload) => Promise<MateRequest>;
  cancelSentRequest: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: 'confirmed' | 'declined') => Promise<void>;
  getRequestById: (id: string) => MateRequest | undefined;
};

const mapApiToFrontend = (req: ApiMateRequest): MateRequest => ({
  id: req.id,
  direction: req.direction,
  mateUserId: req.mateUserId,
  mateName: req.mateName,
  mateUsername: deriveMateUsername(req.mateName, req.mateTenureId),
  mateTenureId: req.mateTenureId,
  mateAvatar: req.mateAvatar,
  categoryId: req.categoryId,
  categoryLabel: req.categoryLabel,
  meetLocation: req.meetLocation,
  fromDateTime: isoToMateString(req.fromDateTime),
  toDateTime: isoToMateString(req.toDateTime),
  message: req.message,
  status: req.status,
  sentAt: req.sentAt,
  otp: req.otp ?? null,
  requesterPronoun: genderToPronoun(req.requesterGender),
  delivered: true,
});

export const useMateRequestsStore = create<MateRequestsState>((set, get) => ({
  received: [],
  sent: [],
  archivedReceived: [],
  archivedSent: [],
  loading: false,
  error: null,

  fetchRequests: async () => {
    set({loading: true, error: null});
    try {
      const data = await fetchMateRequests();
      const allSent = data.sent.map(mapApiToFrontend);
      const allReceived = data.received.map(mapApiToFrontend);

      set({
        sent: allSent.filter(r => r.status === 'pending' || r.status === 'confirmed'),
        received: allReceived.filter(r => r.status === 'pending' || r.status === 'confirmed'),
        archivedSent: allSent.filter(r => r.status === 'declined' || r.status === 'cancelled' || r.status === 'expired'),
        archivedReceived: allReceived.filter(r => r.status === 'declined' || r.status === 'cancelled' || r.status === 'expired'),
        loading: false,
      });
    } catch (err) {
      console.log('Error fetching requests from backend:', err);
      set({error: 'Failed to load requests from server', loading: false});
    }
  },

  addSentRequest: async payload => {
    const apiReq = await sendMateRequest({
      receiverId: payload.mateUserId,
      categoryId: payload.categoryId,
      categoryLabel: payload.categoryLabel,
      meetLocation: payload.meetLocation,
      fromDateTime: mateStringToIso(payload.fromDateTime),
      toDateTime: mateStringToIso(payload.toDateTime),
    });
    const request = mapApiToFrontend(apiReq);
    set(state => ({sent: [request, ...state.sent]}));
    return request;
  },

  cancelSentRequest: async id => {
    const apiReq = await updateMateRequestStatus(id, 'cancelled');
    const request = mapApiToFrontend(apiReq);
    set(state => ({
      sent: state.sent.filter(r => r.id !== id),
      archivedSent: [request, ...state.archivedSent],
    }));
  },

  updateRequestStatus: async (id, status) => {
    const apiReq = await updateMateRequestStatus(id, status);
    const request = mapApiToFrontend(apiReq);
    set(state => {
      if (status === 'confirmed') {
        return {
          received: state.received.map(r => (r.id === id ? request : r)),
        };
      }
      return {
        received: state.received.filter(r => r.id !== id),
        archivedReceived: [request, ...state.archivedReceived],
      };
    });
  },

  getRequestById: id => {
    const state = get();
    return (
      state.received.find(r => r.id === id) ??
      state.sent.find(r => r.id === id) ??
      state.archivedReceived.find(r => r.id === id) ??
      state.archivedSent.find(r => r.id === id)
    );
  },
}));
