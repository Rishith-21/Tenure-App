export type HistoryAlertKind =
  | 'request_accepted'
  | 'meet_canceled'
  | 'meet_expired';

export type HistoryAlert = {
  id: string;
  kind: HistoryAlertKind;
  message: string;
  timestamp: string;
};

