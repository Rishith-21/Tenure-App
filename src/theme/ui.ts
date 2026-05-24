import {StyleSheet, ViewStyle, TextStyle} from 'react-native';

/** Shared Tenure UI tokens (match profile / requests screens). */
export const UI = {
  bg: '#F9F9F7',
  bgCream: '#F7F2EA',
  bgHome: '#F4F4F4',
  brand: '#003B57',
  brandMuted: '#005E95',
  text: '#111111',
  textSecondary: '#444444',
  textMuted: '#666666',
  textHint: '#888888',
  border: '#EFEFEF',
  borderInput: '#E8E0D6',
  borderPill: '#D5D5D5',
  card: '#FFFFFF',
  cardMuted: '#E5E7E9',
  chip: '#D8DEE4',
  overlay: 'rgba(17, 24, 39, 0.5)',
  success: '#35A853',
  warning: '#E4A000',
  danger: '#C0392B',
};

/** Plain style objects — safe to spread inside StyleSheet.create. */
export const uiLayout = {
  screen: {
    flex: 1,
    backgroundColor: UI.bg,
  } as ViewStyle,
  screenCream: {
    flex: 1,
    backgroundColor: UI.bgCream,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  } as ViewStyle,
  sectionCard: {
    backgroundColor: UI.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  pillPrimary: {
    backgroundColor: UI.brand,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
  } as ViewStyle,
  pillPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  } as TextStyle,
  sheet: {
    backgroundColor: UI.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  } as ViewStyle,
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#D2D2D2',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  } as ViewStyle,
  infoPill: {
    backgroundColor: '#F0F7FA',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C5DCE6',
    marginBottom: 12,
  } as ViewStyle,
  infoPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI.brand,
  } as TextStyle,
};

export const uiStyles = StyleSheet.create({
  ...uiLayout,
});
