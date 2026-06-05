export type ChatSender = 'me' | 'them' | 'system';

export type ChatMessageType = 'text' | 'image' | 'voice' | 'system';

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  type: ChatMessageType;
  text?: string;
  imageUri?: string;
  voiceUri?: string;
  voiceDurationSec?: number;
  createdAt: number;
};

export const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const formatMessageTime = (createdAt: number) => {
  const d = new Date(createdAt);
  const hours = d.getHours();
  const mins = d.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${h12}:${String(mins).padStart(2, '0')} ${ampm}`;
};

export const formatVoiceDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
