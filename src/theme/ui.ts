import {StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {lightColors} from './palettes';

/** Static tokens (light) — prefer `useTheme()` in new UI. */
export const UI = {
  bg: lightColors.bg,
  bgCream: lightColors.bg,
  bgHome: lightColors.bgHome,
  brand: lightColors.brand,
  brandDark: lightColors.brandDark,
  brandMuted: lightColors.brandMuted,
  primary: lightColors.primary,
  primaryPressed: lightColors.primaryPressed,
  text: lightColors.text,
  textSecondary: lightColors.textSecondary,
  textMuted: lightColors.textMuted,
  textHint: lightColors.textHint,
  border: lightColors.border,
  borderInput: lightColors.borderInput,
  borderPill: lightColors.borderPill,
  card: lightColors.card,
  cardMuted: lightColors.cardMuted,
  chip: lightColors.chip,
  overlay: lightColors.overlay,
  sheetScrim: lightColors.sheetScrim,
  success: lightColors.success,
  warning: lightColors.warning,
  danger: lightColors.danger,
};

export const uiLayout = {
  screen: {
    flex: 1,
    backgroundColor: UI.bg,
  } as ViewStyle,
  screenCream: {
    flex: 1,
    backgroundColor: UI.bg,
  } as ViewStyle,
  backArrow: {
    fontSize: 28,
    color: UI.text,
  } as TextStyle,
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 14,
  } as TextStyle,
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UI.textSecondary,
    marginBottom: 8,
  } as TextStyle,
  inputField: {
    backgroundColor: UI.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  } as ViewStyle,
  sectionCard: {
    backgroundColor: UI.card,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI.border,
  } as ViewStyle,
  pillPrimary: {
    backgroundColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  } as ViewStyle,
  pillPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
  sheet: {
    backgroundColor: UI.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  } as ViewStyle,
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D2D2D2',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  } as ViewStyle,
  infoPill: {
    backgroundColor: UI.cardMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: UI.border,
    marginBottom: 12,
  } as ViewStyle,
  infoPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI.text,
  } as TextStyle,
};

export const uiStyles = StyleSheet.create({
  ...uiLayout,
});
