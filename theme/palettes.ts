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
  chipActive: string;
  overlay: string;
  sheetScrim: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  statusBar: 'light-content' | 'dark-content';
  /** Glassmorphism surfaces */
  glass: string;
  glassBorder: string;
  glassDark: string;
  glassDarkBorder: string;
  navBg: string;
  navActive: string;
  navInactive: string;
  gradientStart: string;
  gradientEnd: string;
  favorite: string;
  rating: string;
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
  cardMuted: '#F5F5F5',
  chip: '#F5F5F5',
  chipActive: '#014569',
  overlay: 'rgba(0, 0, 0, 0.54)',
  sheetScrim: 'rgba(0, 0, 0, 0.55)',
  success: '#1B8A4A',
  warning: '#C98A00',
  danger: '#C0392B',
  shadow: '#000000',
  statusBar: 'dark-content',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  glassDark: 'rgba(1, 46, 65, 0.82)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.12)',
  navBg: '#FFFFFF',
  navActive: '#014569',
  navInactive: '#999999',
  gradientStart: '#FFFFFF',
  gradientEnd: '#F7F8FA',
  favorite: '#C0392B',
  rating: '#C98A00',
  meetActive: '#014569',
  meetActiveBg: '#FFFFFF',
  meetConfirmed: '#1B8A4A',
  meetConfirmedBg: '#FFF1F6',
  meetPending: '#666666',
  meetPendingBg: '#FFF9EC',
  meetLiveCardBg: '#EAF4FF',
  meetLiveCardBorder: '#C6DFFF',
  meetConfirmedCardBg: '#FFF1F6',
  meetConfirmedCardBorder: '#F7D7E6',
  meetPendingConfirmCardBg: '#FFF9EC',
  meetPendingConfirmCardBorder: '#F2E2B8',
};

export const darkColors: AppColors = {
  bg: '#0A0A0A',
  bgElevated: '#141414',
  bgHome: '#0A0A0A',
  brand: '#FAFAFA',
  brandDark: '#FFFFFF',
  brandMuted: '#A3A3A3',
  primary: '#FAFAFA',
  primaryPressed: '#D4D4D4',
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textMuted: '#737373',
  textHint: '#525252',
  border: '#262626',
  borderInput: '#404040',
  borderPill: '#262626',
  card: '#141414',
  cardMuted: '#1A1A1A',
  chip: '#1A1A1A',
  chipActive: '#FAFAFA',
  overlay: 'rgba(0, 0, 0, 0.72)',
  sheetScrim: 'rgba(0, 0, 0, 0.85)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  shadow: '#000000',
  statusBar: 'light-content',
  glass: 'rgba(30, 30, 32, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(12, 12, 14, 0.92)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.06)',
  navBg: 'rgba(12, 12, 14, 0.94)',
  navActive: '#FFFFFF',
  navInactive: 'rgba(255, 255, 255, 0.4)',
  gradientStart: '#0A0A0A',
  gradientEnd: '#141414',
  favorite: '#F87171',
  rating: '#FBBF24',
  meetActive: '#FAFAFA',
  meetActiveBg: '#0A0A0A',
  meetConfirmed: '#34D399',
  meetConfirmedBg: '#064E3B',
  meetPending: '#A3A3A3',
  meetPendingBg: '#1A1A1A',
  meetLiveCardBg: '#141414',
  meetLiveCardBorder: '#262626',
  meetConfirmedCardBg: '#064E3B',
  meetConfirmedCardBorder: '#059669',
  meetPendingConfirmCardBg: '#78350F',
  meetPendingConfirmCardBorder: '#D97706',
};

export const colorsForMode = (mode: ThemeMode): AppColors =>
  mode === 'dark' ? darkColors : lightColors;
