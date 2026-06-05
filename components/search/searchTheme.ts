/** Search palette — aligned with app brand (#014569). */
import {Platform, ViewStyle} from 'react-native';

export const S = {
  bg: '#F6F8FA',
  card: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBgAlt: '#F9FAFB',
  primary: '#014569',
  primaryDark: '#012E41',
  primarySoft: 'rgba(1,69,105,0.08)',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#1B8A4A',
  successSoft: 'rgba(27,138,74,0.10)',
  shadow: '#0F172A',
} as const;

/** Minimal lift for inputs and compact controls. */
export const searchShadowSoft = Platform.select({
  ios: {
    shadowColor: S.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  android: {elevation: 1},
  default: {},
}) as ViewStyle;

/** Slightly deeper shadow for cards and list rows. */
export const searchShadowCard = Platform.select({
  ios: {
    shadowColor: S.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: {elevation: 2},
  default: {},
}) as ViewStyle;

export const getSearchShadowSoft = (elevated: boolean): ViewStyle =>
  elevated ? searchShadowSoft : {};

export const getSearchShadowCard = (elevated: boolean): ViewStyle =>
  elevated ? searchShadowCard : {};
