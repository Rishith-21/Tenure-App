export type ThemeMode = 'light' | 'dark';

export type AppColors = {
  bg: string;
  bgElevated: string;
  bgHome: string;
  brand: string;
  brandDark: string;
  brandMuted: string;
  primary: string;
  primaryPressed: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textHint: string;
  border: string;
  borderInput: string;
  borderPill: string;
  card: string;
  cardMuted: string;
  chip: string;
  overlay: string;
  sheetScrim: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  statusBar: 'light-content' | 'dark-content';
  meetActive: string;
  meetActiveBg: string;
  meetConfirmed: string;
  meetConfirmedBg: string;
  meetPending: string;
  meetPendingBg: string;
  meetLiveCardBg: string;
  meetLiveCardBorder: string;
  meetConfirmedCardBg: string;
  meetConfirmedCardBorder: string;
  meetPendingConfirmCardBg: string;
  meetPendingConfirmCardBorder: string;
};

export const lightColors: AppColors = {
  bg: '#FFFFFF',
  bgElevated: '#F7F8FA',
  bgHome: '#FFFFFF',
  brand: '#014569',
  brandDark: '#012E41',
  brandMuted: '#026A94',
  primary: '#014569',
  primaryPressed: '#012E41',
  text: '#111111',
  textSecondary: '#444444',
  textMuted: '#666666',
  textHint: '#999999',
  border: '#EEEEEE',
  borderInput: '#E5E5E5',
  borderPill: '#DDDDDD',
  card: '#FFFFFF',
  cardMuted: '#FFFFFF',
  chip: '#F5F5F5',
  overlay: 'rgba(0, 0, 0, 0.54)',
  sheetScrim: 'rgba(0, 0, 0, 0.50)',
  success: '#1B8A4A',
  warning: '#C98A00',
  danger: '#C0392B',
  shadow: '#000000',
  statusBar: 'dark-content',
  meetActive: '#014569',
  meetActiveBg: '#FFFFFF',
  meetConfirmed: '#014569',
  meetConfirmedBg: '#FFFFFF',
  meetPending: '#666666',
  meetPendingBg: '#FFFFFF',
  meetLiveCardBg: '#EAF4FF',
  meetLiveCardBorder: '#C6DFFF',
  meetConfirmedCardBg: '#FFF1F6',
  meetConfirmedCardBorder: '#F7D7E6',
  meetPendingConfirmCardBg: '#FFF9EC',
  meetPendingConfirmCardBorder: '#F2E2B8',
};

export const darkColors: AppColors = {
  bg: '#0F1216',
  bgElevated: '#171C22',
  bgHome: '#0F1216',
  brand: '#3D9FD4',
  brandDark: '#014569',
  brandMuted: '#5BB8E8',
  primary: '#3D9FD4',
  primaryPressed: '#2A8ABF',
  text: '#F4F6F8',
  textSecondary: '#C4CAD2',
  textMuted: '#8B939E',
  textHint: '#6B7380',
  border: '#2A3139',
  borderInput: '#343C46',
  borderPill: '#3A424D',
  card: '#1A1F26',
  cardMuted: '#232A33',
  chip: '#2A3340',
  overlay: 'rgba(0, 0, 0, 0.62)',
  sheetScrim: 'rgba(0, 0, 0, 0.58)',
  success: '#4CD080',
  warning: '#F0B429',
  danger: '#F07167',
  shadow: '#000000',
  statusBar: 'light-content',
  meetActive: '#5BB8E8',
  meetActiveBg: '#152A38',
  meetConfirmed: '#7EC8E8',
  meetConfirmedBg: '#1A2832',
  meetPending: '#A0A8B0',
  meetPendingBg: '#1A1F26',
  meetLiveCardBg: '#173347',
  meetLiveCardBorder: '#2E5D7F',
  meetConfirmedCardBg: '#382431',
  meetConfirmedCardBorder: '#624154',
  meetPendingConfirmCardBg: '#3A3424',
  meetPendingConfirmCardBorder: '#675C3B',
};

export const colorsForMode = (mode: ThemeMode): AppColors =>
  mode === 'dark' ? darkColors : lightColors;
