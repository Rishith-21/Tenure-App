export type HistoryAlertKind =
  | 'request_accepted'
  | 'meet_canceled'
  | 'payment_canceled'
  | 'meet_expired'
  | 'payment_sent'
  | 'payment_received';

export type HistoryAlert = {
  id: string;
  kind: HistoryAlertKind;
  message: string;
  timestamp: string;
};

export type PendingPaymentSummary = {
  label: string;
  count: number;
};
