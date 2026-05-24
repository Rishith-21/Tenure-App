export type MateRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'expired';

export type MateRequest = {
  id: string;
  direction: 'sent' | 'received';
  /** Mate profile id when known */
  mateUserId?: string;
  mateName: string;
  mateUsername?: string;
  mateTenureId: string;
  mateAvatar: string;
  categoryId: string;
  categoryLabel: string;
  meetLocation: string;
  fromDateTime: string;
  toDateTime: string;
  message: string;
  status: MateRequestStatus;
  sentAt: string;
  expiresInDays?: number;
  /** Sent requests: mate has seen the request (double check). */
  delivered?: boolean;
};
