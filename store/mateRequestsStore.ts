import {create} from 'zustand';
import {MateRequest, MateRequestStatus} from '../types/mateRequest';
import {deriveMateUsername, formatPartnerLabel} from '../utils/requestLabels';

type AddSentPayload = {
  mateUserId?: string;
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
  addSentRequest: (payload: AddSentPayload) => MateRequest;
  cancelSentRequest: (id: string) => void;
  updateRequestStatus: (id: string, status: MateRequestStatus) => void;
  getRequestById: (id: string) => MateRequest | undefined;
};

const newId = () => `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useMateRequestsStore = create<MateRequestsState>((set, get) => ({
  received: [],
  sent: [],
  archivedReceived: [],
  archivedSent: [],

  addSentRequest: payload => {
    const request: MateRequest = {
      id: newId(),
      direction: 'sent',
      mateUserId: payload.mateUserId,
      mateName: payload.mateName,
      mateUsername: deriveMateUsername(payload.mateName, payload.mateTenureId),
      mateTenureId: payload.mateTenureId,
      mateAvatar: payload.mateAvatar,
      categoryId: payload.categoryId,
      categoryLabel: formatPartnerLabel(payload.categoryLabel),
      meetLocation: payload.meetLocation,
      fromDateTime: payload.fromDateTime,
      toDateTime: payload.toDateTime,
      message: '',
      status: 'pending',
      delivered: true,
      sentAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    set(state => ({sent: [request, ...state.sent]}));
    return request;
  },

  cancelSentRequest: id => {
    set(state => ({
      sent: state.sent.filter(r => r.id !== id),
    }));
  },

  updateRequestStatus: (id, status) => {
    set(state => ({
      received: state.received.map(r =>
        r.id === id ? {...r, status} : r,
      ),
      sent: state.sent.map(r => (r.id === id ? {...r, status} : r)),
    }));
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
