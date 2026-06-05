import {HistoryAlert, PendingPaymentSummary} from '../types/historyAlert';

export const MOCK_PENDING_PAYMENTS: PendingPaymentSummary = {
  label: 'pending canceled payment',
  count: 2,
};

export const MOCK_HISTORY_ALERTS: HistoryAlert[] = [
  {
    id: 'h1',
    kind: 'request_accepted',
    message: 'pallai accepted your request',
    timestamp: '23-7-2026 12:45:09',
  },
  {
    id: 'h2',
    kind: 'meet_canceled',
    message: 'pallai canceled your meet',
    timestamp: '23-7-2026 11:20:44',
  },
  {
    id: 'h3',
    kind: 'payment_canceled',
    message: 'pallai paid canceled amount',
    timestamp: '22-7-2026 18:05:12',
  },
  {
    id: 'h4',
    kind: 'meet_expired',
    message: "pallai's meet expired",
    timestamp: '21-7-2026 09:30:00',
  },
  {
    id: 'h5',
    kind: 'payment_sent',
    message: 'you paid 300 to kavya',
    timestamp: '20-7-2026 16:12:33',
  },
  {
    id: 'h6',
    kind: 'payment_received',
    message: 'you received 300 from palavi',
    timestamp: '19-7-2026 14:08:21',
  },
];
