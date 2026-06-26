import {HistoryAlert} from '../types/historyAlert';

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
    id: 'h4',
    kind: 'meet_expired',
    message: "pallai's meet expired",
    timestamp: '21-7-2026 09:30:00',
  },
];
